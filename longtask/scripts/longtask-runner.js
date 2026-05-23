#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const { parseArgs } = require("./lib/runner/args");
const { deriveWorkPackage } = require("./lib/runner/artifacts");
const { executeCheckRel, reviewRel } = require("./lib/runner/artifact-names");
const { renderMaxRepairHumanBrief } = require("./lib/runner/human-brief");
const { renderPrompt } = require("./lib/runner/prompt");
const { runCodex } = require("./lib/runner/provider-codex");

function nowIso() {
  return new Date().toISOString();
}

function projectRootFor(taskDir) {
  let dir = path.resolve(taskDir);
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, "longtask", "config.yaml"))) return dir;
    dir = path.dirname(dir);
  }
  return path.resolve(taskDir, "..", "..", "..");
}

function runNode(script, args) {
  const result = spawnSync(process.execPath, [script, ...args], { encoding: "utf8" });
  return { ok: result.status === 0, stdout: result.stdout, stderr: result.stderr };
}

function rel(taskDir, file) {
  return path.relative(taskDir, file) || ".";
}

function appendRunnerLog(taskDir, lines) {
  const logPath = path.join(taskDir, "runner-log.md");
  if (!fs.existsSync(logPath)) {
    fs.writeFileSync(logPath, `# Runner 日志：${path.basename(taskDir)}\n\n`);
  }
  fs.appendFileSync(logPath, `${lines.join("\n")}\n`);
}

function printRunner(message) {
  process.stderr.write(`[runner] ${message}\n`);
}

function finishRunner(taskDir, mode, message) {
  printRunner(message);
  appendRunnerLog(taskDir, [
    "## Runner Complete",
    `- Finished: ${nowIso()}`,
    `- Mode: ${mode}`,
    `- Result: ${message}`,
    "",
  ]);
}

function compact(text, max = 800) {
  const value = String(text || "").replace(/\s+/g, " ").trim();
  if (value.length <= max) return value;
  return `${value.slice(0, max - 3)}...`;
}

function itemText(item) {
  if (!item || typeof item !== "object") return "";
  if (typeof item.text === "string") return item.text;
  if (typeof item.output === "string") return item.output;
  if (typeof item.aggregated_output === "string") return item.aggregated_output;
  if (Array.isArray(item.content)) {
    return item.content
      .map((entry) => {
        if (typeof entry === "string") return entry;
        if (entry && typeof entry.text === "string") return entry.text;
        return "";
      })
      .filter(Boolean)
      .join("\n");
  }
  return "";
}

function commandText(item) {
  if (!item || typeof item !== "object") return "";
  if (Array.isArray(item.command)) return item.command.join(" ");
  return item.command || item.cmd || item.name || "";
}

function printCodexEvent(label, event) {
  const item = event && event.item;
  if (event && event.type === "thread.started") {
    printRunner(`session ${label} thread ${event.thread_id || "started"}`);
    return;
  }
  if (event && event.type === "turn.started") {
    printRunner(`session ${label} turn started`);
    return;
  }
  if (!item || typeof item !== "object") return;
  if (event.type === "item.started" && item.type === "command_execution") {
    printRunner(`${label} command start: ${compact(commandText(item), 300) || "command"}`);
    return;
  }
  if (event.type === "item.completed" && item.type === "command_execution") {
    const status = item.status || item.exit_code || item.exitCode || "completed";
    printRunner(`${label} command done ${status}: ${compact(commandText(item), 300) || "command"}`);
    const output = compact(itemText(item), 800);
    const failed = status === "failed" || item.exit_code || item.exitCode;
    if (failed && output) printRunner(`${label} command output: ${output}`);
    return;
  }
  if (event.type === "item.completed" && item.type === "agent_message") {
    const text = compact(itemText(item), 800);
    if (text) printRunner(`${label} agent: ${text}`);
  }
}

function nextSessionDir(taskDir, label) {
  const root = path.join(taskDir, "runner-sessions");
  fs.mkdirSync(root, { recursive: true });
  const existing = fs.readdirSync(root).filter((entry) => /^\d+-/.test(entry));
  const next = String(existing.length + 1).padStart(3, "0");
  const safeLabel = label.replace(/[^A-Za-z0-9_.-]+/g, "-");
  const dir = path.join(root, `${next}-${safeLabel}`);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function artifactLooksFilled(file, requiredPatterns) {
  if (!fs.existsSync(file)) return false;
  const text = fs.readFileSync(file, "utf8");
  if (/<[^>\n]+>/.test(text)) return false;
  return requiredPatterns.every((pattern) => pattern.test(text));
}

function section(text, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(`(^|\\n)##\\s+${escaped}\\b[^\\n]*\\n([\\s\\S]*?)(?=\\n##\\s|\\n*$)`));
  return match ? match[2].trim() : "";
}

function sprintPlanEntries(taskDir) {
  const planPath = path.join(taskDir, "plan.md");
  if (!fs.existsSync(planPath)) return [{ sprint: "sprint-01", contractRel: "contracts/sprint-01.md", line: "sprint-01" }];
  const sprintPlan = section(fs.readFileSync(planPath, "utf8"), "Sprint Plan");
  const entries = sprintPlan
    .split(/\r?\n/)
    .map((line) => line.trim())
    .map((line) => {
      const match = line.match(/^-\s*(sprint-\d+):\s*(.+)$/i);
      if (!match) return null;
      const sprint = match[1].toLowerCase();
      return { sprint, contractRel: `contracts/${sprint}.md`, line: match[2].trim() };
    })
    .filter(Boolean);
  return entries.length ? entries : [{ sprint: "sprint-01", contractRel: "contracts/sprint-01.md", line: "sprint-01" }];
}

function contractRelForSprint(state, sprint) {
  const wanted = `contracts/${sprint || "sprint-01"}.md`;
  const contracts = (state.artifacts && state.artifacts.contracts) || [];
  return contracts.find((relPath) => path.basename(relPath, ".md") === (sprint || "sprint-01")) || wanted;
}

function currentContractRel(taskDir) {
  const state = readState(taskDir);
  return contractRelForSprint(state, state.current_sprint || "sprint-01");
}

function nextContractAfterCurrent(state) {
  const contracts = (state.artifacts && state.artifacts.contracts) || [];
  const current = contractRelForSprint(state, state.current_sprint || "sprint-01");
  const index = contracts.indexOf(current);
  if (index < 0 || index + 1 >= contracts.length) return null;
  const nextRel = contracts[index + 1];
  return {
    rel: nextRel,
    sprint: path.basename(nextRel, ".md"),
  };
}

function advanceToNextSprint(taskDir, next) {
  const statePath = path.join(taskDir, "state.json");
  const state = JSON.parse(fs.readFileSync(statePath, "utf8"));
  state.phase = "contract";
  state.current_sprint = next.sprint;
  state.latest_attempt = null;
  state.attempt_status = null;
  state.artifacts = state.artifacts || {};
  state.artifacts.handoff = null;
  fs.writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`);
}

function updateContractsIndexFromPlan(taskDir) {
  const statePath = path.join(taskDir, "state.json");
  const state = JSON.parse(fs.readFileSync(statePath, "utf8"));
  state.artifacts = state.artifacts || {};
  state.artifacts.contracts = sprintPlanEntries(taskDir).map((entry) => entry.contractRel);
  state.current_sprint = state.current_sprint || "sprint-01";
  fs.writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`);
  return state.artifacts.contracts;
}

function normalizePrepareState(taskDir) {
  const statePath = path.join(taskDir, "state.json");
  const state = JSON.parse(fs.readFileSync(statePath, "utf8"));
  state.artifacts = state.artifacts || {};
  state.artifacts.intake = state.artifacts.intake || "intake.md";
  state.artifacts.plan = state.artifacts.plan || "plan.md";
  state.artifacts.execution_log = state.artifacts.execution_log || "execution-log.md";
  state.artifacts.contracts = Array.isArray(state.artifacts.contracts) && state.artifacts.contracts.length
    ? state.artifacts.contracts
    : ["contracts/sprint-01.md"];
  state.artifacts.phase_checks = state.artifacts.phase_checks || [];
  state.artifacts.reviews = state.artifacts.reviews || [];
  state.artifacts.human_brief = state.artifacts.human_brief || null;
  state.artifacts.handoff = state.artifacts.handoff || null;
  fs.writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`);
  fs.mkdirSync(path.join(taskDir, "contracts"), { recursive: true });
  fs.mkdirSync(path.join(taskDir, "phase-checks"), { recursive: true });
  fs.mkdirSync(path.join(taskDir, "reviews"), { recursive: true });
  fs.mkdirSync(path.join(taskDir, "evidence"), { recursive: true });
}

function readState(taskDir) {
  return JSON.parse(fs.readFileSync(path.join(taskDir, "state.json"), "utf8"));
}

function field(text, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(`^- \\*\\*${escaped}\\*\\*:[ \\t]*(.*)$`, "m"));
  return match ? match[1].trim() : "";
}

function fieldBlock(text, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(`^- \\*\\*${escaped}\\*\\*:[ \\t]*(.*)$`, "m"));
  if (!match) return "";
  const start = match.index + match[0].length;
  const next = text.slice(start).match(/\n- \*\*[^*]+\*\*:/);
  return [match[1].trim(), (next ? text.slice(start, start + next.index) : text.slice(start)).trim()].filter(Boolean).join("\n");
}

function artifactVerdict(file) {
  if (!fs.existsSync(file)) return "";
  return field(fs.readFileSync(file, "utf8"), "Verdict");
}

function numberedPhaseCheckRel(phase, number) {
  return `phase-checks/${phase}-check-${String(number).padStart(2, "0")}.md`;
}

function nextPhaseCheckNumber(taskDir, phase) {
  let number = 1;
  while (fs.existsSync(path.join(taskDir, numberedPhaseCheckRel(phase, number)))) number += 1;
  return number;
}

function updateContractPhaseCheck(taskDir, contractRel, phaseCheckRel) {
  const contractPath = path.join(taskDir, contractRel);
  if (!fs.existsSync(contractPath)) return;
  const text = fs.readFileSync(contractPath, "utf8");
  const next = text.match(/^- \*\*Phase Check\*\*:/m)
    ? text.replace(/^- \*\*Phase Check\*\*:.*$/m, `- **Phase Check**: ${phaseCheckRel}`)
    : `${text.trimEnd()}\n- **Phase Check**: ${phaseCheckRel}\n`;
  if (next !== text) fs.writeFileSync(contractPath, next);
}

function requireOk(result, label) {
  if (!result.ok) {
    throw new Error(`${label} failed\n${result.stdout}${result.stderr}`);
  }
}

function formatLintFailureRevision(result, contractRel) {
  const output = `${result.stdout || ""}${result.stderr || ""}`.trim() || "lint-contract failed without output";
  return [
    `CONTRACT_REVISION_REQUIRED: \`${contractRel}\` 通过 contract critic 后仍未通过 \`lint-contract\`。`,
    "只修订 lint 输出指出的 contract 字段或格式问题，不扩大 plan、contract 范围或写入 phase-check。",
    "lint 输出：",
    "```",
    output,
    "```",
  ].join("\n");
}

async function runContractReviserSession({ options, taskDir, projectRoot, contractPath, contractRel, sourcePath, sourceDescription, revisionText, checkNumber }) {
  const prompt = [
    "RUNNER_CONTRACT_REVISE",
    "语言要求：自然语言内容必须使用中文。保留代码标识符、命令、路径、文件名、字段 key 和 API 名称的原文。",
    "你是 contract reviser subagent。",
    `任务目录：${taskDir}`,
    `请直接读取：${path.join(taskDir, "intake.md")}`,
    `请直接读取：${path.join(taskDir, "plan.md")}`,
    `请直接读取：${contractPath}`,
    sourcePath ? `请直接读取：${sourcePath}` : null,
    sourceDescription,
    revisionText,
    "可以使用工具、相关能力、必要的代码/文档阅读、subagent 或 MCP 来核实修订，但修订范围必须受上述修订要求限制。",
    "不要把 runner 历史、workflow 内部资料、旧会话或无关本地 skill 文档当作当前项目事实来源。",
    `只写入 ${contractRel}；不要写入 phase-checks、plan.md、execution-log 或业务源码。`,
    "保持 contract Status 为 proposed。",
    "不要运行 lint、longtask-state 或 runner 命令；runner 会在下一轮 critic 写入新的 pass phase check 后统一执行 lint。不要把旧 phase check 的非 pass 结论当作本次修订失败。",
  ].filter(Boolean).join("\n");

  return runProviderSession({
    options,
    taskDir,
    projectRoot,
    label: `contract-reviser-${String(checkNumber).padStart(2, "0")}`,
    requireHandoffOnDrain: false,
    prompt,
  });
}

function runNodeLogged({ taskDir, scriptsDir, name, args, label }) {
  const started = Date.now();
  printRunner(`command ${label || name} start`);
  appendRunnerLog(taskDir, [
    `## Command: ${label || name}`,
    `- Started: ${nowIso()}`,
    `- Command: \`node longtask/scripts/${name} ${args.map((arg) => String(arg)).join(" ")}\``,
  ]);
  const result = runNode(script(scriptsDir, name), args);
  printRunner(`command ${label || name} ${result.ok ? "pass" : "fail"} ${Date.now() - started}ms`);
  appendRunnerLog(taskDir, [
    `- Finished: ${nowIso()}`,
    `- Duration Ms: ${Date.now() - started}`,
    `- Exit: ${result.ok ? "pass" : "fail"}`,
    ...(result.ok ? [] : [
      "- Stdout:",
      "```",
      (result.stdout || "").trim() || "(empty)",
      "```",
      "- Stderr:",
      "```",
      (result.stderr || "").trim() || "(empty)",
      "```",
    ]),
    "",
  ]);
  return result;
}

function writeRunnerFailure(taskDir, failureRel, reason, result) {
  const target = path.join(taskDir, failureRel);
  const lastBudget = result && result.lastBudget
    ? `${result.lastBudget.state} ${(result.lastBudget.ratio * 100).toFixed(1)}%`
    : "none";
  fs.writeFileSync(
    target,
    [
      "# Runner 失败",
      "",
      `- Reason: ${reason}`,
      `- Interrupt Reason: ${(result && result.interruptReason) || "none"}`,
      `- Exit Code: ${(result && result.code) === null ? "null" : (result && result.code)}`,
      `- Signal: ${(result && result.signal) || "none"}`,
      `- Last Budget: ${lastBudget}`,
      `- Handoff Present: ${fs.existsSync(path.join(taskDir, "handoff.md")) ? "yes" : "no"}`,
      "",
    ].join("\n")
  );
}

function writeRunnerPaused(taskDir, reason, result) {
  const lastBudget = result && result.lastBudget
    ? `${result.lastBudget.state} ${(result.lastBudget.ratio * 100).toFixed(1)}%`
    : "none";
  fs.writeFileSync(
    path.join(taskDir, "runner-paused.md"),
    [
      "# Runner 暂停",
      "",
      `- Reason: ${reason}`,
      `- Last Budget: ${lastBudget}`,
      "- Resume Command: rerun the same `node longtask/scripts/longtask-runner.js ...` command.",
      "",
    ].join("\n")
  );
}

function formatMs(ms) {
  const seconds = Math.round(Number(ms || 0) / 1000);
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return minutes > 0 ? `${minutes}m ${rest}s` : `${rest}s`;
}

function purposeForLabel(label) {
  if (/^plan-critic-\d+/.test(label)) return "评审 `plan.md`，并写入对应 plan phase check。";
  if (/^plan-reviser-\d+/.test(label)) return "根据 plan critic 的修订要求更新 `plan.md`。";
  if (/^plan-reviser-from-contract-\d+/.test(label)) return "根据 contract critic 发现的上游问题更新 `plan.md`。";
  if (/^contract-critic-\d+/.test(label)) return "评审 sprint contract，并写入对应 contract phase check。";
  if (/^contract-reviser-\d+/.test(label)) return "根据 contract critic 的修订要求更新 sprint contract。";
  return {
    "prepare-plan-generator": "基于 intake 生成或修订 `plan.md`。",
    "plan-critic": "评审 `plan.md`，并写入 `phase-checks/plan-check-01.md`。",
    "plan-reviser": "根据 plan critic 的修订要求更新 `plan.md`。",
    "prepare-contract-generator": "基于 intake 和 plan 生成完整 sprint contract 包。",
    "contract-critic": "评审 sprint contract，并写入 `phase-checks/contract-check-01.md`。",
    "execute-attempt": "执行当前 sprint attempt，并产出 evidence/review 产物。",
  }[label] || "运行一个 Codex provider 会话。";
}

function readSessionSummaries(taskDir) {
  const root = path.join(taskDir, "runner-sessions");
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root)
    .filter((entry) => /^\d+-/.test(entry))
    .sort()
    .map((entry) => {
      const summaryPath = path.join(root, entry, "summary.json");
      if (!fs.existsSync(summaryPath)) return null;
      try {
        const summary = JSON.parse(fs.readFileSync(summaryPath, "utf8"));
        return { ...summary, sessionDir: path.join(root, entry), sessionName: entry };
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function writeRunnerReport(taskDir) {
  const sessions = readSessionSummaries(taskDir);
  const reportPath = path.join(taskDir, "runner-report.md");
  const totalDurationMs = sessions.reduce((sum, session) => sum + Number(session.durationMs || 0), 0);
  const totalEffective = sessions.reduce((sum, session) => sum + Number(session.usage && session.usage.effectiveUsedTokens || 0), 0);
  const totalGross = sessions.reduce((sum, session) => sum + Number(session.usage && session.usage.grossUsedTokens || 0), 0);
  const totalInput = sessions.reduce((sum, session) => sum + Number(session.usage && session.usage.inputTokens || 0), 0);
  const totalCached = sessions.reduce((sum, session) => sum + Number(session.usage && session.usage.cachedInputTokens || 0), 0);
  const totalOutput = sessions.reduce((sum, session) => sum + Number(session.usage && session.usage.outputTokens || 0), 0);
  const totalReasoning = sessions.reduce((sum, session) => sum + Number(session.usage && session.usage.reasoningOutputTokens || 0), 0);

  const lines = [
    `# Runner 报告：${path.basename(taskDir)}`,
    "",
    `- 更新时间：${nowIso()}`,
    `- Codex Exec 会话数：${sessions.length}`,
    `- 总耗时：${formatMs(totalDurationMs)} (${totalDurationMs} ms)`,
    `- 总有效 Token：${totalEffective}`,
    `- 总原始 Token：${totalGross}`,
    `- 输入 Token：${totalInput}`,
    `- 缓存输入 Token：${totalCached}`,
    `- 输出 Token：${totalOutput}`,
    `- 推理输出 Token：${totalReasoning}`,
    "",
    "## 会话",
    "",
  ];

  if (!sessions.length) {
    lines.push("尚未记录 Codex exec 会话。", "");
  } else {
    lines.push("| # | 会话 | 用途 | 状态 | 耗时 | 有效 Token | 原始 Token | 预算 | 产物 |");
    lines.push("|---:|---|---|---|---:|---:|---:|---|---|");
    sessions.forEach((session, index) => {
      const usage = session.usage || {};
      const budget = session.budget || {};
      const status = session.ok ? "成功" : "失败";
      const budgetText = budget.state
        ? `${budget.state} ${((Number(budget.ratio || 0)) * 100).toFixed(1)}%`
        : "none";
      const artifacts = [
        `prompt：\`${rel(taskDir, path.join(session.sessionDir, "prompt.md"))}\``,
        `stdout：\`${rel(taskDir, path.join(session.sessionDir, "stdout.jsonl"))}\``,
        `summary：\`${rel(taskDir, path.join(session.sessionDir, "summary.json"))}\``,
      ].join("<br>");
      lines.push(`| ${index + 1} | ${session.label || session.sessionName} | ${purposeForLabel(session.label)} | ${status} | ${formatMs(session.durationMs)} | ${Number(usage.effectiveUsedTokens || usage.usedTokens || 0)} | ${Number(usage.grossUsedTokens || 0)} | ${budgetText} | ${artifacts} |`);
    });
    lines.push("");
  }

  lines.push("## 说明");
  lines.push("");
  lines.push("- 有效 Token 用于 runner 预算判断：输入减去缓存输入，再加输出和推理输出。");
  lines.push("- 原始 Token 保留 provider 上报的完整输入总量，用于诊断。");
  lines.push("- 完整 provider JSONL 输出保存在每个会话的 `stdout.jsonl`。");
  lines.push("");

  fs.writeFileSync(reportPath, `${lines.join("\n")}`);
  return reportPath;
}

async function runProviderSession({ options, taskDir, projectRoot, prompt, label, requireHandoffOnDrain }) {
  let sawSoftLimit = false;
  let sawHardLimit = false;
  const sessionDir = nextSessionDir(taskDir, label);
  const promptPath = path.join(sessionDir, "prompt.md");
  const stdoutPath = path.join(sessionDir, "stdout.jsonl");
  const stderrPath = path.join(sessionDir, "stderr.txt");
  const summaryPath = path.join(sessionDir, "summary.json");
  const startedAt = Date.now();
  fs.writeFileSync(promptPath, prompt);
  printRunner(`session ${label} start`);
  printRunner(`session ${label} files prompt=${rel(taskDir, promptPath)} stdout=${rel(taskDir, stdoutPath)} stderr=${rel(taskDir, stderrPath)}`);
  appendRunnerLog(taskDir, [
    `## Session: ${label}`,
    `- Started: ${nowIso()}`,
    `- Prompt: \`${rel(taskDir, promptPath)}\``,
    `- Stdout JSONL: \`${rel(taskDir, stdoutPath)}\``,
    `- Stderr: \`${rel(taskDir, stderrPath)}\``,
  ]);
  const result = await runCodex({
    codexBin: options.codexBin,
    cwd: projectRoot,
    prompt,
    contextLimit: options.contextLimit,
    softRatio: options.softRatio,
    hardRatio: options.hardRatio,
    maxSessionMs: options.maxSessionMs,
    softDrainMs: options.softDrainMs,
    hardKillMs: options.hardKillMs,
    stdoutPath,
    stderrPath,
    onBudget: (budget) => {
      if (budget.state === "soft_limit") sawSoftLimit = true;
      if (budget.state === "hard_limit") sawHardLimit = true;
      printRunner(`${label} budget ${budget.state} ${(budget.ratio * 100).toFixed(1)}% effective=${budget.usedTokens}/${budget.contextLimit}`);
      appendRunnerLog(taskDir, [`- Budget: ${budget.state} ${(budget.ratio * 100).toFixed(1)}%`]);
    },
    onInterrupt: (reason, signal) => {
      printRunner(`${label} interrupt ${reason} -> ${signal}`);
      appendRunnerLog(taskDir, [`- Interrupt: ${reason} -> ${signal}`]);
    },
    onEvent: (event) => printCodexEvent(label, event),
    onStderr: (chunk) => {
      const lines = String(chunk || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      for (const line of lines) {
        const text = compact(line, 800);
        printRunner(`${label} stderr: ${text}`);
        appendRunnerLog(taskDir, [`- Provider Stderr: ${text}`]);
      }
    },
  });
  const durationMs = Date.now() - startedAt;
  const usage = result.lastBudget ? {
    state: result.lastBudget.state,
    ratio: result.lastBudget.ratio,
    usedTokens: result.lastBudget.usedTokens,
    contextLimit: result.lastBudget.contextLimit,
  } : null;
  writeJson(summaryPath, {
    label,
    startedAt: new Date(startedAt).toISOString(),
    finishedAt: nowIso(),
    durationMs,
    ok: result.ok,
    code: result.code,
    signal: result.signal || null,
    interrupted: result.interrupted,
    interruptReason: result.interruptReason || null,
    usage: result.lastUsage || null,
    budget: usage,
    jsonlError: result.jsonlError ? result.jsonlError.message : null,
  });
  const reportPath = writeRunnerReport(taskDir);
  appendRunnerLog(taskDir, [
    `- Finished: ${nowIso()}`,
    `- Duration Ms: ${durationMs}`,
    `- Exit Code: ${result.code === null ? "null" : result.code}`,
    `- Signal: ${result.signal || "none"}`,
    `- Summary: \`${rel(taskDir, summaryPath)}\``,
    `- Report: \`${rel(taskDir, reportPath)}\``,
    "",
  ]);
  printRunner(`session ${label} ${result.ok ? "complete" : "failed"} ${durationMs}ms summary=${rel(taskDir, summaryPath)}`);
  printRunner(`runner report updated ${rel(taskDir, reportPath)}`);

  if (!result.ok) {
    writeRunnerFailure(taskDir, options.runnerFailureRel, "codex provider failed", result);
    printRunner(`runner failure written ${options.runnerFailureRel}`);
    process.stderr.write(result.stderr || "codex provider failed\n");
    if (result.jsonlError) process.stderr.write(`${result.jsonlError.message}\n`);
    process.exit(1);
  }

  const drained = sawSoftLimit || sawHardLimit || result.interrupted;
  if (drained && requireHandoffOnDrain) {
    const handoff = path.join(taskDir, "handoff.md");
    if (!fs.existsSync(handoff)) {
      writeRunnerFailure(taskDir, options.runnerFailureRel, "handoff missing after context limit or interrupt", result);
      printRunner(`runner failure written ${options.runnerFailureRel}`);
      printRunner("context limit reached but handoff.md was not written");
      process.exit(1);
    }
  }

  return { ...result, drained, sawSoftLimit, sawHardLimit, sessionDir, summaryPath };
}

function script(scriptsDir, name) {
  return path.join(scriptsDir, name);
}

function templateText(scriptsDir, name) {
  const file = path.join(scriptsDir, "..", "templates", name);
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
}

async function runPlanCriticLoop({ options, taskDir, projectRoot, scriptsDir, stateScript, startNumber = 1 }) {
  let latestPlanCheckRel = null;
  const endNumber = startNumber + options.maxPlanRevisions;
  for (let checkNumber = startNumber; checkNumber <= endNumber; checkNumber += 1) {
    latestPlanCheckRel = numberedPhaseCheckRel("plan", checkNumber);
    const planCheckPath = path.join(taskDir, latestPlanCheckRel);
    if (!artifactLooksFilled(planCheckPath, [/- \*\*Phase\*\*: plan/m, /- \*\*Verdict\*\*: pass|revise|escalate/m])) {
      const planCritic = await runProviderSession({
        options,
        taskDir,
        projectRoot,
        label: `plan-critic-${String(checkNumber).padStart(2, "0")}`,
        requireHandoffOnDrain: false,
        prompt: [
          "RUNNER_PLAN_CRITIC",
          "语言要求：自然语言内容必须使用中文。保留代码标识符、命令、路径、文件名、字段 key 和 API 名称的原文。",
          "你是独立的 plan critic subagent。",
          `任务目录：${taskDir}`,
          `请直接读取：${path.join(taskDir, "intake.md")}`,
          `请直接读取：${path.join(taskDir, "plan.md")}`,
          `phase check 模板：${path.join(projectRoot, "longtask/templates/phase-check.md")}`,
          "不要使用 generator 或 reviser 聊天历史；可以使用工具、相关能力、必要的代码/文档阅读、subagent 或 MCP 来核实判断。",
          "优先从 intake、plan、plan file map、源码、测试、配置和项目文档取证；不要把 runner 历史、workflow 内部资料、旧会话或无关本地 skill 文档当作当前项目事实来源。",
          "在 Context Boundary 字段中包含这个 lint 可识别短语：without generator or executor chat history。",
          `写入 ${planCheckPath}，Verdict 必须是 pass、revise 或 escalate。`,
          "",
          templateText(scriptsDir, "plan-critic-prompt.md"),
        ].join("\n"),
      });
      if (planCritic.sawHardLimit) {
        writeRunnerPaused(taskDir, "plan-critic 在 session 完成后达到 hard context budget", planCritic);
        process.stdout.write("[runner] prepare 已在 plan critic 后暂停；重新运行同一命令可继续\n");
        return false;
      }
    } else {
      printRunner(`session plan-critic-${String(checkNumber).padStart(2, "0")} skipped: ${latestPlanCheckRel} already exists`);
      appendRunnerLog(taskDir, ["## Session Skipped", `- Label: plan-critic-${String(checkNumber).padStart(2, "0")}`, `- Reason: ${latestPlanCheckRel} already exists`, ""]);
    }
    requireOk(runNodeLogged({ taskDir, scriptsDir, name: "lint-phase-check.js", args: [planCheckPath], label: `lint ${latestPlanCheckRel}` }), `lint ${latestPlanCheckRel}`);
    requireOk(runNode(stateScript, [taskDir, "register-phase-check", latestPlanCheckRel]), `register ${latestPlanCheckRel}`);
    printRunner(`state register ${latestPlanCheckRel}`);
    appendRunnerLog(taskDir, ["## State Operation", `- Operation: register ${latestPlanCheckRel}`, ""]);

    const verdict = artifactVerdict(planCheckPath) || "unknown";
    if (verdict === "pass") return true;
    if (verdict === "escalate") {
      printRunner(`prepare stopped: ${latestPlanCheckRel} verdict is escalate`);
      appendRunnerLog(taskDir, ["## Runner Stop", `- Reason: ${latestPlanCheckRel} verdict is escalate`, "- Next: human decision required by phase check.", ""]);
      return false;
    }
    if (checkNumber >= endNumber) {
      printRunner(`prepare stopped: plan revise loop reached max ${options.maxPlanRevisions}`);
      appendRunnerLog(taskDir, ["## Runner Stop", `- Reason: plan revise loop reached max ${options.maxPlanRevisions}`, `- Last Check: ${latestPlanCheckRel}`, ""]);
      return false;
    }

    const reviser = await runProviderSession({
      options,
      taskDir,
      projectRoot,
      label: `plan-reviser-${String(checkNumber).padStart(2, "0")}`,
      requireHandoffOnDrain: false,
      prompt: [
        "RUNNER_PLAN_REVISE",
        "语言要求：自然语言内容必须使用中文。保留代码标识符、命令、路径、文件名、字段 key 和 API 名称的原文。",
        "你是 plan reviser subagent。",
        `任务目录：${taskDir}`,
        `请直接读取：${path.join(taskDir, "intake.md")}`,
        `请直接读取：${path.join(taskDir, "plan.md")}`,
        `请直接读取：${planCheckPath}`,
        "只根据 phase check 的 Required Revisions 和 Findings 修订 plan.md。",
        "如果修订涉及 unsupported outcome，只能采取四类动作之一：补 mechanism/task/evidence，降低承诺强度，删除承诺，或转为 explicit assumption/risk/discovery task 并取消结果性承诺。",
        "修订范围必须限于 phase check 指出的具体 outcome、语句或 traceability 缺口；不要顺手扩大计划范围。",
        "只写入 plan.md；不要写入 phase-checks、contracts、execution-log 或业务源码。",
        "不要使用 critic/generator 聊天历史。可以使用工具、相关能力、必要的代码/文档阅读、subagent 或 MCP 来核实修订，但修订范围必须受 phase check 限制。",
        "不要无目的扫描整个仓库；优先从 intake、plan、phase check、源码、测试、配置和项目文档取证。不要把 runner 历史、workflow 内部资料、旧会话或无关本地 skill 文档当作当前项目事实来源。",
        "修订后确保 `node longtask/scripts/lint-plan.js docs/longtasks/<task-id>/plan.md` 能通过。",
      ].join("\n"),
    });
    if (reviser.sawHardLimit) {
      writeRunnerPaused(taskDir, "plan-reviser 在 session 完成后达到 hard context budget", reviser);
      process.stdout.write("[runner] prepare 已在 plan reviser 后暂停；重新运行同一命令可继续\n");
      return false;
    }
    requireOk(runNodeLogged({ taskDir, scriptsDir, name: "lint-plan.js", args: [path.join(taskDir, "plan.md")], label: `lint plan after ${latestPlanCheckRel}` }), "lint revised plan");
  }
  return false;
}

async function runContractCriticLoop({ options, taskDir, projectRoot, scriptsDir, stateScript, contractRel, startNumber = 1 }) {
  let latestContractCheckRel = null;
  const endNumber = startNumber + options.maxContractRevisions;
  const contractPath = path.join(taskDir, contractRel);
  for (let checkNumber = startNumber; checkNumber <= endNumber; checkNumber += 1) {
    latestContractCheckRel = numberedPhaseCheckRel("contract", checkNumber);
    const contractCheckPath = path.join(taskDir, latestContractCheckRel);
    if (!artifactLooksFilled(contractCheckPath, [/- \*\*Phase\*\*: contract/m, new RegExp(`- \\*\\*Artifact\\*\\*:\\s*${contractRel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "m"), /- \*\*Verdict\*\*: pass|revise|escalate/m])) {
      const contractCritic = await runProviderSession({
        options,
        taskDir,
        projectRoot,
        label: `contract-critic-${String(checkNumber).padStart(2, "0")}`,
        requireHandoffOnDrain: false,
        prompt: [
          "RUNNER_CONTRACT_CRITIC",
          "语言要求：自然语言内容必须使用中文。保留代码标识符、命令、路径、文件名、字段 key 和 API 名称的原文。",
          "你是独立的 contract critic subagent。",
          `任务目录：${taskDir}`,
          `请直接读取：${path.join(taskDir, "intake.md")}`,
          `请直接读取：${path.join(taskDir, "plan.md")}`,
          `请直接读取：${contractPath}`,
          `phase check 模板：${path.join(projectRoot, "longtask/templates/phase-check.md")}`,
          "这是 prepare 阶段的一致性评审，不是当前 sprint 的执行期 readiness check。",
          "不要使用 generator 或 reviser 聊天历史；可以使用工具、相关能力、必要的代码/文档阅读、subagent 或 MCP 来核实判断。",
          "优先从 intake、plan、contract、contract context map、源码、测试、配置和项目文档取证；不要把 runner 历史、workflow 内部资料、旧会话或无关本地 skill 文档当作当前项目事实来源。",
          "在 Context Boundary 字段中包含这个 lint 可识别短语：without generator or executor chat history。",
          "如果当前 contract 依赖前序 sprint 计划产生的文件或证据，且依赖链写清 producer sprint、预期路径、生产方 completion/evidence/write scope 和当前用途，不要因为该 planned output 在 prepare 阶段尚不存在而 escalate。",
          "`Phase Check` 字段由 runner 在 pass 后统一更新；不要仅因为当前编号不是本次输出文件而要求修订，除非该字段缺失或不是 `phase-checks/contract-check-NN.md` 形态。",
          "如果依赖声明不完整，Required Revisions 必须以 `CONTRACT_REVISION_REQUIRED:` 开头；如果 plan 没有安排前序 sprint 生产该路径，Required Revisions 必须以 `PLAN_REVISION_REQUIRED:` 开头。",
          "如果 contract 本身需要修订，Required Revisions 必须以 `CONTRACT_REVISION_REQUIRED:` 开头。",
          "如果 contract 引入了 plan 中没有 closed traceability 的结果承诺，或必须先修订上游 plan，Required Revisions 必须以 `PLAN_REVISION_REQUIRED:` 开头，并指向具体 outcome 或 acceptance criterion。",
          "评审必须覆盖 lint-contract 的硬性格式规则：Visible Completion 要包含 done when、complete、passes、exists 或 verified 等可观察完成信号；Required Evidence 要有命令输出或 evidence artifact；Context Map 要包含 Required Reads、Optional Reads、Forbidden Context、Budget、Subagent Payload。",
          "如果缺失信息无法从 intake、plan、contract 或明确源码指针自行解决，Verdict 必须是 escalate。",
          `写入 ${contractCheckPath}，Verdict 必须是 pass、revise 或 escalate。`,
          "",
          templateText(scriptsDir, "contract-critic-prompt.md"),
        ].join("\n"),
      });
      if (contractCritic.sawHardLimit) {
        writeRunnerPaused(taskDir, "contract-critic 在 session 完成后达到 hard context budget", contractCritic);
        process.stdout.write("[runner] prepare 已在 contract critic 后暂停；重新运行同一命令可继续\n");
        return false;
      }
    } else {
      printRunner(`session contract-critic-${String(checkNumber).padStart(2, "0")} skipped: ${latestContractCheckRel} already exists`);
      appendRunnerLog(taskDir, ["## Session Skipped", `- Label: contract-critic-${String(checkNumber).padStart(2, "0")}`, `- Reason: ${latestContractCheckRel} already exists`, ""]);
    }

    requireOk(runNodeLogged({ taskDir, scriptsDir, name: "lint-phase-check.js", args: [contractCheckPath], label: `lint ${latestContractCheckRel}` }), `lint ${latestContractCheckRel}`);
    requireOk(runNode(stateScript, [taskDir, "register-phase-check", latestContractCheckRel]), `register ${latestContractCheckRel}`);
    printRunner(`state register ${latestContractCheckRel}`);
    appendRunnerLog(taskDir, ["## State Operation", `- Operation: register ${latestContractCheckRel}`, ""]);

    const verdict = artifactVerdict(contractCheckPath) || "unknown";
    if (verdict === "pass") {
      updateContractPhaseCheck(taskDir, contractRel, latestContractCheckRel);
      const lintResult = runNodeLogged({ taskDir, scriptsDir, name: "lint-contract.js", args: [contractPath], label: `lint ${contractRel} after ${latestContractCheckRel}` });
      if (lintResult.ok) return true;
      if (checkNumber >= endNumber) {
        printRunner(`prepare stopped: contract lint revise loop reached max ${options.maxContractRevisions}`);
        appendRunnerLog(taskDir, ["## Runner Stop", `- Reason: contract lint failed after ${latestContractCheckRel} and revise loop reached max ${options.maxContractRevisions}`, `- Contract: ${contractRel}`, ""]);
        return false;
      }
      const contractReviser = await runContractReviserSession({
        options,
        taskDir,
        projectRoot,
        contractPath,
        contractRel,
        sourcePath: null,
        sourceDescription: "只根据下面的 lint-contract 输出修订 contract；这是 critic pass 后的机械 lint 修订，不是 plan amendment。",
        revisionText: formatLintFailureRevision(lintResult, contractRel),
        checkNumber,
      });
      if (contractReviser.sawHardLimit) {
        writeRunnerPaused(taskDir, "contract-reviser 在 contract lint 修订后达到 hard context budget", contractReviser);
        process.stdout.write("[runner] prepare 已在 contract lint reviser 后暂停；重新运行同一命令可继续\n");
        return false;
      }
      continue;
    }
    if (verdict === "escalate") {
      printRunner(`prepare stopped: ${latestContractCheckRel} verdict is escalate`);
      appendRunnerLog(taskDir, ["## Runner Stop", `- Reason: ${latestContractCheckRel} verdict is escalate`, "- Next: human decision required by phase check.", ""]);
      return false;
    }
    if (checkNumber >= endNumber) {
      printRunner(`prepare stopped: contract revise loop reached max ${options.maxContractRevisions}`);
      appendRunnerLog(taskDir, ["## Runner Stop", `- Reason: contract revise loop reached max ${options.maxContractRevisions}`, `- Last Check: ${latestContractCheckRel}`, ""]);
      return false;
    }

    const requiredRevisions = fieldBlock(fs.readFileSync(contractCheckPath, "utf8"), "Required Revisions");
    if (/PLAN_REVISION_REQUIRED/i.test(requiredRevisions)) {
      const planReviser = await runProviderSession({
        options,
        taskDir,
        projectRoot,
        label: `plan-reviser-from-contract-${String(checkNumber).padStart(2, "0")}`,
        requireHandoffOnDrain: false,
        prompt: [
          "RUNNER_PLAN_REVISE_FROM_CONTRACT",
          "语言要求：自然语言内容必须使用中文。保留代码标识符、命令、路径、文件名、字段 key 和 API 名称的原文。",
          "你是 plan reviser subagent。",
          `任务目录：${taskDir}`,
          `请直接读取：${path.join(taskDir, "intake.md")}`,
          `请直接读取：${path.join(taskDir, "plan.md")}`,
          `请直接读取：${contractPath}`,
          `请直接读取：${contractCheckPath}`,
          "只根据 contract phase check 中 PLAN_REVISION_REQUIRED 的 Required Revisions 和 Findings 修订 plan.md。",
          "可以使用工具、相关能力、必要的代码/文档阅读、subagent 或 MCP 来核实修订，但修订范围必须受 contract phase check 限制。",
          "不要把 runner 历史、workflow 内部资料、旧会话或无关本地 skill 文档当作当前项目事实来源。",
          "如果修订涉及 unsupported outcome，只能采取四类动作之一：补 mechanism/task/evidence，降低承诺强度，删除承诺，或转为 explicit assumption/risk/discovery task 并取消结果性承诺。",
          "修订范围必须限于 contract phase check 指出的具体 outcome、acceptance criterion 或 traceability 缺口；不要顺手扩大计划范围。",
          "只写入 plan.md；不要写入 phase-checks、contracts、execution-log 或业务源码。",
          "修订后确保 `node longtask/scripts/lint-plan.js docs/longtasks/<task-id>/plan.md` 能通过。",
        ].join("\n"),
      });
      if (planReviser.sawHardLimit) {
        writeRunnerPaused(taskDir, "plan-reviser-from-contract 在 session 完成后达到 hard context budget", planReviser);
        process.stdout.write("[runner] prepare 已在 plan reviser 后暂停；重新运行同一命令可继续\n");
        return false;
      }
      requireOk(runNodeLogged({ taskDir, scriptsDir, name: "lint-plan.js", args: [path.join(taskDir, "plan.md")], label: `lint plan after ${latestContractCheckRel}` }), "lint revised plan");
      const planStartNumber = nextPhaseCheckNumber(taskDir, "plan");
      const planCheckPassed = await runPlanCriticLoop({ options, taskDir, projectRoot, scriptsDir, stateScript, startNumber: planStartNumber });
      if (!planCheckPassed) return false;
    } else {
      const contractReviser = await runContractReviserSession({
        options,
        taskDir,
        projectRoot,
        contractPath,
        contractRel,
        sourcePath: contractCheckPath,
        sourceDescription: `只根据 contract phase check 中 CONTRACT_REVISION_REQUIRED 的 Required Revisions 和 Findings 修订 ${contractRel}。`,
        revisionText: "",
        checkNumber,
      });
      if (contractReviser.sawHardLimit) {
        writeRunnerPaused(taskDir, "contract-reviser 在 session 完成后达到 hard context budget", contractReviser);
        process.stdout.write("[runner] prepare 已在 contract reviser 后暂停；重新运行同一命令可继续\n");
        return false;
      }
    }
  }
  return false;
}

async function runPrepare({ options, taskDir, projectRoot, scriptsDir }) {
  const stateScript = script(scriptsDir, "longtask-state.js");
  printRunner(`start mode=prepare task=${taskDir} project=${projectRoot} context_limit=${options.contextLimit}`);
  appendRunnerLog(taskDir, [
    `## Runner Start`,
    `- Started: ${nowIso()}`,
    `- Mode: prepare`,
    `- Task Dir: \`${taskDir}\``,
    `- Project Root: \`${projectRoot}\``,
    `- PID: ${process.pid}`,
    "",
  ]);
  normalizePrepareState(taskDir);
  printRunner("state normalize prepare artifact index");
  appendRunnerLog(taskDir, ["## State Operation", "- Operation: normalize prepare artifact index", ""]);
  requireOk(runNodeLogged({ taskDir, scriptsDir, name: "lint-intake.js", args: [path.join(taskDir, "intake.md")], label: "lint intake" }), "lint-intake");
  requireOk(runNodeLogged({ taskDir, scriptsDir, name: "lint-phase-check.js", args: [path.join(taskDir, "phase-checks/intake-check-01.md")], label: "lint intake phase check" }), "lint intake phase check");
  requireOk(runNode(stateScript, [taskDir, "register-phase-check", "phase-checks/intake-check-01.md"]), "register intake phase check");
  printRunner("state register phase-checks/intake-check-01.md");
  appendRunnerLog(taskDir, ["## State Operation", "- Operation: register intake phase check", ""]);
  if (readState(taskDir).phase === "intake") {
    requireOk(runNode(stateScript, [taskDir, "advance", "plan"]), "advance plan");
    printRunner("state advance plan");
    appendRunnerLog(taskDir, ["## State Operation", "- Operation: advance plan", ""]);
  }

  const planPath = path.join(taskDir, "plan.md");
  if (!artifactLooksFilled(planPath, [/## Goal\b/, /## Sprint Plan\b/, /## Outcome Traceability\b/, /## Tasks\b/, /## Verification\b/])) {
    const planSession = await runProviderSession({
      options,
      taskDir,
      projectRoot,
      label: "prepare-plan-generator",
      requireHandoffOnDrain: false,
      prompt: [
        "RUNNER_PREPARE_PLAN_GENERATE",
        "语言要求：自然语言内容必须使用中文。保留代码标识符、命令、路径、文件名、字段 key 和 API 名称的原文。",
        "以已有 intake 为起点准备原生 longtask plan；intake 用来减少弯路，不是限制继续调查的上限。",
        "可以使用工具、相关能力、必要的代码/文档阅读、subagent 或 MCP 来提升计划质量，但产物必须基于当前项目事实。",
        "不要无目的扫描整个仓库；如果需要补充事实，可以围绕 intake、源码入口、测试、配置、文档或计划决策读取必要代码片段。",
        "优先读取这些输入：",
        `- ${path.join(taskDir, "intake.md")}`,
        `- ${path.join(projectRoot, "longtask/templates/plan.md")}`,
        "- intake 中 Source Map、Evidence、File Map 或同等字段明确引用的项目文件",
        "读取项目文件时先读相关小段；如果发现计划判断缺少事实，可以继续读取必要相邻片段或相关文件，并在信息足够时停止。",
        "不要把 runner 历史、workflow 内部资料、旧会话或无关本地 skill 文档当作当前项目事实来源；如使用 skill、subagent 或 MCP 等能力，仍要回到 intake、源码、测试、配置、项目文档或明确外部来源验证。",
        `只写入或修订 ${planPath}。`,
        "不要运行 lint、longtask-state 或 runner 命令；runner 会统一执行这些检查。",
        "必须在 `## Sprint Plan` 中把所有需要执行的 Building Blocks 分配到连续 sprint，格式为 `- sprint-01: Block 1, Block 2 - <目标>`。",
        "不要写入 contracts/*.md。",
        "不要写入 plan 或 contract 的 critic phase check；这些产物由独立 critic session 生成。",
      ].join("\n"),
    });
    if (planSession.sawHardLimit) {
      writeRunnerPaused(taskDir, "prepare-plan-generator 在 session 完成后达到 hard context budget", planSession);
      process.stdout.write("[runner] prepare 已在 plan generator 后暂停；重新运行同一命令可继续\n");
      return;
    }
  } else {
    printRunner("session prepare-plan-generator skipped: plan.md already filled");
    appendRunnerLog(taskDir, ["## Session Skipped", "- Label: prepare-plan-generator", "- Reason: plan.md already exists and looks filled", ""]);
  }

  requireOk(runNodeLogged({ taskDir, scriptsDir, name: "lint-plan.js", args: [path.join(taskDir, "plan.md")], label: "lint plan" }), "lint-plan");

  const planCheckPassed = await runPlanCriticLoop({ options, taskDir, projectRoot, scriptsDir, stateScript, startNumber: 1 });
  if (!planCheckPassed) {
    printRunner("prepare stopped: no passing plan phase check");
    appendRunnerLog(taskDir, ["## Runner Stop", "- Reason: no passing plan phase check", ""]);
    return;
  }
  if (readState(taskDir).phase === "plan") {
    requireOk(runNode(stateScript, [taskDir, "advance", "contract"]), "advance contract");
    printRunner("state advance contract");
    appendRunnerLog(taskDir, ["## State Operation", "- Operation: advance contract", ""]);
  }

  let contractRels = updateContractsIndexFromPlan(taskDir);
  const contractsFilled = contractRels.every((contractRel) => artifactLooksFilled(path.join(taskDir, contractRel), [/- \*\*Status\*\*: /m, /- \*\*Outcome Links\*\*:/m, /- \*\*Acceptance Criteria\*\*:/m, /- \*\*Required Evidence\*\*:/m]));
  if (!contractsFilled) {
    const contractSession = await runProviderSession({
      options,
      taskDir,
      projectRoot,
      label: "prepare-contract-generator",
      requireHandoffOnDrain: false,
      prompt: [
        "RUNNER_PREPARE_CONTRACT_GENERATE",
        "语言要求：自然语言内容必须使用中文。保留代码标识符、命令、路径、文件名、字段 key 和 API 名称的原文。",
        "只基于已有 intake 和 plan 准备完整 sprint contract 包。",
        "可以使用工具、相关能力、必要的代码/文档阅读、subagent 或 MCP 来提升合同质量，但 contract 必须基于 intake、plan 和当前项目事实。",
        `任务目录：${taskDir}`,
        "优先读取这些输入：",
        `- ${path.join(taskDir, "intake.md")}`,
        `- ${path.join(taskDir, "plan.md")}`,
        `- ${path.join(projectRoot, "longtask/templates/contract.md")}`,
        "如果 contract 边界、验证或写入范围缺少事实，可以读取 plan 明确指向的项目文件小片段。",
        "不要把 runner 历史、workflow 内部资料、旧会话或无关本地 skill 文档当作当前项目事实来源；如使用 skill、subagent 或 MCP 等能力，仍要回到 intake、plan、源码、测试、配置、项目文档或明确外部来源验证。",
        "不要运行 lint、longtask-state 或 runner 命令；runner 会在 critic 写入 phase check 后统一 lint。",
        "读取 plan.md 的 Sprint Plan，并为其中每个 sprint 写入对应 `contracts/sprint-NN.md`。",
        `本次必须写入这些合同：${contractRels.join(", ")}`,
        "每个 contract 的 `Visible Completion` 必须直接包含 lint 可识别的完成信号词：`done when`、`complete`、`passes`、`exists` 或 `verified`；优先写成 `done when <artifact> exists and is complete ... Acceptance Criteria are verified`。",
        "Outcome Links 只能引用 plan 中 Status 为 closed 的 Outcome ID；可以细化 closed outcome 的验收标准，但不要新增结果承诺。",
        "如果后续 sprint 依赖前序 sprint 计划产生的文件或证据，必须在 Context Map、Verification Plan 或 Risk Notes 中写清 producer sprint、预期路径、生产方 completion/evidence/write scope 和当前用途；prepare 阶段不要求这些前序 planned output 已存在。",
        "不要把普通外部输入、当前 sprint 自身必须先存在的输入，或没有前序生产来源的路径标成 planned output。",
        "保持 contract Status 为 proposed，并在 execute 前停止。",
        "不要写入 contract critic phase check；该产物由独立 critic session 生成。",
      ].join("\n"),
    });
    if (contractSession.sawHardLimit) {
      writeRunnerPaused(taskDir, "prepare-contract-generator 在 session 完成后达到 hard context budget", contractSession);
      process.stdout.write("[runner] prepare 已在 contract generator 后暂停；重新运行同一命令可继续\n");
      return;
    }
  } else {
    printRunner("session prepare-contract-generator skipped: all contracts already filled");
    appendRunnerLog(taskDir, ["## Session Skipped", "- Label: prepare-contract-generator", "- Reason: all contracts already exist and look filled", ""]);
  }

  contractRels = updateContractsIndexFromPlan(taskDir);
  let contractCheckNumber = 1;
  for (const contractRel of contractRels) {
    const contractPath = path.join(taskDir, contractRel);
    const contractText = fs.existsSync(contractPath) ? fs.readFileSync(contractPath, "utf8") : "";
    const existingPhaseCheck = field(contractText, "Phase Check");
    if (existingPhaseCheck && artifactVerdict(path.join(taskDir, existingPhaseCheck)) === "pass") {
      const existingLint = runNodeLogged({ taskDir, scriptsDir, name: "lint-contract.js", args: [contractPath], label: `lint ${contractRel} existing ${existingPhaseCheck}` });
      if (existingLint.ok) {
        printRunner(`contract ${contractRel} skipped: existing passing ${existingPhaseCheck}`);
        appendRunnerLog(taskDir, ["## Contract Skipped", `- Contract: ${contractRel}`, `- Reason: existing passing ${existingPhaseCheck} and lint-contract pass`, ""]);
        contractCheckNumber = nextPhaseCheckNumber(taskDir, "contract");
        continue;
      }
      printRunner(`contract ${contractRel} existing ${existingPhaseCheck} has lint failure; creating a new contract check`);
      appendRunnerLog(taskDir, ["## Contract Resume", `- Contract: ${contractRel}`, `- Existing Check: ${existingPhaseCheck}`, "- Reason: existing phase check pass but lint-contract failed; continuing with new check", ""]);
      contractCheckNumber = nextPhaseCheckNumber(taskDir, "contract");
    }
    const contractCheckPassed = await runContractCriticLoop({ options, taskDir, projectRoot, scriptsDir, stateScript, contractRel, startNumber: contractCheckNumber });
    if (!contractCheckPassed) {
      printRunner(`prepare stopped: no passing contract phase check for ${contractRel}`);
      appendRunnerLog(taskDir, ["## Runner Stop", `- Reason: no passing contract phase check for ${contractRel}`, ""]);
      return;
    }
    contractCheckNumber = nextPhaseCheckNumber(taskDir, "contract");
  }

  finishRunner(taskDir, "prepare", "prepare complete; review plan.md and contracts/*.md before execute");
  process.stdout.write("[runner] prepare complete; review plan.md and contracts/*.md before execute\n");
}

async function runExecute({ options, taskDir, projectRoot, scriptsDir }) {
  printRunner(`start mode=execute task=${taskDir} project=${projectRoot} context_limit=${options.contextLimit}`);
  appendRunnerLog(taskDir, [
    `## Runner Start`,
    `- Started: ${nowIso()}`,
    `- Mode: execute`,
    `- Task Dir: \`${taskDir}\``,
    `- Project Root: \`${projectRoot}\``,
    `- PID: ${process.pid}`,
    "",
  ]);
  const stateScript = script(scriptsDir, "longtask-state.js");
  const startingPhase = readState(taskDir).phase;
  if (!["contract", "execute", "repair"].includes(startingPhase)) {
    throw new Error(`execute mode requires phase contract, execute, or repair; got ${startingPhase}`);
  }
  const existingState = readState(taskDir);
  if (startingPhase === "repair" && Number(existingState.repair_attempts || 0) >= options.maxRepairAttempts) {
    const latestReviewRel = existingState.latest_attempt ? reviewRel(existingState.latest_attempt) : "reviews/review-NN.md";
    fs.writeFileSync(
      path.join(taskDir, "human-brief.md"),
      renderMaxRepairHumanBrief({
        taskId: existingState.task_id || path.basename(taskDir),
        maxRepairAttempts: options.maxRepairAttempts,
        latestAttempt: existingState.latest_attempt,
        reviewRel: latestReviewRel,
        handoffRel: (existingState.artifacts && existingState.artifacts.handoff) || "handoff.md",
      })
    );
    requireOk(runNodeLogged({ taskDir, scriptsDir, name: "lint-human-brief.js", args: [path.join(taskDir, "human-brief.md")], label: "lint human brief" }), "lint human brief");
    requireOk(runNode(stateScript, [taskDir, "set-human-brief", "human-brief.md"]), "set human brief");
    printRunner("state set human-brief.md");
    appendRunnerLog(taskDir, ["## State Operation", "- Operation: set human brief", ""]);
    process.stdout.write(`[runner] max repair attempts ${options.maxRepairAttempts} reached; routed to human_brief\n`);
    return;
  }
  requireOk(runNodeLogged({ taskDir, scriptsDir, name: "check-execution-ready.js", args: [taskDir], label: "check execution ready" }), "check-execution-ready");
  if (readState(taskDir).phase === "contract") {
    requireOk(runNode(stateScript, [taskDir, "advance", "execute"]), "advance execute");
    printRunner("state advance execute");
    appendRunnerLog(taskDir, ["## State Operation", "- Operation: advance execute", ""]);
  }
  if (readState(taskDir).attempt_status !== "active") {
    requireOk(runNode(stateScript, [taskDir, "start-attempt"]), "start attempt");
    printRunner("state start attempt");
    appendRunnerLog(taskDir, ["## State Operation", "- Operation: start attempt", ""]);
  }

  const pkg = deriveWorkPackage(taskDir);
  const session = await runProviderSession({
    options,
    taskDir,
    projectRoot,
    label: "execute-attempt",
    requireHandoffOnDrain: true,
    prompt: renderPrompt(pkg, { ...options, templateText: templateText(scriptsDir, "execution-checker-prompt.md") }),
  });
  if (session.drained) {
    requireOk(runNode(script(scriptsDir, "check-recovery-ready.js"), [taskDir]), "check recovery after handoff");
    process.stdout.write("[runner] execute paused for handoff\n");
    return;
  }

  if (readState(taskDir).attempt_status === "active") {
    requireOk(runNode(stateScript, [taskDir, "complete-attempt"]), "complete attempt");
    printRunner("state complete attempt");
    appendRunnerLog(taskDir, ["## State Operation", "- Operation: complete attempt", ""]);
  }
  const state = readState(taskDir);
  const latestExecuteCheckRel = executeCheckRel(state.latest_attempt);
  const latestReviewRel = reviewRel(state.latest_attempt);

  requireOk(runNodeLogged({ taskDir, scriptsDir, name: "lint-execution-log.js", args: [path.join(taskDir, "execution-log.md")], label: "lint execution log" }), "lint-execution-log");
  requireOk(runNodeLogged({ taskDir, scriptsDir, name: "lint-phase-check.js", args: [path.join(taskDir, latestExecuteCheckRel)], label: "lint execute phase check" }), "lint execute phase check");
  requireOk(runNode(stateScript, [taskDir, "register-phase-check", latestExecuteCheckRel]), "register execute phase check");
  printRunner(`state register ${latestExecuteCheckRel}`);
  appendRunnerLog(taskDir, ["## State Operation", `- Operation: register execute phase check ${latestExecuteCheckRel}`, ""]);
  if (readState(taskDir).phase === "execute") {
    requireOk(runNode(stateScript, [taskDir, "advance", "review"]), "advance review");
    printRunner("state advance review");
    appendRunnerLog(taskDir, ["## State Operation", "- Operation: advance review", ""]);
  }

  const reviewPath = path.join(taskDir, latestReviewRel);
  requireOk(runNodeLogged({ taskDir, scriptsDir, name: "lint-review.js", args: [reviewPath], label: "lint review" }), "lint-review");
  requireOk(runNode(stateScript, [taskDir, "register-review", latestReviewRel]), "register review");
  printRunner(`state register ${latestReviewRel}`);
  appendRunnerLog(taskDir, ["## State Operation", `- Operation: register review ${latestReviewRel}`, ""]);
  const review = fs.readFileSync(reviewPath, "utf8");
  const verdict = field(review, "Verdict");
  const failType = field(review, "Fail Type");
  const classification = field(review, "Failure Classification");
  let next = "human_brief";
  if (verdict === "pass" && failType === "none" && classification === "none") {
    const nextContract = nextContractAfterCurrent(readState(taskDir));
    if (nextContract) {
      advanceToNextSprint(taskDir, nextContract);
      printRunner(`state advance contract ${nextContract.sprint}`);
      appendRunnerLog(taskDir, ["## State Operation", `- Operation: advance to next sprint ${nextContract.sprint}`, `- Contract: ${nextContract.rel}`, ""]);
      finishRunner(taskDir, "execute", `execute complete; state advanced to contract ${nextContract.sprint}`);
      process.stdout.write(`[runner] execute complete; state advanced to contract ${nextContract.sprint}\n`);
      return;
    }
    next = "done";
  } else if (verdict === "fail" && failType === "auto" && ["implementation-bug", "build-type-failure"].includes(classification)) next = "repair";
  requireOk(runNode(stateScript, [taskDir, "advance", next]), `advance ${next}`);
  printRunner(`state advance ${next}`);
  appendRunnerLog(taskDir, ["## State Operation", `- Operation: advance ${next}`, ""]);
  finishRunner(taskDir, "execute", `execute complete; state advanced to ${next}`);
  process.stdout.write(`[runner] execute complete; state advanced to ${next}\n`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const taskDir = path.resolve(options.taskDir);
  const projectRoot = projectRootFor(taskDir);
  const scriptsDir = __dirname;

  if (options.mode === "prepare") {
    await runPrepare({ options, taskDir, projectRoot, scriptsDir });
    return;
  }
  if (options.mode === "report") {
    const reportPath = writeRunnerReport(taskDir);
    process.stdout.write(`[runner] report written ${rel(taskDir, reportPath)}\n`);
    return;
  }

  await runExecute({ options, taskDir, projectRoot, scriptsDir });
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
});

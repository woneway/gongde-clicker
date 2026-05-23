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
    if (output) printRunner(`${label} command output: ${output}`);
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
  return requiredPatterns.every((pattern) => pattern.test(text));
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

function artifactVerdict(file) {
  if (!fs.existsSync(file)) return "";
  return field(fs.readFileSync(file, "utf8"), "Verdict");
}

function requireOk(result, label) {
  if (!result.ok) {
    throw new Error(`${label} failed\n${result.stdout}${result.stderr}`);
  }
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
  return {
    "prepare-plan-generator": "基于 intake 生成或修订 `plan.md`。",
    "plan-critic": "评审 `plan.md`，并写入 `phase-checks/plan-check-01.md`。",
    "prepare-contract-generator": "基于 intake 和 plan 生成 `contracts/sprint-01.md`。",
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
  if (!artifactLooksFilled(planPath, [/## Goal\b/, /## Tasks\b/, /## Verification\b/])) {
    const planSession = await runProviderSession({
      options,
      taskDir,
      projectRoot,
      label: "prepare-plan-generator",
      requireHandoffOnDrain: false,
      prompt: [
        "RUNNER_PREPARE_PLAN_GENERATE",
        "语言要求：自然语言内容必须使用中文。保留代码标识符、命令、路径、文件名、字段 key 和 API 名称的原文。",
        "只基于已有 intake 准备原生 longtask plan。",
        "不要扫描整个仓库。",
        "只读取这些必需文件；除非某个引用行离开一个相邻小文件就无法理解，否则不要扩展读取范围：",
        "- docs/longtasks/<task-id>/intake.md",
        "- longtask/templates/plan.md",
        "- app/layout.js",
        "- app/page.js",
        "- components/gongde-clicker.jsx",
        "- lib/gongde-growth.js",
        "- lib/wish-card.js",
        "- public/sitemap.xml",
        "- public/robots.txt",
        "- package.json",
        "- test/gongde-growth.test.js",
        "- test/site-structure.test.js",
        "不要读取 docs/superpowers 文件，除非 intake 为某个具体论断明确要求读取某个指定文件。",
        "只写入或修订 plan.md。",
        "不要写入 contracts/sprint-01.md。",
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
  const planCheckPath = path.join(taskDir, "phase-checks/plan-check-01.md");
  if (!artifactLooksFilled(planCheckPath, [/- \*\*Phase\*\*: plan/m, /- \*\*Verdict\*\*: pass|revise|escalate/m])) {
    const planCritic = await runProviderSession({
      options,
      taskDir,
      projectRoot,
      label: "plan-critic",
      requireHandoffOnDrain: false,
      prompt: [
        "RUNNER_PLAN_CRITIC",
        "语言要求：自然语言内容必须使用中文。保留代码标识符、命令、路径、文件名、字段 key 和 API 名称的原文。",
        "你是独立的 plan critic subagent。",
        `任务目录：${taskDir}`,
        `请直接读取：${path.join(taskDir, "intake.md")}`,
        `请直接读取：${path.join(taskDir, "plan.md")}`,
        `phase check 模板：${path.join(projectRoot, "longtask/templates/phase-check.md")}`,
        "除此之外，只读取 plan file map 明确命名的源码指针。不要使用 generator 聊天历史。",
        "在 Context Boundary 字段中包含这个 lint 可识别短语：without generator or executor chat history。",
        `写入 ${path.join(taskDir, "phase-checks/plan-check-01.md")}，Verdict 必须是 pass、revise 或 escalate。`,
        "",
        templateText(scriptsDir, "plan-critic-prompt.md"),
      ].join("\n"),
    });
    if (planCritic.sawHardLimit) {
      writeRunnerPaused(taskDir, "plan-critic 在 session 完成后达到 hard context budget", planCritic);
      process.stdout.write("[runner] prepare 已在 plan critic 后暂停；重新运行同一命令可继续\n");
      return;
    }
  } else {
    printRunner("session plan-critic skipped: plan phase check already exists");
    appendRunnerLog(taskDir, ["## Session Skipped", "- Label: plan-critic", "- Reason: plan phase check already exists", ""]);
  }
  requireOk(runNodeLogged({ taskDir, scriptsDir, name: "lint-phase-check.js", args: [path.join(taskDir, "phase-checks/plan-check-01.md")], label: "lint plan phase check" }), "lint plan phase check");
  requireOk(runNode(stateScript, [taskDir, "register-phase-check", "phase-checks/plan-check-01.md"]), "register plan phase check");
  printRunner("state register phase-checks/plan-check-01.md");
  appendRunnerLog(taskDir, ["## State Operation", "- Operation: register plan phase check", ""]);
  if (artifactVerdict(planCheckPath) !== "pass") {
    const verdict = artifactVerdict(planCheckPath) || "unknown";
    printRunner(`prepare stopped: plan phase check verdict is ${verdict}`);
    appendRunnerLog(taskDir, [
      "## Runner Stop",
      `- Reason: plan phase check verdict is ${verdict}`,
      "- Next: revise `plan.md` according to `phase-checks/plan-check-01.md`, then rerun prepare.",
      "",
    ]);
    return;
  }
  if (readState(taskDir).phase === "plan") {
    requireOk(runNode(stateScript, [taskDir, "advance", "contract"]), "advance contract");
    printRunner("state advance contract");
    appendRunnerLog(taskDir, ["## State Operation", "- Operation: advance contract", ""]);
  }

  const contractPath = path.join(taskDir, "contracts/sprint-01.md");
  if (!artifactLooksFilled(contractPath, [/- \*\*Status\*\*: /m, /- \*\*Acceptance Criteria\*\*:/m, /- \*\*Required Evidence\*\*:/m])) {
    const contractSession = await runProviderSession({
      options,
      taskDir,
      projectRoot,
      label: "prepare-contract-generator",
      requireHandoffOnDrain: false,
      prompt: [
        "RUNNER_PREPARE_CONTRACT_GENERATE",
        "语言要求：自然语言内容必须使用中文。保留代码标识符、命令、路径、文件名、字段 key 和 API 名称的原文。",
        "只基于已有 intake 和 plan 准备 contracts/sprint-01.md。",
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
    printRunner("session prepare-contract-generator skipped: contract already filled");
    appendRunnerLog(taskDir, ["## Session Skipped", "- Label: prepare-contract-generator", "- Reason: contract already exists and looks filled", ""]);
  }

  const contractCheckPath = path.join(taskDir, "phase-checks/contract-check-01.md");
  if (!artifactLooksFilled(contractCheckPath, [/- \*\*Phase\*\*: contract/m, /- \*\*Verdict\*\*: pass|revise|escalate/m])) {
    const contractCritic = await runProviderSession({
      options,
      taskDir,
      projectRoot,
      label: "contract-critic",
      requireHandoffOnDrain: false,
      prompt: [
        "RUNNER_CONTRACT_CRITIC",
        "语言要求：自然语言内容必须使用中文。保留代码标识符、命令、路径、文件名、字段 key 和 API 名称的原文。",
        "你是独立的 contract critic subagent。",
        `任务目录：${taskDir}`,
        `请直接读取：${path.join(taskDir, "intake.md")}`,
        `请直接读取：${path.join(taskDir, "plan.md")}`,
        `请直接读取：${path.join(taskDir, "contracts/sprint-01.md")}`,
        `phase check 模板：${path.join(projectRoot, "longtask/templates/phase-check.md")}`,
        "除此之外，只读取 contract context map 明确命名的源码指针。不要使用 generator 聊天历史。",
        "在 Context Boundary 字段中包含这个 lint 可识别短语：without generator or executor chat history。",
        `写入 ${path.join(taskDir, "phase-checks/contract-check-01.md")}，Verdict 必须是 pass、revise 或 escalate。`,
        "",
        templateText(scriptsDir, "contract-critic-prompt.md"),
      ].join("\n"),
    });
    if (contractCritic.sawHardLimit) {
      writeRunnerPaused(taskDir, "contract-critic 在 session 完成后达到 hard context budget", contractCritic);
      process.stdout.write("[runner] prepare 已在 contract critic 后暂停；重新运行同一命令可继续\n");
      return;
    }
  } else {
    printRunner("session contract-critic skipped: contract phase check already exists");
    appendRunnerLog(taskDir, ["## Session Skipped", "- Label: contract-critic", "- Reason: contract phase check already exists", ""]);
  }
  requireOk(runNodeLogged({ taskDir, scriptsDir, name: "lint-phase-check.js", args: [path.join(taskDir, "phase-checks/contract-check-01.md")], label: "lint contract phase check" }), "lint contract phase check");
  requireOk(runNodeLogged({ taskDir, scriptsDir, name: "lint-contract.js", args: [path.join(taskDir, "contracts/sprint-01.md")], label: "lint contract" }), "lint-contract");
  requireOk(runNode(stateScript, [taskDir, "register-phase-check", "phase-checks/contract-check-01.md"]), "register contract phase check");
  printRunner("state register phase-checks/contract-check-01.md");
  appendRunnerLog(taskDir, ["## State Operation", "- Operation: register contract phase check", ""]);
  if (artifactVerdict(contractCheckPath) !== "pass") {
    const verdict = artifactVerdict(contractCheckPath) || "unknown";
    printRunner(`prepare stopped: contract phase check verdict is ${verdict}`);
    appendRunnerLog(taskDir, [
      "## Runner Stop",
      `- Reason: contract phase check verdict is ${verdict}`,
      "- Next: revise `contracts/sprint-01.md` according to `phase-checks/contract-check-01.md`, then rerun prepare.",
      "",
    ]);
    return;
  }

  process.stdout.write("[runner] prepare complete; review plan.md and contracts/sprint-01.md before execute\n");
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
  if (verdict === "pass" && failType === "none" && classification === "none") next = "done";
  else if (verdict === "fail" && failType === "auto" && ["implementation-bug", "build-type-failure"].includes(classification)) next = "repair";
  requireOk(runNode(stateScript, [taskDir, "advance", next]), `advance ${next}`);
  printRunner(`state advance ${next}`);
  appendRunnerLog(taskDir, ["## State Operation", `- Operation: advance ${next}`, ""]);
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

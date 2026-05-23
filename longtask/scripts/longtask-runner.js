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
    fs.writeFileSync(logPath, `# Runner Log: ${path.basename(taskDir)}\n\n`);
  }
  fs.appendFileSync(logPath, `${lines.join("\n")}\n`);
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

function requireOk(result, label) {
  if (!result.ok) {
    throw new Error(`${label} failed\n${result.stdout}${result.stderr}`);
  }
}

function runNodeLogged({ taskDir, scriptsDir, name, args, label }) {
  const started = Date.now();
  appendRunnerLog(taskDir, [
    `## Command: ${label || name}`,
    `- Started: ${nowIso()}`,
    `- Command: \`node longtask/scripts/${name} ${args.map((arg) => String(arg)).join(" ")}\``,
  ]);
  const result = runNode(script(scriptsDir, name), args);
  appendRunnerLog(taskDir, [
    `- Finished: ${nowIso()}`,
    `- Duration Ms: ${Date.now() - started}`,
    `- Exit: ${result.ok ? "pass" : "fail"}`,
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
      "# Runner Failure",
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
      "# Runner Paused",
      "",
      `- Reason: ${reason}`,
      `- Last Budget: ${lastBudget}`,
      "- Resume Command: rerun the same `node longtask/scripts/longtask-runner.js ...` command.",
      "",
    ].join("\n")
  );
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
      const line = `[runner] ${label} budget ${budget.state} ${(budget.ratio * 100).toFixed(1)}%`;
      process.stderr.write(`${line}\n`);
      appendRunnerLog(taskDir, [`- Budget: ${budget.state} ${(budget.ratio * 100).toFixed(1)}%`]);
    },
    onInterrupt: (reason, signal) => {
      process.stderr.write(`[runner] ${label} interrupt ${reason} -> ${signal}\n`);
      appendRunnerLog(taskDir, [`- Interrupt: ${reason} -> ${signal}`]);
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
  appendRunnerLog(taskDir, [
    `- Finished: ${nowIso()}`,
    `- Duration Ms: ${durationMs}`,
    `- Exit Code: ${result.code === null ? "null" : result.code}`,
    `- Signal: ${result.signal || "none"}`,
    `- Summary: \`${rel(taskDir, summaryPath)}\``,
    "",
  ]);

  if (!result.ok) {
    writeRunnerFailure(taskDir, options.runnerFailureRel, "codex provider failed", result);
    process.stderr.write(`[runner] runner failure written ${options.runnerFailureRel}\n`);
    process.stderr.write(result.stderr || "codex provider failed\n");
    if (result.jsonlError) process.stderr.write(`${result.jsonlError.message}\n`);
    process.exit(1);
  }

  const drained = sawSoftLimit || sawHardLimit || result.interrupted;
  if (drained && requireHandoffOnDrain) {
    const handoff = path.join(taskDir, "handoff.md");
    if (!fs.existsSync(handoff)) {
      writeRunnerFailure(taskDir, options.runnerFailureRel, "handoff missing after context limit or interrupt", result);
      process.stderr.write(`[runner] runner failure written ${options.runnerFailureRel}\n`);
      process.stderr.write("[runner] context limit reached but handoff.md was not written\n");
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
  appendRunnerLog(taskDir, ["## State Operation", "- Operation: normalize prepare artifact index", ""]);
  requireOk(runNodeLogged({ taskDir, scriptsDir, name: "lint-intake.js", args: [path.join(taskDir, "intake.md")], label: "lint intake" }), "lint-intake");
  requireOk(runNodeLogged({ taskDir, scriptsDir, name: "lint-phase-check.js", args: [path.join(taskDir, "phase-checks/intake-check-01.md")], label: "lint intake phase check" }), "lint intake phase check");
  requireOk(runNode(stateScript, [taskDir, "register-phase-check", "phase-checks/intake-check-01.md"]), "register intake phase check");
  appendRunnerLog(taskDir, ["## State Operation", "- Operation: register intake phase check", ""]);
  if (readState(taskDir).phase === "intake") {
    requireOk(runNode(stateScript, [taskDir, "advance", "plan"]), "advance plan");
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
        "Prepare only the native longtask plan from the existing intake.",
        "Do not scan the whole repository.",
        "Read only these required files unless a referenced line is impossible to understand without one small adjacent file:",
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
        "Do not read docs/superpowers files unless intake explicitly requires a specific one for a concrete claim.",
        "Write or revise plan.md only.",
        "Do not write contracts/sprint-01.md.",
        "Do not write plan or contract critic phase checks; those are produced by independent critic sessions.",
      ].join("\n"),
    });
    if (planSession.sawHardLimit) {
      writeRunnerPaused(taskDir, "prepare-plan-generator reached hard context budget after session completion", planSession);
      process.stdout.write("[runner] prepare paused after plan generator; rerun to continue\n");
      return;
    }
  } else {
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
        "You are an independent plan critic subagent.",
        "Read intake.md and plan.md only from artifacts. Do not use generator chat history.",
        "Write phase-checks/plan-check-01.md with Verdict pass, revise, or escalate.",
        "",
        templateText(scriptsDir, "plan-critic-prompt.md"),
      ].join("\n"),
    });
    if (planCritic.sawHardLimit) {
      writeRunnerPaused(taskDir, "plan-critic reached hard context budget after session completion", planCritic);
      process.stdout.write("[runner] prepare paused after plan critic; rerun to continue\n");
      return;
    }
  } else {
    appendRunnerLog(taskDir, ["## Session Skipped", "- Label: plan-critic", "- Reason: plan phase check already exists", ""]);
  }
  requireOk(runNodeLogged({ taskDir, scriptsDir, name: "lint-phase-check.js", args: [path.join(taskDir, "phase-checks/plan-check-01.md")], label: "lint plan phase check" }), "lint plan phase check");
  requireOk(runNode(stateScript, [taskDir, "register-phase-check", "phase-checks/plan-check-01.md"]), "register plan phase check");
  appendRunnerLog(taskDir, ["## State Operation", "- Operation: register plan phase check", ""]);
  if (readState(taskDir).phase === "plan") {
    requireOk(runNode(stateScript, [taskDir, "advance", "contract"]), "advance contract");
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
        "Prepare only contracts/sprint-01.md from the existing intake and plan.",
        "Leave contract Status proposed and stop before execute.",
        "Do not write contract critic phase checks; those are produced by an independent critic session.",
      ].join("\n"),
    });
    if (contractSession.sawHardLimit) {
      writeRunnerPaused(taskDir, "prepare-contract-generator reached hard context budget after session completion", contractSession);
      process.stdout.write("[runner] prepare paused after contract generator; rerun to continue\n");
      return;
    }
  } else {
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
        "You are an independent contract critic subagent.",
        "Read intake.md, plan.md, and contracts/sprint-01.md only from artifacts. Do not use generator chat history.",
        "Write phase-checks/contract-check-01.md with Verdict pass, revise, or escalate.",
        "",
        templateText(scriptsDir, "contract-critic-prompt.md"),
      ].join("\n"),
    });
    if (contractCritic.sawHardLimit) {
      writeRunnerPaused(taskDir, "contract-critic reached hard context budget after session completion", contractCritic);
      process.stdout.write("[runner] prepare paused after contract critic; rerun to continue\n");
      return;
    }
  } else {
    appendRunnerLog(taskDir, ["## Session Skipped", "- Label: contract-critic", "- Reason: contract phase check already exists", ""]);
  }
  requireOk(runNodeLogged({ taskDir, scriptsDir, name: "lint-phase-check.js", args: [path.join(taskDir, "phase-checks/contract-check-01.md")], label: "lint contract phase check" }), "lint contract phase check");
  requireOk(runNodeLogged({ taskDir, scriptsDir, name: "lint-contract.js", args: [path.join(taskDir, "contracts/sprint-01.md")], label: "lint contract" }), "lint-contract");
  requireOk(runNode(stateScript, [taskDir, "register-phase-check", "phase-checks/contract-check-01.md"]), "register contract phase check");
  appendRunnerLog(taskDir, ["## State Operation", "- Operation: register contract phase check", ""]);

  process.stdout.write("[runner] prepare complete; review plan.md and contracts/sprint-01.md before execute\n");
}

async function runExecute({ options, taskDir, projectRoot, scriptsDir }) {
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
    appendRunnerLog(taskDir, ["## State Operation", "- Operation: set human brief", ""]);
    process.stdout.write(`[runner] max repair attempts ${options.maxRepairAttempts} reached; routed to human_brief\n`);
    return;
  }
  requireOk(runNodeLogged({ taskDir, scriptsDir, name: "check-execution-ready.js", args: [taskDir], label: "check execution ready" }), "check-execution-ready");
  if (readState(taskDir).phase === "contract") {
    requireOk(runNode(stateScript, [taskDir, "advance", "execute"]), "advance execute");
    appendRunnerLog(taskDir, ["## State Operation", "- Operation: advance execute", ""]);
  }
  if (readState(taskDir).attempt_status !== "active") {
    requireOk(runNode(stateScript, [taskDir, "start-attempt"]), "start attempt");
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
    appendRunnerLog(taskDir, ["## State Operation", "- Operation: complete attempt", ""]);
  }
  const state = readState(taskDir);
  const latestExecuteCheckRel = executeCheckRel(state.latest_attempt);
  const latestReviewRel = reviewRel(state.latest_attempt);

  requireOk(runNodeLogged({ taskDir, scriptsDir, name: "lint-execution-log.js", args: [path.join(taskDir, "execution-log.md")], label: "lint execution log" }), "lint-execution-log");
  requireOk(runNodeLogged({ taskDir, scriptsDir, name: "lint-phase-check.js", args: [path.join(taskDir, latestExecuteCheckRel)], label: "lint execute phase check" }), "lint execute phase check");
  requireOk(runNode(stateScript, [taskDir, "register-phase-check", latestExecuteCheckRel]), "register execute phase check");
  appendRunnerLog(taskDir, ["## State Operation", `- Operation: register execute phase check ${latestExecuteCheckRel}`, ""]);
  if (readState(taskDir).phase === "execute") {
    requireOk(runNode(stateScript, [taskDir, "advance", "review"]), "advance review");
    appendRunnerLog(taskDir, ["## State Operation", "- Operation: advance review", ""]);
  }

  const reviewPath = path.join(taskDir, latestReviewRel);
  requireOk(runNodeLogged({ taskDir, scriptsDir, name: "lint-review.js", args: [reviewPath], label: "lint review" }), "lint-review");
  requireOk(runNode(stateScript, [taskDir, "register-review", latestReviewRel]), "register review");
  appendRunnerLog(taskDir, ["## State Operation", `- Operation: register review ${latestReviewRel}`, ""]);
  const review = fs.readFileSync(reviewPath, "utf8");
  const verdict = field(review, "Verdict");
  const failType = field(review, "Fail Type");
  const classification = field(review, "Failure Classification");
  let next = "human_brief";
  if (verdict === "pass" && failType === "none" && classification === "none") next = "done";
  else if (verdict === "fail" && failType === "auto" && ["implementation-bug", "build-type-failure"].includes(classification)) next = "repair";
  requireOk(runNode(stateScript, [taskDir, "advance", next]), `advance ${next}`);
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

  await runExecute({ options, taskDir, projectRoot, scriptsDir });
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
});

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

function writeRunnerFailure(taskDir, rel, reason, result) {
  const target = path.join(taskDir, rel);
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

async function runProviderSession({ options, taskDir, projectRoot, prompt }) {
  let sawSoftLimit = false;
  let sawHardLimit = false;
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
    onBudget: (budget) => {
      if (budget.state === "soft_limit") sawSoftLimit = true;
      if (budget.state === "hard_limit") sawHardLimit = true;
      process.stderr.write(`[runner] budget ${budget.state} ${(budget.ratio * 100).toFixed(1)}%\n`);
    },
    onInterrupt: (reason, signal) => {
      process.stderr.write(`[runner] interrupt ${reason} -> ${signal}\n`);
    },
  });

  if (!result.ok) {
    writeRunnerFailure(taskDir, options.runnerFailureRel, "codex provider failed", result);
    process.stderr.write(`[runner] runner failure written ${options.runnerFailureRel}\n`);
    process.stderr.write(result.stderr || "codex provider failed\n");
    if (result.jsonlError) process.stderr.write(`${result.jsonlError.message}\n`);
    process.exit(1);
  }

  const drained = sawSoftLimit || sawHardLimit || result.interrupted;
  if (drained) {
    const handoff = path.join(taskDir, "handoff.md");
    if (!fs.existsSync(handoff)) {
      writeRunnerFailure(taskDir, options.runnerFailureRel, "handoff missing after context limit or interrupt", result);
      process.stderr.write(`[runner] runner failure written ${options.runnerFailureRel}\n`);
      process.stderr.write("[runner] context limit reached but handoff.md was not written\n");
      process.exit(1);
    }
  }

  return { ...result, drained };
}

function script(scriptsDir, name) {
  return path.join(scriptsDir, name);
}

function templateText(scriptsDir, name) {
  const file = path.join(scriptsDir, "..", "templates", name);
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
}

async function runPrepare({ options, taskDir, projectRoot, scriptsDir }) {
  requireOk(runNode(script(scriptsDir, "lint-intake.js"), [path.join(taskDir, "intake.md")]), "lint-intake");
  await runProviderSession({
    options,
    taskDir,
    projectRoot,
    prompt: [
      "RUNNER_PREPARE_GENERATE",
      "Prepare native longtask plan and contract from the existing intake.",
      "Write plan.md and contracts/sprint-01.md from intake.md.",
      "Write only the intake phase check if needed for state advancement.",
      "Do not write plan or contract critic phase checks; those are produced by independent critic sessions.",
      "Leave contract Status proposed and stop before execute.",
    ].join("\n"),
  });

  const stateScript = script(scriptsDir, "longtask-state.js");
  requireOk(runNode(script(scriptsDir, "lint-phase-check.js"), [path.join(taskDir, "phase-checks/intake-check-01.md")]), "lint intake phase check");
  requireOk(runNode(stateScript, [taskDir, "register-phase-check", "phase-checks/intake-check-01.md"]), "register intake phase check");
  if (readState(taskDir).phase === "intake") requireOk(runNode(stateScript, [taskDir, "advance", "plan"]), "advance plan");

  requireOk(runNode(script(scriptsDir, "lint-plan.js"), [path.join(taskDir, "plan.md")]), "lint-plan");
  await runProviderSession({
    options,
    taskDir,
    projectRoot,
    prompt: [
      "RUNNER_PLAN_CRITIC",
      "You are an independent plan critic subagent.",
      "Read intake.md and plan.md only from artifacts. Do not use generator chat history.",
      "Write phase-checks/plan-check-01.md with Verdict pass, revise, or escalate.",
      "",
      templateText(scriptsDir, "plan-critic-prompt.md"),
    ].join("\n"),
  });
  requireOk(runNode(script(scriptsDir, "lint-phase-check.js"), [path.join(taskDir, "phase-checks/plan-check-01.md")]), "lint plan phase check");
  requireOk(runNode(stateScript, [taskDir, "register-phase-check", "phase-checks/plan-check-01.md"]), "register plan phase check");
  if (readState(taskDir).phase === "plan") requireOk(runNode(stateScript, [taskDir, "advance", "contract"]), "advance contract");

  await runProviderSession({
    options,
    taskDir,
    projectRoot,
    prompt: [
      "RUNNER_CONTRACT_CRITIC",
      "You are an independent contract critic subagent.",
      "Read intake.md, plan.md, and contracts/sprint-01.md only from artifacts. Do not use generator chat history.",
      "Write phase-checks/contract-check-01.md with Verdict pass, revise, or escalate.",
      "",
      templateText(scriptsDir, "contract-critic-prompt.md"),
    ].join("\n"),
  });
  requireOk(runNode(script(scriptsDir, "lint-phase-check.js"), [path.join(taskDir, "phase-checks/contract-check-01.md")]), "lint contract phase check");
  requireOk(runNode(script(scriptsDir, "lint-contract.js"), [path.join(taskDir, "contracts/sprint-01.md")]), "lint-contract");
  requireOk(runNode(stateScript, [taskDir, "register-phase-check", "phase-checks/contract-check-01.md"]), "register contract phase check");

  process.stdout.write("[runner] prepare complete; review plan.md and contracts/sprint-01.md before execute\n");
}

async function runExecute({ options, taskDir, projectRoot, scriptsDir }) {
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
    requireOk(runNode(script(scriptsDir, "lint-human-brief.js"), [path.join(taskDir, "human-brief.md")]), "lint human brief");
    requireOk(runNode(stateScript, [taskDir, "set-human-brief", "human-brief.md"]), "set human brief");
    process.stdout.write(`[runner] max repair attempts ${options.maxRepairAttempts} reached; routed to human_brief\n`);
    return;
  }
  requireOk(runNode(script(scriptsDir, "check-execution-ready.js"), [taskDir]), "check-execution-ready");
  if (readState(taskDir).phase === "contract") requireOk(runNode(stateScript, [taskDir, "advance", "execute"]), "advance execute");
  if (readState(taskDir).attempt_status !== "active") requireOk(runNode(stateScript, [taskDir, "start-attempt"]), "start attempt");

  const pkg = deriveWorkPackage(taskDir);
  const session = await runProviderSession({
    options,
    taskDir,
    projectRoot,
    prompt: renderPrompt(pkg, { ...options, templateText: templateText(scriptsDir, "execution-checker-prompt.md") }),
  });
  if (session.drained) {
    requireOk(runNode(script(scriptsDir, "check-recovery-ready.js"), [taskDir]), "check recovery after handoff");
    process.stdout.write("[runner] execute paused for handoff\n");
    return;
  }

  if (readState(taskDir).attempt_status === "active") requireOk(runNode(stateScript, [taskDir, "complete-attempt"]), "complete attempt");
  const state = readState(taskDir);
  const latestExecuteCheckRel = executeCheckRel(state.latest_attempt);
  const latestReviewRel = reviewRel(state.latest_attempt);

  requireOk(runNode(script(scriptsDir, "lint-execution-log.js"), [path.join(taskDir, "execution-log.md")]), "lint-execution-log");
  requireOk(runNode(script(scriptsDir, "lint-phase-check.js"), [path.join(taskDir, latestExecuteCheckRel)]), "lint execute phase check");
  requireOk(runNode(stateScript, [taskDir, "register-phase-check", latestExecuteCheckRel]), "register execute phase check");
  if (readState(taskDir).phase === "execute") requireOk(runNode(stateScript, [taskDir, "advance", "review"]), "advance review");

  const reviewPath = path.join(taskDir, latestReviewRel);
  requireOk(runNode(script(scriptsDir, "lint-review.js"), [reviewPath]), "lint-review");
  requireOk(runNode(stateScript, [taskDir, "register-review", latestReviewRel]), "register review");
  const review = fs.readFileSync(reviewPath, "utf8");
  const verdict = field(review, "Verdict");
  const failType = field(review, "Fail Type");
  const classification = field(review, "Failure Classification");
  let next = "human_brief";
  if (verdict === "pass" && failType === "none" && classification === "none") next = "done";
  else if (verdict === "fail" && failType === "auto" && ["implementation-bug", "build-type-failure"].includes(classification)) next = "repair";
  requireOk(runNode(stateScript, [taskDir, "advance", next]), `advance ${next}`);
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

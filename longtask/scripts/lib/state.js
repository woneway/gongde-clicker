const fs = require("node:fs");
const path = require("node:path");

const defaultTransitions = {
  intake: ["plan", "human_brief"],
  plan: ["contract", "human_brief"],
  contract: ["execute", "human_brief"],
  execute: ["review", "repair", "human_brief"],
  review: ["done", "repair", "human_brief"],
  repair: ["execute", "human_brief"],
  human_brief: ["intake", "contract", "done"],
  done: [],
};

function field(text, name) {
  const esc = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(`^- \\*\\*${esc}\\*\\*:[ \\t]*(.*)$`, "m"));
  return match ? match[1].trim() : null;
}

function readState(taskDir) {
  const statePath = path.join(taskDir, "state.json");
  if (!fs.existsSync(statePath)) {
    throw new Error(`missing state.json: ${statePath}`);
  }
  return JSON.parse(fs.readFileSync(statePath, "utf8"));
}

function writeState(taskDir, state) {
  fs.mkdirSync(taskDir, { recursive: true });
  fs.writeFileSync(path.join(taskDir, "state.json"), `${JSON.stringify(state, null, 2)}\n`);
}

function executionLogPath(taskDir, state) {
  const rel = state.artifacts && state.artifacts.execution_log ? state.artifacts.execution_log : "execution-log.md";
  return path.join(taskDir, rel);
}

function appendExecutionLog(taskDir, state, lines) {
  const logPath = executionLogPath(taskDir, state);
  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  let text = fs.existsSync(logPath) ? fs.readFileSync(logPath, "utf8") : `# Execution Log: ${state.task_id || path.basename(taskDir)}\n`;
  if (!/\n## Attempts\b/.test(text)) {
    text = `${text.replace(/\s*$/, "\n\n")}## Attempts\n`;
  }
  const block = `${lines.join("\n")}\n`;
  fs.writeFileSync(logPath, `${text.replace(/\s*$/, "\n\n")}${block}`);
}

function phaseCheckPassed(taskDir, state, phase) {
  const artifacts = state.artifacts || {};
  for (const rel of artifacts.phase_checks || []) {
    const file = path.join(taskDir, rel);
    if (!fs.existsSync(file)) continue;
    const text = fs.readFileSync(file, "utf8");
    if (field(text, "Phase") === phase && field(text, "Verdict") === "pass") return true;
  }
  return false;
}

function requiresPhaseCheck(phase) {
  return ["intake", "plan", "contract", "execute"].includes(phase);
}

function findProjectRoot(taskDir) {
  let dir = path.resolve(taskDir);
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, "longtask", "config.yaml"))) return dir;
    dir = path.dirname(dir);
  }
  return path.resolve(taskDir, "..", "..", "..");
}

function parseInlineList(value) {
  const trimmed = value.trim();
  if (!/^\[.*\]$/.test(trimmed)) return null;
  return trimmed.slice(1, -1).split(",").map((item) => item.trim()).filter(Boolean);
}

function loadTransitions(taskDir) {
  const configPath = path.join(findProjectRoot(taskDir), "longtask", "config.yaml");
  if (!fs.existsSync(configPath)) return defaultTransitions;
  const lines = fs.readFileSync(configPath, "utf8").split(/\r?\n/);
  const transitions = {};
  let inTransitions = false;
  for (const line of lines) {
    if (/^transitions:\s*$/.test(line)) {
      inTransitions = true;
      continue;
    }
    if (inTransitions && /^\S/.test(line)) break;
    if (!inTransitions) continue;
    const match = line.match(/^  ([A-Za-z_]+):\s*(.*)$/);
    if (!match) continue;
    const parsed = parseInlineList(match[2]);
    if (parsed) transitions[match[1]] = parsed;
  }
  return Object.keys(transitions).length ? transitions : defaultTransitions;
}

function ensureArtifacts(state) {
  state.artifacts = state.artifacts || {};
  state.artifacts.contracts = state.artifacts.contracts || [];
  state.artifacts.phase_checks = state.artifacts.phase_checks || [];
  state.artifacts.reviews = state.artifacts.reviews || [];
  return state.artifacts;
}

function ensureRelativeExisting(taskDir, rel, label) {
  if (!rel || path.isAbsolute(rel) || rel.includes("..")) {
    throw new Error(`${label} must be a relative artifact path`);
  }
  if (!fs.existsSync(path.join(taskDir, rel))) {
    throw new Error(`missing ${label} ${rel}`);
  }
}

function addUnique(list, value) {
  if (!list.includes(value)) list.push(value);
}

function attemptNumber(attempt) {
  const match = String(attempt || "").match(/^attempt-(\d+)$/);
  return match ? parseInt(match[1], 10) : 0;
}

function formatAttempt(number) {
  return `attempt-${String(number).padStart(2, "0")}`;
}

function nextAttempt(taskDir, state) {
  const attempts = new Set();
  if (state.latest_attempt) attempts.add(state.latest_attempt);
  const evidenceDir = path.join(taskDir, "evidence");
  if (fs.existsSync(evidenceDir)) {
    for (const entry of fs.readdirSync(evidenceDir)) {
      if (/^attempt-\d+$/.test(entry)) attempts.add(entry);
    }
  }
  const highest = [...attempts].reduce((max, attempt) => Math.max(max, attemptNumber(attempt)), 0);
  return formatAttempt(highest + 1);
}

function activeAttempt(state) {
  return state.attempt_status === "active" && state.latest_attempt;
}

function reviewNumberFromPath(rel) {
  const match = path.basename(rel).match(/^review-(\d+)\.md$/);
  return match ? parseInt(match[1], 10) : 0;
}

function assertReviewMatchesAttempt(state, rel) {
  if (!state.latest_attempt) return;
  const reviewNumber = reviewNumberFromPath(rel);
  const latestNumber = attemptNumber(state.latest_attempt);
  if (reviewNumber && latestNumber && reviewNumber !== latestNumber) {
    throw new Error(`${path.basename(rel, ".md")} does not match latest attempt ${state.latest_attempt}`);
  }
}

function reviewForLatestAttempt(taskDir, state) {
  if (!state.latest_attempt) {
    throw new Error("missing latest attempt for review routing");
  }
  const latestNumber = attemptNumber(state.latest_attempt);
  const artifacts = state.artifacts || {};
  for (const rel of artifacts.reviews || []) {
    if (reviewNumberFromPath(rel) !== latestNumber) continue;
    const file = path.join(taskDir, rel);
    if (!fs.existsSync(file)) continue;
    return { rel, text: fs.readFileSync(file, "utf8") };
  }
  throw new Error(`missing registered review for latest attempt ${state.latest_attempt}`);
}

function assertReviewRoutes(taskDir, state, nextPhase) {
  if (state.phase !== "review") return;
  const review = reviewForLatestAttempt(taskDir, state);
  const verdict = field(review.text, "Verdict");
  const failType = field(review.text, "Fail Type");
  const classification = field(review.text, "Failure Classification");

  if (nextPhase === "done") {
    if (verdict === "pass" && failType === "none" && classification === "none") return;
    if (verdict === "fail") throw new Error("review verdict fail routes to repair or human_brief");
    throw new Error(`review verdict ${verdict || "unknown"} cannot route to done`);
  }

  if (nextPhase === "repair") {
    if (verdict === "fail" && failType === "auto" && ["implementation-bug", "build-type-failure"].includes(classification)) return;
    if (verdict === "fail" && failType === "human") {
      throw new Error("review verdict fail with Fail Type human must route to human_brief");
    }
    throw new Error(`review verdict ${verdict || "unknown"} routes to repair only for auto implementation-bug or build-type-failure`);
  }

  if (nextPhase === "human_brief") {
    if (verdict === "fail" && failType === "human") return;
    if (verdict === "escalate") return;
    throw new Error(`review verdict ${verdict || "unknown"} cannot route to human_brief`);
  }
}

function assertLegalTransition(taskDir, currentPhase, nextPhase) {
  const transitions = loadTransitions(taskDir);
  const allowed = transitions[currentPhase] || [];
  if (!allowed.includes(nextPhase)) {
    throw new Error(`illegal transition ${currentPhase} -> ${nextPhase}; allowed: ${allowed.join(", ") || "none"}`);
  }
}

function templatePath(taskDir, name) {
  return path.join(findProjectRoot(taskDir), "longtask", "templates", name);
}

function copyTemplate(taskDir, template, rel) {
  const target = path.join(taskDir, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  if (fs.existsSync(target)) return;
  const source = templatePath(taskDir, template);
  const text = fs.existsSync(source) ? fs.readFileSync(source, "utf8") : "";
  fs.writeFileSync(target, text);
}

function initTask(taskDir) {
  const taskId = path.basename(taskDir);
  fs.mkdirSync(taskDir, { recursive: true });
  copyTemplate(taskDir, "intake.md", "intake.md");
  copyTemplate(taskDir, "plan.md", "plan.md");
  copyTemplate(taskDir, "contract.md", "contracts/sprint-01.md");
  copyTemplate(taskDir, "execution-log.md", "execution-log.md");
  fs.mkdirSync(path.join(taskDir, "phase-checks"), { recursive: true });
  fs.mkdirSync(path.join(taskDir, "reviews"), { recursive: true });
  fs.mkdirSync(path.join(taskDir, "evidence"), { recursive: true });
  const state = {
    schema: "longtask-native",
    task_id: taskId,
    phase: "intake",
    current_sprint: "sprint-01",
    latest_attempt: null,
    attempt_status: null,
    artifacts: {
      intake: "intake.md",
      plan: "plan.md",
      execution_log: "execution-log.md",
      contracts: ["contracts/sprint-01.md"],
      phase_checks: [],
      reviews: [],
      human_brief: null,
      handoff: null,
    },
  };
  writeState(taskDir, state);
  return state;
}

function status(taskDir) {
  const state = readState(taskDir);
  return `${state.phase || "unknown"} ${state.current_sprint || "sprint-01"} ${state.latest_attempt || "no-attempt"}`;
}

function advance(taskDir, nextPhase) {
  const state = readState(taskDir);
  const currentPhase = state.phase;
  assertLegalTransition(taskDir, currentPhase, nextPhase);
  assertReviewRoutes(taskDir, state, nextPhase);
  if (requiresPhaseCheck(currentPhase) && !phaseCheckPassed(taskDir, state, currentPhase)) {
    throw new Error(`missing passing phase check for ${currentPhase}`);
  }
  state.phase = nextPhase;
  writeState(taskDir, state);
}

function startAttempt(taskDir) {
  const state = readState(taskDir);
  if (activeAttempt(state)) {
    throw new Error(`latest attempt ${state.latest_attempt} is already active`);
  }
  const attempt = nextAttempt(taskDir, state);
  fs.mkdirSync(path.join(taskDir, "evidence", attempt), { recursive: true });
  state.latest_attempt = attempt;
  state.attempt_status = "active";
  writeState(taskDir, state);
  appendExecutionLog(taskDir, state, [
    `### ${attempt}`,
    `- **Sprint**: ${state.current_sprint || "sprint-01"}`,
    "- **Status**: active",
    `- **Evidence Directory**: \`evidence/${attempt}/\``,
  ]);
  return attempt;
}

function completeAttempt(taskDir) {
  const state = readState(taskDir);
  if (!activeAttempt(state)) {
    throw new Error("no active attempt to complete");
  }
  state.attempt_status = "complete";
  writeState(taskDir, state);
  appendExecutionLog(taskDir, state, [
    `### ${state.latest_attempt}`,
    `- **Sprint**: ${state.current_sprint || "sprint-01"}`,
    "- **Status**: complete",
    `- **Evidence Directory**: \`evidence/${state.latest_attempt}/\``,
    "- **Block Progress**:",
    "  - Completed: attempt evidence captured.",
    "  - Current: execution phase check.",
    "  - Remaining: final independent review.",
  ]);
  return state.latest_attempt;
}

function registerPhaseCheck(taskDir, rel) {
  const state = readState(taskDir);
  ensureRelativeExisting(taskDir, rel, "phase check");
  const artifacts = ensureArtifacts(state);
  addUnique(artifacts.phase_checks, rel);
  writeState(taskDir, state);
}

function registerReview(taskDir, rel) {
  const state = readState(taskDir);
  ensureRelativeExisting(taskDir, rel, "review");
  assertReviewMatchesAttempt(state, rel);
  const artifacts = ensureArtifacts(state);
  addUnique(artifacts.reviews, rel);
  writeState(taskDir, state);
}

function setHumanBrief(taskDir, rel) {
  const state = readState(taskDir);
  ensureRelativeExisting(taskDir, rel, "human brief");
  const artifacts = ensureArtifacts(state);
  artifacts.human_brief = rel;
  state.phase = "human_brief";
  writeState(taskDir, state);
}

function setHandoff(taskDir, rel) {
  const state = readState(taskDir);
  ensureRelativeExisting(taskDir, rel, "handoff");
  const artifacts = ensureArtifacts(state);
  artifacts.handoff = rel;
  writeState(taskDir, state);
}

module.exports = {
  advance,
  completeAttempt,
  initTask,
  registerPhaseCheck,
  registerReview,
  setHandoff,
  setHumanBrief,
  startAttempt,
  status,
};

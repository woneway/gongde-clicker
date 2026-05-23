#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

function usage() {
  process.stderr.write("Usage: node check-recovery-ready.js <task-dir>\n");
  process.exit(2);
}

const taskDir = process.argv[2] ? path.resolve(process.argv[2]) : null;
if (!taskDir) usage();
if (!fs.existsSync(taskDir) || !fs.statSync(taskDir).isDirectory()) usage();

let state = null;
const statePath = path.join(taskDir, "state.json");
if (fs.existsSync(statePath)) {
  try {
    state = JSON.parse(fs.readFileSync(statePath, "utf8"));
  } catch (error) {
    state = { __parseError: error.message };
  }
}

const currentSprint = (state && state.current_sprint) || "sprint-01";
const required = ["intake.md", "plan.md", "state.json", `contracts/${currentSprint}.md`, "execution-log.md"];
const violations = [];
for (const rel of required) {
  if (!fs.existsSync(path.join(taskDir, rel))) violations.push(`[ARTIFACT] missing ${rel}`);
}

function evidencePointers(text) {
  const pointers = new Set();
  const re = /evidence\/attempt-\d+\/[A-Za-z0-9._/-]+/g;
  let match;
  while ((match = re.exec(text)) !== null) {
    pointers.add(match[0].replace(/[),.;:]+$/g, ""));
  }
  return [...pointers];
}

function currentContractPaths(artifacts, currentSprint) {
  const indexed = artifacts.contracts || [];
  if (indexed.length) return indexed;
  return [`contracts/${currentSprint}.md`];
}

if (fs.existsSync(statePath)) {
  if (state && state.__parseError) {
    violations.push(`[STATE] state.json is not valid JSON: ${state.__parseError}`);
  } else {
    if (state.schema !== "longtask-native") violations.push("[STATE] state.json schema must be longtask-native");
    if (!state.phase) violations.push("[STATE] state.json must include phase");
    if (!state.artifacts) violations.push("[STATE] state.json must include artifacts index");
    const artifacts = state.artifacts || {};
    for (const key of ["intake", "plan", "execution_log"]) {
      if (!artifacts[key]) {
        violations.push(`[ARTIFACT] state missing ${key} pointer`);
      } else if (!fs.existsSync(path.join(taskDir, artifacts[key]))) {
        violations.push(`[ARTIFACT] state references missing ${key} ${artifacts[key]}`);
      }
    }
    for (const rel of artifacts.contracts || []) {
      if (!fs.existsSync(path.join(taskDir, rel))) violations.push(`[ARTIFACT] state references missing contract ${rel}`);
    }
    for (const rel of artifacts.phase_checks || []) {
      if (!fs.existsSync(path.join(taskDir, rel))) violations.push(`[ARTIFACT] state references missing phase check ${rel}`);
    }
    for (const rel of artifacts.reviews || []) {
      if (!fs.existsSync(path.join(taskDir, rel))) violations.push(`[ARTIFACT] state references missing review ${rel}`);
    }
    if (artifacts.human_brief && !fs.existsSync(path.join(taskDir, artifacts.human_brief))) {
      violations.push(`[ARTIFACT] state references missing human brief ${artifacts.human_brief}`);
    }
    if (artifacts.handoff && !fs.existsSync(path.join(taskDir, artifacts.handoff))) {
      violations.push(`[ARTIFACT] state references missing handoff ${artifacts.handoff}`);
    }
    if (state.latest_attempt) {
      const evidenceDir = path.join(taskDir, "evidence", state.latest_attempt);
      if (!fs.existsSync(evidenceDir) || !fs.statSync(evidenceDir).isDirectory()) {
        violations.push(`[EVIDENCE] missing evidence/${state.latest_attempt}/`);
      } else if (fs.readdirSync(evidenceDir).length === 0) {
        violations.push(`[EVIDENCE] evidence/${state.latest_attempt}/ is empty`);
      }

      const logRel = artifacts.execution_log || "execution-log.md";
      const logPath = path.join(taskDir, logRel);
      if (fs.existsSync(logPath)) {
        const log = fs.readFileSync(logPath, "utf8");
        if (!new RegExp(`^###\\s+${state.latest_attempt}\\b`, "m").test(log)) {
          violations.push(`[LOG] execution-log missing latest attempt ${state.latest_attempt}`);
        }
      }

      for (const contractRel of currentContractPaths(artifacts, currentSprint)) {
        const contractPath = path.join(taskDir, contractRel);
        if (!fs.existsSync(contractPath)) continue;
        const contract = fs.readFileSync(contractPath, "utf8");
        for (const pointer of evidencePointers(contract).filter((pointer) => pointer.includes(`${state.latest_attempt}/`))) {
          if (!fs.existsSync(path.join(taskDir, pointer))) {
            violations.push(`[EVIDENCE] missing ${pointer}`);
          }
        }
      }
    }
    if (state.phase === "repair" && !fs.existsSync(path.join(taskDir, "handoff.md"))) {
      violations.push("[HANDOFF] repair phase requires handoff.md");
    }
    if (state.phase === "human_brief" && !fs.existsSync(path.join(taskDir, "human-brief.md"))) {
      violations.push("[HUMAN-BRIEF] human_brief phase requires human-brief.md");
    }
  }
}

if (violations.length) {
  process.stdout.write(`check-recovery-ready: FAIL - ${path.relative(process.cwd(), taskDir)} (${violations.length} violation${violations.length === 1 ? "" : "s"})\n`);
  for (const violation of violations) process.stdout.write(`  ${violation}\n`);
  process.exit(1);
}
process.stdout.write(`check-recovery-ready: PASS - ${path.relative(process.cwd(), taskDir)}\n`);

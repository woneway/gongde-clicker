#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const {
  field,
  fieldBlock,
  hasConcreteValue,
  hasEvidencePointer,
  hasVerifyBy,
  readFile,
  runCheck,
} = require("./lib/checks");

function taskRootForContract(file) {
  const dir = path.dirname(path.resolve(file));
  return path.basename(dir) === "contracts" ? path.dirname(dir) : dir;
}

runCheck("lint-contract", process.argv[2], (text, file) => {
  const violations = [];
  for (const name of [
    "Status",
    "Goal",
    "Plan Blocks",
    "Outcome Links",
    "Visible Completion",
    "Context Map",
    "Allowed Write Scope",
    "Verification Plan",
    "Reviewer Routing",
    "Out-of-Scope",
    "Risk Notes",
    "Phase Check",
  ]) {
    if (!hasConcreteValue(field(text, name))) violations.push(`[FIELD] missing concrete ${name}`);
  }
  for (const name of [
    "Acceptance Criteria",
    "Required Evidence",
  ]) {
    if (!hasConcreteValue(fieldBlock(text, name))) violations.push(`[FIELD] missing concrete ${name}`);
  }
  const status = field(text, "Status");
  if (status && !["proposed", "approved", "locked"].includes(status)) {
    violations.push(`[STATUS] status ${status} is outside proposed, approved, locked`);
  }
  if (!hasVerifyBy(text)) violations.push("[AC] acceptance criteria must include concrete Verify by lines");
  if (!/Block\s+\d+:/i.test(field(text, "Plan Blocks") || "")) {
    violations.push("[BLOCKS] Plan Blocks must reference Block N from plan");
  }
  const outcomeLinks = field(text, "Outcome Links") || "";
  if (!/O\d+\b/i.test(outcomeLinks)) {
    violations.push("[TRACEABILITY] Outcome Links must reference at least one plan Outcome ID such as O1");
  }
  if (/\b(partial|unsupported)\b/i.test(outcomeLinks)) {
    violations.push("[TRACEABILITY] Outcome Links must not use partial or unsupported outcomes as acceptance targets");
  }
  if (!/done when|complete|passes|exists|verified/i.test(field(text, "Visible Completion") || "")) {
    violations.push("[BLOCKS] Visible Completion must describe observable completion");
  }
  if (!hasEvidencePointer(fieldBlock(text, "Required Evidence") || "")) {
    violations.push("[EVIDENCE] Required Evidence must cite a command output or evidence artifact");
  }
  const contextMap = field(text, "Context Map") || "";
  for (const label of ["Required Reads", "Optional Reads", "Forbidden Context", "Budget", "Subagent Payload"]) {
    if (!new RegExp(`${label}\\s*:`, "i").test(contextMap)) {
      violations.push(`[CONTEXT] Context Map must include ${label}`);
    }
  }
  const phaseCheck = field(text, "Phase Check");
  if (hasConcreteValue(phaseCheck)) {
    const phaseCheckPath = path.join(taskRootForContract(file), phaseCheck);
    if (!fs.existsSync(phaseCheckPath)) {
      violations.push(`[PHASE-CHECK] missing ${phaseCheck}`);
    } else {
      const check = readFile(phaseCheckPath);
      if (field(check, "Verdict") !== "pass") violations.push(`[PHASE-CHECK] ${phaseCheck} must have Verdict pass`);
      if (field(check, "Phase") !== "contract") violations.push(`[PHASE-CHECK] ${phaseCheck} must be for contract phase`);
    }
  }
  return violations;
});

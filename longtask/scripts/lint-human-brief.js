#!/usr/bin/env node
const { field, hasConcreteSection, hasConcreteValue, hasEvidencePointer, runCheck } = require("./lib/checks");

const phases = ["intake", "plan", "contract", "execute", "review"];
const classifications = [
  "requirement-gap",
  "context-gap",
  "contract-gap",
  "environment-failure",
  "repeated-same-failure",
  "permission-gap",
  "safety-gap",
];
const options = ["intake", "contract", "abort", "escalation", "done"];

runCheck("lint-human-brief", process.argv[2], (text) => {
  const violations = [];
  for (const name of [
    "Trigger Phase",
    "Failure Classification",
    "Decision Needed",
    "Blocked Route",
    "Self-Recovery Tried",
    "Smallest Human Decision",
    "Resume Command",
    "Recommended Options",
  ]) {
    if (!hasConcreteValue(field(text, name))) violations.push(`[FIELD] missing concrete ${name}`);
  }
  const phase = field(text, "Trigger Phase");
  const classification = field(text, "Failure Classification");
  const recommended = field(text, "Recommended Options") || "";
  if (phase && !phases.includes(phase)) violations.push(`[PHASE] Trigger Phase ${phase} is not recognized`);
  if (classification && !classifications.includes(classification)) {
    violations.push(`[CLASSIFICATION] Failure Classification ${classification} is not recognized for human brief`);
  }
  if (recommended && !recommended.split(/[,|]/).map((item) => item.trim()).some((item) => options.includes(item))) {
    violations.push("[OPTIONS] Recommended Options must include intake, contract, abort, escalation, or done");
  }
  if (!/`node longtask\/scripts\/longtask-state\.js [^`]+`/.test(field(text, "Resume Command") || "")) {
    violations.push("[DECISION] Resume Command must include a backticked longtask-state.js command");
  }
  if (!hasEvidencePointer(text)) violations.push("[EVIDENCE] human brief must cite evidence artifacts or command output");
  if (!hasConcreteSection(text, "Summary")) violations.push("[SUMMARY] missing concrete summary");
  return violations;
});

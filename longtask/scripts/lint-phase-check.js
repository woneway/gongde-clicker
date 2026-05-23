#!/usr/bin/env node
const { field, hasConcreteSection, hasConcreteValue, hasEvidencePointer, runCheck } = require("./lib/checks");

const allowedPhases = ["intake", "plan", "contract", "execute"];
const allowedVerdicts = ["pass", "revise", "escalate"];

runCheck("lint-phase-check", process.argv[2], (text) => {
  const violations = [];
  for (const name of [
    "Phase",
    "Artifact",
    "Critic Role",
    "Verdict",
    "Drift Check",
    "Context Boundary",
    "Self-Recovery Attempted",
    "Escalation Decision",
    "Required Revisions",
    "Evidence Checked",
  ]) {
    if (!hasConcreteValue(field(text, name))) violations.push(`[FIELD] missing concrete ${name}`);
  }

  const phase = field(text, "Phase");
  const verdict = field(text, "Verdict");
  const contextBoundary = field(text, "Context Boundary") || "";

  if (phase && !allowedPhases.includes(phase)) {
    violations.push(`[PHASE] Phase ${phase} is outside ${allowedPhases.join(", ")}`);
  }
  if (verdict && !allowedVerdicts.includes(verdict)) {
    violations.push(`[VERDICT] Verdict must be pass, revise, or escalate`);
  }
  if (verdict === "pass" && !/none/i.test(field(text, "Required Revisions") || "")) {
    violations.push("[REVISIONS] pass requires Required Revisions to be none");
  }
  if (!/(checked|read|queried|reviewed|artifacts|source|evidence|none needed)/i.test(field(text, "Self-Recovery Attempted") || "")) {
    violations.push("[SELF-RECOVERY] must describe what was checked before escalation");
  }
  if (verdict === "pass" && !/none/i.test(field(text, "Escalation Decision") || "")) {
    violations.push("[ESCALATION] pass requires Escalation Decision to be none");
  }
  if (!/no .*chat history|not receive|without .*history|artifact/i.test(contextBoundary)) {
    violations.push("[CONTEXT] Context Boundary must state what history or context was withheld");
  }
  if (!hasConcreteSection(text, "Findings")) violations.push("[FINDINGS] missing concrete findings");
  if (!hasEvidencePointer(text)) violations.push("[EVIDENCE] phase check must cite evidence, commands, or source pointers");

  return violations;
});

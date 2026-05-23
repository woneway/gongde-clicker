#!/usr/bin/env node
const { field, hasConcreteSection, hasConcreteValue, hasEvidencePointer, runCheck } = require("./lib/checks");

const allowedClassifications = [
  "none",
  "requirement-gap",
  "context-gap",
  "contract-gap",
  "build-type-failure",
  "implementation-bug",
  "environment-failure",
  "repeated-same-failure",
  "permission-gap",
  "safety-gap",
];

runCheck("lint-review", process.argv[2], (text) => {
  const violations = [];
  const verdict = field(text, "Verdict");
  const failType = field(text, "Fail Type");
  const classification = field(text, "Failure Classification");
  const routing = field(text, "Routing Reason");

  if (!["pass", "fail", "escalate"].includes(verdict)) violations.push("[VERDICT] Verdict must be pass, fail, or escalate");
  if (!["none", "auto", "human"].includes(failType)) violations.push("[FAIL-TYPE] Fail Type must be none, auto, or human");
  if (!allowedClassifications.includes(classification)) violations.push("[CLASSIFICATION] Failure Classification is not recognized");
  if (!hasConcreteValue(routing)) violations.push("[ROUTING] Routing Reason must be concrete");
  if (!hasConcreteSection(text, "Findings")) violations.push("[FINDINGS] missing concrete findings");
  if (!hasEvidencePointer(text)) violations.push("[EVIDENCE] review must cite evidence artifacts or command output");
  if (verdict === "pass" && failType !== "none") violations.push("[ROUTING] pass requires Fail Type none");
  if (verdict === "pass" && classification !== "none") violations.push("[ROUTING] pass requires Failure Classification none");
  if (verdict === "fail" && classification === "none") violations.push("[ROUTING] fail requires concrete Failure Classification");
  if (verdict === "fail" && failType === "none") violations.push("[ROUTING] fail requires Fail Type auto or human");
  if (verdict === "fail" && failType === "auto" && !["implementation-bug", "build-type-failure"].includes(classification)) {
    violations.push("[ROUTING] fail + auto requires implementation-bug or build-type-failure");
  }
  if (["environment-failure", "repeated-same-failure"].includes(classification) && failType === "auto") {
    violations.push("[ROUTING] environment-failure and repeated-same-failure cannot use Fail Type auto");
  }
  if (classification === "build-type-failure" && !/build-error-resolver/i.test(text)) {
    violations.push("[ROUTING] build-type-failure must route to build-error-resolver");
  }
  const humanSensitive = ["requirement-gap", "context-gap", "contract-gap", "repeated-same-failure", "permission-gap", "safety-gap"];
  if (humanSensitive.includes(classification) && failType === "auto") {
    violations.push("[ROUTING] human-sensitive classifications cannot use Fail Type auto");
  }
  return violations;
});

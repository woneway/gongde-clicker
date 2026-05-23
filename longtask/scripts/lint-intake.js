#!/usr/bin/env node
const { hasConcreteSection, runCheck } = require("./lib/checks");

runCheck("lint-intake", process.argv[2], (text) => {
  const violations = [];
  for (const heading of [
    "Requirement",
    "Context",
    "Assumptions",
    "Non-Goals",
    "Decisions",
    "Open Questions",
    "Clarification Coverage",
    "Resolved Unknowns",
    "Readiness Decision",
  ]) {
    if (!hasConcreteSection(text, heading)) {
      const code = ["Clarification Coverage", "Resolved Unknowns", "Readiness Decision"].includes(heading) ? "CLARIFICATION" : "SECTION";
      violations.push(`[${code}] missing concrete ## ${heading}`);
    }
  }
  if (!/Ready for planning:\s*(yes|no)\b/i.test(text)) {
    violations.push("[CLARIFICATION] Readiness Decision must state Ready for planning: yes or no");
  }
  return violations;
});

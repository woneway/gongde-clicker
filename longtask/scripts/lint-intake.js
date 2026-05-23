#!/usr/bin/env node
const { hasConcreteSection, runCheck } = require("./lib/checks");

function section(text, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(`^## ${escaped}\\s*$`, "m"));
  if (!match) return "";
  const start = match.index + match[0].length;
  const next = text.slice(start).match(/\n## /);
  return (next ? text.slice(start, start + next.index) : text.slice(start)).trim();
}

function hasStageOnlyImplementationBoundary(text) {
  const target = [
    section(text, "Requirement"),
    section(text, "Non-Goals"),
    section(text, "Decisions"),
  ].join("\n");
  const hasStageScope = /(当前|本阶段|intake\s*阶段|澄清阶段|需求入口阶段|事实基线|事实\s*baseline)/i.test(target);
  const hasImplementationBlock = /(不直接进入|不进入|不做|不实现|不修改|不改|暂不实现|暂不改|暂不进入).{0,16}(实现|改版|代码|UI|功能|开发)/i.test(target);
  return hasStageScope && hasImplementationBlock;
}

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
  if (hasStageOnlyImplementationBoundary(text)) {
    violations.push("[SCOPE] Requirement/Non-Goals/Decisions must describe the full task, not encode intake-stage-only implementation limits");
  }
  return violations;
});

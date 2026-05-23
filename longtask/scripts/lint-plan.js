#!/usr/bin/env node
const { hasConcreteSection, runCheck, section } = require("./lib/checks");

runCheck("lint-plan", process.argv[2], (text) => {
  const violations = [];
  for (const heading of [
    "Goal",
    "Architecture",
    "Finished Picture",
    "Building Blocks",
    "Assembly Order",
    "Progress Checkpoints",
    "File Map",
    "Tasks",
    "Verification",
  ]) {
    if (!hasConcreteSection(text, heading)) {
      const code = ["Finished Picture", "Building Blocks", "Assembly Order", "Progress Checkpoints"].includes(heading) ? "BLUEPRINT" : "SECTION";
      violations.push(`[${code}] missing concrete ## ${heading}`);
    }
  }
  if (/\b(TBD|TODO|implement later|fill in details)\b/i.test(text)) {
    violations.push("[PLACEHOLDER] plan contains placeholder language");
  }
  if (!/(Create|Modify|Test):\s+`[^`]+`/i.test(section(text, "File Map") || "")) {
    violations.push("[FILE-MAP] File Map must list concrete Create/Modify/Test paths");
  }
  if (!/Block\s+\d+:/i.test(section(text, "Building Blocks") || "")) {
    violations.push("[BLUEPRINT] Building Blocks must list Block N entries");
  }
  if (!/done when/i.test(section(text, "Progress Checkpoints") || "")) {
    violations.push("[BLUEPRINT] Progress Checkpoints must define done-when checks");
  }
  if (!/`[^`]*(npm|node|pytest|uv|curl|bash|pnpm|yarn|test)[^`]*`/i.test(section(text, "Verification") || "")) {
    violations.push("[VERIFICATION] Verification must include a concrete command");
  }
  return violations;
});

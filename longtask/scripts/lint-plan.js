#!/usr/bin/env node
const { hasConcreteSection, hasConcreteValue, runCheck, section } = require("./lib/checks");

function outcomeBlocks(text) {
  const value = section(text, "Outcome Traceability") || "";
  return value
    .split(/(?=^- \*\*Outcome ID\*\*:)/m)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function outcomeField(block, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = block.match(new RegExp(`^\\s*- \\*\\*${escaped}\\*\\*:[ \\t]*(.*)$`, "m"));
  return match ? match[1].trim() : "";
}

function blockNumbers(text) {
  const value = section(text, "Building Blocks") || "";
  return [...value.matchAll(/\bBlock\s+(\d+)\s*:/gi)].map((match) => Number(match[1]));
}

function sprintLines(text) {
  const value = section(text, "Sprint Plan") || "";
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^-\s*sprint-\d+:/i.test(line));
}

runCheck("lint-plan", process.argv[2], (text) => {
  const violations = [];
  for (const heading of [
    "Goal",
    "Architecture",
    "Finished Picture",
    "Building Blocks",
    "Assembly Order",
    "Progress Checkpoints",
    "Sprint Plan",
    "Outcome Traceability",
    "File Map",
    "Tasks",
    "Verification",
  ]) {
    if (!hasConcreteSection(text, heading)) {
      const code = ["Finished Picture", "Building Blocks", "Assembly Order", "Progress Checkpoints", "Sprint Plan"].includes(heading) ? "BLUEPRINT" : "SECTION";
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
  const knownBlocks = blockNumbers(text);
  const knownBlockSet = new Set(knownBlocks);
  const assignedBlocks = new Map();
  const sprints = sprintLines(text);
  if (!sprints.length) {
    violations.push("[SPRINT-PLAN] Sprint Plan must list at least sprint-01");
  }
  sprints.forEach((line, index) => {
    const expected = `sprint-${String(index + 1).padStart(2, "0")}`;
    const match = line.match(/^-\s*(sprint-(\d+)):\s*(.+)$/i);
    if (!match) {
      violations.push(`[SPRINT-PLAN] Sprint Plan line ${index + 1} must use "- sprint-NN: Block N - goal"`);
      return;
    }
    const sprint = match[1].toLowerCase();
    const number = Number(match[2]);
    const body = match[3].trim();
    if (sprint !== expected || number !== index + 1) {
      violations.push(`[SPRINT-PLAN] ${sprint} must be consecutive and start at ${expected}`);
    }
    const refs = [...body.matchAll(/\bBlock\s+(\d+)\b/gi)].map((ref) => Number(ref[1]));
    if (!refs.length) {
      violations.push(`[SPRINT-PLAN] ${sprint} must reference at least one Block N`);
    }
    const goal = body.replace(/\bBlock\s+\d+\b/gi, "").replace(/[,，、;；:-]/g, " ").trim();
    if (!hasConcreteValue(goal)) {
      violations.push(`[SPRINT-PLAN] ${sprint} must include a concrete sprint goal`);
    }
    refs.forEach((block) => {
      if (!knownBlockSet.has(block)) {
        violations.push(`[SPRINT-PLAN] ${sprint} references missing Block ${block}`);
      }
      if (assignedBlocks.has(block)) {
        violations.push(`[SPRINT-PLAN] Block ${block} assigned more than once (${assignedBlocks.get(block)} and ${sprint})`);
      }
      assignedBlocks.set(block, sprint);
    });
  });
  knownBlocks.forEach((block) => {
    if (!assignedBlocks.has(block)) {
      violations.push(`[SPRINT-PLAN] Block ${block} must be assigned to a sprint`);
    }
  });
  const outcomes = outcomeBlocks(text);
  if (!outcomes.length) {
    violations.push("[TRACEABILITY] Outcome Traceability must list at least one Outcome ID");
  }
  outcomes.forEach((block, index) => {
    const label = outcomeField(block, "Outcome ID") || `#${index + 1}`;
    const level = outcomeField(block, "Level");
    const status = outcomeField(block, "Status");
    if (!/^O\d+\b/i.test(label)) {
      violations.push(`[TRACEABILITY] Outcome ID ${label} must use O<N> format`);
    }
    if (!/^(critical|important|advisory)$/i.test(level)) {
      violations.push(`[TRACEABILITY] ${label} Level must be critical, important, or advisory`);
    }
    if (!/^(closed|partial|unsupported|out-of-scope)$/i.test(status)) {
      violations.push(`[TRACEABILITY] ${label} Status must be closed, partial, unsupported, or out-of-scope`);
    }
    for (const name of ["Outcome", "Mechanism", "Supporting Blocks/Tasks", "Evidence", "Boundary"]) {
      if (!hasConcreteValue(outcomeField(block, name))) {
        violations.push(`[TRACEABILITY] ${label} missing concrete ${name}`);
      }
    }
    if (/^critical$/i.test(level) && !/^closed$/i.test(status)) {
      violations.push(`[TRACEABILITY] critical ${label} must be closed before contract`);
    }
    if (/^closed$/i.test(status) && !/Block\s+\d+|Task\s+\d+/i.test(outcomeField(block, "Supporting Blocks/Tasks"))) {
      violations.push(`[TRACEABILITY] closed ${label} must cite supporting Block or Task`);
    }
  });
  if (!/`[^`]*(npm|node|pytest|uv|curl|bash|pnpm|yarn|test)[^`]*`/i.test(section(text, "Verification") || "")) {
    violations.push("[VERIFICATION] Verification must include a concrete command");
  }
  return violations;
});

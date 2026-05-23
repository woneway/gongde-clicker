const fs = require("node:fs");
const path = require("node:path");

function read(taskDir, rel) {
  return fs.readFileSync(path.join(taskDir, rel), "utf8");
}

function section(text, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(`(^|\\n)##\\s+${escaped}\\b[^\\n]*\\n([\\s\\S]*?)(?=\\n##\\s|\\n*$)`));
  return match ? match[2].trim() : "";
}

function bulletLines(text) {
  return text
    .split(/\r?\n/)
    .filter((line) => /^\s*- /.test(line))
    .map((line) => line.trim());
}

function field(text, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(`^- \\*\\*${escaped}\\*\\*:[ \\t]*(.*)$`, "m"));
  return match ? match[1].trim() : "";
}

function acceptanceItems(contractText) {
  const match = contractText.match(/^- \*\*Acceptance Criteria\*\*:\s*\n([\s\S]*?)(?=^- \*\*|$)/m);
  const source = match ? match[1] : "";
  return source
    .split(/\r?\n(?=\s*\d+\. \*\*)/)
    .map((item) => item.trim())
    .filter((item) => /^\d+\. \*\*/.test(item));
}

function requiredEvidence(contractText) {
  const match = contractText.match(/^- \*\*Required Evidence\*\*:\s*\n([\s\S]*?)(?=^- \*\*|$)/m);
  return match ? bulletLines(match[1]) : [];
}

function planBlocks(planText) {
  return bulletLines(section(planText, "Building Blocks")).filter((line) => /Block \d+:/i.test(line));
}

function currentBlock(planText, executionLog) {
  const blocks = planBlocks(planText);
  if (!blocks.length) throw new Error("plan has no Building Blocks");
  const currentMatch = executionLog.match(/Current:\s*(Block \d+[^.\n]*)/i);
  if (currentMatch) {
    const wanted = currentMatch[1].replace(/\s+/g, " ").trim();
    const found = blocks.find((block) => block.replace(/\s+/g, " ").includes(wanted));
    if (found) return found;
  }
  return blocks[0];
}

function criteriaForBlock(criteria, block) {
  const blockNumber = (block.match(/Block\s+(\d+)/i) || [])[1];
  const matches = criteria.filter((item) => blockNumber && item.toLowerCase().includes(`block ${blockNumber}`));
  return matches.length ? matches : criteria.slice(0, 1);
}

function contractRelForSprint(artifacts, sprint) {
  const wanted = `contracts/${sprint || "sprint-01"}.md`;
  const contracts = artifacts.contracts || [];
  return contracts.find((relPath) => path.basename(relPath, ".md") === (sprint || "sprint-01")) || wanted;
}

function deriveWorkPackage(taskDir) {
  const state = JSON.parse(read(taskDir, "state.json"));
  if (state.schema !== "longtask-native") throw new Error("state schema must be longtask-native");
  const artifacts = state.artifacts || {};
  const planRel = artifacts.plan || "plan.md";
  const logRel = artifacts.execution_log || "execution-log.md";
  const currentSprint = state.current_sprint || "sprint-01";
  const contractRel = contractRelForSprint(artifacts, currentSprint);
  const planText = read(taskDir, planRel);
  const contractText = read(taskDir, contractRel);
  const logPath = path.join(taskDir, logRel);
  const executionLog = fs.existsSync(logPath) ? read(taskDir, logRel) : "";
  const planBlock = currentBlock(planText, executionLog);
  const allCriteria = acceptanceItems(contractText);

  return {
    taskDir,
    taskId: state.task_id || path.basename(taskDir),
    phase: state.phase,
    currentSprint,
    latestAttempt: state.latest_attempt || "none",
    planRel,
    contractRel,
    executionLogRel: logRel,
    handoffRel: artifacts.handoff || "handoff.md",
    planBlock,
    acceptanceCriteria: criteriaForBlock(allCriteria, planBlock),
    requiredEvidence: requiredEvidence(contractText),
    allowedWriteScope: field(contractText, "Allowed Write Scope"),
    verificationPlan: field(contractText, "Verification Plan"),
  };
}

module.exports = { deriveWorkPackage };

function renderMaxRepairHumanBrief({ taskId, maxRepairAttempts, latestAttempt, reviewRel, handoffRel }) {
  const id = taskId || "<task-id>";
  return [
    `# 人工简报：${id}`,
    "",
    "- **Trigger Phase**: review",
    "- **Failure Classification**: repeated-same-failure",
    `- **Decision Needed**: 自动修复已达到 ${maxRepairAttempts} 次上限；需要决定是修订 contract、回到 intake，还是停止任务。`,
    "- **Blocked Route**: 继续自动修复可能持续改代码，但无法解决同一个底层失败。",
    `- **Self-Recovery Tried**: 已检查最新 attempt ${latestAttempt || "unknown"}、最新 review 和 handoff 指针，再路由到人工决策。`,
    "- **Smallest Human Decision**: 选择一个路线：修订 contract、回到 intake、中止，或仅在外部证据足够时标记完成。",
    `- **Resume Command**: \`node longtask/scripts/longtask-state.js docs/longtasks/${id} status\``,
    "- **Recommended Options**: contract, intake, abort, escalation",
    "- **Evidence**:",
    `  - \`${reviewRel || "reviews/review-NN.md"}\``,
    `  - \`${handoffRel || "handoff.md"}\``,
    "",
    "## Summary",
    "",
    `自动修复已达到配置上限 ${maxRepairAttempts} 次。继续自动修改前，必须由人类决定下一条路线。`,
    "",
  ].join("\n");
}

module.exports = { renderMaxRepairHumanBrief };

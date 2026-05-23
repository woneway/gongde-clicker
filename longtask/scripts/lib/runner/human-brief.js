function renderMaxRepairHumanBrief({ taskId, maxRepairAttempts, latestAttempt, reviewRel, handoffRel }) {
  const id = taskId || "<task-id>";
  return [
    `# Human Brief: ${id}`,
    "",
    "- **Trigger Phase**: review",
    "- **Failure Classification**: repeated-same-failure",
    `- **Decision Needed**: automatic repair reached ${maxRepairAttempts} attempts; decide whether to revise the contract, return to intake, or stop.`,
    "- **Blocked Route**: repeated automatic repair may continue changing code without resolving the underlying failure.",
    `- **Self-Recovery Tried**: reviewed latest attempt ${latestAttempt || "unknown"}, latest review, and handoff pointers before routing to human decision.`,
    "- **Smallest Human Decision**: choose one route: revise contract, return to intake, abort, or mark done only if external evidence justifies it.",
    `- **Resume Command**: \`node longtask/scripts/longtask-state.js docs/longtasks/${id} status\``,
    "- **Recommended Options**: contract, intake, abort, escalation",
    "- **Evidence**:",
    `  - \`${reviewRel || "reviews/review-NN.md"}\``,
    `  - \`${handoffRel || "handoff.md"}\``,
    "",
    "## Summary",
    "",
    `Automatic repair reached the configured limit of ${maxRepairAttempts}. A human must decide the next route before more automatic changes are safe.`,
    "",
  ].join("\n");
}

module.exports = { renderMaxRepairHumanBrief };

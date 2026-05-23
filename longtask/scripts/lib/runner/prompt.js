function list(items) {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "- none";
}

function renderPrompt(pkg, budget) {
  const parts = [
    "You are running one bounded native longtask work package.",
    "",
    "Do not rely on prior chat history. Use only the artifacts and source pointers named below unless the package explicitly allows more.",
    "",
    `Task: ${pkg.taskId}`,
    `Phase: ${pkg.phase}`,
    `Sprint: ${pkg.currentSprint}`,
    `Latest Attempt: ${pkg.latestAttempt}`,
    "",
    "Work only on this Plan Block:",
    pkg.planBlock,
    "",
    "Acceptance Criteria for this session:",
    list(pkg.acceptanceCriteria),
    "",
    "Required Evidence:",
    list(pkg.requiredEvidence),
    "",
    "Allowed Write Scope:",
    pkg.allowedWriteScope || "none",
    "",
    "Verification Plan:",
    pkg.verificationPlan || "none",
    "",
    "Required Reads:",
    `- ${pkg.planRel}`,
    `- ${pkg.contractRel}`,
    `- ${pkg.executionLogRel}`,
    `- ${pkg.handoffRel} when it exists`,
    "",
    "Budget Rules:",
    `- Context soft limit ratio: ${budget.softRatio}`,
    `- Context hard limit ratio: ${budget.hardRatio}`,
    `- Configured context limit: ${budget.contextLimit}`,
    "- If near the context soft limit, finish the current atomic action, update evidence/logs, write `handoff.md`, and exit.",
    "- Do not start the next Plan Block.",
    "- Do not expand the write scope.",
    "",
    "`handoff.md` must include current phase and sprint, completed work, current atomic action status, remaining work, next recommended command, required reads, evidence paths, verification status, risks or unresolved questions, and git/worktree status summary.",
    "",
  ];

  if (budget.templateText) {
    parts.push("Native workflow prompt template:", "", budget.templateText.trim(), "");
  }

  return parts.join("\n");
}

module.exports = { renderPrompt };

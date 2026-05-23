function attemptNumber(attempt) {
  const match = String(attempt || "").match(/^attempt-(\d+)$/);
  if (!match) throw new Error(`invalid attempt ${attempt || "none"}`);
  return match[1].padStart(2, "0");
}

function executeCheckRel(attempt) {
  return `phase-checks/execute-check-${attemptNumber(attempt)}.md`;
}

function reviewRel(attempt) {
  return `reviews/review-${attemptNumber(attempt)}.md`;
}

module.exports = { attemptNumber, executeCheckRel, reviewRel };

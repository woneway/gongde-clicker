function usageFromCodex(usage) {
  const inputTokens = Number(usage.input_tokens || 0);
  const cachedInputTokens = Number(usage.cached_input_tokens || 0);
  const outputTokens = Number(usage.output_tokens || 0);
  const reasoningOutputTokens = Number(usage.reasoning_output_tokens || 0);
  const effectiveInputTokens = Math.max(inputTokens - cachedInputTokens, 0);
  const grossUsedTokens = inputTokens + outputTokens + reasoningOutputTokens;
  const effectiveUsedTokens = effectiveInputTokens + outputTokens + reasoningOutputTokens;
  return {
    inputTokens,
    cachedInputTokens,
    outputTokens,
    reasoningOutputTokens,
    effectiveInputTokens,
    grossUsedTokens,
    effectiveUsedTokens,
    usedTokens: effectiveUsedTokens,
  };
}

function budgetStatus({ usedTokens, contextLimit, softRatio, hardRatio }) {
  const ratio = usedTokens / contextLimit;
  let state = "running";
  if (ratio >= hardRatio) state = "hard_limit";
  else if (ratio >= softRatio) state = "soft_limit";
  return { state, ratio, usedTokens, contextLimit };
}

module.exports = { budgetStatus, usageFromCodex };

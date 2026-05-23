const { usageFromCodex } = require("./budget");

function parseJsonlLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch (error) {
    throw new Error(`invalid Codex JSONL: ${error.message}`);
  }
}

function usageEvent(event) {
  if (!event || event.type !== "turn.completed" || !event.usage) return null;
  return usageFromCodex(event.usage);
}

module.exports = { parseJsonlLine, usageEvent };

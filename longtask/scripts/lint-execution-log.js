#!/usr/bin/env node
const { runCheck } = require("./lib/checks");

runCheck("lint-execution-log", process.argv[2], (text) => {
  const violations = [];
  if (!/^## Attempts\b/m.test(text)) violations.push("[ATTEMPTS] missing ## Attempts");
  const parts = text.split(/^###\s+/m).slice(1).map((part) => {
    const [heading, ...rest] = part.split("\n");
    return { attempt: heading.trim().split(/\s+/)[0], body: rest.join("\n") };
  });
  if (!parts.length) violations.push("[ATTEMPTS] missing attempt entries");
  const statuses = new Map();
  for (const { attempt, body } of parts) {
    if (!/^attempt-\d+$/.test(attempt)) {
      violations.push(`[ATTEMPT] ${attempt} is not a canonical attempt-NN heading`);
      continue;
    }
    if (!/- \*\*Status\*\*:\s*(active|complete)\b/m.test(body)) {
      violations.push(`[STATUS] ${attempt} missing Status active or complete`);
    }
    if (!/- \*\*Evidence Directory\*\*:\s*`evidence\/attempt-\d+\/`/m.test(body)) {
      violations.push(`[EVIDENCE] ${attempt} missing Evidence Directory`);
    }
    const statusMatch = body.match(/- \*\*Status\*\*:\s*(active|complete)\b/m);
    if (statusMatch && statusMatch[1] === "complete" && !/- \*\*Block Progress\*\*:/m.test(body)) {
      violations.push(`[PROGRESS] ${attempt} complete entry must include Block Progress`);
    }
    if (/- \*\*Block Progress\*\*:/m.test(body)) {
      for (const label of ["Completed", "Current", "Remaining"]) {
        if (!new RegExp(`- ${label}:\\s+`, "m").test(body)) {
          violations.push(`[PROGRESS] ${attempt} Block Progress missing ${label}`);
        }
      }
      if (/\b(none recorded|replace with)\b/i.test(body)) {
        violations.push(`[PROGRESS] ${attempt} Block Progress must not contain placeholder progress`);
      }
    }
    if (statusMatch) {
      const list = statuses.get(attempt) || [];
      list.push(statusMatch[1]);
      statuses.set(attempt, list);
    }
  }
  for (const [attempt, list] of statuses) {
    if (list.includes("complete") && !list.includes("active")) {
      violations.push(`[STATUS] ${attempt} complete entry requires an active entry`);
    }
  }
  return violations;
});

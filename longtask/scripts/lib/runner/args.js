function numberFlag(name, value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) throw new Error(`${name} must be a positive number`);
  return parsed;
}

function parseArgs(argv) {
  const args = [...argv];
  const taskDir = args.shift();
  if (!taskDir) throw new Error("usage: longtask-runner <task-dir> [--provider codex] [--context-limit N]");

  const parsed = {
    taskDir,
    mode: "execute",
    provider: "codex",
    contextLimit: 200000,
    softRatio: 0.5,
    hardRatio: 0.75,
    codexBin: "codex",
    drainTimeoutMs: 30000,
    maxSessionMs: 0,
    softDrainMs: 30000,
    hardKillMs: 5000,
    runnerFailureRel: "runner-failure.md",
    maxRepairAttempts: 5,
  };

  for (let i = 0; i < args.length; i += 1) {
    const flag = args[i];
    const value = args[i + 1];
    if (!flag.startsWith("--")) throw new Error(`unexpected argument ${flag}`);
    if (value === undefined || value.startsWith("--")) throw new Error(`${flag} requires a value`);
    i += 1;

    if (flag === "--mode") parsed.mode = value;
    else if (flag === "--provider") parsed.provider = value;
    else if (flag === "--context-limit") parsed.contextLimit = numberFlag(flag, value);
    else if (flag === "--soft-ratio") parsed.softRatio = numberFlag(flag, value);
    else if (flag === "--hard-ratio") parsed.hardRatio = numberFlag(flag, value);
    else if (flag === "--codex-bin") parsed.codexBin = value;
    else if (flag === "--drain-timeout-ms") parsed.drainTimeoutMs = numberFlag(flag, value);
    else if (flag === "--max-session-ms") parsed.maxSessionMs = numberFlag(flag, value);
    else if (flag === "--soft-drain-ms") parsed.softDrainMs = numberFlag(flag, value);
    else if (flag === "--hard-kill-ms") parsed.hardKillMs = numberFlag(flag, value);
    else if (flag === "--runner-failure") parsed.runnerFailureRel = value;
    else if (flag === "--max-repair-attempts") parsed.maxRepairAttempts = numberFlag(flag, value);
    else throw new Error(`unknown flag ${flag}`);
  }

  if (parsed.provider !== "codex") throw new Error(`unsupported provider ${parsed.provider}`);
  if (!["prepare", "execute"].includes(parsed.mode)) throw new Error(`unsupported mode ${parsed.mode}`);
  if (parsed.softRatio >= parsed.hardRatio) throw new Error("soft ratio must be lower than hard ratio");
  if (parsed.hardRatio > 1) throw new Error("hard ratio must be <= 1");

  return parsed;
}

module.exports = { parseArgs };

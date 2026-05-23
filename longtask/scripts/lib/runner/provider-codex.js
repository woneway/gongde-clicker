const { spawn } = require("node:child_process");
const { budgetStatus } = require("./budget");
const { parseJsonlLine, usageEvent } = require("./codex-jsonl");

function buildCodexExecArgs({ cwd, prompt }) {
  return [
    "exec",
    "--json",
    "-C",
    cwd,
    "--dangerously-bypass-approvals-and-sandbox",
    prompt,
  ];
}

function runCodex({
  codexBin,
  cwd,
  prompt,
  contextLimit,
  softRatio,
  hardRatio,
  maxSessionMs,
  softDrainMs,
  hardKillMs,
  onBudget,
  onInterrupt,
}) {
  return new Promise((resolve) => {
    const child = spawn(
      codexBin,
      buildCodexExecArgs({ cwd, prompt }),
      { cwd, stdio: ["ignore", "pipe", "pipe"] }
    );

    let stdout = "";
    let stderr = "";
    let jsonlError = null;
    let lastBudget = null;
    let interrupted = false;
    let interruptReason = null;
    let closed = false;
    const timers = [];

    function interrupt(reason, signal) {
      if (closed) return;
      interrupted = true;
      interruptReason = interruptReason || reason;
      if (onInterrupt) onInterrupt(reason, signal);
      child.kill(signal);
    }

    if (maxSessionMs > 0) {
      timers.push(setTimeout(() => {
        interrupt("max-session-ms", "SIGINT");
        timers.push(setTimeout(() => {
          interrupt("soft-drain-ms", "SIGTERM");
          timers.push(setTimeout(() => {
            interrupt("hard-kill-ms", "SIGKILL");
          }, hardKillMs || 5000));
        }, softDrainMs || 30000));
      }, maxSessionMs));
    }

    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
      for (const line of chunk.split(/\r?\n/)) {
        if (!line.trim()) continue;
        try {
          const event = parseJsonlLine(line);
          const usage = usageEvent(event);
          if (usage) {
            lastBudget = budgetStatus({
              usedTokens: usage.usedTokens,
              contextLimit,
              softRatio,
              hardRatio,
            });
            if (onBudget) onBudget(lastBudget, usage);
          }
        } catch (error) {
          jsonlError = error;
        }
      }
    });

    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });

    child.on("error", (error) => {
      closed = true;
      for (const timer of timers) clearTimeout(timer);
      resolve({ ok: false, code: null, stdout, stderr: `${stderr}${error.message}`, lastBudget, jsonlError, interrupted, interruptReason });
    });

    child.on("close", (code, signal) => {
      closed = true;
      for (const timer of timers) clearTimeout(timer);
      resolve({ ok: code === 0 && !jsonlError, code, signal, stdout, stderr, lastBudget, jsonlError, interrupted, interruptReason });
    });
  });
}

module.exports = { buildCodexExecArgs, runCodex };

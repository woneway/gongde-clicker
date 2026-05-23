const { spawn } = require("node:child_process");
const fs = require("node:fs");
const { budgetStatus } = require("./budget");
const { parseJsonlLine, usageEvent } = require("./codex-jsonl");

function buildCodexExecArgs({ cwd }) {
  return [
    "exec",
    "--json",
    "-C",
    cwd,
    "--dangerously-bypass-approvals-and-sandbox",
    "-",
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
  stdoutPath,
  stderrPath,
  onBudget,
  onInterrupt,
  onEvent,
}) {
  return new Promise((resolve) => {
    if (stdoutPath) fs.writeFileSync(stdoutPath, "");
    if (stderrPath) fs.writeFileSync(stderrPath, "");
    const child = spawn(
      codexBin,
      buildCodexExecArgs({ cwd }),
      { cwd, stdio: ["pipe", "pipe", "pipe"] }
    );
    if (child.stdin) child.stdin.end(prompt);

    let stdout = "";
    let stderr = "";
    let jsonlError = null;
    let lastBudget = null;
    let lastUsage = null;
    let pendingStdout = "";
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
      if (stdoutPath) fs.appendFileSync(stdoutPath, chunk);
      pendingStdout += chunk;
      const lines = pendingStdout.split(/\r?\n/);
      pendingStdout = lines.pop() || "";
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const event = parseJsonlLine(line);
          if (event && onEvent) onEvent(event);
          const usage = usageEvent(event);
          if (usage) {
            lastUsage = usage;
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
      if (stderrPath) fs.appendFileSync(stderrPath, chunk);
    });

    child.on("error", (error) => {
      closed = true;
      for (const timer of timers) clearTimeout(timer);
      resolve({ ok: false, code: null, stdout, stderr: `${stderr}${error.message}`, lastBudget, lastUsage, jsonlError, interrupted, interruptReason });
    });

    child.on("close", (code, signal) => {
      closed = true;
      for (const timer of timers) clearTimeout(timer);
      if (pendingStdout.trim()) {
        try {
          const event = parseJsonlLine(pendingStdout);
          if (event && onEvent) onEvent(event);
          const usage = usageEvent(event);
          if (usage) {
            lastUsage = usage;
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
      resolve({ ok: code === 0 && !jsonlError, code, signal, stdout, stderr, lastBudget, lastUsage, jsonlError, interrupted, interruptReason });
    });
  });
}

module.exports = { buildCodexExecArgs, runCodex };

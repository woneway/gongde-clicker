#!/usr/bin/env node
const path = require("node:path");
const stateLib = require("./lib/state");

function usage() {
  process.stderr.write(
    "Usage: node longtask-state.js <task-dir> <init|status|advance|start-attempt|complete-attempt|register-phase-check|register-review|set-human-brief|set-handoff> [value]\n"
  );
  process.exit(2);
}

const taskDir = process.argv[2] ? path.resolve(process.argv[2]) : null;
const command = process.argv[3];
if (!taskDir || !command) usage();

try {
  if (command === "status") {
    process.stdout.write(`${stateLib.status(taskDir)}\n`);
  } else if (command === "init") {
    stateLib.initTask(taskDir);
    process.stdout.write(`initialized ${path.relative(process.cwd(), taskDir)}\n`);
  } else if (command === "advance") {
    const nextPhase = process.argv[4];
    if (!nextPhase) usage();
    stateLib.advance(taskDir, nextPhase);
    process.stdout.write(`advanced ${path.relative(process.cwd(), taskDir)} to ${nextPhase}\n`);
  } else if (command === "start-attempt") {
    const attempt = stateLib.startAttempt(taskDir);
    process.stdout.write(`started ${attempt}\n`);
  } else if (command === "complete-attempt") {
    const attempt = stateLib.completeAttempt(taskDir);
    process.stdout.write(`completed ${attempt}\n`);
  } else if (command === "register-phase-check") {
    const rel = process.argv[4];
    if (!rel) usage();
    stateLib.registerPhaseCheck(taskDir, rel);
    process.stdout.write(`registered phase check ${rel}\n`);
  } else if (command === "register-review") {
    const rel = process.argv[4];
    if (!rel) usage();
    stateLib.registerReview(taskDir, rel);
    process.stdout.write(`registered review ${rel}\n`);
  } else if (command === "set-human-brief") {
    const rel = process.argv[4];
    if (!rel) usage();
    stateLib.setHumanBrief(taskDir, rel);
    process.stdout.write(`set human brief ${rel}\n`);
  } else if (command === "set-handoff") {
    const rel = process.argv[4];
    if (!rel) usage();
    stateLib.setHandoff(taskDir, rel);
    process.stdout.write(`set handoff ${rel}\n`);
  } else {
    usage();
  }
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
}

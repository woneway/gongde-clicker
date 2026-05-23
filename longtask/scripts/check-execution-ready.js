#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const { field, hasConcreteValue, readFile } = require("./lib/checks");

function usage() {
  process.stderr.write("Usage: node check-execution-ready.js <task-dir>\n");
  process.exit(2);
}

const taskDir = process.argv[2] ? path.resolve(process.argv[2]) : null;
if (!taskDir) usage();
if (!fs.existsSync(taskDir) || !fs.statSync(taskDir).isDirectory()) usage();

function readState() {
  const statePath = path.join(taskDir, "state.json");
  if (!fs.existsSync(statePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(statePath, "utf8"));
  } catch {
    return null;
  }
}

const state = readState();
const currentSprint = (state && state.current_sprint) || "sprint-01";
const contractPath = path.join(taskDir, "contracts", `${currentSprint}.md`);
const logPath = path.join(taskDir, "execution-log.md");
const handoffPath = path.join(taskDir, "handoff.md");
const violations = [];
const v = (rule, message) => violations.push(`[${rule}] ${message}`);

if (!fs.existsSync(contractPath)) v("CONTRACT", `missing contracts/${currentSprint}.md`);
if (!fs.existsSync(logPath)) v("LOG", "missing execution-log.md");

let contract = "";
if (fs.existsSync(contractPath)) contract = readFile(contractPath);
if (field(contract, "Status") !== "locked") v("CONTRACT", "contract status must be locked before execution");
if (!hasConcreteValue(field(contract, "Allowed Write Scope"))) v("WRITE-SCOPE", "contract must define Allowed Write Scope");
const phaseCheckRel = field(contract, "Phase Check");
if (!phaseCheckRel) {
  v("CONTRACT", "contract must reference its Phase Check before execution");
} else {
  const phaseCheckPath = path.join(taskDir, phaseCheckRel);
  if (!fs.existsSync(phaseCheckPath)) {
    v("CONTRACT", `missing contract phase check ${phaseCheckRel}`);
  } else {
    const phaseCheck = readFile(phaseCheckPath);
    if (field(phaseCheck, "Phase") !== "contract" || field(phaseCheck, "Verdict") !== "pass") {
      v("CONTRACT", `${phaseCheckRel} must be a passing contract phase check`);
    }
    if (field(phaseCheck, "Artifact") !== `contracts/${currentSprint}.md`) {
      v("CONTRACT", `${phaseCheckRel} must check contracts/${currentSprint}.md`);
    }
  }
}

function reviewNumber(name) {
  const match = name.match(/^review-(\d+)\.md$/);
  return match ? parseInt(match[1], 10) : -1;
}

const latestReview = fs.existsSync(path.join(taskDir, "reviews"))
  ? fs.readdirSync(path.join(taskDir, "reviews")).filter((name) => /^review-\d+\.md$/.test(name)).sort((a, b) => reviewNumber(a) - reviewNumber(b)).pop()
  : null;
if (latestReview) {
  const review = readFile(path.join(taskDir, "reviews", latestReview));
  const verdict = field(review, "Verdict");
  const failType = field(review, "Fail Type");
  const classification = field(review, "Failure Classification");
  if (verdict === "fail") {
    if (failType !== "auto") v("REPAIR", `latest review ${latestReview} is not auto-repairable`);
    if (!["implementation-bug", "build-type-failure"].includes(classification)) {
      v("REPAIR", `Failure Classification ${classification} cannot auto-enter execution`);
    }
    if (!fs.existsSync(handoffPath)) v("HANDOFF", "failed review requires handoff.md before repair execution");
    if (classification === "build-type-failure" && fs.existsSync(handoffPath) && !/build-error-resolver/i.test(readFile(handoffPath))) {
      v("HANDOFF", "build-type-failure handoff must route to build-error-resolver");
    }
  }
}

if (violations.length) {
  process.stdout.write(`check-execution-ready: FAIL - ${path.relative(process.cwd(), taskDir)} (${violations.length} violation${violations.length === 1 ? "" : "s"})\n`);
  for (const violation of violations) process.stdout.write(`  ${violation}\n`);
  process.exit(1);
}
process.stdout.write(`check-execution-ready: PASS - ${path.relative(process.cwd(), taskDir)}\n`);

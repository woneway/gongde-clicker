const fs = require("node:fs");
const path = require("node:path");

function readFile(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch (error) {
    throw new Error(`cannot read ${file}: ${error.message}`);
  }
}

function rel(file) {
  return path.relative(process.cwd(), file) || file;
}

function section(text, heading) {
  const esc = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(`(^|\\n)##\\s+${esc}\\b[^\\n]*\\n([\\s\\S]*?)(?=\\n##\\s|\\n*$)`));
  return match ? match[2].trim() : null;
}

function field(text, name) {
  const esc = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(`^- \\*\\*${esc}\\*\\*:[ \\t]*(.*)$`, "m"));
  return match ? match[1].trim() : null;
}

function fieldBlock(text, name) {
  const esc = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(`^- \\*\\*${esc}\\*\\*:[ \\t]*(.*)$`, "m"));
  if (!match) return null;
  const firstLine = match[1].trim();
  const start = match.index + match[0].length;
  const nextField = text.slice(start).match(/\n- \*\*[^*]+\*\*:/);
  const rest = nextField ? text.slice(start, start + nextField.index) : text.slice(start);
  return [firstLine, rest.trim()].filter(Boolean).join("\n").trim();
}

function hasConcreteValue(value) {
  if (value === null || value === undefined) return false;
  const trimmed = String(value).trim();
  if (!trimmed) return false;
  if (/^<[^>]*>$/.test(trimmed)) return false;
  if (/^(tbd|todo|n\/?a|none needed|\.{3}|…|\[.*\])$/i.test(trimmed)) return false;
  return true;
}

function hasConcreteSection(text, heading) {
  return hasConcreteValue(section(text, heading));
}

function hasEvidencePointer(text) {
  return /evidence\/attempt-\d+\/|`[^`]*(npm|node|pytest|uv|curl|test|bash|pnpm|yarn)[^`]*`|`[^`]+\.(md|js|jsx|ts|tsx|json|xml|yaml|yml|css|html|txt|png)`|\.png\b|\.txt\b|stdout|stderr|exit\s+\d/i.test(text);
}

function hasVerifyBy(text) {
  return /^\s*[-*]\s*Verify by:\s*(?!<|$).+/im.test(text);
}

function artifactRoot(file) {
  let dir = path.dirname(path.resolve(file));
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, "state.json")) || path.basename(dir) === "contracts" || path.basename(dir) === "reviews") {
      if (path.basename(dir) === "contracts" || path.basename(dir) === "reviews") return path.dirname(dir);
      return dir;
    }
    dir = path.dirname(dir);
  }
  return path.dirname(path.resolve(file));
}

function evidencePointers(text) {
  const pointers = new Set();
  const re = /evidence\/attempt-\d+\/[A-Za-z0-9._/-]+/g;
  let match;
  while ((match = re.exec(text)) !== null) {
    pointers.add(match[0].replace(/[),.;:]+$/g, ""));
  }
  return [...pointers];
}

function missingEvidencePointers(text, file) {
  const root = artifactRoot(file);
  return evidencePointers(text).filter((pointer) => !fs.existsSync(path.join(root, pointer)));
}

function fail(name, file, violations) {
  process.stdout.write(`${name}: FAIL - ${rel(file)} (${violations.length} violation${violations.length === 1 ? "" : "s"})\n`);
  for (const violation of violations) process.stdout.write(`  ${violation}\n`);
  process.exit(1);
}

function pass(name, file) {
  process.stdout.write(`${name}: PASS - ${rel(file)}\n`);
  process.exit(0);
}

function runCheck(name, file, checker) {
  if (!file) {
    process.stderr.write(`Usage: node ${path.basename(process.argv[1])} <artifact>\n`);
    process.exit(2);
  }
  const target = path.resolve(file);
  let text;
  try {
    text = readFile(target);
  } catch (error) {
    process.stderr.write(`${name}: ${error.message}\n`);
    process.exit(3);
  }
  const violations = checker(text, target);
  if (violations.length) fail(name, target, violations);
  pass(name, target);
}

module.exports = {
  field,
  fieldBlock,
  hasConcreteSection,
  hasConcreteValue,
  hasEvidencePointer,
  hasVerifyBy,
  missingEvidencePointers,
  readFile,
  runCheck,
  section,
};

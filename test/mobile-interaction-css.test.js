import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

test("clicker surface disables mobile tap highlights and accidental text selection", () => {
  assert.match(css, /-webkit-tap-highlight-color:\s*transparent/);
  assert.match(css, /\.clicker-page\s*{[^}]*user-select:\s*none/s);
  assert.match(css, /\.wooden-fish\s*{[^}]*-webkit-user-select:\s*none/s);
});

test("wooden fish keeps keyboard focus visible without drawing a mobile black box", () => {
  assert.match(css, /\.wooden-fish:focus\s*{[^}]*outline:\s*none/s);
  assert.match(css, /@media\s*\(hover:\s*hover\)\s*and\s*\(pointer:\s*fine\)/);
});

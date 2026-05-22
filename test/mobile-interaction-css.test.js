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

test("clicker motion uses polished but reducible animation primitives", () => {
  assert.match(css, /\.wooden-fish\.is-hit\s*{[^}]*fish-hit/s);
  assert.match(css, /\.wooden-fish\.is-hit::after\s*{[^}]*fish-pulse/s);
  assert.match(css, /\.floater\s*{[^}]*animation:\s*float-up/s);
  assert.match(css, /\.combo-line\.is-combo-hot\s*{[^}]*combo-pop/s);
  assert.match(css, /\.progress-card\.is-pulsing\s+\.progress-track::after/s);
  assert.match(css, /\.share-button:active\s*{[^}]*transform/s);
  assert.match(css, /\.share-status\.has-feedback\s*{[^}]*color:\s*var\(--rose\)/s);
  assert.match(css, /@keyframes fish-hit/);
  assert.match(css, /@keyframes fish-pulse/);
  assert.match(css, /@keyframes combo-pop/);
  assert.match(css, /@keyframes progress-sweep/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
});

import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const layout = readFileSync(new URL("../app/layout.js", import.meta.url), "utf8");
const sitemap = readFileSync(
  new URL("../public/sitemap.xml", import.meta.url),
  "utf8",
);

test("site navigation exposes review-friendly informational pages", () => {
  assert.match(layout, /href="\/how-it-works"/);
  assert.match(layout, /href="\/faq"/);
});

test("sitemap includes the informational pages on the canonical domain", () => {
  assert.match(sitemap, /https:\/\/gongdeclicker\.com\/how-it-works/);
  assert.match(sitemap, /https:\/\/gongdeclicker\.com\/faq/);
});

test("informational route files exist", () => {
  assert.equal(
    existsSync(new URL("../app/how-it-works/page.js", import.meta.url)),
    true,
  );
  assert.equal(existsSync(new URL("../app/faq/page.js", import.meta.url)), true);
});

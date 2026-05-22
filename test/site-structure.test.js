import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const layout = readFileSync(new URL("../app/layout.js", import.meta.url), "utf8");
const sitemap = readFileSync(
  new URL("../public/sitemap.xml", import.meta.url),
  "utf8",
);
const clicker = readFileSync(
  new URL("../components/gongde-clicker.jsx", import.meta.url),
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

test("home page keeps detailed review copy off the product surface", () => {
  assert.doesNotMatch(clicker, /What it is/);
  assert.doesNotMatch(clicker, /How to use/);
  assert.doesNotMatch(clicker, /Privacy/);
  assert.doesNotMatch(clicker, /Note/);
});

test("home page focuses on achievement and share-card flow", () => {
  assert.doesNotMatch(clicker, /quiet-space/);
  assert.doesNotMatch(clicker, /今日休息区/);
  assert.match(clicker, /朋友圈/);
  assert.match(clicker, /getAchievementProgress/);
});

test("root layout includes the AdSense publisher verification script", () => {
  assert.match(layout, /pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/);
  assert.match(layout, /client=ca-pub-1739691894917552/);
});

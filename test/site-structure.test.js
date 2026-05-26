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
  assert.doesNotMatch(clicker, /wish-card-panel/);
  assert.match(clicker, /保存愿望功德图/);
  assert.match(clicker, /has-feedback/);
  assert.match(clicker, /manualShareText/);
  assert.match(clicker, /手动复制文案/);
  assert.match(clicker, /getAchievementProgress/);
});

test("root layout includes the AdSense publisher verification script", () => {
  assert.match(layout, /pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/);
  assert.match(layout, /client=ca-pub-1739691894917552/);
});

test("home page exposes search-friendly copy for core queries", () => {
  assert.match(clicker, /seo-summary/);
  assert.match(clicker, /在线电子木鱼/);
  assert.match(clicker, /木鱼模拟器/);
  assert.match(clicker, /上班摸鱼解压/);
});

test("root layout describes the product with WebApplication structured data", () => {
  assert.match(layout, /"@type": "WebApplication"/);
  assert.match(layout, /"name": "功德敲敲"/);
  assert.match(layout, /"alternateName": "Gongde Clicker"/);
  assert.match(layout, /"applicationCategory": "EntertainmentApplication"/);
});

test("FAQ page exposes FAQPage structured data", () => {
  const faqPage = readFileSync(new URL("../app/faq/page.js", import.meta.url), "utf8");

  assert.match(faqPage, /"@type": "FAQPage"/);
  assert.match(faqPage, /"@type": "Question"/);
  assert.match(faqPage, /"@type": "Answer"/);
});

test("sitemap lastmod reflects the latest SEO update", () => {
  assert.match(sitemap, /<lastmod>2026-05-26<\/lastmod>/);
});

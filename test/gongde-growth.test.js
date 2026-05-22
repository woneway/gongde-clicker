import test from "node:test";
import assert from "node:assert/strict";
import {
  getAchievements,
  getDailyFortune,
  getShareText,
} from "../lib/gongde-growth.js";

test("getDailyFortune returns the same fortune for the same date", () => {
  assert.deepEqual(getDailyFortune("2026-05-22"), getDailyFortune("2026-05-22"));
});

test("getDailyFortune returns a complete fortune", () => {
  const fortune = getDailyFortune("2026-05-22");

  assert.equal(typeof fortune.title, "string");
  assert.equal(typeof fortune.text, "string");
  assert.equal(typeof fortune.good, "string");
  assert.equal(typeof fortune.avoid, "string");
  assert.ok(fortune.title.length > 0);
  assert.ok(fortune.text.length > 0);
  assert.ok(fortune.good.length > 0);
  assert.ok(fortune.avoid.length > 0);
});

test("getAchievements marks badges unlocked from local stats", () => {
  const achievements = getAchievements({
    today: 31,
    total: 101,
    bestCombo: 12,
    date: "2026-05-22",
  });

  assert.equal(achievements.find((item) => item.id === "first").unlocked, true);
  assert.equal(achievements.find((item) => item.id === "ten").unlocked, true);
  assert.equal(achievements.find((item) => item.id === "hundred").unlocked, true);
  assert.equal(
    achievements.find((item) => item.id === "daily-thirty").unlocked,
    true,
  );
  assert.equal(
    achievements.find((item) => item.id === "combo-ten").unlocked,
    true,
  );
  assert.equal(
    achievements.find((item) => item.id === "combo-thirty").unlocked,
    false,
  );
});

test("getShareText includes today's count, fortune title, and canonical URL", () => {
  const text = getShareText(
    { today: 88, total: 188, bestCombo: 18, date: "2026-05-22" },
    { title: "宜准点下班", text: "", good: "", avoid: "" },
  );

  assert.match(text, /88/);
  assert.match(text, /宜准点下班/);
  assert.match(text, /https:\/\/gongdeclicker\.com/);
});

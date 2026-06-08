import test from "node:test";
import assert from "node:assert/strict";
import {
  getAchievements,
  getAchievementProgress,
  getActiveWish,
  getDailyFortune,
  getDefaultWish,
  getNextDefaultWish,
  getShareText,
  getWishShareText,
  normalizeWish,
  saveWish,
  DEFAULT_WISH_COUNT,
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

test("getAchievementProgress summarizes unlocked badges and next target", () => {
  const progress = getAchievementProgress({
    today: 5,
    total: 5,
    bestCombo: 2,
    date: "2026-05-23",
  });

  assert.equal(progress.unlockedCount, 1);
  assert.equal(progress.totalCount, 12);
  assert.equal(progress.nextAchievement.id, "ten");
  assert.equal(progress.remaining, 5);
  assert.equal(progress.summary, "已解锁 1/12");
  assert.equal(progress.nextLine, "下一枚「十念清心」还差 5 点功德");
});

test("getAchievementProgress handles all achievements unlocked", () => {
  const progress = getAchievementProgress({
    today: 120,
    total: 1200,
    bestCombo: 120,
    streak: 40,
    date: "2026-05-23",
  });

  assert.equal(progress.unlockedCount, 12);
  assert.equal(progress.totalCount, 12);
  assert.equal(progress.nextAchievement, null);
  assert.equal(progress.remaining, 0);
  assert.equal(progress.nextLine, "成就已全部解锁，今天可以安心收工");
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

test("normalizeWish trims whitespace and limits to 32 visible characters", () => {
  const text = normalizeWish(
    "  愿   今天    不临时拉会abcdefghijklmnopqrstuvwxyz0123456789  ",
  );

  assert.equal(text, "愿 今天 不临时拉会abcdefghijklmnopqrstuv");
  assert.equal(Array.from(text).length, 32);
});

test("getDefaultWish returns a deterministic wish for a date", () => {
  assert.equal(getDefaultWish("2026-05-23"), getDefaultWish("2026-05-23"));
  assert.match(getDefaultWish("2026-05-23"), /^愿/);
});

test("default wishes cover a broad set of work and internet situations", () => {
  assert.ok(DEFAULT_WISH_COUNT >= 36);

  const sampledWishes = new Set([getDefaultWish("2026-06-01")]);
  let currentWish = getDefaultWish("2026-06-01");
  for (let index = 0; index < DEFAULT_WISH_COUNT + 4; index += 1) {
    currentWish = getNextDefaultWish("2026-06-01", currentWish);
    sampledWishes.add(currentWish);
  }

  const wishes = Array.from(sampledWishes).join(" ");
  assert.match(wishes, /产品|需求|PRD/);
  assert.match(wishes, /程序员|代码|Bug|构建|上线/);
  assert.match(wishes, /设计|稿|审美/);
  assert.match(wishes, /销售|客户|回款|甲方/);
  assert.match(wishes, /运营|数据|爆单|流量/);
  assert.match(wishes, /老师|学生|论文|实验/);
  assert.match(wishes, /离谱|退退退|上岸|天选/);
});

test("getNextDefaultWish rotates away from the current default wish", () => {
  const current = getDefaultWish("2026-05-23");
  const next = getNextDefaultWish("2026-05-23", current);

  assert.notEqual(next, current);
  assert.match(next, /^愿/);
});

test("getActiveWish returns saved wish for the same date", () => {
  const storage = new MapStorage();

  saveWish(storage, "2026-05-23", " 愿 今天 不加班 ");

  assert.equal(getActiveWish(storage, "2026-05-23"), "愿 今天 不加班");
});

test("getActiveWish resets stale saved wish to the date default", () => {
  const storage = new MapStorage();

  saveWish(storage, "2026-05-22", "愿昨天不加班");

  assert.equal(getActiveWish(storage, "2026-05-23"), getDefaultWish("2026-05-23"));
});

test("getWishShareText includes wish when present", () => {
  const text = getWishShareText(
    { today: 108, total: 208, bestCombo: 18, date: "2026-05-23" },
    { title: "宜准点下班", text: "", good: "", avoid: "" },
    "愿今天不临时拉会",
  );

  assert.equal(
    text,
    "我今天为「愿今天不临时拉会」敲了 108 下功德，今日功德签：宜准点下班。https://gongdeclicker.com",
  );
});

test("getWishShareText falls back to current share text for blank wishes", () => {
  const stats = { today: 18, total: 28, bestCombo: 8, date: "2026-05-23" };
  const fortune = { title: "宜少开会", text: "", good: "", avoid: "" };

  assert.equal(getWishShareText(stats, fortune, " "), getShareText(stats, fortune));
});

class MapStorage {
  #items = new Map();

  getItem(key) {
    return this.#items.get(key) || null;
  }

  setItem(key, value) {
    this.#items.set(key, value);
  }
}

import test from "node:test";
import assert from "node:assert/strict";
import {
  createWishCardModel,
  wrapTextForCard,
} from "../lib/wish-card.js";

test("createWishCardModel includes wish, stats, fortune, and canonical URL", () => {
  const model = createWishCardModel(
    { today: 108, total: 208, bestCombo: 18, date: "2026-05-23" },
    { title: "宜准点下班", text: "", good: "整理桌面", avoid: "临时需求" },
    "愿今天不临时拉会",
  );

  assert.equal(model.width, 1200);
  assert.equal(model.height, 1500);
  assert.equal(model.wish, "愿今天不临时拉会");
  assert.equal(model.countLine, "我已为此敲下 108 点功德");
  assert.equal(model.fortuneLine, "今日签：宜准点下班，忌临时需求");
  assert.equal(model.siteLine, "赛博木鱼 Cyber Muyu · gongdeclicker.com");
});

test("createWishCardModel surfaces streak copy", () => {
  const base = { today: 12, total: 60, bestCombo: 6, date: "2026-05-23" };
  const fortune = { title: "宜少开会", text: "", good: "", avoid: "" };

  assert.equal(
    createWishCardModel(base, fortune, "愿摸鱼不被发现", 5).streakLine,
    "已连续修行 5 天",
  );
  assert.equal(
    createWishCardModel(base, fortune, "愿摸鱼不被发现", 1).streakLine,
    "今天开始修行",
  );
});

test("createWishCardModel falls back to daily ritual copy for blank wish", () => {
  const model = createWishCardModel(
    { today: 8, total: 28, bestCombo: 4, date: "2026-05-23" },
    { title: "宜少开会", text: "", good: "", avoid: "" },
    " ",
  );

  assert.equal(model.wish, "愿今日心态稳定");
});

test("wrapTextForCard wraps by measured width without dropping characters", () => {
  const lines = wrapTextForCard("愿今天不要临时拉会也不要突然改需求", 80, (text) => {
    return text.length * 10;
  });

  assert.deepEqual(lines, ["愿今天不要临时拉", "会也不要突然改需", "求"]);
});

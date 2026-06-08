import test from "node:test";
import assert from "node:assert/strict";
import {
  buildLast7Days,
  computeCurrentStreak,
  computeLongestStreak,
  getStreakInfo,
  recordActiveDay,
  shiftDateKey,
  summarizeStreak,
  GONGDE_STREAK_KEY,
} from "../lib/gongde-streak.js";

class MapStorage {
  #items = new Map();
  getItem(key) {
    return this.#items.has(key) ? this.#items.get(key) : null;
  }
  setItem(key, value) {
    this.#items.set(key, String(value));
  }
}

test("shiftDateKey moves across month boundaries", () => {
  assert.equal(shiftDateKey("2026-03-01", -1), "2026-02-28");
  assert.equal(shiftDateKey("2026-12-31", 1), "2027-01-01");
});

test("computeCurrentStreak counts consecutive days ending today", () => {
  const days = ["2026-05-18", "2026-05-19", "2026-05-20"];
  assert.equal(computeCurrentStreak(days, "2026-05-20"), 3);
});

test("computeCurrentStreak stays alive from yesterday when today is not yet done", () => {
  const days = ["2026-05-18", "2026-05-19"];
  assert.equal(computeCurrentStreak(days, "2026-05-20"), 2);
});

test("computeCurrentStreak resets to 0 when the chain is broken", () => {
  const days = ["2026-05-10", "2026-05-11"];
  assert.equal(computeCurrentStreak(days, "2026-05-20"), 0);
});

test("computeLongestStreak finds the longest historical run", () => {
  const days = [
    "2026-05-01",
    "2026-05-02",
    "2026-05-03",
    "2026-05-10",
    "2026-05-11",
  ];
  assert.equal(computeLongestStreak(days), 3);
});

test("buildLast7Days returns 7 ordered slots flagging active days and today", () => {
  const slots = buildLast7Days(["2026-05-20", "2026-05-18"], "2026-05-20");

  assert.equal(slots.length, 7);
  assert.equal(slots[6].date, "2026-05-20");
  assert.equal(slots[6].isToday, true);
  assert.equal(slots[6].active, true);
  assert.equal(slots[4].date, "2026-05-18");
  assert.equal(slots[4].active, true);
  assert.equal(slots[5].active, false);
});

test("recordActiveDay is idempotent within the same day and grows the streak", () => {
  const storage = new MapStorage();

  recordActiveDay(storage, "2026-05-19");
  const info = recordActiveDay(storage, "2026-05-19");
  assert.equal(info.current, 1);

  const next = recordActiveDay(storage, "2026-05-20");
  assert.equal(next.current, 2);
  assert.equal(next.longest, 2);
  assert.equal(next.activeToday, true);
});

test("getStreakInfo reads persisted days without mutating storage", () => {
  const storage = new MapStorage();
  storage.setItem(
    GONGDE_STREAK_KEY,
    JSON.stringify({ days: ["2026-05-19", "2026-05-20"] }),
  );

  const info = getStreakInfo(storage, "2026-05-20");
  assert.equal(info.current, 2);
  assert.equal(info.longest, 2);
});

test("summarizeStreak tolerates malformed input", () => {
  const info = summarizeStreak(null, "2026-05-20");
  assert.equal(info.current, 0);
  assert.equal(info.longest, 0);
  assert.equal(info.last7.length, 7);
});

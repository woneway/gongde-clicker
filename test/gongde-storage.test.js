import test from "node:test";
import assert from "node:assert/strict";
import {
  addMerit,
  getGongdeLevel,
  getInitialStats,
  GONGDE_STORAGE_KEY,
} from "../lib/gongde-storage.js";

function memoryStorage(initialValue) {
  const values = new Map();
  if (initialValue !== undefined) {
    values.set(GONGDE_STORAGE_KEY, initialValue);
  }

  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
  };
}

test("getInitialStats starts empty for first-time visitors", () => {
  assert.deepEqual(getInitialStats(memoryStorage(), "2026-05-19"), {
    today: 0,
    total: 0,
    bestCombo: 0,
    date: "2026-05-19",
  });
});

test("addMerit increments today's count and total count", () => {
  const storage = memoryStorage();

  const first = addMerit(storage, "2026-05-19", 1);
  const second = addMerit(storage, "2026-05-19", 2);

  assert.equal(first.today, 1);
  assert.equal(second.today, 2);
  assert.equal(second.total, 2);
  assert.equal(second.bestCombo, 2);
});

test("getInitialStats resets today when the stored date is old", () => {
  const storage = memoryStorage(
    JSON.stringify({
      today: 8,
      total: 88,
      bestCombo: 6,
      date: "2026-05-18",
    }),
  );

  assert.deepEqual(getInitialStats(storage, "2026-05-19"), {
    today: 0,
    total: 88,
    bestCombo: 6,
    date: "2026-05-19",
  });
});

test("getGongdeLevel returns stable analytics buckets", () => {
  assert.deepEqual(getGongdeLevel(0), {
    key: "starter",
    label: "清心入门",
    range: "0-9",
  });
  assert.deepEqual(getGongdeLevel(10), {
    key: "steady",
    label: "心态稳定",
    range: "10-99",
  });
  assert.deepEqual(getGongdeLevel(100), {
    key: "focused",
    label: "功德进阶",
    range: "100-499",
  });
  assert.deepEqual(getGongdeLevel(500), {
    key: "master",
    label: "功德圆满",
    range: "500+",
  });
});

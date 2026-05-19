export const GONGDE_STORAGE_KEY = "gongde-clicker:stats";

const emptyStats = (date) => ({
  today: 0,
  total: 0,
  bestCombo: 0,
  date,
});

const normalizeStats = (value, date) => {
  if (!value || typeof value !== "object") {
    return emptyStats(date);
  }

  return {
    today: value.date === date ? Number(value.today) || 0 : 0,
    total: Number(value.total) || 0,
    bestCombo: Number(value.bestCombo) || 0,
    date,
  };
};

export function getTodayKey(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getGongdeLevel(total) {
  const value = Number(total) || 0;

  if (value < 10) {
    return { key: "starter", label: "清心入门", range: "0-9" };
  }

  if (value < 100) {
    return { key: "steady", label: "心态稳定", range: "10-99" };
  }

  if (value < 500) {
    return { key: "focused", label: "功德进阶", range: "100-499" };
  }

  return { key: "master", label: "功德圆满", range: "500+" };
}

export function getInitialStats(storage, date = getTodayKey()) {
  if (!storage) {
    return emptyStats(date);
  }

  try {
    const raw = storage.getItem(GONGDE_STORAGE_KEY);
    return normalizeStats(raw ? JSON.parse(raw) : null, date);
  } catch {
    return emptyStats(date);
  }
}

export function saveStats(storage, stats) {
  if (!storage) {
    return;
  }

  storage.setItem(GONGDE_STORAGE_KEY, JSON.stringify(stats));
}

export function addMerit(storage, date = getTodayKey(), combo = 1) {
  const current = getInitialStats(storage, date);
  const next = {
    today: current.today + 1,
    total: current.total + 1,
    bestCombo: Math.max(current.bestCombo, combo),
    date,
  };

  saveStats(storage, next);
  return next;
}

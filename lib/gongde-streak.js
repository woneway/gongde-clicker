// 连续打卡（streak）——独立于核心 stats 存储，记录"哪些天敲过木鱼"，
// 由此推导当前连续天数、历史最长连续、最近 7 天打卡点阵。
// 设计为纯函数 + 薄存储包装，便于单测与 SSR 安全。
export const GONGDE_STREAK_KEY = "gongde-clicker:streak";

const MAX_HISTORY = 120;

// 在 YYYY-MM-DD 上按本地日历偏移天数，输出同样格式，避免时区漂移。
export function shiftDateKey(dateKey, deltaDays) {
  const [year, month, day] = String(dateKey).split("-").map(Number);
  const date = new Date(year, (month || 1) - 1, day || 1);
  date.setDate(date.getDate() + deltaDays);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function normalizeDays(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set();
  for (const item of value) {
    if (typeof item === "string" && /^\d{4}-\d{2}-\d{2}$/.test(item)) {
      seen.add(item);
    }
  }

  return Array.from(seen).sort();
}

// 当前连续天数：从今天往回数；若今天还没敲，则从昨天起算（连击仍"存活"）。
export function computeCurrentStreak(days, today) {
  const set = new Set(normalizeDays(days));
  let anchor = today;

  if (!set.has(anchor)) {
    anchor = shiftDateKey(today, -1);
    if (!set.has(anchor)) {
      return 0;
    }
  }

  let streak = 0;
  let cursor = anchor;
  while (set.has(cursor)) {
    streak += 1;
    cursor = shiftDateKey(cursor, -1);
  }

  return streak;
}

// 历史最长连续天数。
export function computeLongestStreak(days) {
  const sorted = normalizeDays(days);
  let longest = 0;
  let run = 0;
  let previous = null;

  for (const day of sorted) {
    run = previous && shiftDateKey(previous, 1) === day ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = day;
  }

  return longest;
}

// 最近 7 天点阵（从 today-6 到 today），用于日历式打卡展示。
export function buildLast7Days(days, today) {
  const set = new Set(normalizeDays(days));

  return Array.from({ length: 7 }, (_, index) => {
    const date = shiftDateKey(today, index - 6);
    return { date, active: set.has(date), isToday: date === today };
  });
}

export function summarizeStreak(days, today) {
  return {
    current: computeCurrentStreak(days, today),
    longest: computeLongestStreak(days),
    last7: buildLast7Days(days, today),
    activeToday: new Set(normalizeDays(days)).has(today),
  };
}

function readDays(storage) {
  if (!storage) {
    return [];
  }

  try {
    const raw = storage.getItem(GONGDE_STREAK_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return normalizeDays(parsed?.days);
  } catch {
    return [];
  }
}

export function getStreakInfo(storage, today) {
  return summarizeStreak(readDays(storage), today);
}

// 记录今天为活跃日（同一天重复调用是幂等的），返回更新后的连续信息。
export function recordActiveDay(storage, today) {
  const days = readDays(storage);

  if (days.includes(today)) {
    return summarizeStreak(days, today);
  }

  const nextDays = normalizeDays([...days, today]).slice(-MAX_HISTORY);

  if (storage) {
    storage.setItem(GONGDE_STREAK_KEY, JSON.stringify({ days: nextDays }));
  }

  return summarizeStreak(nextDays, today);
}

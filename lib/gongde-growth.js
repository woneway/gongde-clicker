const fortunes = [
  {
    title: "宜准点下班",
    text: "今天的功德不靠硬扛，靠按时收工。",
    good: "整理桌面",
    avoid: "临时需求",
  },
  {
    title: "宜少开会",
    text: "少一点无效讨论，多一点清净输出。",
    good: "写清楚一句话",
    avoid: "反复拉群",
  },
  {
    title: "宜先喝水",
    text: "心态稳定之前，先让身体稳定。",
    good: "补水休息",
    avoid: "空腹硬撑",
  },
  {
    title: "宜慢慢来",
    text: "今天不必急着证明什么，稳住就是进度。",
    good: "拆小任务",
    avoid: "一口吃完",
  },
  {
    title: "宜清缓存",
    text: "卡住的时候，先重启思路，再重启电脑。",
    good: "重新整理",
    avoid: "越改越乱",
  },
  {
    title: "宜静音十分钟",
    text: "消息可以晚点回，心态最好早点救。",
    good: "专注一轮",
    avoid: "消息轰炸",
  },
  {
    title: "宜善待自己",
    text: "今日功德从不苛责自己开始。",
    good: "留点余量",
    avoid: "自我压榨",
  },
];

export const GONGDE_WISH_STORAGE_KEY = "gongde-clicker:wish";

const defaultWishes = [
  "愿今天不临时拉会",
  "愿甲方一次过稿",
  "愿周五不要发版",
  "愿构建一次通过",
  "愿老板忘记周报",
  "愿工资准时到账",
  "愿 Bug 自动消失",
  "愿需求不再变更",
  "愿测试环境稳定",
  "愿消息不用秒回",
];

const achievementDefinitions = [
  {
    id: "first",
    name: "初次敲响",
    condition: "累计功德达到 1",
    isUnlocked: (stats) => stats.total >= 1,
    getRemaining: (stats) => Math.max(1 - stats.total, 0),
    unit: "点功德",
  },
  {
    id: "ten",
    name: "十念清心",
    condition: "累计功德达到 10",
    isUnlocked: (stats) => stats.total >= 10,
    getRemaining: (stats) => Math.max(10 - stats.total, 0),
    unit: "点功德",
  },
  {
    id: "hundred",
    name: "百敲不乱",
    condition: "累计功德达到 100",
    isUnlocked: (stats) => stats.total >= 100,
    getRemaining: (stats) => Math.max(100 - stats.total, 0),
    unit: "点功德",
  },
  {
    id: "daily-thirty",
    name: "今日入定",
    condition: "今日功德达到 30",
    isUnlocked: (stats) => stats.today >= 30,
    getRemaining: (stats) => Math.max(30 - stats.today, 0),
    unit: "点今日功德",
  },
  {
    id: "combo-ten",
    name: "连击小成",
    condition: "最高连击达到 10",
    isUnlocked: (stats) => stats.bestCombo >= 10,
    getRemaining: (stats) => Math.max(10 - stats.bestCombo, 0),
    unit: "次连击",
  },
  {
    id: "combo-thirty",
    name: "连击护法",
    condition: "最高连击达到 30",
    isUnlocked: (stats) => stats.bestCombo >= 30,
    getRemaining: (stats) => Math.max(30 - stats.bestCombo, 0),
    unit: "次连击",
  },
];

function hashDate(date) {
  return String(date)
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function normalizeStats(stats) {
  return {
    today: Number(stats?.today) || 0,
    total: Number(stats?.total) || 0,
    bestCombo: Number(stats?.bestCombo) || 0,
  };
}

export function getDailyFortune(date) {
  return fortunes[hashDate(date) % fortunes.length];
}

export function getAchievements(stats) {
  const normalized = normalizeStats(stats);

  return achievementDefinitions.map(
    ({ isUnlocked, getRemaining, unit, ...definition }) => ({
      ...definition,
      remaining: getRemaining(normalized),
      unit,
      unlocked: isUnlocked(normalized),
    }),
  );
}

export function getAchievementProgress(stats) {
  const achievements = getAchievements(stats);
  const unlockedCount = achievements.filter((item) => item.unlocked).length;
  const totalCount = achievements.length;
  const nextAchievement = achievements.find((item) => !item.unlocked) || null;
  const remaining = nextAchievement?.remaining || 0;

  return {
    achievements,
    unlockedCount,
    totalCount,
    nextAchievement,
    remaining,
    summary: `已解锁 ${unlockedCount}/${totalCount}`,
    nextLine: nextAchievement
      ? `下一枚「${nextAchievement.name}」还差 ${remaining} ${nextAchievement.unit}`
      : "成就已全部解锁，今天可以安心收工",
  };
}

export function getShareText(stats, fortune) {
  const normalized = normalizeStats(stats);
  const title = fortune?.title || "今日功德签";

  return `我今天在功德敲敲敲了 ${normalized.today} 下，今日功德签：${title}。https://gongdeclicker.com`;
}

export function normalizeWish(input) {
  return Array.from(String(input || "").trim().replace(/\s+/g, " "))
    .slice(0, 32)
    .join("");
}

export function getDefaultWish(date) {
  return defaultWishes[hashDate(date) % defaultWishes.length];
}

export function getNextDefaultWish(date, currentWish) {
  const normalizedWish = normalizeWish(currentWish);
  const startIndex = hashDate(date) % defaultWishes.length;
  const currentIndex = defaultWishes.findIndex((wish) => wish === normalizedWish);

  if (currentIndex >= 0) {
    return defaultWishes[(currentIndex + 1) % defaultWishes.length];
  }

  return defaultWishes[(startIndex + 1) % defaultWishes.length];
}

export function getActiveWish(storage, date) {
  if (!storage) {
    return getDefaultWish(date);
  }

  try {
    const raw = storage.getItem(GONGDE_WISH_STORAGE_KEY);
    const stored = raw ? JSON.parse(raw) : null;
    const wish = normalizeWish(stored?.wish);

    if (stored?.date === date && wish) {
      return wish;
    }
  } catch {
    return getDefaultWish(date);
  }

  return getDefaultWish(date);
}

export function saveWish(storage, date, wish) {
  if (!storage) {
    return getActiveWish(storage, date);
  }

  const normalized = normalizeWish(wish);
  storage.setItem(
    GONGDE_WISH_STORAGE_KEY,
    JSON.stringify({
      date,
      wish: normalized,
    }),
  );

  return normalized || getDefaultWish(date);
}

export function getWishShareText(stats, fortune, wish) {
  const normalizedWish = normalizeWish(wish);

  if (!normalizedWish) {
    return getShareText(stats, fortune);
  }

  const normalized = normalizeStats(stats);
  const title = fortune?.title || "今日功德签";

  return `我今天为「${normalizedWish}」敲了 ${normalized.today} 下功德，今日功德签：${title}。https://gongdeclicker.com`;
}

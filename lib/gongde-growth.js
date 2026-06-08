const fortunesByLang = {
  zh: [
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
  ],
  en: [
    {
      title: "Clock Out On Time",
      text: "Today's merit isn't grinding — it's leaving on time.",
      good: "Tidy your desk",
      avoid: "Last-minute asks",
    },
    {
      title: "Fewer Meetings",
      text: "Less pointless talk, more quiet output.",
      good: "One clear sentence",
      avoid: "Endless threads",
    },
    {
      title: "Hydrate First",
      text: "Steady your body before you steady your mind.",
      good: "A water break",
      avoid: "Running on empty",
    },
    {
      title: "Take It Slow",
      text: "Nothing to prove today — holding steady is progress.",
      good: "Small tasks",
      avoid: "All at once",
    },
    {
      title: "Clear The Cache",
      text: "When stuck, reboot your thinking before your laptop.",
      good: "Start fresh",
      avoid: "Making it messier",
    },
    {
      title: "Ten Quiet Minutes",
      text: "Replies can wait; your sanity shouldn't.",
      good: "One focused round",
      avoid: "Notification storm",
    },
    {
      title: "Be Kind To Yourself",
      text: "Today's merit starts with not beating yourself up.",
      good: "Leave some slack",
      avoid: "Self-grinding",
    },
  ],
};

export const GONGDE_WISH_STORAGE_KEY = "gongde-clicker:wish";

const wishesByLang = {
  zh: [
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
    "愿产品经理放过 PRD",
    "愿需求评审不变玄学会",
    "愿程序员今天不背锅",
    "愿代码合并不爆红",
    "愿上线不在下班前",
    "愿设计稿一版封神",
    "愿审美差异自动消失",
    "愿销售客户秒回款",
    "愿甲方今天不说再想想",
    "愿运营数据突然支棱",
    "愿活动上线直接爆单",
    "愿流量别再薛定谔",
    "愿老板画饼能配咖啡",
    "愿 HR 面试不已读乱回",
    "愿财务报销不再卡壳",
    "愿法务审核少改两页",
    "愿客服遇到正常人类",
    "愿医生今天少写病历",
    "愿老师下课铃准时响",
    "愿学生论文查重飘绿",
    "愿实验数据不要离谱",
    "愿考研考公顺利上岸",
    "愿外卖别在小区迷路",
    "愿快递今天别放错柜",
    "愿房租别再刺客我",
    "愿通勤一路绿灯开挂",
    "愿会议退退退",
    "愿今天情绪稳定不破防",
    "愿摸鱼不被精准捕捞",
    "愿我的方案被天选",
    "愿周报自己学会长大",
    "愿 KPI 别来沾边",
    "愿需求别仰卧起坐",
    "愿群消息自动已读",
    "愿这波稳了不是玄学",
    "愿我今天狠狠上分",
    "愿人生进度条别卡 99%",
    "愿每个 OK 都是真的 OK",
  ],
  en: [
    "May no surprise meetings",
    "May the client approve fast",
    "May Friday have no deploys",
    "May the build pass first try",
    "May the boss skip the report",
    "May payday arrive on time",
    "May bugs vanish on their own",
    "May requirements stop changing",
    "May staging stay stable",
    "May replies not be urgent",
    "May the PM spare the PRD",
    "May reviews stay sane",
    "May no one get blamed today",
    "May the merge not go red",
    "May releases dodge Fridays",
    "May design land in one pass",
    "May taste debates resolve",
    "May clients pay on time",
    "May 'let me think' never be said",
    "May metrics suddenly pop",
    "May the campaign go viral",
    "May traffic stop being random",
    "May HR actually reply",
    "May expenses clear smoothly",
    "May legal cut two pages",
    "May support meet a human",
    "May the bell ring on time",
    "May the thesis pass the check",
    "May the data behave today",
    "May exams go through",
    "May delivery find me",
    "May rent stop hurting",
    "May the commute be all green",
    "May the meeting be cancelled",
    "May I stay calm today",
    "May slacking go unnoticed",
    "May my proposal be chosen",
    "May the report write itself",
    "May KPIs stay far away",
    "May the deploy not break",
  ],
};

export const DEFAULT_WISH_COUNT = wishesByLang.zh.length;

const achievementDefinitions = [
  {
    id: "first",
    icon: "🪷",
    name: { zh: "初次敲响", en: "First Strike" },
    condition: { zh: "累计功德达到 1", en: "Reach 1 total merit" },
    unit: { zh: "点功德", en: "merit" },
    isUnlocked: (stats) => stats.total >= 1,
    getRemaining: (stats) => Math.max(1 - stats.total, 0),
  },
  {
    id: "ten",
    icon: "🌱",
    name: { zh: "十念清心", en: "Ten Calm Taps" },
    condition: { zh: "累计功德达到 10", en: "Reach 10 total merit" },
    unit: { zh: "点功德", en: "merit" },
    isUnlocked: (stats) => stats.total >= 10,
    getRemaining: (stats) => Math.max(10 - stats.total, 0),
  },
  {
    id: "hundred",
    icon: "🪵",
    name: { zh: "百敲不乱", en: "Hundred Steady" },
    condition: { zh: "累计功德达到 100", en: "Reach 100 total merit" },
    unit: { zh: "点功德", en: "merit" },
    isUnlocked: (stats) => stats.total >= 100,
    getRemaining: (stats) => Math.max(100 - stats.total, 0),
  },
  {
    id: "thousand",
    icon: "🏯",
    name: { zh: "千锤百炼", en: "Tempered Soul" },
    condition: { zh: "累计功德达到 1000", en: "Reach 1000 total merit" },
    unit: { zh: "点功德", en: "merit" },
    isUnlocked: (stats) => stats.total >= 1000,
    getRemaining: (stats) => Math.max(1000 - stats.total, 0),
  },
  {
    id: "daily-thirty",
    icon: "☕",
    name: { zh: "今日入定", en: "In The Zone" },
    condition: { zh: "今日功德达到 30", en: "Reach 30 merit today" },
    unit: { zh: "点今日功德", en: "merit today" },
    isUnlocked: (stats) => stats.today >= 30,
    getRemaining: (stats) => Math.max(30 - stats.today, 0),
  },
  {
    id: "daily-hundred",
    icon: "🔥",
    name: { zh: "今日精进", en: "On Fire Today" },
    condition: { zh: "今日功德达到 100", en: "Reach 100 merit today" },
    unit: { zh: "点今日功德", en: "merit today" },
    isUnlocked: (stats) => stats.today >= 100,
    getRemaining: (stats) => Math.max(100 - stats.today, 0),
  },
  {
    id: "combo-ten",
    icon: "⚡",
    name: { zh: "连击小成", en: "Combo Starter" },
    condition: { zh: "最高连击达到 10", en: "Hit a 10 combo" },
    unit: { zh: "次连击", en: "combo" },
    isUnlocked: (stats) => stats.bestCombo >= 10,
    getRemaining: (stats) => Math.max(10 - stats.bestCombo, 0),
  },
  {
    id: "combo-thirty",
    icon: "🥁",
    name: { zh: "连击护法", en: "Combo Guardian" },
    condition: { zh: "最高连击达到 30", en: "Hit a 30 combo" },
    unit: { zh: "次连击", en: "combo" },
    isUnlocked: (stats) => stats.bestCombo >= 30,
    getRemaining: (stats) => Math.max(30 - stats.bestCombo, 0),
  },
  {
    id: "combo-hundred",
    icon: "🌀",
    name: { zh: "连击宗师", en: "Combo Master" },
    condition: { zh: "最高连击达到 100", en: "Hit a 100 combo" },
    unit: { zh: "次连击", en: "combo" },
    isUnlocked: (stats) => stats.bestCombo >= 100,
    getRemaining: (stats) => Math.max(100 - stats.bestCombo, 0),
  },
  {
    id: "streak-3",
    icon: "📅",
    name: { zh: "三日不辍", en: "Three In A Row" },
    condition: { zh: "连续敲击 3 天", en: "Tap 3 days straight" },
    unit: { zh: "天", en: "days" },
    isUnlocked: (stats) => stats.streak >= 3,
    getRemaining: (stats) => Math.max(3 - stats.streak, 0),
  },
  {
    id: "streak-7",
    icon: "🗓️",
    name: { zh: "七日精进", en: "Seven Day Zen" },
    condition: { zh: "连续敲击 7 天", en: "Tap 7 days straight" },
    unit: { zh: "天", en: "days" },
    isUnlocked: (stats) => stats.streak >= 7,
    getRemaining: (stats) => Math.max(7 - stats.streak, 0),
  },
  {
    id: "streak-30",
    icon: "🌙",
    name: { zh: "月度修行", en: "Monthly Monk" },
    condition: { zh: "连续敲击 30 天", en: "Tap 30 days straight" },
    unit: { zh: "天", en: "days" },
    isUnlocked: (stats) => stats.streak >= 30,
    getRemaining: (stats) => Math.max(30 - stats.streak, 0),
  },
];

const progressCopy = {
  zh: {
    summary: (unlocked, total) => `已解锁 ${unlocked}/${total}`,
    next: (name, remaining, unit) => `下一枚「${name}」还差 ${remaining} ${unit}`,
    done: "成就已全部解锁，今天可以安心收工",
  },
  en: {
    summary: (unlocked, total) => `Unlocked ${unlocked}/${total}`,
    next: (name, remaining, unit) => `Next "${name}" — ${remaining} ${unit} to go`,
    done: "All badges unlocked — rest easy today.",
  },
};

function normLang(lang) {
  return lang === "en" ? "en" : "zh";
}

function pick(value, lang) {
  if (value && typeof value === "object") {
    return value[lang] ?? value.zh;
  }
  return value;
}

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
    streak: Number(stats?.streak) || 0,
  };
}

export function getDailyFortune(date, lang = "zh") {
  const fortunes = fortunesByLang[normLang(lang)];
  return fortunes[hashDate(date) % fortunes.length];
}

export function getAchievements(stats, lang = "zh") {
  const normalized = normalizeStats(stats);
  const code = normLang(lang);

  return achievementDefinitions.map((definition) => ({
    id: definition.id,
    icon: definition.icon,
    name: pick(definition.name, code),
    condition: pick(definition.condition, code),
    unit: pick(definition.unit, code),
    remaining: definition.getRemaining(normalized),
    unlocked: definition.isUnlocked(normalized),
  }));
}

export function getAchievementProgress(stats, lang = "zh") {
  const code = normLang(lang);
  const copy = progressCopy[code];
  const achievements = getAchievements(stats, code);
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
    summary: copy.summary(unlockedCount, totalCount),
    nextLine: nextAchievement
      ? copy.next(nextAchievement.name, remaining, nextAchievement.unit)
      : copy.done,
  };
}

export function getShareText(stats, fortune, lang = "zh") {
  const normalized = normalizeStats(stats);

  if (normLang(lang) === "en") {
    const title = fortune?.title || "today's fortune";
    return `I tapped ${normalized.today} times on Cyber Muyu today. Fortune: ${title}. https://gongdeclicker.com`;
  }

  const title = fortune?.title || "今日功德签";
  return `我今天在功德敲敲敲了 ${normalized.today} 下，今日功德签：${title}。https://gongdeclicker.com`;
}

export function normalizeWish(input) {
  return Array.from(String(input || "").trim().replace(/\s+/g, " "))
    .slice(0, 32)
    .join("");
}

export function getDefaultWish(date, lang = "zh") {
  const wishes = wishesByLang[normLang(lang)];
  return wishes[hashDate(date) % wishes.length];
}

export function getNextDefaultWish(date, currentWish, lang = "zh") {
  const wishes = wishesByLang[normLang(lang)];
  const normalizedWish = normalizeWish(currentWish);
  const startIndex = hashDate(date) % wishes.length;
  const currentIndex = wishes.findIndex((wish) => wish === normalizedWish);

  if (currentIndex >= 0) {
    return wishes[(currentIndex + 1) % wishes.length];
  }

  return wishes[(startIndex + 1) % wishes.length];
}

export function getActiveWish(storage, date, lang = "zh") {
  if (!storage) {
    return getDefaultWish(date, lang);
  }

  try {
    const raw = storage.getItem(GONGDE_WISH_STORAGE_KEY);
    const stored = raw ? JSON.parse(raw) : null;
    const wish = normalizeWish(stored?.wish);

    if (stored?.date === date && wish) {
      return wish;
    }
  } catch {
    return getDefaultWish(date, lang);
  }

  return getDefaultWish(date, lang);
}

// 仅返回用户当天已保存的愿望（归一化后），没有则返回空串——
// 由调用方按当前语言决定默认愿望，避免默认值被锁死在某种语言。
export function getStoredWish(storage, date) {
  if (!storage) {
    return "";
  }

  try {
    const raw = storage.getItem(GONGDE_WISH_STORAGE_KEY);
    const stored = raw ? JSON.parse(raw) : null;
    const wish = normalizeWish(stored?.wish);

    if (stored?.date === date && wish) {
      return wish;
    }
  } catch {
    return "";
  }

  return "";
}

export function saveWish(storage, date, wish, lang = "zh") {
  if (!storage) {
    return getActiveWish(storage, date, lang);
  }

  const normalized = normalizeWish(wish);
  storage.setItem(
    GONGDE_WISH_STORAGE_KEY,
    JSON.stringify({
      date,
      wish: normalized,
    }),
  );

  return normalized || getDefaultWish(date, lang);
}

export function getWishShareText(stats, fortune, wish, lang = "zh") {
  const normalizedWish = normalizeWish(wish);

  if (!normalizedWish) {
    return getShareText(stats, fortune, lang);
  }

  const normalized = normalizeStats(stats);

  if (normLang(lang) === "en") {
    const title = fortune?.title || "today's fortune";
    return `I tapped ${normalized.today} times for "${normalizedWish}" on Cyber Muyu today. Fortune: ${title}. https://gongdeclicker.com`;
  }

  const title = fortune?.title || "今日功德签";
  return `我今天为「${normalizedWish}」敲了 ${normalized.today} 下功德，今日功德签：${title}。https://gongdeclicker.com`;
}

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

const achievementDefinitions = [
  {
    id: "first",
    name: "初次敲响",
    condition: "累计功德达到 1",
    isUnlocked: (stats) => stats.total >= 1,
  },
  {
    id: "ten",
    name: "十念清心",
    condition: "累计功德达到 10",
    isUnlocked: (stats) => stats.total >= 10,
  },
  {
    id: "hundred",
    name: "百敲不乱",
    condition: "累计功德达到 100",
    isUnlocked: (stats) => stats.total >= 100,
  },
  {
    id: "daily-thirty",
    name: "今日入定",
    condition: "今日功德达到 30",
    isUnlocked: (stats) => stats.today >= 30,
  },
  {
    id: "combo-ten",
    name: "连击小成",
    condition: "最高连击达到 10",
    isUnlocked: (stats) => stats.bestCombo >= 10,
  },
  {
    id: "combo-thirty",
    name: "连击护法",
    condition: "最高连击达到 30",
    isUnlocked: (stats) => stats.bestCombo >= 30,
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

  return achievementDefinitions.map(({ isUnlocked, ...definition }) => ({
    ...definition,
    unlocked: isUnlocked(normalized),
  }));
}

export function getShareText(stats, fortune) {
  const normalized = normalizeStats(stats);
  const title = fortune?.title || "今日功德签";

  return `我今天在功德敲敲敲了 ${normalized.today} 下，今日功德签：${title}。https://gongdeclicker.com`;
}

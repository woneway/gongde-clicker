"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { track } from "@vercel/analytics";
import {
  addMerit,
  getGongdeLevel,
  getInitialStats,
  getTodayKey,
} from "../lib/gongde-storage";
import {
  getAchievementProgress,
  getAchievements,
  getDailyFortune,
  getDefaultWish,
  getNextDefaultWish,
  getStoredWish,
  getWishShareText,
  normalizeWish,
  saveWish,
} from "../lib/gongde-growth";
import { getStreakInfo, recordActiveDay } from "../lib/gongde-streak";
import { renderWishCardToDataUrl } from "../lib/wish-card";
import {
  DEFAULT_LANG,
  LANGUAGES,
  detectLanguage,
  normalizeLang,
  readStoredLanguage,
  saveLanguage,
} from "../lib/i18n";
import { AdsenseUnit } from "./adsense-unit";
import { WoodenFish } from "./wooden-fish";

const SHARE_TITLE = "赛博木鱼 Cyber Muyu";
const SHARE_URL =
  "https://gongdeclicker.com/?utm_source=share&utm_medium=web_share&utm_campaign=wish_card";

// 敲击火花的迸射方向（六向），由 CSS 用 --sx/--sy 驱动飞出。
const sparkVectors = [
  { x: 0, y: -36 },
  { x: 32, y: -18 },
  { x: 32, y: 18 },
  { x: 0, y: 36 },
  { x: -32, y: 18 },
  { x: -32, y: -18 },
];

const phrasesByLang = {
  zh: [
    "老板少骂我一次",
    "bug 自动消失",
    "甲方已读不回",
    "周报自动生成",
    "需求不再变更",
    "KPI 轻轻放过我",
    "今天不加班",
    "会议自动取消",
    "代码一次过审",
    "外卖提前送达",
    "消息不用秒回",
    "日报自己会写",
  ],
  en: [
    "boss yells one less time",
    "bugs vanish on their own",
    "client stops ghosting",
    "weekly report writes itself",
    "no more spec changes",
    "KPIs go easy on me",
    "no overtime today",
    "meeting gets cancelled",
    "code passes review",
    "lunch arrives early",
    "no need to reply instantly",
    "the daily report self-writes",
  ],
};

const ritualPromptsByLang = {
  zh: [
    "敲三下，先把心态放平。",
    "等构建时敲一敲，别盯进度条。",
    "开会前先清空一点杂念。",
    "写完一段代码，给自己补一点功德。",
    "消息太多时，先敲一下再回复。",
  ],
  en: [
    "Tap thrice and let your mind settle.",
    "Tap while it builds — stop staring at the bar.",
    "Clear your head before the meeting.",
    "Finished a chunk of code? Earn some merit.",
    "Too many pings? Tap once, then reply.",
  ],
};

const BLESSING_PREFIX = { zh: "正在加持：", en: "Blessing: " };

const ui = {
  zh: {
    statToday: "今日功德",
    statTotal: "累计功德",
    statBest: "最高连击",
    streakPre: "连续修行",
    streakSuf: "天",
    bestPre: "最长",
    bestSuf: "天",
    fishAria: "敲木鱼，功德加一",
    comboHint: "点击木鱼或按空格键",
    comboPre: "连击 x",
    nextStage: "下一阶段",
    progressAria: (n) => `距离下一阶段还差 ${n} 点功德`,
    seoKicker: "在线电子木鱼",
    seoTitle: "赛博木鱼 Cyber Muyu",
    seoBody:
      "赛博木鱼（Cyber Muyu）是一个免费的在线电子木鱼和木鱼模拟器。打开网页就能点击木鱼、按空格敲击、记录今日功德和累计功德，适合上班摸鱼解压、学习休息、等待构建或开会前放松一下。",
    fortuneKicker: "今日功德签",
    doLabel: "宜：",
    avoidLabel: "忌：",
    wishLabel: "今日愿望",
    wishPlaceholder: "愿今天不临时拉会",
    wishHint: "愿望仅保存在本机，请勿填写隐私信息。",
    rotateBtn: "换一个",
    shareBtn: "分享我的功德",
    saveBtn: "保存愿望功德图",
    shareIdle: "分享给需要一点功德的朋友",
    manualLabel: "手动复制文案",
    achievementsKicker: "成就",
    allDoneHint: "可以继续敲一张更好看的分享图",
    badgeUnlocked: "已解锁",
    badgeLocked: "未解锁",
    navIntro: "介绍",
    navFortune: "功德签",
    navBadges: "成就",
    sheetClose: "收起",
    msgCopied: "已复制分享文案",
    msgCopyFail: "复制失败，请手动复制文案",
    msgRotated: "已换一个愿望",
    msgSaved: "图片已生成，已开始保存",
    msgSaveFail: "当前浏览器暂不支持保存图片",
    msgShared: "已唤起分享",
  },
  en: {
    statToday: "Today",
    statTotal: "Total",
    statBest: "Best Combo",
    streakPre: "Streak",
    streakSuf: "days",
    bestPre: "Best",
    bestSuf: "days",
    fishAria: "Tap the wooden fish, +1 merit",
    comboHint: "Tap the fish or press space",
    comboPre: "Combo x",
    nextStage: "Next stage",
    progressAria: (n) => `${n} merit to the next stage`,
    seoKicker: "Online Wooden Fish",
    seoTitle: "Cyber Muyu",
    seoBody:
      "Cyber Muyu is a free online wooden fish (muyu) and merit clicker. Open the page, tap the fish or press space, and track today's and total merit — perfect for a quick break at work, between study sessions, or while a build runs.",
    fortuneKicker: "Today's Fortune",
    doLabel: "Do: ",
    avoidLabel: "Avoid: ",
    wishLabel: "Today's Wish",
    wishPlaceholder: "May no surprise meetings",
    wishHint: "Saved on your device only — keep it non-sensitive.",
    rotateBtn: "Shuffle",
    shareBtn: "Share my merit",
    saveBtn: "Save merit card",
    shareIdle: "Share some merit with a friend",
    manualLabel: "Copy manually",
    achievementsKicker: "Badges",
    allDoneHint: "Keep tapping for a nicer share card",
    badgeUnlocked: "Unlocked",
    badgeLocked: "Locked",
    navIntro: "About",
    navFortune: "Fortune",
    navBadges: "Badges",
    sheetClose: "Close",
    msgCopied: "Copied share text",
    msgCopyFail: "Copy failed — please copy manually",
    msgRotated: "Shuffled a new wish",
    msgSaved: "Image ready, saving now",
    msgSaveFail: "This browser can't save the image",
    msgShared: "Share sheet opened",
  },
};

const defaultStats = {
  today: 0,
  total: 0,
  bestCombo: 0,
  date: "",
};

const defaultStreak = {
  current: 0,
  longest: 0,
  last7: [],
  activeToday: false,
};

const statsEventName = "gongde-clicker:stats-updated";
const wishEventName = "gongde-clicker:wish-updated";
const streakEventName = "gongde-clicker:streak-updated";

function subscribeToStats(onStoreChange) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener(statsEventName, onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener(statsEventName, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getStatsSnapshot() {
  if (typeof window === "undefined") {
    return JSON.stringify(defaultStats);
  }

  return JSON.stringify(getInitialStats(window.localStorage, getTodayKey()));
}

function emitStatsChange() {
  window.dispatchEvent(new Event(statsEventName));
}

function subscribeToWish(onStoreChange) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener(wishEventName, onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener(wishEventName, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getWishSnapshot() {
  if (typeof window === "undefined") {
    return "";
  }

  return getStoredWish(window.localStorage, getTodayKey());
}

function emitWishChange() {
  window.dispatchEvent(new Event(wishEventName));
}

function subscribeToStreak(onStoreChange) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener(streakEventName, onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener(streakEventName, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getStreakSnapshot() {
  if (typeof window === "undefined") {
    return JSON.stringify(defaultStreak);
  }

  return JSON.stringify(getStreakInfo(window.localStorage, getTodayKey()));
}

function emitStreakChange() {
  window.dispatchEvent(new Event(streakEventName));
}

const langEventName = "gongde-clicker:lang-updated";

function subscribeToLang(onStoreChange) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener(langEventName, onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener(langEventName, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getLangSnapshot() {
  if (typeof window === "undefined") {
    return DEFAULT_LANG;
  }

  return detectLanguage(
    readStoredLanguage(window.localStorage),
    window.navigator?.language,
  );
}

function emitLangChange() {
  window.dispatchEvent(new Event(langEventName));
}

// 客户端判定：SSR 与首帧 hydration 返回 false，挂载后返回 true，
// 用于把"取本地默认愿望"推迟到客户端，避免服务端/客户端日期不一致导致的 hydration 不匹配。
const noopSubscribe = () => () => {};

function shouldReportAnalytics() {
  return process.env.NEXT_PUBLIC_DISABLE_ANALYTICS !== "1";
}

function getNextMilestone(total) {
  if (total < 10) {
    return 10;
  }

  if (total < 100) {
    return 100;
  }

  if (total < 500) {
    return 500;
  }

  return Math.ceil((total + 1) / 500) * 500;
}

function playWoodenFishSound(audioRef) {
  if (typeof window === "undefined") {
    return;
  }

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) {
    return;
  }

  const context = audioRef.current || new AudioContext();
  audioRef.current = context;

  const start = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const filter = context.createBiquadFilter();

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(220, start);
  oscillator.frequency.exponentialRampToValueAtTime(120, start + 0.08);

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(900, start);

  gain.gain.setValueAtTime(0.001, start);
  gain.gain.exponentialRampToValueAtTime(0.36, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.001, start + 0.16);

  oscillator.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + 0.18);
}

export function GongdeClicker() {
  const [combo, setCombo] = useState(0);
  const [hitState, setHitState] = useState(false);
  const [floaters, setFloaters] = useState([]);
  const [pops, setPops] = useState([]);
  const [progressPulse, setProgressPulse] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const [manualShareText, setManualShareText] = useState("");
  const [activeSheet, setActiveSheet] = useState(null);
  const audioRef = useRef(null);
  const comboRef = useRef(0);
  const comboTimer = useRef(null);
  const progressTimer = useRef(null);
  const shareStatusTimer = useRef(null);
  const floaterId = useRef(0);
  const statsRaw = useSyncExternalStore(
    subscribeToStats,
    getStatsSnapshot,
    () => JSON.stringify(defaultStats),
  );
  const stats = useMemo(() => JSON.parse(statsRaw), [statsRaw]);
  const savedWish = useSyncExternalStore(subscribeToWish, getWishSnapshot, () => "");
  const streakRaw = useSyncExternalStore(
    subscribeToStreak,
    getStreakSnapshot,
    () => JSON.stringify(defaultStreak),
  );
  const streak = useMemo(() => JSON.parse(streakRaw), [streakRaw]);
  const currentStreak = streak.current;
  const lang = useSyncExternalStore(
    subscribeToLang,
    getLangSnapshot,
    () => DEFAULT_LANG,
  );
  const isClient = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const t = ui[lang];

  useEffect(() => {
    document.documentElement.lang = lang === "en" ? "en" : "zh-CN";
  }, [lang]);

  useEffect(() => {
    return () => {
      if (comboTimer.current) {
        window.clearTimeout(comboTimer.current);
      }

      if (progressTimer.current) {
        window.clearTimeout(progressTimer.current);
      }

      if (shareStatusTimer.current) {
        window.clearTimeout(shareStatusTimer.current);
      }
    };
  }, []);

  // 已保存愿望优先；没有则按当前语言给默认愿望（挂载后才取默认，避免日期相关的 hydration 不匹配）。
  const activeWish =
    savedWish || (isClient ? getDefaultWish(getTodayKey(), lang) : "");

  const gongdeLevel = useMemo(
    () => getGongdeLevel(stats.total, lang),
    [stats.total, lang],
  );
  const nextMilestone = useMemo(
    () => getNextMilestone(stats.total),
    [stats.total],
  );
  const progressPercent = Math.min(
    100,
    Math.round((stats.total / nextMilestone) * 100),
  );
  const ritualPrompts = ritualPromptsByLang[lang];
  const ritualPrompt = ritualPrompts[stats.today % ritualPrompts.length];
  const dailyFortune = useMemo(
    () => getDailyFortune(stats.date, lang),
    [stats.date, lang],
  );
  const statsWithStreak = useMemo(
    () => ({ ...stats, streak: currentStreak }),
    [stats, currentStreak],
  );
  const achievements = useMemo(
    () => getAchievements(statsWithStreak, lang),
    [statsWithStreak, lang],
  );
  const achievementProgress = useMemo(
    () => getAchievementProgress(statsWithStreak, lang),
    [statsWithStreak, lang],
  );

  const changeLang = useCallback((next) => {
    saveLanguage(window.localStorage, normalizeLang(next));
    emitLangChange();
  }, []);

  // 移动端：点击底部入口展开对应抽屉，再次点击或点遮罩关闭。
  const toggleSheet = useCallback((panel) => {
    setActiveSheet((current) => (current === panel ? null : panel));
  }, []);
  const closeSheet = useCallback(() => setActiveSheet(null), []);

  const showShareStatus = useCallback((message) => {
    if (shareStatusTimer.current) {
      window.clearTimeout(shareStatusTimer.current);
    }

    setShareStatus(message);
    shareStatusTimer.current = window.setTimeout(() => {
      setShareStatus("");
      shareStatusTimer.current = null;
    }, 1800);
  }, []);

  const copyShareText = useCallback(async () => {
    const text = getWishShareText(stats, dailyFortune, activeWish, lang);

    try {
      await navigator.clipboard.writeText(text);
      setManualShareText("");
      showShareStatus(t.msgCopied);
    } catch {
      setManualShareText(text);
      showShareStatus(t.msgCopyFail);
    }
  }, [activeWish, dailyFortune, lang, showShareStatus, stats, t]);

  const updateWish = useCallback(
    (value) => {
      const normalized = normalizeWish(value);
      saveWish(window.localStorage, stats.date, normalized, lang);
      emitWishChange();
    },
    [lang, stats.date],
  );

  const rotateWish = useCallback(() => {
    const nextWish = getNextDefaultWish(stats.date, activeWish, lang);
    updateWish(nextWish);
    showShareStatus(t.msgRotated);
  }, [activeWish, lang, showShareStatus, stats.date, t, updateWish]);

  const generateWishCard = useCallback(() => {
    try {
      const dataUrl = renderWishCardToDataUrl(
        stats,
        dailyFortune,
        activeWish,
        document,
        currentStreak,
      );
      const link = document.createElement("a");

      link.download = "gongde-wish-card.png";
      link.href = dataUrl;
      document.body.append(link);
      link.click();
      link.remove();
      showShareStatus(t.msgSaved);
    } catch {
      showShareStatus(t.msgSaveFail);
    }
  }, [activeWish, currentStreak, dailyFortune, showShareStatus, stats, t]);

  const shareWish = useCallback(async () => {
    const text = getWishShareText(stats, dailyFortune, activeWish, lang);

    if (typeof navigator !== "undefined" && navigator.share) {
      let payload = { title: SHARE_TITLE, text, url: SHARE_URL };

      // 优先把功德图作为文件分享，唤起系统面板里的"分享图片"
      try {
        const dataUrl = renderWishCardToDataUrl(
          stats,
          dailyFortune,
          activeWish,
          document,
          currentStreak,
        );
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], "gongde-wish-card.png", {
          type: "image/png",
        });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          payload = { title: SHARE_TITLE, text, files: [file] };
        }
      } catch {
        // 生成图失败则退回纯文本分享
      }

      try {
        await navigator.share(payload);
        showShareStatus(t.msgShared);
        return;
      } catch (error) {
        if (error && error.name === "AbortError") {
          return; // 用户主动取消，不再兜底
        }
        // 其它失败 → 落到剪贴板兜底
      }
    }

    await copyShareText();
  }, [activeWish, copyShareText, currentStreak, dailyFortune, lang, showShareStatus, stats, t]);

  const strike = useCallback(
    (source = "click") => {
      comboRef.current += 1;
      const nextCombo = comboRef.current;
      const nextStats = addMerit(window.localStorage, getTodayKey(), nextCombo);
      const phrases = phrasesByLang[lang];
      const phrase =
        activeWish && Math.random() > 0.45
          ? `${BLESSING_PREFIX[lang]}${activeWish}`
          : phrases[Math.floor(Math.random() * phrases.length)];
      const id = floaterId.current + 1;

      floaterId.current = id;
      emitStatsChange();
      recordActiveDay(window.localStorage, getTodayKey());
      emitStreakChange();
      if (shouldReportAnalytics()) {
        const levelForTrack = getGongdeLevel(nextStats.total, "zh");
        track("gongde_click", {
          source,
          level: levelForTrack.key,
          level_label: levelForTrack.label,
          total_range: levelForTrack.range,
        });
      }
      setCombo(nextCombo);
      setHitState(true);
      setProgressPulse(true);
      setFloaters((items) => [
        ...items.slice(-6),
        {
          id,
          text: phrase,
          x: 34 + Math.random() * 32,
          drift: Math.random() > 0.5 ? "left" : "right",
        },
      ]);
      setPops((items) => [...items.slice(-4), { id }]);

      playWoodenFishSound(audioRef);

      if (navigator.vibrate) {
        navigator.vibrate(18);
      }

      window.setTimeout(() => setHitState(false), 120);
      if (progressTimer.current) {
        window.clearTimeout(progressTimer.current);
      }
      progressTimer.current = window.setTimeout(
        () => setProgressPulse(false),
        520,
      );
      window.setTimeout(() => {
        setFloaters((items) => items.filter((item) => item.id !== id));
      }, 1100);
      window.setTimeout(() => {
        setPops((items) => items.filter((item) => item.id !== id));
      }, 780);

      if (comboTimer.current) {
        window.clearTimeout(comboTimer.current);
      }
      comboTimer.current = window.setTimeout(() => {
        comboRef.current = 0;
        setCombo(0);
      }, 1400);
    },
    [activeWish, lang],
  );

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.code !== "Space" || event.repeat) {
        return;
      }

      const target = event.target;
      const isTyping =
        target instanceof HTMLElement &&
        ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);

      if (isTyping) {
        return;
      }

      event.preventDefault();
      strike("space");
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [strike]);

  return (
    <main className="clicker-page">
      <div className="lang-switch" role="group" aria-label="Language">
        {LANGUAGES.map((item) => (
          <button
            className={`lang-option ${lang === item.code ? "is-active" : ""}`}
            key={item.code}
            onClick={() => changeLang(item.code)}
            type="button"
            aria-pressed={lang === item.code}
          >
            {item.label}
          </button>
        ))}
      </div>

      <section className="score-strip" aria-label="功德统计">
        <div>
          <span>{t.statToday}</span>
          <strong>{stats.today}</strong>
        </div>
        <div>
          <span>{t.statTotal}</span>
          <strong>{stats.total}</strong>
        </div>
        <div>
          <span>{t.statBest}</span>
          <strong>{stats.bestCombo}</strong>
        </div>
      </section>

      <section className="streak-bar" aria-label="连续打卡">
        <div className="streak-headline">
          <span className="streak-flame" aria-hidden="true">
            🔥
          </span>
          <span className="streak-count">
            {t.streakPre} <strong>{streak.current}</strong> {t.streakSuf}
          </span>
          <span className="streak-best">
            {t.bestPre} {streak.longest} {t.bestSuf}
          </span>
        </div>
        <ol className="streak-dots" aria-hidden="true">
          {streak.last7.map((slot) => (
            <li
              key={slot.date}
              className={`streak-dot ${slot.active ? "is-active" : ""} ${
                slot.isToday ? "is-today" : ""
              }`}
            />
          ))}
        </ol>
      </section>

      <section className="play-area" aria-label="电子木鱼">
        <div className="status-stack">
          <p className="status-pill">{gongdeLevel.label}</p>
          <p className="ritual-prompt">{ritualPrompt}</p>
        </div>
        <div className="floater-layer" aria-live="polite">
          {floaters.map((item) => (
            <span
              className={`floater ${item.drift}`}
              key={item.id}
              style={{ left: `${item.x}%` }}
            >
              {item.text}
            </span>
          ))}
        </div>
        <button
          className={`wooden-fish ${hitState ? "is-hit" : ""}`}
          onClick={() => strike("click")}
          type="button"
          aria-label={t.fishAria}
        >
          <WoodenFish isHit={hitState} />
          <span className="merit-layer" aria-hidden="true">
            {pops.map((pop) => (
              <span className="merit-pop" key={pop.id}>
                <span className="merit-pop-value">+1</span>
                {sparkVectors.map((vector, index) => (
                  <span
                    className="merit-spark"
                    key={index}
                    style={{ "--sx": `${vector.x}px`, "--sy": `${vector.y}px` }}
                  />
                ))}
              </span>
            ))}
          </span>
        </button>
        <div
          className={`combo-line ${combo >= 3 ? "is-combo-hot" : ""}`}
          aria-live="polite"
        >
          {combo > 1 ? `${t.comboPre}${combo}` : t.comboHint}
        </div>
        <div
          className={`progress-card ${progressPulse ? "is-pulsing" : ""}`}
          aria-label={t.progressAria(Math.max(nextMilestone - stats.total, 0))}
        >
          <div className="progress-copy">
            <span>{t.nextStage}</span>
            <strong>
              {stats.total}/{nextMilestone}
            </strong>
          </div>
          <span className="progress-track">
            <span style={{ width: `${progressPercent}%` }} />
          </span>
        </div>
      </section>

      <nav className="sheet-nav" aria-label="详情入口">
        {[
          { key: "intro", label: t.navIntro },
          { key: "fortune", label: t.navFortune },
          { key: "badges", label: t.navBadges },
        ].map((item) => (
          <button
            className={`sheet-chip ${activeSheet === item.key ? "is-active" : ""}`}
            key={item.key}
            type="button"
            aria-expanded={activeSheet === item.key}
            onClick={() => toggleSheet(item.key)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <button
        className={`sheet-backdrop ${activeSheet ? "is-open" : ""}`}
        type="button"
        aria-label={t.sheetClose}
        onClick={closeSheet}
      />

      <div className="detail-region" data-active={activeSheet || ""}>
        <section
          className="seo-summary"
          data-panel="intro"
          aria-labelledby="seo-summary-title"
        >
          <button className="sheet-handle" type="button" onClick={closeSheet}>
            {t.sheetClose}
          </button>
          <p className="section-kicker">{t.seoKicker}</p>
          <h1 id="seo-summary-title">{t.seoTitle}</h1>
          <p>{t.seoBody}</p>
        </section>

        <section className="growth-panel" aria-label="每日功德签和成就">
          <article className="fortune-card" data-panel="fortune">
            <button className="sheet-handle" type="button" onClick={closeSheet}>
              {t.sheetClose}
            </button>
          <span className="section-kicker">{t.fortuneKicker}</span>
          <h2>{dailyFortune.title}</h2>
          <p>{dailyFortune.text}</p>
          <div className="fortune-pair">
            <span>
              {t.doLabel}
              {dailyFortune.good}
            </span>
            <span>
              {t.avoidLabel}
              {dailyFortune.avoid}
            </span>
          </div>
          <div className="wish-box">
            <label htmlFor="daily-wish">{t.wishLabel}</label>
            <input
              id="daily-wish"
              maxLength={40}
              onChange={(event) => updateWish(event.target.value)}
              placeholder={t.wishPlaceholder}
              type="text"
              value={activeWish}
            />
            <div className="wish-tools">
              <small>{t.wishHint}</small>
              <button onClick={rotateWish} type="button">
                {t.rotateBtn}
              </button>
            </div>
          </div>
          <button className="share-button" onClick={shareWish} type="button">
            {t.shareBtn}
          </button>
          <button
            className="share-button share-button-secondary"
            onClick={generateWishCard}
            type="button"
          >
            {t.saveBtn}
          </button>
          <small
            className={`share-status ${shareStatus ? "has-feedback" : ""}`}
            aria-live="polite"
          >
            {shareStatus || t.shareIdle}
          </small>
          {manualShareText && (
            <label className="manual-share-box">
              <span>{t.manualLabel}</span>
              <textarea readOnly value={manualShareText} />
            </label>
          )}
        </article>

        <article className="achievement-card" data-panel="badges">
          <button className="sheet-handle" type="button" onClick={closeSheet}>
            {t.sheetClose}
          </button>
          <div className="achievement-heading">
            <span className="section-kicker">{t.achievementsKicker}</span>
            <strong>{achievementProgress.summary}</strong>
          </div>
          <div className="achievement-progress">
            <p>{achievementProgress.nextLine}</p>
            <span>
              {achievementProgress.nextAchievement
                ? achievementProgress.nextAchievement.condition
                : t.allDoneHint}
            </span>
          </div>
          <div className="badge-grid">
            {achievements.map((item) => (
              <div
                className={`badge-item ${item.unlocked ? "is-unlocked" : ""}`}
                key={item.id}
              >
                <span className="badge-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <strong>{item.name}</strong>
                <small>{item.condition}</small>
                <span className="badge-state">
                  {item.unlocked ? t.badgeUnlocked : t.badgeLocked}
                </span>
              </div>
            ))}
          </div>
        </article>
        </section>
      </div>

      <AdsenseUnit slot="5762213705" />
    </main>
  );
}

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
  getActiveWish,
  getAchievementProgress,
  getAchievements,
  getDailyFortune,
  getNextDefaultWish,
  getWishShareText,
  normalizeWish,
  saveWish,
} from "../lib/gongde-growth";
import { renderWishCardToDataUrl } from "../lib/wish-card";
import { AdsenseUnit } from "./adsense-unit";

const phrases = [
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
];

const ritualPrompts = [
  "敲三下，先把心态放平。",
  "等构建时敲一敲，别盯进度条。",
  "开会前先清空一点杂念。",
  "写完一段代码，给自己补一点功德。",
  "消息太多时，先敲一下再回复。",
];

const defaultStats = {
  today: 0,
  total: 0,
  bestCombo: 0,
  date: "",
};

const statsEventName = "gongde-clicker:stats-updated";
const wishEventName = "gongde-clicker:wish-updated";

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

  return getActiveWish(window.localStorage, getTodayKey());
}

function emitWishChange() {
  window.dispatchEvent(new Event(wishEventName));
}

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
  const [progressPulse, setProgressPulse] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const [manualShareText, setManualShareText] = useState("");
  const audioRef = useRef(null);
  const comboTimer = useRef(null);
  const progressTimer = useRef(null);
  const shareStatusTimer = useRef(null);
  const floaterId = useRef(0);
  const stats = JSON.parse(
    useSyncExternalStore(
      subscribeToStats,
      getStatsSnapshot,
      () => JSON.stringify(defaultStats),
    ),
  );
  const activeWish = useSyncExternalStore(subscribeToWish, getWishSnapshot, () => "");

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

  const gongdeLevel = useMemo(() => getGongdeLevel(stats.total), [stats.total]);
  const nextMilestone = useMemo(
    () => getNextMilestone(stats.total),
    [stats.total],
  );
  const progressPercent = Math.min(
    100,
    Math.round((stats.total / nextMilestone) * 100),
  );
  const ritualPrompt = ritualPrompts[stats.today % ritualPrompts.length];
  const dailyFortune = useMemo(() => getDailyFortune(stats.date), [stats.date]);
  const achievements = useMemo(() => getAchievements(stats), [stats]);
  const achievementProgress = useMemo(
    () => getAchievementProgress(stats),
    [stats],
  );

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
    const text = getWishShareText(stats, dailyFortune, activeWish);

    try {
      await navigator.clipboard.writeText(text);
      setManualShareText("");
      showShareStatus("已复制分享文案");
    } catch {
      setManualShareText(text);
      showShareStatus("复制失败，请手动复制文案");
    }
  }, [activeWish, dailyFortune, showShareStatus, stats]);

  const updateWish = useCallback(
    (value) => {
      const normalized = normalizeWish(value);
      saveWish(window.localStorage, stats.date, normalized);
      emitWishChange();
    },
    [stats.date],
  );

  const rotateWish = useCallback(() => {
    const nextWish = getNextDefaultWish(stats.date, activeWish);
    updateWish(nextWish);
    showShareStatus("已换一个愿望");
  }, [activeWish, showShareStatus, stats.date, updateWish]);

  const generateWishCard = useCallback(() => {
    try {
      const dataUrl = renderWishCardToDataUrl(stats, dailyFortune, activeWish);
      const link = document.createElement("a");

      link.download = "gongde-wish-card.png";
      link.href = dataUrl;
      document.body.append(link);
      link.click();
      link.remove();
      showShareStatus("图片已生成，已开始保存");
    } catch {
      showShareStatus("当前浏览器暂不支持保存图片");
    }
  }, [activeWish, dailyFortune, showShareStatus, stats]);

  const strike = useCallback((source = "click") => {
    const nextCombo = combo + 1;
    const nextStats = addMerit(window.localStorage, getTodayKey(), nextCombo);
    const nextLevel = getGongdeLevel(nextStats.total);
    const phrase =
      activeWish && Math.random() > 0.45
        ? `正在加持：${activeWish}`
        : phrases[Math.floor(Math.random() * phrases.length)];
    const id = floaterId.current + 1;

    floaterId.current = id;
    emitStatsChange();
    if (shouldReportAnalytics()) {
      track("gongde_click", {
        source,
        level: nextLevel.key,
        level_label: nextLevel.label,
        total_range: nextLevel.range,
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

    playWoodenFishSound(audioRef);

    if (navigator.vibrate) {
      navigator.vibrate(18);
    }

    window.setTimeout(() => setHitState(false), 120);
    if (progressTimer.current) {
      window.clearTimeout(progressTimer.current);
    }
    progressTimer.current = window.setTimeout(() => setProgressPulse(false), 520);
    window.setTimeout(() => {
      setFloaters((items) => items.filter((item) => item.id !== id));
    }, 1100);

    if (comboTimer.current) {
      window.clearTimeout(comboTimer.current);
    }
    comboTimer.current = window.setTimeout(() => setCombo(0), 1400);
  }, [activeWish, combo]);

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
      <section className="score-strip" aria-label="功德统计">
        <div>
          <span>今日功德</span>
          <strong>{stats.today}</strong>
        </div>
        <div>
          <span>累计功德</span>
          <strong>{stats.total}</strong>
        </div>
        <div>
          <span>最高连击</span>
          <strong>{stats.bestCombo}</strong>
        </div>
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
          aria-label="敲木鱼，功德加一"
        >
          <span className="fish-top" />
          <span className="fish-mouth" />
          <span className="fish-core">木鱼</span>
        </button>
        <div
          className={`combo-line ${combo >= 3 ? "is-combo-hot" : ""}`}
          aria-live="polite"
        >
          {combo > 1 ? `连击 x${combo}` : "点击木鱼或按空格键"}
        </div>
        <div
          className={`progress-card ${progressPulse ? "is-pulsing" : ""}`}
          aria-label={`距离下一阶段还差 ${Math.max(
            nextMilestone - stats.total,
            0,
          )} 点功德`}
        >
          <div className="progress-copy">
            <span>下一阶段</span>
            <strong>
              {stats.total}/{nextMilestone}
            </strong>
          </div>
          <span className="progress-track">
            <span style={{ width: `${progressPercent}%` }} />
          </span>
        </div>
      </section>

      <section className="seo-summary" aria-labelledby="seo-summary-title">
        <p className="section-kicker">在线电子木鱼</p>
        <h1 id="seo-summary-title">功德敲敲 Gongde Clicker</h1>
        <p>
          功德敲敲是一个免费的在线电子木鱼和木鱼模拟器。打开网页就能点击木鱼、
          按空格敲击、记录今日功德和累计功德，适合上班摸鱼解压、学习休息、
          等待构建或开会前放松一下。
        </p>
      </section>

      <section className="growth-panel" aria-label="每日功德签和成就">
        <article className="fortune-card">
          <span className="section-kicker">今日功德签</span>
          <h2>{dailyFortune.title}</h2>
          <p>{dailyFortune.text}</p>
          <div className="fortune-pair">
            <span>宜：{dailyFortune.good}</span>
            <span>忌：{dailyFortune.avoid}</span>
          </div>
          <div className="wish-box">
            <label htmlFor="daily-wish">今日愿望</label>
            <input
              id="daily-wish"
              maxLength={40}
              onChange={(event) => updateWish(event.target.value)}
              placeholder="愿今天不临时拉会"
              type="text"
              value={activeWish}
            />
            <div className="wish-tools">
              <small>愿望仅保存在本机，请勿填写隐私信息。</small>
              <button onClick={rotateWish} type="button">
                换一个
              </button>
            </div>
          </div>
          <button className="share-button" onClick={copyShareText} type="button">
            复制分享文案
          </button>
          <button
            className="share-button share-button-secondary"
            onClick={generateWishCard}
            type="button"
          >
            保存愿望功德图
          </button>
          <small
            className={`share-status ${shareStatus ? "has-feedback" : ""}`}
            aria-live="polite"
          >
            {shareStatus || "分享给需要一点功德的朋友"}
          </small>
          {manualShareText && (
            <label className="manual-share-box">
              <span>手动复制文案</span>
              <textarea readOnly value={manualShareText} />
            </label>
          )}
        </article>

        <article className="achievement-card">
          <div className="achievement-heading">
            <span className="section-kicker">成就</span>
            <strong>{achievementProgress.summary}</strong>
          </div>
          <div className="achievement-progress">
            <p>{achievementProgress.nextLine}</p>
            <span>
              {achievementProgress.nextAchievement
                ? achievementProgress.nextAchievement.condition
                : "可以继续敲一张更好看的分享图"}
            </span>
          </div>
          <div className="badge-grid">
            {achievements.map((item) => (
              <div
                className={`badge-item ${item.unlocked ? "is-unlocked" : ""}`}
                key={item.id}
              >
                <span>{item.unlocked ? "已解锁" : "未解锁"}</span>
                <strong>{item.name}</strong>
                <small>{item.condition}</small>
              </div>
            ))}
          </div>
        </article>

      </section>

      <AdsenseUnit slot="5762213705" />
    </main>
  );
}

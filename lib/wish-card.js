import { normalizeWish } from "./gongde-growth.js";

const cardWidth = 1200;
const cardHeight = 1500;
const fallbackWish = "愿今日心态稳定";

export function createWishCardModel(stats, fortune, wish, streak = 0) {
  const normalizedWish = normalizeWish(wish) || fallbackWish;
  const today = Number(stats?.today) || 0;
  const safeStreak = Number(streak) || 0;
  const title = fortune?.title || "今日功德签";
  const avoid = fortune?.avoid ? `，忌${fortune.avoid}` : "";

  return {
    width: cardWidth,
    height: cardHeight,
    wish: normalizedWish,
    countLine: `我已为此敲下 ${today} 点功德`,
    fortuneLine: `今日签：${title}${avoid}`,
    streak: safeStreak,
    streakLine: safeStreak >= 2 ? `已连续修行 ${safeStreak} 天` : "今天开始修行",
    siteLine: "赛博木鱼 Cyber Muyu · gongdeclicker.com",
  };
}

export function wrapTextForCard(text, maxWidth, measureText) {
  const chars = Array.from(String(text || ""));
  const lines = [];
  let line = "";

  chars.forEach((char) => {
    const next = `${line}${char}`;

    if (line && measureText(next) > maxWidth) {
      lines.push(line);
      line = char;
      return;
    }

    line = next;
  });

  if (line) {
    lines.push(line);
  }

  return lines;
}

export function renderWishCardToDataUrl(
  stats,
  fortune,
  wish,
  documentRef = document,
  streak = 0,
) {
  if (!documentRef?.createElement) {
    throw new Error("Canvas is not available");
  }

  const model = createWishCardModel(stats, fortune, wish, streak);
  const canvas = documentRef.createElement("canvas");
  canvas.width = model.width;
  canvas.height = model.height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas context is not available");
  }

  drawCard(context, model);
  return canvas.toDataURL("image/png");
}

function drawCard(context, model) {
  // 纸底 + 双向禅意渐变
  context.fillStyle = "#fff8eb";
  context.fillRect(0, 0, model.width, model.height);

  const gradient = context.createLinearGradient(0, 0, model.width, model.height);
  gradient.addColorStop(0, "rgba(39, 116, 91, 0.2)");
  gradient.addColorStop(0.46, "rgba(255, 248, 235, 0)");
  gradient.addColorStop(1, "rgba(211, 66, 53, 0.18)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, model.width, model.height);

  // 卡片底板
  context.fillStyle = "#fffdf7";
  roundRect(context, 96, 104, 1008, 1292, 34);
  context.fill();
  context.strokeStyle = "#e8d7bd";
  context.lineWidth = 4;
  context.stroke();

  context.textAlign = "left";

  // 顶部品牌条
  context.fillStyle = "#d34235";
  context.font = "900 40px sans-serif";
  context.fillText("赛博木鱼 · Cyber Muyu", 160, 206);

  context.fillStyle = "#2f5f98";
  context.font = "800 40px sans-serif";
  context.fillText("今日愿望", 160, 286);

  // 愿望主文案
  context.fillStyle = "#211a16";
  context.font = "900 92px sans-serif";
  const wishLines = wrapTextForCard(
    model.wish,
    880,
    (text) => context.measureText(text).width,
  ).slice(0, 3);
  wishLines.forEach((line, index) => {
    context.fillText(line, 160, 420 + index * 118);
  });

  // 金色分隔线
  context.strokeStyle = "rgba(224, 164, 37, 0.55)";
  context.lineWidth = 5;
  context.beginPath();
  context.moveTo(160, 832);
  context.lineTo(1040, 832);
  context.stroke();

  // 功德数
  context.fillStyle = "#27745b";
  context.font = "900 58px sans-serif";
  context.fillText(model.countLine, 160, 916);

  // 连续修行
  context.fillStyle = "#b9791a";
  context.font = "900 50px sans-serif";
  context.fillText(`🔥 ${model.streakLine}`, 160, 1004);

  // 今日签
  context.fillStyle = "#75695f";
  context.font = "700 42px sans-serif";
  wrapTextForCard(
    model.fortuneLine,
    860,
    (text) => context.measureText(text).width,
  )
    .slice(0, 2)
    .forEach((line, index) => {
      context.fillText(line, 160, 1090 + index * 60);
    });

  // 主张文案
  context.fillStyle = "#d34235";
  context.font = "900 52px sans-serif";
  context.fillText("木鱼已敲，心态先稳住。", 160, 1240);

  // 底部站点
  context.fillStyle = "#75695f";
  context.font = "800 38px sans-serif";
  context.fillText(model.siteLine, 160, 1330);
}

function roundRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

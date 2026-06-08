// 轻量 i18n 工具：语言检测、归一化、持久化键与切换器数据。
// 具体文案分布在使用处（组件内 UI 字典、gongde-growth/gongde-storage 的内容数据），
// 所有内容函数以 lang="zh" 为默认，保证中文行为与单测不变。
export const LANGUAGE_STORAGE_KEY = "gongde-clicker:lang";
export const DEFAULT_LANG = "zh";

export const LANGUAGES = [
  { code: "zh", label: "中文" },
  { code: "en", label: "EN" },
];

export function normalizeLang(lang) {
  return lang === "en" ? "en" : "zh";
}

// 检测初始语言：优先用户已选 → 浏览器语言 → 默认中文。
export function detectLanguage(stored, navigatorLang) {
  if (stored === "zh" || stored === "en") {
    return stored;
  }

  const lang = String(navigatorLang || "").toLowerCase();
  if (lang && !lang.startsWith("zh")) {
    return "en";
  }

  return DEFAULT_LANG;
}

export function readStoredLanguage(storage) {
  if (!storage) {
    return null;
  }

  try {
    const value = storage.getItem(LANGUAGE_STORAGE_KEY);
    return value === "zh" || value === "en" ? value : null;
  } catch {
    return null;
  }
}

export function saveLanguage(storage, lang) {
  if (!storage) {
    return;
  }

  storage.setItem(LANGUAGE_STORAGE_KEY, normalizeLang(lang));
}

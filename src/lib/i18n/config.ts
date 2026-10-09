/**
 * 多語設定（票 11）。
 * 三語：English / 简体中文 / 繁體中文。
 */

export type Locale = "zh-Hant" | "zh-Hans" | "en";

export const LOCALES: Locale[] = ["zh-Hant", "zh-Hans", "en"];

/**
 * ⚠️ 臨時開關：**測試期預設簡體**。
 * 正式上線時改為 `"zh-Hant"`（客群是香港旅客，繁體才是天然預設）。
 */
export const DEFAULT_LOCALE: Locale = "zh-Hans";

/** 語言選擇器上的名稱（各語自己顯示自己的名字）。 */
export const LOCALE_NAMES: Record<Locale, string> = {
  "zh-Hant": "繁體中文",
  "zh-Hans": "简体中文",
  en: "English",
};

/** 窄版選擇器用的短標籤。 */
export const LOCALE_SHORT: Record<Locale, string> = {
  "zh-Hant": "繁",
  "zh-Hans": "简",
  en: "EN",
};

/** <html lang> 用的 BCP-47 標籤。 */
export const HTML_LANG: Record<Locale, string> = {
  "zh-Hant": "zh-Hant",
  "zh-Hans": "zh-Hans",
  en: "en",
};

/** 把任意字串正規化為支援的 Locale；不認得就回預設。 */
export function resolveLocale(raw: string | undefined | null): Locale {
  if (!raw) return DEFAULT_LOCALE;
  const v = raw.trim().toLowerCase();
  if (v === "en" || v.startsWith("en-")) return "en";
  if (v === "zh-hant" || v === "zh-tw" || v === "zh-hk" || v.startsWith("zh-hant-")) return "zh-Hant";
  if (v === "zh-hans" || v === "zh-cn" || v === "zh" || v.startsWith("zh-hans-")) return "zh-Hans";
  if (v === "zh-hant" || v.includes("hant") || v.includes("tw") || v.includes("hk")) return "zh-Hant";
  if (v.includes("hans") || v.includes("cn")) return "zh-Hans";
  return DEFAULT_LOCALE;
}

export const LOCALE_COOKIE = "locale";

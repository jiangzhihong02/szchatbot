/**
 * 意圖的純定義與關鍵詞匹配 —— **客戶端安全**（不 import 任何伺服器端模組）。
 * 前端按鈕、共用 hook 與伺服器端分發器都從這裡取。
 */

/** 前端预设按钮（票 01 契约的 6 个）。它是按钮 key / emoji / 标签 / 提示的唯一来源。 */
export const PRESET_BUTTONS = [
  { key: "food", emoji: "🍜", label: "找美食", hint: "3–4 家精選" },
  { key: "day", emoji: "🗺️", label: "一日遊路線", hint: "主推 + 換一條" },
  { key: "family", emoji: "👨👩👧", label: "親子路線", hint: "帶小孩首選" },
  { key: "weather", emoji: "🌤️", label: "查天氣", hint: "今日＋未來 2 天" },
  { key: "pricing", emoji: "💰", label: "算優惠＋交通", hint: "按人數計" },
  { key: "deals", emoji: "🎫", label: "深圳優惠活動", hint: "門票 / 支付" },
] as const;

export type IntentKey = (typeof PRESET_BUTTONS)[number]["key"];
export type PresetButton = (typeof PRESET_BUTTONS)[number];

/**
 * 每个意图的**额外**关键词别名（繁體 + 簡體 + 少量粵語口語）。
 * 按钮自身的 label 不在此列——它由 PRESET_BUTTONS 提供，matchIntent 会自动并入。
 */
export const KEYWORDS: Record<IntentKey, string[]> = {
  food: ["深圳美食", "有咩好食", "食乜好", "美食推薦", "美食推荐", "美食"],
  day: ["一日遊", "一日游", "規劃行程", "规划行程", "路線", "路线", "行程"],
  family: ["親子遊", "亲子游", "親子", "亲子", "帶小孩", "带小孩", "小朋友"],
  weather: ["天氣點", "天气点", "天氣", "天气", "落雨", "weather"],
  pricing: ["點搭車", "点搭车", "幾多錢", "几多钱", "點去", "点去", "車費", "车费", "交通"],
  deals: ["有咩優惠", "有咩优惠", "優惠活動", "优惠活动", "著數", "着数", "打折", "折扣", "優惠", "优惠"],
};

/** 某意图的全部匹配词 = 额外别名 + 按钮 label（唯一的 label 来源）。 */
export function aliasesFor(key: IntentKey): string[] {
  const label = PRESET_BUTTONS.find((b) => b.key === key)?.label;
  return label ? [...KEYWORDS[key], label] : KEYWORDS[key];
}

/**
 * 手打文字 → 命中意图。最长关键词优先，避免短词盖过长词。
 * 命中规则：输入与匹配词都去空白、转小写后做子字串匹配（繁简皆收于别名与 label）。
 */
export function matchIntent(text: string): IntentKey | null {
  const t = text.trim().toLowerCase();
  if (!t) return null;

  let best: { key: IntentKey; len: number } | null = null;
  for (const b of PRESET_BUTTONS) {
    for (const w of aliasesFor(b.key)) {
      const wl = w.toLowerCase();
      if (t.includes(wl) && (!best || wl.length > best.len)) {
        best = { key: b.key, len: wl.length };
      }
    }
  }
  return best?.key ?? null;
}

/** 按鈕 label（供聊天氣泡顯示使用者「說了什麼」）。 */
export function labelFor(key: IntentKey): string {
  return PRESET_BUTTONS.find((b) => b.key === key)?.label ?? key;
}

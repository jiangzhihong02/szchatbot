import { PRESET_BUTTONS } from "./presets";
import type { IntentKey } from "./presets";
import { messages } from "./i18n/messages";
import { LOCALES } from "./i18n/config";

/**
 * 意圖的純定義與關鍵詞匹配 —— **客戶端安全**（無伺服器依賴）。
 * 鍵與 emoji 來自 `presets.ts`；三語標籤在 `i18n/messages.ts`。
 * 前端按鈕、共用 hook 與伺服器端的意圖分發都從這裡取。
 */

export { PRESET_BUTTONS };
export type { IntentKey, PresetButton } from "./presets";

/**
 * 每个意图的**额外**关键词别名（繁體 + 簡體 + 粵語口語 + English）。
 * 按钮自身的 label（三语）由 `allLabels` 併入，故不在此重複。
 */
export const KEYWORDS: Record<IntentKey, string[]> = {
  // ⚠️ 只收「口岸」相關的詞，**不收裸地名**（羅湖／福田）：那些也是食店與路線的區名，
  //    收了會讓「羅湖有咩好食」被判成口岸問題。地名一律寫成「XX口岸」。
  border: [
    "口岸", "過關", "过关", "通關", "通关", "過境", "过境", "邊境", "边境", "關口", "关口",
    "點過關", "点过关", "邊個口岸", "哪个口岸",
    "落馬洲", "落马洲", "福田口岸", "深圳灣口岸", "深圳湾口岸", "蓮塘口岸", "莲塘口岸",
    "香園圍", "香园围", "文錦渡口岸", "文锦渡口岸", "羅湖口岸", "罗湖口岸",
    "border", "checkpoint", "crossing", "immigration",
  ],
  food: ["深圳美食", "有咩好食", "食乜好", "美食推薦", "美食推荐", "美食", "food", "eat", "restaurant", "hungry"],
  day: ["一日遊", "一日游", "規劃行程", "规划行程", "路線", "路线", "行程", "route", "day trip", "itinerary"],
  family: ["親子遊", "亲子游", "親子", "亲子", "帶小孩", "带小孩", "小朋友", "family", "kids", "children"],
  weather: ["天氣點", "天气点", "天氣", "天气", "落雨", "weather", "rain"],
  transportDeals: [
    "點搭車", "点搭车", "幾多錢", "几多钱", "點去", "点去", "車費", "车费", "交通",
    "transport", "fare", "how to get", "how much",
  ],
  deals: [
    "有咩優惠", "有咩优惠", "優惠活動", "优惠活动", "著數", "着数", "打折", "折扣", "優惠", "优惠",
    "deal", "deals", "discount", "coupon", "offer",
  ],
};

/** 某意圖在**三語**下的按鈕標籤（讓任一語言的手打輸入都能命中）。 */
function allLabels(key: IntentKey): string[] {
  return LOCALES.map((l) => messages[l].presets[key].label);
}

/** 某意图的全部匹配词 = 额外别名 + 三语按钮 label。 */
export function aliasesFor(key: IntentKey): string[] {
  return [...KEYWORDS[key], ...allLabels(key)];
}

/**
 * 手打文字 → 命中意图。最长关键词优先，避免短词盖过长词。
 * 命中规则：输入与匹配词都去空白、转小写后做子字串匹配。
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

import type { Card, RouteCardData, Travellers } from "./types";
import { routesByPool } from "./data/routes";
import { featuredFoods } from "./data/foods";
import { getWeather } from "./weather";
import { buildPricingPlan } from "./pricing";
import { fetchAllDeals } from "./sources";

/**
 * 意圖分發（規則引擎，純函式，可測試）
 * ────────────────────────────────────────────────────────────
 * 把「按鈕 / 關鍵詞」映射到確定的卡片輸出。命中就返回卡片；
 * 未命中則由呼叫方交給 Claude（/api/chat）自由問答。
 *
 * 契約見 .scratch/.../issues/01-preset-buttons-and-output-formats.md
 * 詞彙定義見 CONTEXT.md。
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
 * 按钮自身的 label 不在此列——它由 PRESET_BUTTONS 提供，matchIntent 会自动并入，
 * 避免标签在两处各写一遍而漂移。
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
function aliasesFor(key: IntentKey): string[] {
  const label = PRESET_BUTTONS.find((b) => b.key === key)?.label;
  return label ? [...KEYWORDS[key], label] : KEYWORDS[key];
}

export interface DispatchOptions {
  /** 「算優惠＋交通」需要的人数；由 UI 的快捷选项提供。 */
  travellers?: Travellers;
  /** 「換一條」当前索引 */
  routeIndex?: number;
}

export type DispatchResult =
  | { matched: false }
  | { matched: true; intent: IntentKey; cards: Card[]; needsInput?: "travellers" };

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

/** 意图 → 卡片。按鈕直接呼叫此函式；手打輸入先 matchIntent 再呼叫。 */
export async function buildCards(intent: IntentKey, opts: DispatchOptions = {}): Promise<Card[]> {
  switch (intent) {
    case "food":
      return [{ type: "foodList", data: featuredFoods() }];

    case "day":
    case "family": {
      const pool = routesByPool(intent === "family" ? "family" : "day");
      const raw = opts.routeIndex ?? 0;
      const index = ((raw % pool.length) + pool.length) % pool.length;
      const data: RouteCardData = { route: pool[index], index, total: pool.length };
      return [{ type: "route", data }];
    }

    case "weather":
      return [{ type: "weather", data: await getWeather() }];

    case "pricing": {
      if (!opts.travellers) {
        throw new Error(
          "buildCards('pricing') 需要 opts.travellers —— 應由 UI 的人數快捷選項提供（契約規則 3）。"
        );
      }
      return [{ type: "pricing", data: buildPricingPlan(opts.travellers) }];
    }

    case "deals":
      return [{ type: "dealList", data: await fetchAllDeals() }];
  }
}

/** 分發入口：命中返回卡片；未命中交回呼叫方（→ /api/chat）。 */
export async function dispatch(text: string, opts: DispatchOptions = {}): Promise<DispatchResult> {
  const intent = matchIntent(text);
  if (!intent) return { matched: false };

  // 「算優惠＋交通」需要人數；手打時拿不到，交回 UI 彈快捷選項。
  if (intent === "pricing" && !opts.travellers) {
    return { matched: true, intent, cards: [], needsInput: "travellers" };
  }

  return { matched: true, intent, cards: await buildCards(intent, opts) };
}

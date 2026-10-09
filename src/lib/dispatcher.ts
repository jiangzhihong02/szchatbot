import type { Card, RouteCardData, Travellers } from "./types";
import { routesByPool } from "./data/routes";
import { featuredFoods } from "./data/foods";
import { getWeather } from "./weather";
import { buildPricingPlan } from "./pricing";
import { fetchAllDeals } from "./sources";
import { matchIntent } from "./intents";
import type { IntentKey } from "./intents";

/**
 * 意圖分發（規則引擎）—— **伺服器端**。
 * 把「按鈕 / 關鍵詞」映射到確定的卡片輸出。命中就返回卡片；
 * 未命中則由呼叫方交給 Claude（/api/chat）自由問答。
 *
 * 純定義（PRESET_BUTTONS / KEYWORDS / matchIntent）在 `./intents`，前端可直接 import。
 * 契約見 .scratch/.../issues/01-preset-buttons-and-output-formats.md；詞彙見 CONTEXT.md。
 */

// 重新導出純定義，讓既有入口（冒煙腳本等）仍可從 dispatcher 取用。
export { PRESET_BUTTONS, KEYWORDS, matchIntent, aliasesFor, labelFor } from "./intents";
export type { IntentKey, PresetButton } from "./intents";

export interface DispatchOptions {
  /** 「算優惠＋交通」需要的人数；由 UI 的快捷选项提供。 */
  travellers?: Travellers;
  /** 「換一條」当前索引 */
  routeIndex?: number;
}

export type DispatchResult =
  | { matched: false }
  | { matched: true; intent: IntentKey; cards: Card[]; needsInput?: "travellers" };

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

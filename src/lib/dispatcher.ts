import type { Card, RouteCardData } from "./types";
import { routesByPool } from "./data/routes";
import { featuredFoods } from "./data/foods";
import { getWeather } from "./weather";
import { buildPricingPlan } from "./pricing";
import { fetchAllDeals } from "./sources";
import { matchIntent } from "./intents";
import type { IntentKey } from "./intents";
import type { DispatchOptions, DispatchResult } from "./dispatch-contract";

// 契約型別在 `dispatch-contract`（客戶端安全）；這裡再導出一次，方便伺服器端呼叫方。
export type { DispatchOptions, DispatchResult } from "./dispatch-contract";

/**
 * 意圖分發（規則引擎）—— **伺服器端**。
 * 把「按鈕 / 關鍵詞」映射到確定的卡片輸出。命中就返回卡片；
 * 未命中則由呼叫方交給 Claude（/api/chat）自由問答。
 *
 * ⚠️ 本檔**不含面向使用者的文案**，也**不接收 locale** —— 卡片一律回傳結構化資料，
 *    文案由前端按語言渲染（見 `i18n/messages.ts`），故切語言時既有的卡也會即時跟著變。
 *
 * 純定義（PRESET_BUTTONS / KEYWORDS / matchIntent）在 `./intents`，前端可直接 import。
 * 契約見 .scratch/.../issues/01-preset-buttons-and-output-formats.md；詞彙見 CONTEXT.md。
 */

/**
 * 意圖 → 卡片。**低階**：呼叫方（`dispatchIntent`）須先保證 `transportDeals` 帶了出行組合；
 * 這裡沒帶只是不變式斷言（程式錯誤），不是使用者可見的行為。
 */
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

    case "transportDeals": {
      if (!opts.travellers) {
        throw new Error("buildCards('transportDeals') 不變式：呼叫方須先保證有 travellers（見 dispatchIntent）。");
      }
      return [{ type: "transportDeals", data: buildPricingPlan(opts.travellers) }];
    }

    case "deals":
      return [{ type: "dealList", data: await fetchAllDeals() }];
  }
}

/**
 * 意圖分發入口（**唯一**）：按鈕與手打都走這裡。
 * 「算優惠＋交通 需要出行組合」這條規則**只在此處表述一次** —— 回傳 `needsInput` 而非拋錯，
 * 由 UI 據此彈快捷選項。
 */
export async function dispatchIntent(intent: IntentKey, opts: DispatchOptions = {}): Promise<DispatchResult> {
  if (intent === "transportDeals" && !opts.travellers) {
    return { matched: true, intent, cards: [], needsInput: "travellers" };
  }
  return { matched: true, intent, cards: await buildCards(intent, opts) };
}

/** 手打文字入口：命中意圖就轉給 `dispatchIntent`；未命中交回呼叫方（→ /api/chat）。 */
export async function dispatch(text: string, opts: DispatchOptions = {}): Promise<DispatchResult> {
  const intent = matchIntent(text);
  if (!intent) return { matched: false };
  return dispatchIntent(intent, opts);
}

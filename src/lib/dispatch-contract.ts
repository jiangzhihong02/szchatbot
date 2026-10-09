import type { Card, Travellers } from "./types";
import type { IntentKey } from "./presets";

/**
 * 分發的**契約**（客戶端安全）。
 * 放在獨立模組，是因為伺服器端的 `dispatcher.ts` 會拖進 `amap`／資料源，
 * 客戶端（`useChat`）不該為了拿一個型別而 import 整個伺服器圖。
 * 分發器、API 路由、`useChat` 都 import 這裡 —— 型別只宣告一次。
 */

/** 分發的輸入選項。 */
export interface DispatchOptions {
  travellers?: Travellers;
  routeIndex?: number;
}

/** 分發的結果：未命中 / 命中（可能還需要出行組合）。 */
export type DispatchResult =
  | { matched: false }
  | { matched: true; intent: IntentKey; cards: Card[]; needsInput?: "travellers" };

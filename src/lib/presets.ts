/**
 * 七個預設按鈕的鍵與 emoji（**無文案、無依賴**）。
 * 文案在 `i18n/messages.ts`（三語），匹配詞在 `intents.ts`。
 * 這樣拆分是為了避免 `intents ⇄ messages` 的循環 import。
 *
 * 順序＝**旅程順序**：先過關，再玩、再食。口岸排第一，因為那是旅客的第一個問題。
 */
export const PRESET_BUTTONS = [
  { key: "border", emoji: "🛂" },
  { key: "food", emoji: "🍜" },
  { key: "day", emoji: "🗺️" },
  { key: "family", emoji: "👨‍👩‍👧" },
  { key: "weather", emoji: "🌤️" },
  { key: "transportDeals", emoji: "💰" },
  { key: "deals", emoji: "🎫" },
] as const;

export type IntentKey = (typeof PRESET_BUTTONS)[number]["key"];
export type PresetButton = (typeof PRESET_BUTTONS)[number];

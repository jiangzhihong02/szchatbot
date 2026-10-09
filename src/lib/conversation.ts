import type { Card } from "./types";
import type { IntentKey } from "./presets";

/**
 * 對話狀態的**純部分**（客戶端安全，無 React、無 fetch）。
 * 從 `useChat` 抽出來，好讓順序敏感的規則能被檢視與測試。
 */

/** 聊天串中的一則訊息。 */
export type ChatMsg = {
  id: string;
  role: "user" | "assistant";
  text?: string;
  cards?: Card[];
  streaming?: boolean;
  /** 若這則由某意圖產生，記下它以支持「換一條」。 */
  fromIntent?: IntentKey;
  routeIndex?: number;
};

/**
 * 餵給 LLM 的對話歷史：只取**有文字**的訊息（純卡片的不算），由舊到新，最多 `limit` 則。
 * 這條順序敏感的規則以前埋在 fetch 裡 —— 抽出後可單測。
 */
export function transcriptFor(
  messages: ChatMsg[],
  limit = 12
): { role: "user" | "assistant"; content: string }[] {
  return messages
    .filter((m) => m.text && m.text.trim())
    .map((m) => ({ role: m.role, content: (m.text as string).trim() }))
    .slice(-limit);
}

/** 「換一條」的下一索引（在池內循環由 `buildCards` 負責）。 */
export function nextRouteIndex(current: number | undefined): number {
  return (current ?? 0) + 1;
}

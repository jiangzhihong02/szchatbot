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

/** 餵給 LLM 的一輪：角色＋文字（API 形狀，與帶卡片的 `ChatMsg` 不同）。 */
export type Turn = { role: "user" | "assistant"; content: string };

/**
 * 清洗 /api/chat 收到的 messages（**純函式**，從路由抽出好單測）：
 *   1. 丟掉非 user/assistant、或 content 非字串、或去空白後為空的；
 *   2. 從第一條 user 起（Anthropic API 要求首條為 user，開頭的 assistant 要丟）；
 *   3. 只留最近 `limit` 輪。
 * 沒有任何 user → 回空陣列，呼叫方據此回 400。content 保留原樣（不 trim）。
 */
export function sanitizeTurns(raw: unknown, limit = 20): Turn[] {
  const arr = Array.isArray(raw) ? raw : [];
  const valid: Turn[] = [];
  for (const m of arr) {
    if (!m || typeof m !== "object") continue;
    const { role, content } = m as { role?: unknown; content?: unknown };
    if ((role === "user" || role === "assistant") && typeof content === "string" && content.trim().length > 0) {
      valid.push({ role, content });
    }
  }
  const firstUser = valid.findIndex((t) => t.role === "user");
  if (firstUser === -1) return [];
  return valid.slice(firstUser).slice(-limit);
}

import type { DispatchResult } from "@/lib/dispatch-contract";
import { parseSSE } from "@/lib/sse";

/**
 * 聊天的 **transport seam** —— `useChat` 與伺服器之間唯一的接觸面。
 *
 * 抽出來的理由（架構第 2 輪）：原本 fetch 與 SSE 解析都埋在 `useChat` 裡，
 * 沒有 DOM 就跑不起來，於是「先 dispatch、未命中再 stream」這段核心編排**無法測**。
 * 把它收進一個介面後：
 *   - `useChat(tx = defaultTransport)` 可注入 **fakeTransport** 來測編排；
 *   - SSE 的逐行解析落在純函式 `parseSSE`（`lib/sse`），可餵半截 chunk 單測。
 */
export interface ChatTransport {
  /** 打 /api/dispatch，走確定性路徑。非 2xx 一律拋錯（由 `useChat` 顯示資料錯誤）。 */
  dispatch(body: unknown): Promise<DispatchResult>;
  /** 打 /api/chat，逐段把 LLM 的自由問答回呼出來。locale 決定回答語言。 */
  streamChat(
    messages: { role: string; content: string }[],
    locale: string,
    onDelta: (s: string) => void
  ): Promise<void>;
}

/** 正式 transport：真的 fetch。瀏覽器端。 */
export const defaultTransport: ChatTransport = {
  async dispatch(body) {
    const res = await fetch("/api/dispatch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`dispatch ${res.status}`);
    return (await res.json()) as DispatchResult;
  },

  async streamChat(messages, locale, onDelta) {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, locale }),
    });
    if (!res.body) {
      onDelta("（暫時連接不上服務）");
      return;
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let rest = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      // 位元組 → 字串（含跨 chunk 的多位元組）在這裡；行解析交給純函式。
      const parsed = parseSSE(rest, decoder.decode(value, { stream: true }));
      rest = parsed.rest;
      for (const e of parsed.events) {
        if (e.text) onDelta(e.text);
        else if (e.error) onDelta(`\n\n${e.error}`);
      }
      if (parsed.done) return;
    }
  },
};

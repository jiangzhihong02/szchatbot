/**
 * SSE 行解析 —— **純函式**（無 fetch、無 React、無 TextDecoder）。
 *
 * /api/chat 以 Server-Sent Events 串流回答：每個事件一行 `data: {...}`，
 * 以 `data: [DONE]` 收尾。網路 chunk 不保證切在換行上，故要跨 chunk 緩衝：
 * 把上一次剩下的半行（`prev`）接在新 chunk 前面，處理完整的行，再把新的半行留回 `rest`。
 *
 * 位元組 → 字串的解碼（含多位元組 UTF-8 跨 chunk）由呼叫方的 TextDecoder 負責；
 * 本檔只碰字串，因此可以餵「斷在任意位置的 chunk」來單測（見 scripts/check-sse.ts）。
 */

/** 一個 SSE 事件的負載：要嘛一段文字，要嘛一則錯誤。 */
export interface SSEChunk {
  text?: string;
  error?: string;
}

export interface SSEResult {
  /** 本次新解析出的完整事件（已濾掉空白行、註解行、壞 JSON）。 */
  events: SSEChunk[];
  /** 尚未遇到換行的半行，要接到下一個 chunk 前面。 */
  rest: string;
  /** 是否看到了 `[DONE]`；看到就該停止讀取。 */
  done: boolean;
}

/**
 * 把 `prev + chunk` 切成完整行並解析。遇到 `[DONE]` 立即停（其後同批的行丟棄，
 * 與原本「見 [DONE] 即 return」的行為一致）。壞 JSON 或非 `data:` 行一律忽略，不拋錯。
 */
export function parseSSE(prev: string, chunk: string): SSEResult {
  const lines = (prev + chunk).split("\n");
  const rest = lines.pop() ?? "";
  const events: SSEChunk[] = [];
  let done = false;

  for (const line of lines) {
    const l = line.trim(); // 順便吃掉 CRLF 的 \r
    if (!l.startsWith("data:")) continue; // 空白行、`:` 註解行
    const payload = l.slice(5).trim();
    if (payload === "[DONE]") {
      done = true;
      break;
    }
    try {
      const j = JSON.parse(payload) as SSEChunk;
      if (typeof j.text === "string" || typeof j.error === "string") events.push(j);
    } catch {
      /* 不完整或非 JSON 片段：忽略 */
    }
  }

  return { events, rest, done };
}

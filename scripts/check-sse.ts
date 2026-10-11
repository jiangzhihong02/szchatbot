// 冒煙檢查：SSE 行解析（parseSSE）。運行：npx tsx scripts/check-sse.ts
//
// 重點是**跨 chunk 緩衝**：網路不保證把事件切在換行上。每條斷言的期望值都是
// 人手推出來的（不是跑一遍實現抄回來），所以它證明的是「對」，不只是「沒變」。
import { parseSSE } from "../src/lib/sse";
import { makeChecker } from "./_check";

const { check, report } = makeChecker();

function main() {
  // ── 1. 單一完整事件 ──
  const a = parseSSE("", 'data: {"text":"hi"}\n');
  check("完整事件 → 一個 text", a.events.length === 1 && a.events[0].text === "hi");
  check("完整事件 → rest 空、未 done", a.rest === "" && !a.done);

  // ── 2. 事件被切成兩個 chunk（最關鍵的情況）──
  const p1 = parseSSE("", 'data: {"te');
  check("半截 chunk → 無事件", p1.events.length === 0);
  check("半截 chunk → 整段留在 rest", p1.rest === 'data: {"te');
  const p2 = parseSSE(p1.rest, 'xt":"yo"}\n');
  check("接上後半 → 解析出來", p2.events.length === 1 && p2.events[0].text === "yo");

  // 文字也可能斷在字串中間
  const h1 = parseSSE("", 'data: {"text":"he');
  const h2 = parseSSE(h1.rest, 'llo"}\n');
  check("文字斷在中間 → 接回 hello", h2.events[0]?.text === "hello");

  // ── 3. [DONE] ──
  const d = parseSSE("", "data: [DONE]\n");
  check("[DONE] → done=true、無事件", d.done && d.events.length === 0);

  // 同一批裡 [DONE] 之後的行要丟棄（與原本「見 [DONE] 即 return」一致）
  const d2 = parseSSE("", 'data: {"text":"a"}\ndata: [DONE]\ndata: {"text":"late"}\n');
  check("[DONE] 前的收、後的丟", d2.done && d2.events.length === 1 && d2.events[0].text === "a");

  // ── 4. 錯誤事件 ──
  const e = parseSSE("", 'data: {"error":"boom"}\n');
  check("error 事件", e.events.length === 1 && e.events[0].error === "boom");

  // ── 5. 一個 chunk 多個事件 ──
  const m = parseSSE("", 'data: {"text":"a"}\ndata: {"text":"b"}\n');
  check("多事件同批", m.events.length === 2 && m.events[0].text === "a" && m.events[1].text === "b");

  // 最後一行沒有換行 → 留在 rest，不吞
  const m2 = parseSSE("", 'data: {"text":"a"}\ndata: {"text":"b"}');
  check("末行無換行 → 前者收、後者留 rest", m2.events.length === 1 && m2.rest === 'data: {"text":"b"}');

  // ── 6. 噪音與邊界：空行、註解、壞 JSON、空物件、CRLF ──
  const n = parseSSE("", ': 註解\n\ndata: {"text":"x"}\n');
  check("空行與 : 註解行被忽略", n.events.length === 1 && n.events[0].text === "x");
  check("壞 JSON 不拋錯、不產事件", parseSSE("", "data: {壞\n").events.length === 0);
  check("空物件（無 text/error）不算事件", parseSSE("", "data: {}\n").events.length === 0);
  check("CRLF：\\r 被 trim 掉", parseSSE("", 'data: {"text":"a"}\r\n').events[0]?.text === "a");
  check("多位元組字串原樣帶過", parseSSE("", 'data: {"text":"你好"}\n').events[0]?.text === "你好");

  report();
}

main();

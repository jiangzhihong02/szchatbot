# 第 1 輪 · `useChat` 抽出 transport seam ＋ 純 `parseSSE`

**候選**：報告 Candidate 2（Strong，Top rec）｜**類型**：洩漏的 seam ＋ 可測性
**日期**：2026-10-11｜**commit**：見本輪末

## 問題

聊天的狀態外殼 `useChat`（184 行、改過 9 次）把三件事混在一起：React 狀態、`fetch`、以及 **SSE 逐行解碼**。上一輪已把*純*的部分（`transcriptFor` / `nextRouteIndex`）抬進 `conversation.ts`，但仍困在 hook 裡的是：

- `callDispatch` / `streamChat`（`fetch`）；
- SSE 解碼迴圈——切 `\n`、認 `data:`、`[DONE]`、`JSON.parse`、**緩衝半截 chunk**。

這段最容易出 bug，卻**一個測試都沒有**：它只活在 hook 裡，沒有 DOM 就跑不起來。「先 dispatch、未命中再 stream」的核心編排同理。

## 方案（deepened interface）

一個 **transport seam**，SSE 解析落成純函式：

- `src/lib/sse.ts` — `parseSSE(prev, chunk) → { events, rest, done }`。純字串邏輯，位元組解碼留給呼叫方的 `TextDecoder`，所以可以餵「斷在任意位置的 chunk」單測。
- `src/components/chat/transport.ts` — `interface ChatTransport { dispatch; streamChat }` ＋ `defaultTransport`（真 `fetch`，`streamChat` 內用 `parseSSE`）。
- `useChat(tx: ChatTransport = defaultTransport)` — 呼叫點由 `callDispatch(...)`→`tx.dispatch(...)`、`streamChat(...)`→`tx.streamChat(...)`。兩個版面 `useChat()` 不帶參數，靠預設值，無需改動。

測試面＝介面：餵 chunk 測 `parseSSE`，餵 fake transport 測 `send()` 編排。

## 檢查／debug 過程

| 步驟 | 指令 | 結果 |
|---|---|---|
| 基線（動手前） | `npm run check` | 綠。213＋i18n＋17＋13＋29＋24 |
| 新增 SSE 斷言後 | `npm run check` | 綠。新增 **check-sse 16 項**（總數 +16） |
| 型別＋編譯 | `npm run build` | 綠。`Compiled successfully` / `Finished TypeScript`，5 條路由如常 |

**本輪沒有紅**——改動是機械式的搬移。真正要記下的是三個**設計判斷**（而非 bug）：

1. **錯誤文案的 `\n\n` 前綴留在 transport，不進 `parseSSE`。** 讓 `parseSSE` 只管 SSE 分幀＋JSON，顯示格式（`error` 前補兩個換行）是 transport 的事。純函式才純得乾淨。
2. **`[DONE]` 用 `break` 而非 `continue`。** 忠實還原原本「見 `[DONE]` 即 `return`」：同一批裡 `[DONE]` 之後的行要丟棄。為此特地寫了一條斷言（`[DONE] 前的收、後的丟`）釘住這個細節，免得日後有人「順手」改成 `continue`。
3. **CRLF 容忍是白撿的**：行解析用 `l.trim()`，順手吃掉 `\r`。加了一條斷言記錄這個性質。

**一筆明知而暫不處理的債**：`streamChat` 在 `!res.body` 時回退的 `"（暫時連接不上服務）"` 是**寫死的簡繁混用字串**，沒走 i18n。本輪照搬未改（屬 ADR-0003 文案層，不在本輪範圍）——留記於此，日後併入 i18n 輪次。

## 結果

- 新檔：`src/lib/sse.ts`、`src/components/chat/transport.ts`、`scripts/check-sse.ts`
- 改檔：`src/components/chat/useChat.ts`（-49 行內嵌 transport，+注入點）、`package.json`（check 串接 check-sse）
- **刪除測試回看**：hook 保住（React state＋action）；搬走的 transport 不再無法觸及——`parseSSE` 現在能被餵半截 chunk 測。seam 補成。
- `npm run check` 綠、`npm run build` 綠。

# 第 4 輪 · `chat/route.ts` 抽出 `sanitizeTurns`

**候選**：報告 Candidate 4（Worth exploring，小）｜**類型**：洩漏的 seam
**日期**：2026-10-11｜**commit**：見本輪末

## 問題

`/api/chat` 路由中段有一段**順序敏感的純邏輯**：濾掉空的／非 user/assistant 的訊息、從第一條 user 起（Anthropic API 要求首條為 user）、只留最近 20 輪。它坐在 HTTP 處理器裡，**沒有測試**——正是前幾輪抽走 `transcriptFor` 的同一個類別，只因在伺服器側而非 hook 裡才漏了。

## 方案（deepened interface）

抽成純函式 `sanitizeTurns(raw: unknown, limit = 20): Turn[]`，放進 `lib/conversation.ts`（對話的純部分）。路由只剩「收 request → `sanitizeTurns` → 空則 400 → 餵 SDK → 串流」。HTTP 的事（`invalid JSON` / `no user message` 兩個 400）留在路由；純邏輯進模組。

## 檢查／debug 過程

| 步驟 | 指令 | 結果 |
|---|---|---|
| 改 conversation.ts ＋ route.ts ＋ 新增 check-conversation | `npm run check` | 綠。新增 **check-conversation 14 項** |
| 型別＋編譯 | `npm run build` | 綠 |

**踩到並修掉的一個坑：** 把 `Turn` 型別移進 `conversation.ts` 並在路由 `import type { Turn }` 後，路由裡**還留著原本那行 `type Turn = …` 的本地宣告**——會變成重複識別符、編譯必紅。動手術時誤刪成「加了個空行」而非刪掉。發現後把本地宣告整行刪掉，只留 import，`build` 才綠。教訓：移型別要**同時**刪舊宣告，不能只加 import。

**行為保持**：`content` 保留原樣不 trim（與舊版一致——舊版 filter 用 `trim().length>0` 判空，但 push 的是原始訊息）；「無 user → 400 no user message」改由「`sanitizeTurns` 回空 → 路由判空回 400」表達，兩個 400 文案都原樣保留。

**順手補的覆蓋**：`conversation.ts` 的 `transcriptFor` / `nextRouteIndex` 本來也沒測試，check-conversation 一併補上（同模組、極便宜）。

## 結果

- 新檔：`scripts/check-conversation.ts`
- 改檔：`src/lib/conversation.ts`（+`Turn`、`sanitizeTurns`）、`src/app/api/chat/route.ts`（內嵌 filter → 一行呼叫）、`package.json`
- **刪除測試回看**：邏輯從路由集中進純模組，可測；路由變薄。另兩個路由（`dispatch`／`route-map`）已是薄 pass-through，未動。
- `npm run check` 綠、`npm run build` 綠。

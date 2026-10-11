# 架構深化 · 分輪記錄（arch-rounds）

把 `/improve-codebase-architecture` 找出的四個深化候選，**按優先級**一輪一輪做掉。
每一輪一個檔，記下：**問題 → 方案 → 檢查／debug 過程（跑了什麼、哪裡紅了、怎麼修）→ 結果**。
目的是日後專案匯報時，能把「遇到什麼問題、怎麼解決」講得出來。

> 詞彙以 [`CONTEXT.md`](../../CONTEXT.md) 為準；架構詞彙（module／interface／depth／seam／leverage／locality／刪除測試）見 `/codebase-design`。
> 報告原件（含 before/after 圖）當時開在 `%TEMP%\architecture-review-*.html`（非版控）。

## 驗證方式（每輪一致）

- `npm run check` —— 冒煙斷言（純函式、契約、同源閘、高德簽名、口岸、變更監看）
- `npm run build` —— Next.js 編譯（含型別）

## 輪次

| 輪 | 候選 | 類型 | 強度 | 狀態 |
|---|---|---|---|---|
| 1 | `useChat` 抽出 transport seam ＋ 純 `parseSSE` | 洩漏的 seam | Strong | ✅ 完成 · [記錄](round-1-usechat-transport-seam.md) |
| 2 | 譯文欄位清單去重（`localizeX` 由 `*_FIELDS` 推導） | locality | Strong | ✅ 完成 · [記錄](round-2-i18n-field-dedup.md) |
| 3 | 卡片種類登記表（沿 client／server 拆） | 缺失的 seam | Worth exploring | ✅ 完成（選 B：只做前端視圖表）· [記錄](round-3-card-view-registry.md) |
| 4 | `chat/route.ts` 抽出 `sanitizeTurns` | 洩漏的 seam | Worth exploring | 待辦 |

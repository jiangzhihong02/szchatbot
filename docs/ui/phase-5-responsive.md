# Phase 5 · 響應式 + 收尾

**類型**：響應式與打磨（§21/§27/§29/§32）｜**日期**：2026-10-11｜**commit**：見末

## 做了什麼

- **路線時間線**：站點序號之間加一條髮絲連接線（4b 刻意延後、此輪補上），序號圈疊於線上，層級更像「時序」。
- **骨架屏**（§29）：取數/分發途中（assistant 訊息還沒有文字/卡片/串流）顯示 `CardSkeleton`——手機在對話流內，桌面在右側舞台。取代「空白等待」。
- **平板**（§21）：桌面版側欄 `w-80 lg:w-[22rem]`、舞台內距 `p-4 sm:p-6`，窄一點的平板不再被 22rem 側欄擠壓。
- **focus / disabled 一致**：全互動元件在 Phase 3 的 primitive 已統一 `focus-visible` ring 與 `disabled:opacity-40`；本輪覆核 LocaleSwitcher 也有 ring。
- 互動態（hover/active）由 V2 按鈕與 Chip/IconButton 統一提供。

## 刻意沒做（避免 scope creep / 風險）

- **UA 路由不改**：手機/桌面仍由 `resolveVariant`（UA）分發，非 CSS 斷點切換——那是 ADR-0002 的決定，不在 UI 重構範圍。平板走桌面版，已做上面的寬度自適應。
- `h-screen`（桌面）與 `h-[100dvh]`（手機）維持——各自版面各自合適，桌面無需 dvh。

## 驗證

- `npm run build` 綠；`npm run check` 9 ✅ 不變；dev 200 ×3（home/mobile/desktop）。
- 功能安全：全程只動樣式/組合，未碰 API/dispatch/資料/i18n 鍵/狀態/路由。

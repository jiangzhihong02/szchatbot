# UI/UX 視覺重構（ui-refactor）

把 reference（圓周旅迹式現代旅行產品）的視覺語言，套到**現有的對話式產品**上。
一次 **UI/UX Visual Refactor**，不是重做產品、不碰業務邏輯。

> 設計方向與組件樣式見提案稿（當時開在 `%TEMP%\design-system-20261011-*.html`，非版控）。
> 詞彙以 [`CONTEXT.md`](../../CONTEXT.md) 為準。

## 範圍（已與使用者確認）

- 本項目是**對話式助手**：單路由 `/` → 手機對話流／桌面分欄台 + 六種卡片。**不新造** My Trips／Trip Detail／Create Trip／Profile 等本項目沒有的頁面。
- 只改 **CSS · token · 組件樣式 · 組合 · 圖標 · 空/載入態**。不動 API／dispatch／資料／i18n 鍵／狀態／路由／裝置分發。
- 確認的方向：**主色＝靜謐旅行綠 `#2E6B57`**（黑僅留給最高強度動作）；chrome 圖標引入 **lucide-react**；**7 個預設按鈕的類別 emoji 保留**（內容識別），只把發送/麥/品牌/空態等 chrome 換成線性圖標。

## 審計 · 最嚴重的問題

1. **字體沒生效**：Geist 載入了卻被 `globals.css` 的 `body{font-family:Arial}` 蓋掉——全 app 其實是 Arial。
2. **卡片外殼手抄 7 次**，無共享 Card/Button/Input/Chip。
3. **主色漂移**：teal-600 為主，天氣卡卻用 sky→cyan，hover 用 teal-500，全硬編碼。
4. **圓角/間距/字號無系統**：同種按鈕三種圓角；`text-[11px]/[10px]` 任意值。
5. **emoji 當圖標 + 無 focus 態**：`🌆↑🎤👈`；輸入框 `outline-none` 無替代 ring。

## 驗證（每階段一致）

- `npm run build` —— Next.js 編譯 + 型別
- `npm run check` —— 冒煙斷言（UI 重構不應改變其數字）
- 手機 / 桌面各看一次

## 階段

| 階段 | 內容 | 狀態 |
|---|---|---|
| 2 | Design tokens（@theme 語義色/字體/陰影）+ 修字體 | ✅ [記錄](phase-2-tokens.md) |
| 3 | 共享組件 `src/components/ui/*` + lucide-react | ✅ [記錄](phase-3-primitives.md) |
| 4 | 逐面套用（兩版面 · 六卡 · Composer · PresetBar · 選擇器 · 麥 · 語言 · 空/載入） | ✅ [記錄](phase-4-apply.md) |
| 5 | 響應式 + 收尾（tablet · focus ring · 時間線 · 骨架屏） | ✅ [記錄](phase-5-responsive.md) |

**五階段全綠**。另記：按鈕質感定 V2、chrome 圖標定 Solar Duotone（備選對照見 [icon-decision.md](icon-decision.md)）。

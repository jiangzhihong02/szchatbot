# Phase 2 · Design tokens + 修字體

**類型**：全局基礎（§6–§10）｜**日期**：2026-10-11｜**commit**：見末

## 做了什麼

把設計系統的 token 寫進 `src/app/globals.css`，用 Tailwind v4 的 `@theme`：

- **語義色** → 生成 `bg-*/text-*/border-*` 工具類：`surface/sunken/ink/ink-2/ink-3/ink-disabled/line`、`primary/primary-hover/primary-weak/on-primary/accent-ink`、狀態 `success/warning/danger/info` 各帶 `-weak` 淡底。
- **字體** → `--font-sans` = Geist +（PingFang／微軟正黑／Noto）CJK 棧；`--font-mono` = Geist Mono。
- **陰影** → `shadow-e1`（靜置）、`shadow-e2`（浮層），克制。
- **修字體**：刪掉舊的 `body{font-family:Arial}`——它把 layout 載入的 Geist 整個蓋掉。改 `body` 用 `var(--font-sans)`、暖白底 `--color-bg`、主文 `--color-ink`。
- **去掉 dark 自動翻轉**：舊 `@media prefers-color-scheme:dark` 會把底色翻成近黑，與暖白設計衝突；本次設計為亮色優先，移除。

## 兩個刻意的決定

1. **不覆蓋 Tailwind 內建的 radius / spacing 階。** 若在 `@theme` 重定義 `--radius-lg`，會**靜默**把既有的 `rounded-lg`（現為 8px 的 tip/輸入框）改成別的值。過渡期這是陷阱。半徑統一留到組件層用內建階（`rounded-xl`=12 / `rounded-2xl`=16 / `rounded-full`）。顏色/陰影是**新增命名**，不碰 `teal-*`，故舊組件原樣可跑——這讓 Phase 4 能一個組件一個組件遷。
2. **亮色優先、無 dark mode。** reference 全是亮色；brief 未要求暗色。先不引入，避免再分裂一套。

## 檢查

| 指令 | 結果 |
|---|---|
| `npm run build` | 綠。`Compiled successfully` / `Finished TypeScript`，5 路由如常，無警告 |
| grep 舊 token | 無任何 `bg-background/text-foreground/--background/dark:` 殘留，安全移除 |

**可見變化**：字體真的變 Geist+CJK、底色暖白；組件仍是舊 teal（下一階段才遷）。這是刻意的增量。

## 結果

- 改檔：`src/app/globals.css`（重寫為 token 定義）
- 新增可用工具類：`bg-surface text-ink border-line bg-primary text-primary bg-primary-weak shadow-e1 …`
- 不碰任何 TS／組件／資料；`npm run build` 綠。

## 勘誤（dev 跑起來才暴露的）

`npm run build` 綠，但 `npm run dev` 整頁 500。真因：上面的 CSS 註釋裡寫了 `teal-*/slate-*`，其中的 **`*/` 把 `/* 註釋 */` 提前關掉了**，後面的中文變成非法 CSS。`@tailwindcss/turbopack` 的 dev loader 抓到並報 `Parsing CSS source code failed`，而 build 的處理路徑把它吞了。

- 已修：`teal-*/slate-*` → 「teal 與 slate 色階」，去掉那個 `*/`。
- **教訓**：CSS 註釋裡別出現 `*/`；且「`build` 綠」對 CSS 不是充分閘，**真跑一次 dev** 才算數。
- 另注：這台機器當時堆了 13 個 node 孤兒進程，耗盡資源 → turbopack dev worker spawn 失敗（Windows `0xc0000142`），一度把這個 parse error 蓋成了進程錯誤。清掉 node 孤兒後真錯誤才現形。

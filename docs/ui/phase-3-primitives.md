# Phase 3 · 共享組件 + lucide-react

**類型**：共享組件（§20）｜**日期**：2026-10-11｜**commit**：見末

## 做了什麼

建 `src/components/ui/`，每個組件**只有一處定義**，取代今天 7× 手抄的卡殼與散落的 raw `<button>/<input>`：

| 組件 | 取代 | 要點 |
|---|---|---|
| `Button` | Composer/TravellersPicker 的 raw button | variant primary/secondary/ghost/accent，size sm/md |
| `IconButton` | — | 圓形，tone primary/neutral/danger，放 lucide 圖標（發送/麥） |
| `Card` | 手抄 7× 的卡殼 | `rounded-2xl border-line bg-surface shadow-e1` |
| `Tag` | `QUEUE_STYLE` + 散落徽章 | tone 映射語義色（排隊/優惠/tips） |
| `Chip` | PresetBar/TravellersPicker 膠囊 | active 選中態；類別 emoji 由呼叫方放 children |
| `Input` | Composer/TravellersPicker 的 raw input | sunken 底 + **focus ring**（補 a11y 缺口） |
| `EmptyState` | `👈/👋` 空頁 | 線性圖標 + 引導 + 動作 |
| `Skeleton` / `CardSkeleton` | 無（新增） | 取數佔位 |

全部走 Phase 2 的 token 工具類（`bg-primary text-ink border-line shadow-e1 …`）＋ Tailwind 內建半徑/間距。統一互動態：hover、**focus-visible ring**、disabled `opacity-40`。

**引入 `lucide-react ^1.55.0`**（依賴變更）：線性圖標庫，給 chrome（發送/麥/語言/地點/時鐘）用。項目原本零圖標庫，這是一條輕依賴；類別 emoji 不動（內容識別）。

## 檢查

| 指令 | 結果 |
|---|---|
| `npm install lucide-react` | 加 1 包 |
| `npm run build` | 綠。`tsc` 過（build 會對未被 import 的新檔也做型別檢查） |
| `npm run check` | 綠，數字不變（213/…/24）——未碰 lib/script |

**注意**：這些組件本階段**尚未被任何頁面 import**，純粹先備好。Tailwind v4 以檔案 glob 掃描類名（非 import 圖），故工具類照常生成；`next build` 的 tsc 覆蓋全 `src`，故型別已驗。真正換上去是 Phase 4。

## 結果

- 新檔：`src/components/ui/{Button,IconButton,Card,Tag,Chip,Input,EmptyState,Skeleton,index}.ts(x)`
- 依賴：+`lucide-react`
- 不碰任何現有組件/資料；`build` + `check` 綠。

# 圖標風格決定 · Solar Bold Duotone

**日期**：2026-10-11｜**決定人**：使用者（看了圖標對照台後選定）

## 決定

chrome 圖標（發送／麥克風／搜尋／定位／時鐘／語言／換一條等）用 **Solar Bold Duotone**。
理由：lucide 偏幾何、機械、冷；Solar 厚實、圓潤、暖，最貼本專案 travel／calm／human 的調性。

**實作**：內聯 SVG 於 `src/components/ui/Icon.tsx`（`<Icon name="send" />`），零運行時依賴、離線、`currentColor` 可換色（雙色層自帶 `opacity:.5`）。原 Phase 3 裝的 `lucide-react` 已移除（未使用）。
**類別 emoji**（🛂🍜🗺️👨‍👩‍👧🌤️💰🎫）不受影響——那是內容識別，保留。

## 想換時直接換（備選記錄）

使用者說「後面想改跟你說直接換」。換法：按下表重取 SVG（`https://api.iconify.design/<set>/<name>.svg`）替換 `Icon.tsx` 的 `INNER`，或改用 `@iconify/react` 以 `icon="<set>:<name>"` 一行切換。各風格同一批圖標的 Iconify 名稱：

| 語義 | Lucide（冷·幾何） | Material Rounded | Phosphor（人文） | Phosphor Duotone | **Solar Duotone（採用）** |
|---|---|---|---|---|---|
| 發送 send | `lucide:send` | `material-symbols:send-rounded` | `ph:paper-plane-right` | `ph:paper-plane-right-duotone` | `solar:plain-2-bold-duotone` |
| 麥克風 mic | `lucide:mic` | `material-symbols:mic-rounded` | `ph:microphone` | `ph:microphone-duotone` | `solar:microphone-bold-duotone` |
| 搜尋 search | `lucide:search` | `material-symbols:search-rounded` | `ph:magnifying-glass` | `ph:magnifying-glass-duotone` | `solar:magnifer-bold-duotone` |
| 定位 pin | `lucide:map-pin` | `material-symbols:location-on-rounded` | `ph:map-pin` | `ph:map-pin-duotone` | `solar:map-point-bold-duotone` |
| 時鐘 clock | `lucide:clock` | `material-symbols:schedule-rounded` | `ph:clock` | `ph:clock-duotone` | `solar:clock-circle-bold-duotone` |
| 語言 globe | `lucide:languages` | `material-symbols:language` | `ph:translate` | `ph:translate-duotone` | `solar:global-bold-duotone` |
| 換一條 cycle | `lucide:refresh-cw` | `material-symbols:refresh-rounded` | `ph:arrows-clockwise` | `ph:arrows-clockwise-duotone` | `solar:refresh-bold-duotone` |

> 對照台原件：`%TEMP%\icon-lab-20261011-1036.html`（Iconify 網頁組件實時渲染全部五套，非圖片）。

## 連帶定下的

- **按鈕質感**：V2「柔和浮起」（淡綠投影 + hover 抬升 1px + active 回落）。token `--shadow-btn` / `--shadow-btn-hover` 於 `globals.css`；`Button` 的 primary/accent 與 `IconButton` 的 primary 套用。

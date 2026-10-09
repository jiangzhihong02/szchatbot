# 任務：聊天界面與卡片組件（前端實現）

Type: task
Status: claimed
Label: wayfinder:task

## Question

按原型票（`原型：聊天界面與卡片視覺`）的產出，把聊天界面真正實現出來。

要做的：

- **聊天布局**：氣泡流、底部輸入欄 + 麥克風按鈕、**預設按鈕排**（6 個）。
- **卡片組件**：`route` / `weather` / `pricing` / `foodList` / `dealList`，全繁體，移動優先。
- **互動**：路線卡的「換一條」；點「算優惠＋交通」彈人數快捷選項（1大 / 2大 / 2大1小 / 自訂）。
- **接線**：接分發器（任務票 08）與 `/api/chat` 流式（任務票 04）；語音麥克風接任務票 05。
- **狀態**：加載中 / 錯誤 / 空狀態。

產出：可運行的聊天頁（`src/app/page.tsx` 一帶）。

## Blocked by

（無。原型票 02 已 resolved。）

## 落地時要遵守原型票的 verdict

- **一手資料**：原型的完整變體集（A/B/C + 浮動 switching 條）在 **`prototype/chat-ui` 分支**（`src/components/prototype/`）。看：`git checkout prototype/chat-ui && npm run dev`。
- **服務端讀 `user-agent`** 決定結構：手機 → A 對話優先；桌面 → C 分欄指令台。
- **結合響應式**做結構內微調（UA 對 iPad / 折疊屏 / 桌面模式不準）。
- 折進正式代碼時，把**落選變體 B 與浮動 switching 條移出主幹**。
- 原型代碼是 throwaway（無測試、最小錯誤處理），落地時**重寫**，不要直接提升。

## Answer

**產出並驗證。**

- **`src/app/page.tsx`**：服務端讀 `user-agent` → 手機 `<MobileChat/>`、桌面 `<DesktopConsole/>`（`instant = false` 供動態渲染）。
- **`src/app/api/dispatch/route.ts`**（新）：分發器 API。`{text|intent, travellers?, routeIndex?}` → `{matched, intent?, cards?, needsInput?}`。因分發器依賴 `use cache` 與伺服器資料，前端不直接呼叫它。
- **`src/lib/intents.ts`**（新，**客戶端安全**）：`PRESET_BUTTONS` / `KEYWORDS` / `matchIntent` / `labelFor` 等純定義。**重構**：這些原在 `dispatcher.ts`（它 import 了 `next/cache`），客戶端 import 會把伺服器碼打進瀏覽器包，故拆出；`dispatcher.ts` 改為 re-export 保持相容。
- **`src/components/chat/`**：
  - `cards.tsx`：5 種卡片；用可辨識聯合，`card.data` 自動收窄、零 cast。
  - `useChat.ts`：共用狀態 hook。先打 `/api/dispatch`；**未命中才**打 `/api/chat` 串流。含「換一條」（記 `fromIntent` / `routeIndex`）與人數快捷選項。
  - `parts.tsx`：`PresetBar`（6 按鈕，row / grid 兩種排法）+ `HeadcountPicker`（1大 / 2大 / 2大1小 / 自訂）。
  - `MobileChat.tsx`（對話優先）、`DesktopConsole.tsx`（左動作欄 + 對話，右大卡片舞台）。
- **降級佔位**：麥克風按鈕停用（票 05）；地圖未接（票 10）。

**驗證**：`tsc` 乾淨；`next build` 綠（`/`、`/api/chat`、`/api/dispatch` 皆動態）；UA 分發以 curl 雙向驗證；5 種卡片端點皆 HTTP 200；冒煙 81 項全過。

**踩坑（環境）**：早前刪 `node_modules` 後，`.next` 的 Turbopack 快取損壞 → `next dev` 對 `/` 拋 panic（`0xc0000142`），而 `next build` 正常。清 `.next` 即解。
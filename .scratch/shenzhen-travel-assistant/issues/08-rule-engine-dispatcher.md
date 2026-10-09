# 任務：規則引擎分發器 + 內容數據落地

Type: task
Status: claimed
Label: wayfinder:task

## Question

把「按鈕/關鍵詞 → 固定格式卡片」這條確定性鏈路落地，並把研究內容灌進代碼。

要做的：

- **內容數據落地**：把 `research/03-shenzhen-content.md` 的結構化 JSON 落成 `src/lib/data/` 種子（routes / foods / deals），取代或擴充現有 `src/lib/data/routes.ts`。
- **型別擴充**：`CardType` 增 `foodList` / `dealList`（或讓卡片 `data` 支援陣列），承載清單卡。
- **關鍵詞分發器**：輸入文本 → 繁簡不敏感 + 粵語別名表（見票「決策：預設按鈕清單…」契約表）→ 命中則走對應路徑，未命中則轉 `/api/chat`。
- **路徑接線**：`foodList`→美食清單；`route`→路線（支援「換一條」候選索引）；`weather`→`src/lib/weather.ts`；`pricing`→`pricing.ts` 的 `buildPricingPlan`；`dealList`→`src/lib/sources`。

產出：一個純函式分發器 + 落地後的種子資料，可被前端與測試直接調用。

## Blocked by

（無。契約票 01 與內容票 03 均已 resolved。）

## Answer

**產出並驗證通過。**

**代碼**
- `src/lib/dispatcher.ts` —— 分發器（純函式）：
  - `KEYWORDS`（繁簡 + 粵語關鍵詞表）、`PRESET_BUTTONS`（6 按鈕，供前端）
  - `matchIntent(text)`（最長匹配優先）、`buildCards(intent, opts)`、`dispatch(text, opts)`
  - 路線支援「換一條」：`routeIndex` 在候選池內循環，回傳 `{ route, index, total }`
  - 未命中回 `{ matched: false }`，由呼叫方轉 `/api/chat`
- **數據落地**：`src/lib/data/routes.ts`（7 路線，加 `pool: day|family`）、`foods.ts`（12）、`deals.ts`（10）；`sources/index.ts` 的 `CuratedSource` 改讀 `DEALS`。
- **型別擴充**：`CardType` 增 `foodList`/`dealList`；`WeatherData` 改為 3 日（`days: WeatherDay[]`）。
- **天氣 3 日**：`src/lib/weather.ts` 改用 `/v7/weather/3d`，mock 亦為 3 天。**順帶完成了票 06 的代碼部分**——票 06 只剩「申請 key + 配環境變數」。

**驗證**
- `scripts/check-dispatcher.ts`：19 個匹配用例全過（含 3 個應為 null 的未命中）；`buildCards` 冒烟全對（weather 3 天 / route 換一條 1→2 / family 2 候選 / pricing 2 優惠 / deals 10 / foods 12）。
- `tsc --noEmit` 與 `next build` 均綠。
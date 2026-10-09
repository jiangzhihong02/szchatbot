# 任務：規則引擎分發器 + 內容數據落地

Type: task
Status: open
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
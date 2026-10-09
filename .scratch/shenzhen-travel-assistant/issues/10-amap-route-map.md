# 任務：路線地圖（高德路徑規劃）

Type: task
Status: claimed
Label: wayfinder:task

## Question

在路線卡旁加一張**高德（AMap）地圖**，顯示該路線的**真實走法**。

已定（2026-10-09，與人類確認）：
- **用途**：真實路徑規劃——用高德**路徑規劃 API** 算出站點之間的實際走法，不是僅把站點連成直線。
- **與卡片關係**：路線卡保留文字站點，**卡片旁並排一張地圖**。

要做的：
- 申請高德開放平台 **Web 端（JS API）** 應用：JS API key + 安全密鑰；配到環境變數（本地 `.env.local`、線上 Vercel）。
- **後端**：新增路由（如 `/api/route-map`）調高德路徑規劃 API，逐段算「站點 → 站點」的走法。**交通方式待定**——建議預設「公交 / 地鐵」，貼近香港旅客以深圳地鐵為主的實際。
- **前端**：高德 JS API 地圖組件，標出站點、畫出路徑；與路線卡並排（手機端上下堆疊）。
- **降級**：無 key / 請求失敗時，卡片仍顯示文字站點，地圖優雅缺席。

## Blocked by

（無。票 09 已 resolved。）

## Answer

**產出並驗證。**

- **方案調整（重要）**：原定「高德 JS API 互動地圖」需要**另一把 key**（Web 端 JS API + 安全密鑰），而使用者只提供了「Web 服務」key。故改用**同一把 key 即可跑通**的方案：**高德靜態地圖**（服務端組圖、代理回傳）。若日後要可拖拽的互動地圖，補一把 JS key 即可。
- **站點座標**：`scripts/geocode-stops.ts` 經高德 **POI 搜索**（`place/text`，須用**簡體**檢索詞——高德庫為簡體而站名為繁體）一次性取得 23 個站點座標，烘入 `data/routes.ts`（`RouteStop` 加 `lng` / `lat`）。
- **`src/lib/route-map.ts`**（伺服器端）：`buildRouteMapUrl(routeId)` —— 逐段調**駕車路徑規劃**（`/v3/direction/driving`）取真實走法，抽稀至 90 點，組出靜態地圖 URL（markers 編號 + paths 折線）。`use cache` + `cacheLife({ revalidate: 604800 })`。
- **`src/app/api/route-map/route.ts`**（新）：**代理取圖** —— 前端用 `<img src="/api/route-map?routeId=x">`，伺服器帶 key 取圖後回傳 PNG，**key 不出現在瀏覽器**。無 key / 路線不存在回 404。
- **卡片**：`RouteCard` 嵌 `<img>`，`onError` 自動隱藏（無 key 時優雅降級）。
- 交通方式：**駕車**（單折線、最簡可靠）；公車／地鐵規劃較複雜，留待後續。

**驗證**：`tsc` 乾淨；`next build` 綠（`/api/route-map` 為動態路由）；3 條路線的地圖皆回傳真 PNG（54–83KB）；不存在的路線回 404。

**踩坑**：
1. 高德免費版 **QPS 限制**緊——連發請求回 `CUQPS_HAS_EXCEEDED_THE_LIMIT`（10021），故地理編碼腳本加請求間隔。
2. **dev server 模組陳舊**：伺服器在資料更新前啟動，HMR 未接上，加上 `use cache` 把錯誤結果（`center=NaN`）快取一週 → 靜態地圖回 `20003 UNKNOWN_ERROR`。清 `.next` 重啟即解。

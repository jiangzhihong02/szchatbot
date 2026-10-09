# 任务：天气 API 接入（高德天气）

Type: task
Status: resolved
Label: wayfinder:task

## Question

把已写的 `src/lib/weather.ts`（现为 mock 回退）接上**真实天气**。

要做的：

- 申请**和风天气**免费 key，配到 `.env.local`（`QWEATHER_KEY` + 你账号专属的 `QWEATHER_HOST`）。
- ✅ **3 日預報代碼已完成**（票 08）：`src/lib/weather.ts` 已改用 `/v7/weather/3d`，`WeatherData` 已為 `days: WeatherDay[]`。本票**只剩申請 key + 配環境變數**。
- 线上 Vercel 配同名环境变量。
- 保留无 key 时的 mock 回退（demo 可离线演示）。

产出：真实天气数据 + 出行建议文案。

## Blocked by

（无）

## Answer

**改用高德天氣（與路線地圖共用同一平台與 key），已完成並驗證。**

- 決策變更：原定「和風天氣」改為**高德開放平台天氣預報接口**（`restapi.amap.com/v3/weather/weatherInfo`，深圳 adcode `440300`，`extensions=all`）。少註冊一個平台。
- `src/lib/weather.ts`：`cachedAmapForecast()`（`use cache` + `cacheLife({revalidate:1800})`）；純映射 `mapAmapForecast()` 與 `mockWeather()` 可純 Node 單測。
- **型別調整**：高德不提供濕度，故 `WeatherDay` 改為「白天/夜間天氣 + 白天/夜間溫度 + 風向」，`WeatherData.source` 改為 `"amap" | "mock"`。**這偏離了票 01 契約的「濕度」欄**（見下方註記）。
- Key 配於 `.env.local`（`AMAP_KEY`，gitignored）。已用真 key 直連高德驗證：深圳 晴 31°/23°，HTTP 200。
- 冒煙腳本相應更新（仍 81 項全過）；`tsc` 與 build 綠。

> **契約偏差**：票 01 的天氣卡原列「濕度」，高德無此欄。卡片改顯示白天/夜間天氣與溫度、風向。

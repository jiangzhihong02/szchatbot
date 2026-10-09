import { cacheLife } from "next/cache";
import type { WeatherData } from "./types";
import { amapJson } from "./amap";
import { mapAmapForecast, mockWeather } from "./weather-core";
import type { AmapForecastResponse } from "./weather-core";

/**
 * 天气查询（3 日）—— 伺服器端 adapter。取數與 key 由 `amap` 負責。
 * 解析與回退在 `weather-core`（純、可單測）；本檔只做「取數 → 解析 → 快取」。
 *
 * 配置：.env.local 的 AMAP_KEY（高德「Web 服務」類型）。深圳 adcode: 440300。
 * 高德不提供濕度，故 WeatherDay 用「白天/夜間天氣 + 溫度 + 風向」；文案一律由前端按語言渲染。
 */

const SHENZHEN_ADCODE = "440300";

/**
 * 高德 3 日预报（带缓存）。本仓开了 cacheComponents，故用 `use cache` + `cacheLife`。
 * 無 key / 失敗 → 回退 mock（demo 可離線演示）。
 */
async function cachedAmapForecast(): Promise<WeatherData | null> {
  "use cache";
  cacheLife({ revalidate: 1800 }); // 30 分鐘

  const json = await amapJson<AmapForecastResponse>("/weather/weatherInfo", {
    city: SHENZHEN_ADCODE,
    extensions: "all",
  });
  if (!json) return null;
  const days = mapAmapForecast(json);
  return days.length ? { days, source: "amap" } : null;
}

export async function getWeather(): Promise<WeatherData> {
  return (await cachedAmapForecast()) ?? mockWeather();
}

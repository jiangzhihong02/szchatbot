import { cacheLife } from "next/cache";
import type { WeatherData, WeatherDay } from "./types";

/**
 * 天气查询（3 日）。用**高德开放平台**的天气预报接口（与路线地图共用同一 key）。
 * 没配 key 时回退到 mock，保证开发期功能可跑。
 *
 * 配置：.env.local 里设置 AMAP_KEY（高德「Web 服务」类型 key）。
 * 深圳 adcode: 440300
 *
 * ⚠️ 本檔**不含任何面向使用者的文案**：
 *    - 高德回传的是簡體詞條，由前端 `i18n/weather-text.ts` 的詞表轉成介面語言；
 *    - 出行建議由前端用 `adviceKeyFor()` + `messages.engine.weatherAdvice` 生成；
 *    - 城市名與「今日/明日/後日」也由前端按語言產生。
 *    這樣切語言時既有的天氣卡才會即時跟著變。
 */

const SHENZHEN_ADCODE = "440300";

type AmapForecastResponse = {
  status: string;
  forecasts?: Array<{
    casts?: Array<{
      date: string;
      dayweather: string;
      nightweather: string;
      daytemp: string;
      nighttemp: string;
      daywind: string;
    }>;
  }>;
};

/** 纯函数：高德天气预报响应 → WeatherDay[]（取前 3 天）。非成功或空则返回 []。可单测。 */
export function mapAmapForecast(json: AmapForecastResponse): WeatherDay[] {
  const casts = json.forecasts?.[0]?.casts;
  if (json.status !== "1" || !casts?.length) return [];
  return casts.slice(0, 3).map((c, i) => ({
    dayOffset: i,
    text: c.dayweather,
    textNight: c.nightweather,
    tempMax: Number(c.daytemp),
    tempMin: Number(c.nighttemp),
    wind: c.daywind,
  }));
}

/** 无 key / 请求失败时的回退。詞條刻意採用**高德的簡體詞彙**，讓前端詞表一致。 */
export function mockWeather(): WeatherData {
  const days: WeatherDay[] = [
    { dayOffset: 0, text: "多云", textNight: "多云", tempMax: 29, tempMin: 23, wind: "东" },
    { dayOffset: 1, text: "阵雨", textNight: "多云", tempMax: 28, tempMin: 23, wind: "东南" },
    { dayOffset: 2, text: "晴", textNight: "晴", tempMax: 31, tempMin: 24, wind: "南" },
  ];
  return { days, source: "mock" };
}

/**
 * 高德 3 日预报（带缓存）。本仓开了 cacheComponents，故用 `use cache` + `cacheLife`。
 * 无 key / 请求失败返回 null，由 getWeather 回退到 mock。
 */
async function cachedAmapForecast(): Promise<WeatherData | null> {
  "use cache";
  cacheLife({ revalidate: 1800 }); // 30 分鐘

  const key = process.env.AMAP_KEY;
  if (!key) return null;

  try {
    const url = `https://restapi.amap.com/v3/weather/weatherInfo?key=${key}&city=${SHENZHEN_ADCODE}&extensions=all`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const days = mapAmapForecast((await res.json()) as AmapForecastResponse);
    if (!days.length) return null;
    return { days, source: "amap" };
  } catch {
    return null;
  }
}

export async function getWeather(): Promise<WeatherData> {
  return (await cachedAmapForecast()) ?? mockWeather();
}

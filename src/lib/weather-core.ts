import type { WeatherData, WeatherDay } from "./types";

/**
 * 天氣模組的**純內部縫** —— 不碰 key、不碰網路、不碰伺服器，故可直接單測。
 * 取數（`amapJson`）與快取留在 `weather.ts`；這裡只有解析與回退。
 */

/** 高德天氣回應（只取本專案用到的欄位）。 */
export type AmapForecastResponse = {
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

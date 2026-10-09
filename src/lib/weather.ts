import { cacheLife } from "next/cache";
import type { WeatherData, WeatherDay } from "./types";

/**
 * 天气查询（3 日）。用**高德开放平台**的天气预报接口（与路线地图共用同一 key）。
 * 没配 key 时回退到 mock，保证开发期功能可跑。
 *
 * 配置：.env.local 里设置 AMAP_KEY（高德「Web 服务」类型 key）。
 * 深圳 adcode: 440300
 *
 * 注：高德天气不提供湿度，故 WeatherDay 以「白天/夜间天气 + 温度 + 风向」表达。
 */

const SHENZHEN_ADCODE = "440300";
const DAY_LABELS = ["今日", "明日", "後日"];

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

function adviceFromWeather(days: WeatherDay[]): string {
  const today = days[0];
  if (days.slice(0, 2).some((d) => d.text.includes("雨") || (d.textNight ?? "").includes("雨")))
    return "未來一兩日有雨，記得帶傘；室內景點 / 商場更合適。";
  if (today.tempMax >= 32) return "天氣炎熱，注意防曬補水，建議安排室內或傍晚行程。";
  if (today.tempMin <= 12) return "偏涼，記得添衣。";
  return "天氣舒適，適合戶外行程。";
}

/** 纯函数：高德天气预报响应 → WeatherDay[]（取前 3 天）。非成功或空则返回 []。可单测。 */
export function mapAmapForecast(json: AmapForecastResponse): WeatherDay[] {
  const casts = json.forecasts?.[0]?.casts;
  if (json.status !== "1" || !casts?.length) return [];
  return casts.slice(0, 3).map((c, i) => ({
    date: DAY_LABELS[i] ?? c.date,
    text: c.dayweather,
    textNight: c.nightweather,
    tempMax: Number(c.daytemp),
    tempMin: Number(c.nighttemp),
    wind: c.daywind,
  }));
}

/** 无 key / 请求失败时的回退，保证 demo 可离线演示。 */
export function mockWeather(): WeatherData {
  const days: WeatherDay[] = [
    { date: "今日", text: "多雲", textNight: "多雲", tempMax: 29, tempMin: 23, wind: "東風" },
    { date: "明日", text: "短暫陣雨", textNight: "多雲", tempMax: 28, tempMin: 23, wind: "東南風" },
    { date: "後日", text: "晴", textNight: "晴", tempMax: 31, tempMin: 24, wind: "南風" },
  ];
  return {
    city: "深圳",
    days,
    advice: `${adviceFromWeather(days)}（示例數據，配置 AMAP_KEY 後顯示實時天氣）`,
    source: "mock",
  };
}

/**
 * 高德 3 日预报（带缓存）。本仓开了 cacheComponents，故按 AGENTS.md 的迁移指南
 * 用 `use cache` + `cacheLife`。无 key / 请求失败返回 null，由 getWeather 回退到 mock。
 *
 * 注：此函数依赖 Next 运行时，故纯 Node 下单测请用上面的 mapAmapForecast / mockWeather。
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
    return { city: "深圳", days, advice: adviceFromWeather(days), source: "amap" };
  } catch {
    return null;
  }
}

export async function getWeather(): Promise<WeatherData> {
  return (await cachedAmapForecast()) ?? mockWeather();
}

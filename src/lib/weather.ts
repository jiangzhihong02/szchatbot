import { cacheLife } from "next/cache";
import type { WeatherData, WeatherDay } from "./types";

/**
 * 天气查询（3 日）。默认用「和风天气」(QWeather) 免费接口；
 * 没配 key 时回退到 mock，保证开发期功能可跑。
 *
 * 配置：.env.local 里设置
 *   QWEATHER_KEY=你的key
 *   QWEATHER_HOST=https://xxx.qweatherapi.com   （和风新版需用你的专属 host）
 * 深圳 LocationID: 101280601
 */

const SHENZHEN_LOCATION = "101280601";
const DAY_LABELS = ["今日", "明日", "後日"];

type QWeatherResponse = {
  code: string;
  daily?: Array<{
    fxDate: string;
    textDay: string;
    tempMax: string;
    tempMin: string;
    humidity: string;
  }>;
};

function adviceFromWeather(days: WeatherDay[]): string {
  const today = days[0];
  if (days.slice(0, 2).some((d) => d.text.includes("雨")))
    return "未來一兩日有雨，記得帶傘；室內景點 / 商場更合適。";
  if (today.tempMax >= 32) return "天氣炎熱，注意防曬補水，建議安排室內或傍晚行程。";
  if (today.tempMax <= 12) return "偏涼，記得添衣。";
  return "天氣舒適，適合戶外行程。";
}

/** 纯函数：和风 3d 响应 → WeatherDay[]。非 200 或无数据时返回空数组。可单测。 */
export function mapQWeather3d(json: QWeatherResponse): WeatherDay[] {
  if (json.code !== "200" || !json.daily?.length) return [];
  return json.daily.slice(0, 3).map((d, i) => ({
    date: DAY_LABELS[i] ?? d.fxDate,
    text: d.textDay,
    tempMax: Number(d.tempMax),
    tempMin: Number(d.tempMin),
    humidity: Number(d.humidity),
  }));
}

/** 无 key / 请求失败时的回退，保证 demo 可离线演示。 */
export function mockWeather(): WeatherData {
  const days: WeatherDay[] = [
    { date: "今日", text: "多雲", tempMax: 29, tempMin: 23, humidity: 70 },
    { date: "明日", text: "短暫陣雨", tempMax: 28, tempMin: 23, humidity: 78 },
    { date: "後日", text: "晴", tempMax: 31, tempMin: 24, humidity: 65 },
  ];
  return {
    city: "深圳",
    days,
    advice: `${adviceFromWeather(days)}（示例數據，配置 QWEATHER_KEY 後顯示實時天氣）`,
    source: "mock",
  };
}

/**
 * 和风天气 3 日预报（带缓存）。
 * 本仓 next.config 开了 cacheComponents，故按 AGENTS.md 指向的迁移指南，
 * 用 `use cache` + `cacheLife` 取代旧的 `fetch(url, { next: { revalidate } })`。
 * 无 key / 请求失败返回 null，由 getWeather 回退到 mock。
 *
 * 注：此函数依赖 Next 运行时，故纯 Node 下单测请用上面的 mapQWeather3d / mockWeather。
 */
async function cachedQWeather3d(): Promise<WeatherData | null> {
  "use cache";
  cacheLife({ revalidate: 1800 }); // 30 分鐘

  const key = process.env.QWEATHER_KEY;
  const host = process.env.QWEATHER_HOST;
  if (!key || !host) return null;

  try {
    const res = await fetch(`${host}/v7/weather/3d?location=${SHENZHEN_LOCATION}&key=${key}`);
    if (!res.ok) return null;
    const days = mapQWeather3d((await res.json()) as QWeatherResponse);
    if (!days.length) return null;
    return { city: "深圳", days, advice: adviceFromWeather(days), source: "qweather" };
  } catch {
    return null;
  }
}

export async function getWeather(): Promise<WeatherData> {
  return (await cachedQWeather3d()) ?? mockWeather();
}

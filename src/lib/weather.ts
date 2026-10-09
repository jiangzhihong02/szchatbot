import type { WeatherData } from "./types";

/**
 * 天气查询。默认用「和风天气」(QWeather) 免费接口；
 * 没配 key 时回退到 mock，保证开发期功能可跑。
 *
 * 配置：.env.local 里设置
 *   QWEATHER_KEY=你的key
 *   QWEATHER_HOST=https://xxx.qweatherapi.com   （和风新版需用你的专属 host）
 * 深圳 LocationID: 101280601
 */

const SHENZHEN_LOCATION = "101280601";

function adviceFromWeather(text: string, tempMax: number): string {
  if (text.includes("雨")) return "有雨，記得帶傘；室內景點 / 商場更合適。";
  if (tempMax >= 32) return "天氣炎熱，注意防曬補水，建議安排室內或傍晚行程。";
  if (tempMax <= 12) return "偏涼，記得添衣。";
  return "天氣舒適，適合戶外行程。";
}

function mockWeather(): WeatherData {
  return {
    city: "深圳",
    date: new Date().toISOString().slice(0, 10),
    tempNow: 26,
    tempMax: 29,
    tempMin: 23,
    text: "多雲",
    humidity: 70,
    advice: "天氣舒適，適合戶外行程。（示例數據，配置 QWEATHER_KEY 後顯示實時天氣）",
    source: "mock",
  };
}

export async function getWeather(): Promise<WeatherData> {
  const key = process.env.QWEATHER_KEY;
  const host = process.env.QWEATHER_HOST;
  if (!key || !host) return mockWeather();

  try {
    const url = `${host}/v7/weather/now?location=${SHENZHEN_LOCATION}&key=${key}`;
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) return mockWeather();
    const json = (await res.json()) as {
      code: string;
      now?: {
        temp: string;
        text: string;
        humidity: string;
      };
    };
    if (json.code !== "200" || !json.now) return mockWeather();

    const tempNow = Number(json.now.temp);
    return {
      city: "深圳",
      date: new Date().toISOString().slice(0, 10),
      tempNow,
      tempMax: tempNow + 2,
      tempMin: tempNow - 3,
      text: json.now.text,
      humidity: Number(json.now.humidity),
      advice: adviceFromWeather(json.now.text, tempNow + 2),
      source: "qweather",
    };
  } catch {
    return mockWeather();
  }
}

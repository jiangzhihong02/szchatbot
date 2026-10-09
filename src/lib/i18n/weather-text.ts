import type { Locale } from "./config";
import type { WeatherDay } from "../types";

/**
 * 天氣詞表（票 11）。
 * 高德天氣回傳**簡體**詞條，故：
 *   - `zh-Hans` 直接用原文；
 *   - `zh-Hant` 轉繁體；
 *   - `en` 譯英文。
 * 未收錄的詞條原樣回傳（不會出錯）。
 */

type Tr = { "zh-Hant": string; en: string };

const WEATHER: Record<string, Tr> = {
  晴: { "zh-Hant": "晴", en: "Clear" },
  多云: { "zh-Hant": "多雲", en: "Cloudy" },
  阴: { "zh-Hant": "陰", en: "Overcast" },
  阵雨: { "zh-Hant": "陣雨", en: "Showers" },
  雷阵雨: { "zh-Hant": "雷陣雨", en: "Thunder showers" },
  雷阵雨伴有冰雹: { "zh-Hant": "雷陣雨夾冰雹", en: "Thunder showers with hail" },
  雨夹雪: { "zh-Hant": "雨夾雪", en: "Sleet" },
  小雨: { "zh-Hant": "小雨", en: "Light rain" },
  中雨: { "zh-Hant": "中雨", en: "Rain" },
  大雨: { "zh-Hant": "大雨", en: "Heavy rain" },
  暴雨: { "zh-Hant": "暴雨", en: "Torrential rain" },
  大暴雨: { "zh-Hant": "大暴雨", en: "Downpour" },
  特大暴雨: { "zh-Hant": "特大暴雨", en: "Extreme downpour" },
  阵雪: { "zh-Hant": "陣雪", en: "Snow showers" },
  小雪: { "zh-Hant": "小雪", en: "Light snow" },
  中雪: { "zh-Hant": "中雪", en: "Snow" },
  大雪: { "zh-Hant": "大雪", en: "Heavy snow" },
  暴雪: { "zh-Hant": "暴雪", en: "Blizzard" },
  雾: { "zh-Hant": "霧", en: "Fog" },
  冻雾: { "zh-Hant": "凍霧", en: "Freezing fog" },
  霾: { "zh-Hant": "霾", en: "Haze" },
  扬沙: { "zh-Hant": "揚沙", en: "Blowing sand" },
  浮尘: { "zh-Hant": "浮塵", en: "Dust" },
  沙尘暴: { "zh-Hant": "沙塵暴", en: "Sandstorm" },
  强沙尘暴: { "zh-Hant": "強沙塵暴", en: "Severe sandstorm" },
  大风: { "zh-Hant": "大風", en: "Strong wind" },
  飑: { "zh-Hant": "颮", en: "Squall" },
  龙卷风: { "zh-Hant": "龍捲風", en: "Tornado" },
  热带风暴: { "zh-Hant": "熱帶風暴", en: "Tropical storm" },
  无: { "zh-Hant": "無", en: "—" },
  未知: { "zh-Hant": "未知", en: "Unknown" },
};

const WIND: Record<string, Tr> = {
  无风向: { "zh-Hant": "無風向", en: "Variable" },
  旋转不定: { "zh-Hant": "旋轉不定", en: "Variable" },
  北: { "zh-Hant": "北", en: "N" },
  东北: { "zh-Hant": "東北", en: "NE" },
  东: { "zh-Hant": "東", en: "E" },
  东南: { "zh-Hant": "東南", en: "SE" },
  南: { "zh-Hant": "南", en: "S" },
  西南: { "zh-Hant": "西南", en: "SW" },
  西: { "zh-Hant": "西", en: "W" },
  西北: { "zh-Hant": "西北", en: "NW" },
};

function lookup(table: Record<string, Tr>, text: string, locale: Locale): string {
  if (locale === "zh-Hans") return text;
  return table[text]?.[locale] ?? text;
}

export function weatherTerm(text: string, locale: Locale): string {
  return lookup(WEATHER, text, locale);
}

export function windTerm(text: string, locale: Locale): string {
  return lookup(WIND, text, locale);
}

/** 出行建議的**類型**（文案在 messages.engine.weatherAdvice）。 */
export type AdviceKey = "rain" | "hot" | "cold" | "ok";

/**
 * 純函式：由天氣判斷該給哪種建議。
 * 放在這裡（而非伺服器）是為了讓切換語言時既有的天氣卡也能即時更新。
 */
export function adviceKeyFor(days: WeatherDay[]): AdviceKey {
  if (!days.length) return "ok";
  const today = days[0];
  const wet = (s?: string) => !!s && (s.includes("雨") || s.includes("雪") || s.includes("雷"));
  if (days.slice(0, 2).some((d) => wet(d.text) || wet(d.textNight))) return "rain";
  if (today.tempMax >= 32) return "hot";
  if (today.tempMin <= 12) return "cold";
  return "ok";
}

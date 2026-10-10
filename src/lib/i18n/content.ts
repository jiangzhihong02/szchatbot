import type { Locale } from "./config";
import type { RouteData, FoodData, DealData, BorderData } from "../types";
import { ROUTES } from "../data/routes";
import { FOODS } from "../data/foods";
import { DEALS } from "../data/deals";
import { BORDERS } from "../data/borders";
import { CONTENT_I18N } from "../data/i18n-generated";

/**
 * 內容數據本地化（票 11 第二批）。
 * 繁體是**正本**（`lib/data/*`）；`zh-Hans` 與 `en` 為譯文疊加層（`data/i18n-generated.ts`）。
 * 缺譯文時一律回退原文，故英文界面下最壞情況只是看到繁體，不會出錯。
 *
 * 鍵的構造器與**欄位清單**都在此定義，其他工具一律 import 這裡，避免兩邊漂移。
 */

/**
 * 疊層的鍵 = **命名空間 + 正本 id + 欄位**。
 * 命名空間讓「路線 id」與「美食 id」即使同名（例如 `hakka-longgang`）也不會撞鍵 —— 結構上不可能碰撞。
 */
export const kRoute = (id: string, field: string) => `route.${id}.${field}`;
export const kStop = (id: string, i: number, field: string) => `route.${id}.stop${i}.${field}`;
export const kFood = (id: string, field: string) => `food.${id}.${field}`;
export const kDeal = (id: string, field: string) => `deal.${id}.${field}`;
export const kBorder = (id: string, field: string) => `border.${id}.${field}`;

export const ROUTE_FIELDS = ["title", "theme", "area", "bestFor", "tips"] as const;
export const STOP_FIELDS = ["name", "area", "desc"] as const;
export const FOOD_FIELDS = ["name", "area", "category", "mustTry"] as const;
export const DEAL_FIELDS = ["title", "merchant", "area", "summary", "validUntil", "sourceName"] as const;
/** 口岸的可譯欄位。`hours` **不在**其中：時刻是數字，三語相同，沒必要翻。 */
export const BORDER_FIELDS = ["nameHk", "nameSz", "hkAccess", "szAccess", "note", "tip"] as const;

/** 正本裡所有**應有譯文**的鍵（順序固定，供生成與校驗共用）。 */
export function allContentKeys(): string[] {
  const keys: string[] = [];
  for (const r of ROUTES) {
    for (const f of ROUTE_FIELDS) keys.push(kRoute(r.id, f));
    r.stops.forEach((_, i) => STOP_FIELDS.forEach((f) => keys.push(kStop(r.id, i, f))));
  }
  FOODS.forEach((f) => FOOD_FIELDS.forEach((field) => keys.push(kFood(f.id, field))));
  for (const d of DEALS) DEAL_FIELDS.forEach((f) => keys.push(kDeal(d.id, f)));
  for (const b of BORDERS) BORDER_FIELDS.forEach((f) => keys.push(kBorder(b.id, f)));
  return keys;
}

type Overlay = Record<string, { "zh-Hans": string; en: string }>;

/** 取譯文；繁體（正本）或無譯文時回原文。 */
function tr(key: string, locale: Locale, fallback: string): string {
  if (locale === "zh-Hant") return fallback;
  return (CONTENT_I18N as Overlay)[key]?.[locale] ?? fallback;
}

export function localizeRoute(r: RouteData, locale: Locale): RouteData {
  if (locale === "zh-Hant") return r;
  return {
    ...r,
    title: tr(kRoute(r.id, "title"), locale, r.title),
    theme: tr(kRoute(r.id, "theme"), locale, r.theme),
    area: tr(kRoute(r.id, "area"), locale, r.area),
    bestFor: tr(kRoute(r.id, "bestFor"), locale, r.bestFor),
    tips: r.tips ? tr(kRoute(r.id, "tips"), locale, r.tips) : r.tips,
    stops: r.stops.map((s, i) => ({
      ...s,
      name: tr(kStop(r.id, i, "name"), locale, s.name),
      area: tr(kStop(r.id, i, "area"), locale, s.area),
      desc: tr(kStop(r.id, i, "desc"), locale, s.desc),
    })),
  };
}

/** 美食以 `FoodData.id` 為鍵（穩定；改名不影響譯文）。 */
export function localizeFood(f: FoodData, locale: Locale): FoodData {
  if (locale === "zh-Hant") return f;
  return {
    ...f,
    name: tr(kFood(f.id, "name"), locale, f.name),
    area: tr(kFood(f.id, "area"), locale, f.area),
    category: tr(kFood(f.id, "category"), locale, f.category),
    mustTry: tr(kFood(f.id, "mustTry"), locale, f.mustTry),
  };
}

export function localizeDeal(d: DealData, locale: Locale): DealData {
  if (locale === "zh-Hant") return d;
  return {
    ...d,
    title: tr(kDeal(d.id, "title"), locale, d.title),
    merchant: tr(kDeal(d.id, "merchant"), locale, d.merchant),
    area: tr(kDeal(d.id, "area"), locale, d.area),
    summary: tr(kDeal(d.id, "summary"), locale, d.summary),
    validUntil: d.validUntil ? tr(kDeal(d.id, "validUntil"), locale, d.validUntil) : d.validUntil,
    sourceName: tr(kDeal(d.id, "sourceName"), locale, d.sourceName),
  };
}

export function localizeBorder(b: BorderData, locale: Locale): BorderData {
  if (locale === "zh-Hant") return b;
  return {
    ...b,
    nameHk: tr(kBorder(b.id, "nameHk"), locale, b.nameHk),
    nameSz: b.nameSz ? tr(kBorder(b.id, "nameSz"), locale, b.nameSz) : b.nameSz,
    hkAccess: tr(kBorder(b.id, "hkAccess"), locale, b.hkAccess),
    szAccess: tr(kBorder(b.id, "szAccess"), locale, b.szAccess),
    note: tr(kBorder(b.id, "note"), locale, b.note),
    tip: b.tip ? tr(kBorder(b.id, "tip"), locale, b.tip) : b.tip,
  };
}

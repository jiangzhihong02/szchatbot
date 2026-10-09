import type { Locale } from "./config";
import type { RouteData, FoodData, DealData } from "../types";
import { ROUTES } from "../data/routes";
import { FOODS } from "../data/foods";
import { DEALS } from "../data/deals";
import { CONTENT_I18N } from "../data/i18n-generated";

/**
 * 內容數據本地化（票 11 第二批）。
 * 繁體是**正本**（`lib/data/*`）；`zh-Hans` 與 `en` 為譯文疊加層（`data/i18n-generated.ts`）。
 * 缺譯文時一律回退原文，故英文界面下最壞情況只是看到繁體，不會出錯。
 *
 * 鍵的構造器與**欄位清單**都在此定義，其他工具一律 import 這裡，避免兩邊漂移。
 */

export const kRoute = (id: string, field: string) => `${id}.${field}`;
export const kStop = (id: string, i: number, field: string) => `${id}.stop${i}.${field}`;
export const kFood = (i: number, field: string) => `${i}.${field}`;
export const kDeal = (id: string, field: string) => `${id}.${field}`;

export const ROUTE_FIELDS = ["title", "theme", "area", "bestFor", "tips"] as const;
export const STOP_FIELDS = ["name", "area", "desc"] as const;
export const FOOD_FIELDS = ["name", "area", "category", "mustTry"] as const;
export const DEAL_FIELDS = ["title", "merchant", "area", "summary", "validUntil", "sourceName"] as const;

/** 正本裡所有**應有譯文**的鍵（順序固定，供生成與校驗共用）。 */
export function allContentKeys(): string[] {
  const keys: string[] = [];
  for (const r of ROUTES) {
    for (const f of ROUTE_FIELDS) keys.push(kRoute(r.id, f));
    r.stops.forEach((_, i) => STOP_FIELDS.forEach((f) => keys.push(kStop(r.id, i, f))));
  }
  FOODS.forEach((_, i) => FOOD_FIELDS.forEach((f) => keys.push(kFood(i, f))));
  for (const d of DEALS) DEAL_FIELDS.forEach((f) => keys.push(kDeal(d.id, f)));
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

/**
 * 美食譯文以**原始索引**為鍵（卡片裡是篩選後的子集，索引對不上），
 * 故這裡用原名回查原始索引。
 */
export function localizeFood(f: FoodData, locale: Locale): FoodData {
  if (locale === "zh-Hant") return f;
  const i = FOODS.findIndex((x) => x.name === f.name);
  if (i < 0) return f;
  return {
    ...f,
    name: tr(kFood(i, "name"), locale, f.name),
    area: tr(kFood(i, "area"), locale, f.area),
    category: tr(kFood(i, "category"), locale, f.category),
    mustTry: tr(kFood(i, "mustTry"), locale, f.mustTry),
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

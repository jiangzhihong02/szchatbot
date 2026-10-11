// 冒煙檢查：內容本地化由 *_FIELDS 推導（架構第 2 輪）。
// 執行：npx tsx scripts/check-localize.ts
//
// check-i18n 守的是「鍵的覆蓋」；本檔守的是「localize 真的照 *_FIELDS 把每個欄位換成了
// 疊層的譯文」。兩者合起來，欄位清單只住一處（*_FIELDS）這件事才有端到端的保障。
import { makeChecker } from "./_check";
import { ROUTES } from "../src/lib/data/routes";
import { FOODS } from "../src/lib/data/foods";
import { DEALS } from "../src/lib/data/deals";
import { BORDERS } from "../src/lib/data/borders";
import { CONTENT_I18N } from "../src/lib/data/i18n-generated";
import {
  localizeRoute, localizeFood, localizeDeal, localizeBorder,
  ROUTE_FIELDS, STOP_FIELDS, FOOD_FIELDS, DEAL_FIELDS, BORDER_FIELDS,
  kRoute, kStop, kFood, kDeal, kBorder,
} from "../src/lib/i18n/content";
import type { Locale } from "../src/lib/i18n/config";

const { check, report } = makeChecker();
type Rec = Record<string, unknown>;

// 期望值獨立算出（直接讀疊層），再比對 localize 的產出——不是拿 localize 跑一遍抄回來。
function match(src: Rec, out: Rec, fields: readonly string[], key: (f: string) => string, loc: Locale): boolean {
  for (const f of fields) {
    const v = src[f];
    if (typeof v !== "string" || !v) continue; // 可選欄位缺值：localize 原樣保留，略過
    const expected = CONTENT_I18N[key(f)]?.[loc as "zh-Hans" | "en"] ?? v;
    if (out[f] !== expected) return false;
  }
  return true;
}

for (const loc of ["zh-Hans", "en"] as const) {
  check(`route 全欄位＋站點 @${loc}`, ROUTES.every((r) => {
    const L = localizeRoute(r, loc) as unknown as Rec;
    const base = match(r as unknown as Rec, L, ROUTE_FIELDS, (f) => kRoute(r.id, f), loc);
    const stops = r.stops.every((s, i) =>
      match(s as unknown as Rec, (L.stops as Rec[])[i], STOP_FIELDS, (f) => kStop(r.id, i, f), loc));
    return base && stops;
  }));
  check(`food 全欄位 @${loc}`, FOODS.every((f) =>
    match(f as unknown as Rec, localizeFood(f, loc) as unknown as Rec, FOOD_FIELDS, (x) => kFood(f.id, x), loc)));
  check(`deal 全欄位 @${loc}`, DEALS.every((d) =>
    match(d as unknown as Rec, localizeDeal(d, loc) as unknown as Rec, DEAL_FIELDS, (x) => kDeal(d.id, x), loc)));
  check(`border 全欄位 @${loc}`, BORDERS.every((b) =>
    match(b as unknown as Rec, localizeBorder(b, loc) as unknown as Rec, BORDER_FIELDS, (x) => kBorder(b.id, x), loc)));
}

// 具體正向錨點：確實換成了疊層的值（不是靜默回退原文）。
check("zh-Hans 確取疊層值（food name）",
  localizeFood(FOODS[0], "zh-Hans").name === CONTENT_I18N[kFood(FOODS[0].id, "name")]["zh-Hans"]);

// zh-Hant 是正本：原樣返回（參照相等，零拷貝）。
check("zh-Hant 原樣（route）", localizeRoute(ROUTES[0], "zh-Hant") === ROUTES[0]);
check("zh-Hant 原樣（food）", localizeFood(FOODS[0], "zh-Hant") === FOODS[0]);
check("zh-Hant 原樣（deal）", localizeDeal(DEALS[0], "zh-Hant") === DEALS[0]);
check("zh-Hant 原樣（border）", localizeBorder(BORDERS[0], "zh-Hant") === BORDERS[0]);

report();

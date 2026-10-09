// 把譯文草稿轉成正式的資料檔（票 11 第二批）。
// 執行：npx tsx scripts/build-i18n-data.ts
// 讀：.scratch/shenzhen-travel-assistant/i18n-draft.json
// 寫：src/lib/data/i18n-generated.ts
import fs from "node:fs";
import path from "node:path";
import { ROUTES } from "../src/lib/data/routes";
import { FOODS } from "../src/lib/data/foods";
import { DEALS } from "../src/lib/data/deals";
import { kRoute, kStop, kFood, kDeal } from "../src/lib/i18n/content";

type Tr = { "zh-Hans": string; en: string };

const draftPath = path.join(process.cwd(), ".scratch/shenzhen-travel-assistant/i18n-draft.json");
const draft = JSON.parse(fs.readFileSync(draftPath, "utf8")) as { strings?: Record<string, Tr> };
const src = draft.strings ?? {};

// 應有的鍵（順序固定，讓輸出 diff 穩定）
const expected: string[] = [];
for (const r of ROUTES) {
  expected.push(
    kRoute(r.id, "title"),
    kRoute(r.id, "theme"),
    kRoute(r.id, "area"),
    kRoute(r.id, "bestFor"),
    kRoute(r.id, "tips")
  );
  r.stops.forEach((_, i) =>
    expected.push(kStop(r.id, i, "name"), kStop(r.id, i, "area"), kStop(r.id, i, "desc"))
  );
}
FOODS.forEach((_, i) =>
  expected.push(kFood(i, "name"), kFood(i, "area"), kFood(i, "category"), kFood(i, "mustTry"))
);
for (const d of DEALS) {
  expected.push(kDeal(d.id, "title"), kDeal(d.id, "merchant"), kDeal(d.id, "area"), kDeal(d.id, "summary"));
}

const missing = expected.filter((k) => !src[k]?.["zh-Hans"] || !src[k]?.en);
const entries = expected
  .filter((k) => src[k]?.["zh-Hans"] && src[k]?.en)
  .map(
    (k) =>
      `  ${JSON.stringify(k)}: { "zh-Hans": ${JSON.stringify(src[k]["zh-Hans"])}, en: ${JSON.stringify(
        src[k].en
      )} },`
  )
  .join("\n");

const out = `/**
 * 內容數據的三語譯文疊加層（票 11 第二批）。
 * ⚠️ 本檔由 \`scripts/build-i18n-data.ts\` 自動生成，請勿手改。
 * 鍵格式見 \`src/lib/i18n/content.ts\` 的 kRoute / kStop / kFood / kDeal。
 * 繁體（正本）不在此列 —— 正本在 \`lib/data/*\`。
 */
export const CONTENT_I18N: Record<string, { "zh-Hans": string; en: string }> = {
${entries}
};
`;
fs.writeFileSync(path.join(process.cwd(), "src/lib/data/i18n-generated.ts"), out, "utf8");

console.log(`✅ 寫入 ${expected.length - missing.length}/${expected.length} 鍵`);
if (missing.length) {
  console.log(`⚠️ 缺 ${missing.length} 鍵：`);
  for (const m of missing) console.log("   " + m);
}

// 用 LLM 端點起草內容數據的簡體與英文譯文（票 11 第二批）。
// 執行：npx tsx scripts/gen-translations.ts
// 產出：.scratch/shenzhen-travel-assistant/i18n-draft.json（供人工校對）
//
// 策略：**逐項翻譯**，且每項都用「扁平字串物件」進出 —— 先前用陣列會讓模型把陣列壓成單一物件。
import fs from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { ROUTES } from "../src/lib/data/routes";
import { FOODS } from "../src/lib/data/foods";
import { DEALS } from "../src/lib/data/deals";
import { glossaryPrompt } from "../src/lib/i18n/glossary";
import { kRoute, kStop, kFood, kDeal } from "../src/lib/i18n/content";

function envFromFile(key: string): string | undefined {
  try {
    const txt = fs.readFileSync(path.join(process.cwd(), ".env.local"), "utf8");
    return txt.match(new RegExp(`^${key}=(.*)$`, "m"))?.[1]?.trim();
  } catch {
    return undefined;
  }
}

const API_KEY = envFromFile("ANTHROPIC_API_KEY");
const BASE_URL = envFromFile("APP_ANTHROPIC_BASE_URL");
const MODEL = envFromFile("APP_ANTHROPIC_MODEL") ?? "claude-opus-4-8";
if (!API_KEY) {
  console.error("缺少 ANTHROPIC_API_KEY（.env.local）");
  process.exit(1);
}

const client = new Anthropic({ apiKey: API_KEY, baseURL: BASE_URL });

const SYSTEM = `你是專業的本地化譯者，為一個面向**香港旅客**的深圳旅遊助手翻譯內容。

輸入是一個**扁平的字串物件**（鍵 → 繁體中文字串）。
請回傳一個**擁有完全相同鍵**的物件，把每個值換成 {"zh-Hans": "...", "en": "..."}。
只回傳 JSON，不要解釋、不要 markdown 圍欄。

規則：
1. 繁體是正本。簡體用**內地自然用語**（不只是字形轉換）；英文用**自然、口語、親切的英文**，不要直譯腔。
2. 專有名詞（景點、餐廳、商戶）保留專名，不要意譯成泛稱。
3. **英文版的地名／店名**：採「羅馬拼音 + 英文通名 + （簡體中文）」格式，讓旅客能念出來、也能出示給本地人看。
   例：福田站 → Futian Station（福田站）；東門老街 → Dongmen Old Street（东门老街）；蓮花山公園 → Lianhuashan Park（莲花山公园）。
   通名譯成英文：站→Station、公園→Park、口岸→Port、老街→Old Street、商場→Mall、村→Village 等。
4. 香港用語改用內地對應詞：
${glossaryPrompt()}
5. 數字、價格、時間（如 ¥220、12:00–14:00）**原樣保留**。
6. \`area\`、\`theme\`、\`category\` 這類短標籤也要翻譯（可短）。`;

type Tr = { "zh-Hans": string; en: string };

function extractJson(text: string): Record<string, Tr> {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = (fenced ? fenced[1] : text).trim();
  const start = raw.indexOf("{");
  if (start === -1) throw new Error("回應中找不到 JSON");
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < raw.length; i++) {
    const ch = raw[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return JSON.parse(raw.slice(start, i + 1)) as Record<string, Tr>;
    }
  }
  throw new Error(`JSON 不完整（${raw.length} 字元）`);
}

async function translateBlock(label: string, payload: Record<string, string>): Promise<Record<string, Tr>> {
  // ⚠️ 這個端點對 `system` 陣列 + cache_control 支援不好（實測慢 3 倍），故用純字串 system、非串流。
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 16000,
    system: SYSTEM,
    messages: [{ role: "user", content: `請翻譯（${label}）：\n${JSON.stringify(payload, null, 1)}` }],
  });
  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  const out = extractJson(text);
  const missing = Object.keys(payload).filter((k) => !out[k]?.["zh-Hans"] || !out[k]?.en);
  if (missing.length) throw new Error(`${label} 缺少 ${missing.length} 個鍵：${missing.slice(0, 8).join(", ")}…`);
  return out;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * 分塊翻譯並遞迴折半重試。
 * ⚠️ 端點有 Cloudflare 的 **120 秒源站超時**（524），單次請求太大必失敗，
 * 故每塊控制在 ~15 鍵，失敗則折半再試。
 */
async function translateChunk(
  flat: Record<string, string>,
  out: Record<string, Tr>,
  label: string
): Promise<void> {
  const keys = Object.keys(flat);
  if (!keys.length) return;
  try {
    const res = await translateBlock(label, flat);
    Object.assign(out, res);
    process.stdout.write(`  ${label}: +${keys.length} 鍵\n`);
  } catch (e) {
    if (keys.length === 1) throw e;
    const mid = Math.ceil(keys.length / 2);
    const a: Record<string, string> = {};
    const b: Record<string, string> = {};
    keys.slice(0, mid).forEach((k) => (a[k] = flat[k]));
    keys.slice(mid).forEach((k) => (b[k] = flat[k]));
    process.stdout.write(`  ${label} 失敗，折半重試（${Object.keys(a).length}+${Object.keys(b).length}）\n`);
    await sleep(4000);
    await translateChunk(a, out, `${label}a`);
    await translateChunk(b, out, `${label}b`);
  }
}

const CHUNK = 15;

async function translateAll(flat: Record<string, string>, label: string, out: Record<string, Tr>) {
  const keys = Object.keys(flat);
  for (let i = 0; i < keys.length; i += CHUNK) {
    const sub: Record<string, string> = {};
    keys.slice(i, i + CHUNK).forEach((k) => (sub[k] = flat[k]));
    await translateChunk(sub, out, `${label}#${i / CHUNK + 1}`);
  }
}

async function main() {
  // 全部攤平成「扁平鍵 → 繁體字串」，再分塊送（端點慢且有 120s 逾時）。
  const routeFlat: Record<string, string> = {};
  for (const r of ROUTES) {
    routeFlat[kRoute(r.id, "title")] = r.title;
    routeFlat[kRoute(r.id, "theme")] = r.theme;
    routeFlat[kRoute(r.id, "area")] = r.area;
    routeFlat[kRoute(r.id, "bestFor")] = r.bestFor;
    routeFlat[kRoute(r.id, "tips")] = r.tips ?? "";
    r.stops.forEach((s, i) => {
      routeFlat[kStop(r.id, i, "name")] = s.name;
      routeFlat[kStop(r.id, i, "area")] = s.area;
      routeFlat[kStop(r.id, i, "desc")] = s.desc;
    });
  }

  const foodFlat: Record<string, string> = {};
  FOODS.forEach((f, i) => {
    foodFlat[kFood(i, "name")] = f.name;
    foodFlat[kFood(i, "area")] = f.area;
    foodFlat[kFood(i, "category")] = f.category;
    foodFlat[kFood(i, "mustTry")] = f.mustTry;
  });

  const dealFlat: Record<string, string> = {};
  for (const d of DEALS) {
    dealFlat[kDeal(d.id, "title")] = d.title;
    dealFlat[kDeal(d.id, "merchant")] = d.merchant;
    dealFlat[kDeal(d.id, "area")] = d.area;
    dealFlat[kDeal(d.id, "summary")] = d.summary;
  }

  const result: Record<string, Tr> = {};
  const dest = path.join(process.cwd(), ".scratch/shenzhen-travel-assistant/i18n-draft.json");
  const save = () =>
    fs.writeFileSync(
      dest,
      JSON.stringify({ generatedAt: new Date().toISOString(), strings: result }, null, 2),
      "utf8"
    );

  console.log(`路線 ${Object.keys(routeFlat).length} 鍵 / 美食 ${Object.keys(foodFlat).length} / 優惠 ${Object.keys(dealFlat).length}\n`);

  await translateAll(routeFlat, "r", result);
  save();
  await translateAll(foodFlat, "f", result);
  save();
  await translateAll(dealFlat, "d", result);
  save();

  console.log(`\n✅ 共 ${Object.keys(result).length} 鍵，已寫入 ${dest}`);
}

main().catch((e) => {
  console.error("\n失敗：", e instanceof Error ? e.message : e);
  process.exit(1);
});

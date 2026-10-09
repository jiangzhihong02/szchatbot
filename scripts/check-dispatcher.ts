// 冒烟检查：规则分發器（票 08）。运行：npx tsx scripts/check-dispatcher.ts
// 失败会打印并返回非零退出码——不再无条件报成功。
import { buildCards, dispatch } from "../src/lib/dispatcher";
import { matchIntent, KEYWORDS, aliasesFor } from "../src/lib/intents";
import { PRESET_BUTTONS } from "../src/lib/presets";
import type { IntentKey } from "../src/lib/presets";
import type { Card } from "../src/lib/types";
import { mapAmapForecast, mockWeather } from "../src/lib/weather";
import { weatherTerm, windTerm, adviceKeyFor } from "../src/lib/i18n/weather-text";

let passed = 0;
const failures: string[] = [];

function check(label: string, ok: boolean) {
  if (ok) {
    passed++;
  } else {
    failures.push(label);
  }
}

function cardOf(cards: Card[], type: Card["type"]): Card | undefined {
  return cards.find((c) => c.type === type);
}

async function main() {
  // ── 1. 走**同一個縫**：用 intents 導出的 aliasesFor，而非在測試裡重寫它的組合邏輯 ──
  //        （先前測試自己拼 KEYWORDS ∪ labels，所以改 aliasesFor 測試照樣綠。）
  const aliasSets = new Map<string, Set<string>>();
  for (const b of PRESET_BUTTONS) {
    const set = new Set(aliasesFor(b.key));
    aliasSets.set(b.key, set);
    check(`每個意圖都有額外別名（${b.key}）`, KEYWORDS[b.key].length > 0);
    for (const w of set) check(`別名 "${w}" → ${b.key}`, matchIntent(w) === b.key);
  }

  // ── 1b. 語料性質：同一別名不得同時屬於兩個意圖（否則命中取決於表順序）──
  const keys = [...aliasSets.keys()];
  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      const shared = [...aliasSets.get(keys[i])!].filter((w) => aliasSets.get(keys[j])!.has(w));
      check(`${keys[i]} 與 ${keys[j]} 無共用別名`, shared.length === 0);
      if (shared.length) console.log(`     共用：${keys[i]} / ${keys[j]} → ${shared.join(", ")}`);
    }
  }

  // ── 1c. 歧義短語 → 期望意圖（最長匹配的契約），以**資料表**斷言 ──
  const AMBIGUOUS: [string, IntentKey][] = [
    ["優惠", "deals"],
    ["交通", "transportDeals"],
    ["算優惠＋交通", "transportDeals"],
    ["親子路線", "family"],
    ["路線", "day"],
    ["深圳優惠活動", "deals"],
    ["查天氣", "weather"],
    ["Find food", "food"],
    ["Family route", "family"],
    ["route", "day"],
    ["Deals + transport", "transportDeals"],
  ];
  for (const [text, want] of AMBIGUOUS) check(`歧義「${text}」→ ${want}`, matchIntent(text) === want);

  // ── 2. 无冲突规则（契约）：優惠 類歸 🎫，交通 類歸 💰 ──
  check('無衝突：「優惠」→ deals', matchIntent("優惠") === "deals");
  check('無衝突：「交通」→ transportDeals', matchIntent("交通") === "transportDeals");
  check('最長匹配：「算優惠＋交通」→ transportDeals', matchIntent("算優惠＋交通") === "transportDeals");

  // ── 3. 未命中 → null（交給 /api/chat） ──
  for (const t of ["今日食咩好", "hello world", "   ", ""]) {
    check(`未命中 "${t}" → null`, matchIntent(t) === null);
  }

  // ── 4. 按鈕數量與關鍵詞表完整性 ──
  check("按鈕數 = 6", PRESET_BUTTONS.length === 6);
  check(
    "KEYWORDS 覆盖全部意图",
    PRESET_BUTTONS.every((b) => Array.isArray(KEYWORDS[b.key]) && KEYWORDS[b.key].length > 0)
  );

  // ── 5. buildCards：逐项断言契约要求的字段 ──
  // 美食：契約要求 3–4 家
  const food = await buildCards("food");
  const fc = cardOf(food, "foodList");
  if (fc && fc.type === "foodList") {
    const n = fc.data.length;
    check(`美食清單 3–4 家（實得 ${n}）`, n >= 3 && n <= 4);
    check(
      "美食項含 區域/類別/必試/人均RMB",
      fc.data.every((f) => !!f.area && !!f.category && !!f.mustTry && !!f.priceRMB)
    );
  } else {
    check("找美食 → foodList 卡", false);
  }

  // 路線：一日遊池 / 親子池；「換一條」索引遞進
  const day0 = await buildCards("day");
  const day1 = await buildCards("day", { routeIndex: 1 });
  const d0 = cardOf(day0, "route");
  const d1 = cardOf(day1, "route");
  if (d0 && d0.type === "route" && d1 && d1.type === "route") {
    check("day 卡回傳 index/total", d0.data.total > 1 && d0.data.index === 0);
    check("換一條 index 遞進", d1.data.index === 1 && d1.data.route.id !== d0.data.route.id);
    check("day 池含全部非親子路線", d0.data.total === 5);
  } else {
    check("一日遊 → route 卡", false);
  }
  const fam = await buildCards("family");
  const famc = cardOf(fam, "route");
  if (famc && famc.type === "route") {
    check("family 池只含親子路線", famc.data.total === 2 && famc.data.route.pool === "family");
  } else {
    check("親子 → route 卡", false);
  }

  // 天氣：測「純映射」—— 高德詞條原樣保留，翻譯在前端
  const mapped = mapAmapForecast({
    status: "1",
    forecasts: [
      {
        casts: [
          { date: "2026-10-09", dayweather: "多云", nightweather: "多云", daytemp: "29", nighttemp: "23", daywind: "东" },
          { date: "2026-10-10", dayweather: "阵雨", nightweather: "多云", daytemp: "28", nighttemp: "23", daywind: "东南" },
          { date: "2026-10-11", dayweather: "晴", nightweather: "晴", daytemp: "31", nighttemp: "24", daywind: "南" },
        ],
      },
    ],
  });
  check("mapAmapForecast 取 3 天", mapped.length === 3);
  check("mapAmapForecast 用 dayOffset 0/1/2", mapped[0].dayOffset === 0 && mapped[2].dayOffset === 2);
  check("mapAmapForecast 帶日夜天氣與風", mapped.every((d) => !!d.text && !!d.textNight && !!d.wind));
  check("mapAmapForecast 非成功 → 空", mapAmapForecast({ status: "0" }).length === 0);
  check("mock 3 天", mockWeather().days.length === 3);

  // 天氣詞表與建議（前端渲染；切語言時既有的卡也會跟著變）
  check(
    "詞表：晴 三語",
    weatherTerm("晴", "en") === "Clear" && weatherTerm("晴", "zh-Hant") === "晴" && weatherTerm("晴", "zh-Hans") === "晴"
  );
  check("詞表：未收錄原樣回傳", weatherTerm("某某", "en") === "某某");
  check("風向：東南", windTerm("东南", "en") === "SE" && windTerm("东南", "zh-Hant") === "東南");
  check("建議：有雨 → rain", adviceKeyFor([{ dayOffset: 0, text: "阵雨", tempMax: 30, tempMin: 25 }]) === "rain");
  check("建議：晴 30° → ok", adviceKeyFor([{ dayOffset: 0, text: "晴", tempMax: 30, tempMin: 25 }]) === "ok");
  check("建議：晴 35° → hot", adviceKeyFor([{ dayOffset: 0, text: "晴", tempMax: 35, tempMin: 25 }]) === "hot");

  // 優惠：清單 + 每項帶來源（契約要求「來源」欄）
  const deals = await buildCards("deals");
  const dc = cardOf(deals, "dealList");
  if (dc && dc.type === "dealList") {
    check("優惠清單非空", dc.data.length > 0);
    check("優惠項含真實來源", dc.data.every((d) => !!d.sourceName && d.sourceName !== "精選活動"));
  } else {
    check("優惠活動 → dealList 卡", false);
  }

  // 交通優惠卡：缺出行組合應拋錯（不被靜默默認蓋住）
  let threw = false;
  try {
    await buildCards("transportDeals");
  } catch {
    threw = true;
  }
  check("transportDeals 缺 travellers 時拋錯", threw);

  const pr = await buildCards("transportDeals", { travellers: { adults: 2, children: 1 } });
  const pc = cardOf(pr, "transportDeals");
  if (pc && pc.type === "transportDeals") {
    check("回報出行組合", pc.data.travellers.adults === 2 && pc.data.travellers.children === 1);
    check("帶交通方案鍵", !!pc.data.transport);
    check("帶優惠項鍵", pc.data.discounts.length > 0);
  } else {
    check("算優惠＋交通 → transportDeals 卡", false);
  }

  // 規則隨出行組合變化（純結構、無文案）
  const two = await buildCards("transportDeals", { travellers: { adults: 2, children: 0 } });
  const six = await buildCards("transportDeals", { travellers: { adults: 6, children: 0 } });
  const c2 = cardOf(two, "transportDeals");
  const c6 = cardOf(six, "transportDeals");
  if (c2?.type === "transportDeals" && c6?.type === "transportDeals") {
    check("2 大人 → metro", c2.data.transport === "metro");
    check("6 大人 → charter", c6.data.transport === "charter");
    check("2 大人無團體票", !c2.data.discounts.includes("group"));
    check("6 大人有團體票", c6.data.discounts.includes("group"));
  }

  // ── 6. dispatch：matched:false 與 needsInput 路徑 ──
  const miss = await dispatch("hello world");
  check("dispatch 未命中 → matched:false", miss.matched === false);

  const need = await dispatch("交通");
  check(
    "dispatch 缺人數 → needsInput:'travellers'",
    need.matched === true && need.needsInput === "travellers" && need.cards.length === 0
  );

  const hit = await dispatch("交通", { travellers: { adults: 2, children: 0 } });
  check("dispatch 帶人數 → 出卡", hit.matched === true && hit.cards.length === 1);

  const btn = await dispatch("找美食");
  check("dispatch 按鈕字串命中 → foodList", btn.matched === true && btn.cards[0]?.type === "foodList");

  // ── 报告 ──
  console.log(`\n✅ 通過 ${passed} 項`);
  if (failures.length) {
    console.log(`❌ 失敗 ${failures.length} 項：`);
    for (const f of failures) console.log(`   - ${f}`);
  }
  process.exit(failures.length === 0 ? 0 : 1);
}

main();

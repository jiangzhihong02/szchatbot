// 冒烟检查：规则分發器（票 08）。运行：npx tsx scripts/check-dispatcher.ts
// 失败会打印并返回非零退出码——不再无条件报成功。
import {
  matchIntent,
  buildCards,
  dispatch,
  PRESET_BUTTONS,
  KEYWORDS,
} from "../src/lib/dispatcher";
import type { Card } from "../src/lib/types";
import { mapAmapForecast, mockWeather } from "../src/lib/weather";
import { messages } from "../src/lib/i18n/messages";
import { LOCALES } from "../src/lib/i18n/config";

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
  // ── 1. 每个别名（额外别名 + **三语**按钮 label）都命中自己的意图 ──
  for (const b of PRESET_BUTTONS) {
    const labels = LOCALES.map((l) => messages[l].presets[b.key].label);
    for (const w of [...KEYWORDS[b.key], ...labels]) {
      check(`別名 "${w}" → ${b.key}`, matchIntent(w) === b.key);
    }
  }

  // ── 2. 无冲突规则（契约）：優惠 類歸 🎫，交通 類歸 💰 ──
  check('無衝突：「優惠」→ deals', matchIntent("優惠") === "deals");
  check('無衝突：「交通」→ pricing', matchIntent("交通") === "pricing");
  check('最長匹配：「算優惠＋交通」→ pricing', matchIntent("算優惠＋交通") === "pricing");

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

  // 天氣：測「純映射」與 mock 形狀。
  // （真實 fetch 路徑跑在 Next runtime 的 `use cache` 裡，純 Node 下無法執行，故不在此測。）
  const mapped = mapAmapForecast({
    status: "1",
    forecasts: [
      {
        casts: [
          { date: "2026-10-09", dayweather: "多雲", nightweather: "多雲", daytemp: "29", nighttemp: "23", daywind: "東風" },
          { date: "2026-10-10", dayweather: "短暫陣雨", nightweather: "多雲", daytemp: "28", nighttemp: "23", daywind: "東南風" },
          { date: "2026-10-11", dayweather: "晴", nightweather: "晴", daytemp: "31", nighttemp: "24", daywind: "南風" },
        ],
      },
    ],
  });
  check("mapAmapForecast 取 3 天", mapped.length === 3);
  check("mapAmapForecast 標籤為 今日/明日/後日", mapped[0].date === "今日" && mapped[2].date === "後日");
  check("mapAmapForecast 帶日夜天氣與風", mapped.every((d) => !!d.text && !!d.textNight && !!d.wind));
  check("mapAmapForecast 非成功 → 空", mapAmapForecast({ status: "0" }).length === 0);
  const mw = mockWeather("zh-Hant");
  check("mock 3 天 + 建議", mw.days.length === 3 && mw.advice.length > 0);

  // 規則引擎文案隨語言（票 11 第三批）
  const prHant = await buildCards("pricing", { travellers: { adults: 2, children: 1 } }, "zh-Hant");
  const prEn = await buildCards("pricing", { travellers: { adults: 2, children: 1 } }, "en");
  const p1 = cardOf(prHant, "pricing");
  const p2 = cardOf(prEn, "pricing");
  if (p1?.type === "pricing" && p2?.type === "pricing") {
    check("交通方案隨語言", p1.data.transport.mode !== p2.data.transport.mode);
    check("優惠項隨語言", p1.data.discounts[0].name !== p2.data.discounts[0].name);
    check("支付提示隨語言", p1.data.paymentTips[0] !== p2.data.paymentTips[0]);
  } else {
    check("pricing 卡（zh-Hant / en）", false);
  }
  check("天氣建議隨語言", mockWeather("zh-Hant").advice !== mockWeather("en").advice);

  // 優惠：清單 + 每項帶來源（契約要求「來源」欄）
  const deals = await buildCards("deals");
  const dc = cardOf(deals, "dealList");
  if (dc && dc.type === "dealList") {
    check("優惠清單非空", dc.data.length > 0);
    check("優惠項含真實來源", dc.data.every((d) => !!d.sourceName && d.sourceName !== "精選活動"));
  } else {
    check("優惠活動 → dealList 卡", false);
  }

  // 優惠＋交通：缺人數應拋錯（不被靜默默認蓋住）
  let threw = false;
  try {
    await buildCards("pricing");
  } catch {
    threw = true;
  }
  check("pricing 缺 travellers 時拋錯", threw);

  const pr = await buildCards("pricing", { travellers: { adults: 2, children: 1 } });
  const pc = cardOf(pr, "pricing");
  if (pc && pc.type === "pricing") {
    check("pricing 回報人數", pc.data.travellers.adults === 2 && pc.data.travellers.children === 1);
    check("pricing 帶交通方案", pc.data.transport.mode.length > 0);
    check("pricing 帶優惠項", pc.data.discounts.length > 0);
  } else {
    check("算優惠＋交通 → pricing 卡", false);
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

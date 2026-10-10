// 冒烟检查：口岸頁面的變更偵測。运行：npx tsx scripts/check-checkpoint-watch.ts
//
// fixture 是 2026-10-10 從入境處管制站頁面抓下來的**真實**表格文字（簡體，官方原文）。
// 用真資料當測資，因為這支程式要對付的正是那張表。
import { readFileSync } from "node:fs";
import {
  extractStations,
  diffStations,
  hasChanges,
  looksLikeControlPointTable,
  tableToText,
} from "../src/lib/checkpoint-watch";

let passed = 0;
const failures: string[] = [];

function check(label: string, ok: boolean) {
  if (ok) {
    passed++;
  } else {
    failures.push(label);
  }
}

const FIXTURE = new URL("./fixtures/immd-control-points.txt", import.meta.url);
const REAL = readFileSync(FIXTURE, "utf8");

async function main() {
  // ── 1. 分段：官方頁 13 個管制站，個個都要分得出來 ──
  const stations = extractStations(REAL);
  check("解析得出結果", stations !== null);
  const names = Object.keys(stations ?? {});
  check(`抓到 13 個管制站（實得 ${names.length}）`, names.length === 13);
  check("第一個是香港國際機場", names[0] === "香港国际机场");
  check("最後一個是香園圍", names[names.length - 1] === "香园围");
  check("羅湖在裡面", names.includes("罗湖"));

  // ── 2. 段落內容要含各自的時刻，且不會跟隔壁站混在一起 ──
  check("羅湖那段帶自己的時刻", stations?.["罗湖"]?.includes("上午6时30分至午夜12时") === true);
  check("羅湖那段不含落馬洲的時刻", stations?.["罗湖"]?.includes("全日24小时") !== true);
  check("落馬洲支線那段帶 22:30", stations?.["落马洲支线"]?.includes("上午6时30分至晚上10时30分") === true);

  // ── 3. 深圳灣這種「一段兩條時刻」要整段留著，不挑（挑就是賭）──
  const szBay = stations?.["深圳湾"] ?? "";
  check("深圳灣段落同時保留旅檢與貨車兩條", szBay.includes("上午6时30分至午夜12时") && szBay.includes("全日24小时"));
  check("深圳灣段落保留頻道標籤", szBay.includes("旅检大楼") && szBay.includes("货车"));

  // ── 4. 多行時刻不得被截斷（機場那段橫跨兩行）──
  check("機場那段跨行的時刻完整", stations?.["香港国际机场"]?.includes("上午12时15分") === true);

  // ── 5. 差異比對 ──
  const same = diffStations(stations!, stations!);
  check("自己跟自己比 → 無變更", !hasChanges(same));

  const changedHours = { ...stations!, 罗湖: "上午6时30分至晚上11时" };
  const d1 = diffStations(stations!, changedHours);
  check("只認出羅湖變了", d1.changed.length === 1 && d1.changed[0] === "罗湖");
  check("沒有誤報新增／移除", d1.added.length === 0 && d1.removed.length === 0);

  const { 罗湖: _drop, ...withoutLoWu } = stations!;
  const d2 = diffStations(stations!, withoutLoWu);
  check("移除一個站 → removed 認得", d2.removed.length === 1 && d2.removed[0] === "罗湖");

  const d3 = diffStations(stations!, { ...stations!, 新口岸: "上午8时至晚上8时" });
  check("新增一個站 → added 認得", d3.added.length === 1 && d3.added[0] === "新口岸");

  // ── 6. 結構斷言：這是唯一能分辨「沒變」與「改版了」的東西 ──
  check(
    "真頁面通過結構斷言",
    looksLikeControlPointTable(stations!, 10, ["罗湖", "落马洲支线", "深圳湾", "香园围"]).ok
  );
  const tooFew = looksLikeControlPointTable({ 罗湖: "x" }, 10, ["罗湖"]).ok;
  check("站數太少 → 斷言失敗（改版了）", !tooFew);
  const missing = looksLikeControlPointTable(stations!, 10, ["罗湖", "不存在的新口岸"]).ok;
  check("缺少預期站名 → 斷言失敗", !missing);

  // ── 7. 壞輸入不得拋錯 ──
  check("空字串 → null", extractStations("") === null);
  check("純散文 → null（沒有編號段落）", extractStations("這是一段沒有編號的文字\n第二行") === null);

  // ── 8. 表格 HTML → 文字 ──
  check(
    "去標籤並保留文字",
    tableToText("<table><tr><td>2.罗湖</td></tr><tr><td>上午6时30分至午夜12时</td></tr></table>") ===
      "2.罗湖\n上午6时30分至午夜12时"
  );
  check("解 HTML 實體（&nbsp; 變空格、&amp; 變 &，都不是換行）", tableToText("<td>A&nbsp;B&amp;C</td>") === "A B&C");
  check("標籤之間不留空行", tableToText("<tr><td>a</td></tr><tr><td>b</td></tr>") === "a\nb");

  console.log(`\n✅ 通過 ${passed} 項`);
  if (failures.length) {
    console.log(`❌ 失敗 ${failures.length} 項：`);
    for (const f of failures) console.log(`   - ${f}`);
  }
  process.exit(failures.length === 0 ? 0 : 1);
}

main();

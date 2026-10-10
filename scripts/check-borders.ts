// 冒烟检查：深港口岸（票 12）。运行：npx tsx scripts/check-borders.ts
//
// 这張卡的兩種錯都會讓旅人付出真實代價：
//   1. 「未開放」被渲染成「暢通」—— 沙頭角現在回傳的就是 99；
//   2. 管制站代碼打錯字 —— 徽章會靜默消失，沒人會發現。
// 所以兩者都要有斷言釘住。
import { mapQueueLevels } from "../src/lib/border-live-core";
import { BORDERS } from "../src/lib/data/borders";

let passed = 0;
const failures: string[] = [];

function check(label: string, ok: boolean) {
  if (ok) {
    passed++;
  } else {
    failures.push(label);
  }
}

/** 香港入境處公開數據實際提供的管制站代碼（2026-10 實測）。 */
const IMMD_CODES = ["HYW", "HZM", "LMC", "LSC", "LWS", "MKT", "SBC", "STK"];

async function main() {
  // ── 1. 代碼 → 等級的映射 ──
  check("0 → 正常", mapQueueLevels({ LWS: { depQueue: 0 } })?.LWS === "normal");
  check("1 → 繁忙", mapQueueLevels({ LWS: { depQueue: 1 } })?.LWS === "busy");
  check("2 → 非常繁忙", mapQueueLevels({ LWS: { depQueue: 2 } })?.LWS === "veryBusy");
  check("4 → 維護中", mapQueueLevels({ LWS: { depQueue: 4 } })?.LWS === "maintenance");
  check("99 → 未開放", mapQueueLevels({ STK: { depQueue: 99 } })?.STK === "closed");

  // ── 2. 最重要的一條：「未開放」絕不等於「正常」 ──
  //     沙頭角 2026-10 實測就是 99。天真地把 0/1/2 映射過去會顯示成一路暢通。
  const stk = mapQueueLevels({ STK: { depQueue: 99 } });
  check("99 不是正常（沙頭角現在是關閉的）", stk?.STK !== "normal" && stk?.STK === "closed");

  // ── 3. 讀的是 depQueue（香港出境），不是 arrQueue（回港方向）──
  //     兩個方向若在同一管制站同時有值，必須取 dep；取錯方向會讓旅人看反。
  const both = mapQueueLevels({ LWS: { arrQueue: 2, depQueue: 0 } });
  check("同時有 arr 與 dep 時取 depQueue", both?.LWS === "normal");

  // ── 4. 未知代碼一律略過，不得瞎猜 ──
  check("未知等級碼 → 略過該站", mapQueueLevels({ LWS: { depQueue: 77 } })?.LWS === undefined);
  check("缺 depQueue → 略過該站", mapQueueLevels({ LWS: {} })?.LWS === undefined);
  // 註：本函式**不**過濾「不認識的管制站代碼」，這是刻意的——過濾就得把口岸清單餵進來，
  // 讓一個純映射器去認識業務資料。多出來的鍵是惰性的：派發器只按 `liveCode` 取值。
  check(
    "未知等級碼不會變成任何等級",
    Object.values(mapQueueLevels({ XXX: { depQueue: 77 } }) ?? {}).length === 0
  );

  // ── 5. 壞輸入不得拋錯 ──
  check("null → null", mapQueueLevels(null) === null);
  check("undefined → null", mapQueueLevels(undefined as never) === null);

  // ── 6. 種子資料的完整性 ──
  const ids = BORDERS.map((b) => b.id);
  check("口岸 id 不重複", new Set(ids).size === ids.length);
  check("口岸 id 非空", ids.every((i) => !!i));
  check("每個口岸都有名稱", BORDERS.every((b) => !!b.nameHk));
  check("每個口岸都有通關方式", BORDERS.every((b) => b.modes.length > 0));
  check("每個口岸都有開放時間", BORDERS.every((b) => !!b.hours));
  check("每個口岸都有兩側接駁", BORDERS.every((b) => !!b.hkAccess && !!b.szAccess));
  check("每個口岸都有特點與提示", BORDERS.every((b) => !!b.note && !!b.tip));

  // ── 7. liveCode 必須是入境處真實存在的代碼（打錯字會讓徽章靜默消失）──
  for (const b of BORDERS) {
    check(
      `liveCode 合法（${b.id} → ${b.liveCode ?? "無"}）`,
      b.liveCode === null || IMMD_CODES.includes(b.liveCode)
    );
  }
  const used = BORDERS.map((b) => b.liveCode).filter((c): c is string => c !== null);
  check("兩個口岸不會共用同一個 liveCode", new Set(used).size === used.length);

  // ── 8. 開放時間必須是時刻，不是文案 ──
  //     時刻三語相同，故刻意不放進譯文疊層；一旦有人寫成「上午六時半」就會漏翻。
  check(
    "開放時間全為數字時刻（故不必翻譯）",
    BORDERS.every((b) => /^[0-9:–\-]+$/.test(b.hours))
  );

  // ── 9. 皇崗／落馬洲尚未列入（新皇崗 2026-10-12 啟用，見 issues/12）──
  //     這是刻意的：拿不到運營方確認前不寫。此斷言是提醒，不是防錯。
  check(
    "LMC（落馬洲/皇崗）尚未列入 —— 待新皇崗啟用確認後補",
    !used.includes("LMC")
  );

  console.log(`\n✅ 通過 ${passed} 項`);
  if (failures.length) {
    console.log(`❌ 失敗 ${failures.length} 項：`);
    for (const f of failures) console.log(`   - ${f}`);
  }
  process.exit(failures.length === 0 ? 0 : 1);
}

main();

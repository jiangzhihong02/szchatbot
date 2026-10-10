// 冒烟检查：高德数字签名（sig）。运行：npx tsx scripts/check-amap-sign.ts
//
// 这里每一个「期望值」都是用 **openssl 独立算出来的**（printf '%s' '<串>' | openssl md5），
// 不是拿本仓的实现跑一遍抄下来——否则测试只能证明「代码没变」，不能证明「代码是对的」。
import { amapSig } from "../src/lib/amap-sign";

let passed = 0;
const failures: string[] = [];

function check(label: string, ok: boolean) {
  if (ok) {
    passed++;
  } else {
    failures.push(label);
  }
}

async function main() {
  // ── 1. 官方示例（lbs.amap.com/faq/quota-key/key/41181）──
  //    参数 a=23, b=12, d=48, f=8, c=67；私钥 bbbbb
  //    官方给的待哈希串是 a=23&b=12&c=67&d=48&f=8bbbbb（注意 c 被排到了第三位）
  const OFFICIAL = "a89e8c2266d888860c46672d77d069f3";
  check("官方向量", amapSig({ a: "23", b: "12", d: "48", f: "8", c: "67" }, "bbbbb") === OFFICIAL);
  check(
    "官方示例打亂輸入順序 → 同一個 sig（證明我們排序）",
    amapSig({ f: "8", c: "67", b: "12", a: "23", d: "48" }, "bbbbb") === OFFICIAL
  );

  // ── 2. key 要算進去；sig 自己不算 ──
  check(
    "key 有參與哈希（換 key 就換 sig）",
    amapSig({ key: "AAA", city: "440300" }, "S") !== amapSig({ key: "BBB", city: "440300" }, "S")
  );
  check(
    "sig 被排除在哈希之外",
    amapSig({ key: "K", a: "1" }, "S") === amapSig({ key: "K", a: "1", sig: "垃圾值" }, "S")
  );

  // ── 3. 用**原始值**哈希，不是 urlencode 之後的值 ──
  //    這是最容易做錯的一步：本專案地圖參數滿是 , : | ;，兩種取法算出的 sig 完全不同。
  check(
    "原始值哈希",
    amapSig({ key: "K", center: "114.05,22.54" }, "S") === "b278ba382dbbf3cbe12e48a475e4ad1b"
  );
  check(
    "不是編碼值哈希（若哪天有人「順手」先編碼，這條會紅）",
    amapSig({ key: "K", center: "114.05,22.54" }, "S") !== "22c044cb01c4046b6ed527e0e8db2198"
  );

  // ── 4. 實戰向量：真實的靜態地圖參數 + 私鑰 TESTSECRET ──
  //    排序後為 center, key, markers, paths, size, zoom
  check(
    "實戰：靜態地圖參數全形",
    amapSig(
      {
        size: "750*380",
        zoom: "12",
        center: "114.057868,22.543099",
        markers: "mid,0x0E7490,1:114.05,22.54|mid,0x0E7490,2:114.10,22.60",
        paths: "6,0x0E7490,1,,:114.05,22.54;114.10,22.60",
        key: "TESTKEY",
      },
      "TESTSECRET"
    ) === "44f6256833ee250ab08d242f730b2b1f"
  );

  // ── 5. 輸出格式：32 字元小寫十六進位 ──
  //    官方文件沒寫大小寫，但所有可運作的實作都是小寫；這條把它釘死，
  //    免得哪天有人改成大寫然後線上全部 10007。
  const sig = amapSig({ key: "K" }, "S");
  check("長度 32", sig.length === 32);
  check("全為小寫十六進位", /^[0-9a-f]{32}$/.test(sig));

  // ── 6. 邊界與敏感度 ──
  check("空參數表 → md5(私鑰)", amapSig({}, "S") === "5dbc98dcc983a70728bd082d1a47546e");
  check("私鑰不同 → sig 不同", amapSig({ key: "K" }, "S1") !== amapSig({ key: "K" }, "S2"));
  check("參數值不同 → sig 不同", amapSig({ key: "K", a: "1" }, "S") !== amapSig({ key: "K", a: "2" }, "S"));
  check(
    "排序區分大小寫（A 在 a 之前，非不分大小寫排序）",
    amapSig({ a: "1", A: "2" }, "S") === amapSig({ A: "2", a: "1" }, "S") &&
      amapSig({ a: "1", A: "2" }, "S") !== amapSig({ A: "1", a: "2" }, "S")
  );

  console.log(`\n✅ 通過 ${passed} 項`);
  if (failures.length) {
    console.log(`❌ 失敗 ${failures.length} 項：`);
    for (const f of failures) console.log(`   - ${f}`);
  }
  process.exit(failures.length === 0 ? 0 : 1);
}

main();

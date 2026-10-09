// 譯文覆蓋校驗（架構審查候選 1）。
// 執行：npx tsx scripts/check-i18n.ts
//
// 斷言**兩個方向**：
//   ⊇ 正本每個可譯欄位都有 zh-Hans + en（否則會靜默回退繁體）
//   ⊆ 疊層沒有多餘的鍵（改了正本卻忘刪譯文）
// 以及沒有空字串。失敗回傳非零退出碼。
import { CONTENT_I18N } from "../src/lib/data/i18n-generated";
import { allContentKeys } from "../src/lib/i18n/content";

const expected = allContentKeys();
const have = Object.keys(CONTENT_I18N);

// 正本鍵本身不得重複 —— 否則「缺一個」會被重複項掩蓋（曾真的發生過）。
const dupExpected = expected.filter((k, i) => expected.indexOf(k) !== i);
const dups = have.filter((k, i) => have.indexOf(k) !== i);

const missing = expected.filter((k) => !CONTENT_I18N[k]?.["zh-Hans"] || !CONTENT_I18N[k]?.en);
const extra = have.filter((k) => !expected.includes(k));
const blank = have.filter((k) => !CONTENT_I18N[k]["zh-Hans"]?.trim() || !CONTENT_I18N[k].en?.trim());

console.log(`正本 ${expected.length} 鍵 / 疊層 ${have.length} 鍵\n`);

for (const k of dupExpected) console.log(`  ❌ 正本鍵重複：${k}`);
for (const k of dups) console.log(`  ❌ 疊層鍵重複：${k}`);
for (const k of missing) console.log(`  ❌ 缺譯文：${k}`);
for (const k of extra) console.log(`  ❌ 多餘鍵：${k}（正本已無此欄位？）`);
for (const k of blank) console.log(`  ❌ 空值：${k}`);

const failed = dupExpected.length + dups.length + missing.length + extra.length + blank.length;
console.log(failed ? `\n❌ ${failed} 項不合格` : "\n✅ 譯文覆蓋完整（⊇ 且 ⊆，無重複、無空值）");
process.exit(failed ? 1 : 0);

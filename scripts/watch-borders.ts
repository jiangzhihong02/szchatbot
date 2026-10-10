// 口岸頁面變更偵測（票 13）。由 .github/workflows/watch-borders.yml 每日執行，也可本機跑。
//
// 只做一件事：告訴人「官方頁面變了、哪個口岸變了」。
// **刻意不改 `src/lib/data/borders.ts`** —— 理由見 `src/lib/border-watch.ts` 的檔頭。
//
// 退出碼：
//   0 = 跑完（有沒有變更由 workflow 用 git diff 判斷）
//   1 = 抓不到 / 看不懂這一頁  ← **這不是「沒變」，是「查不到」**，必須吵
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { extractBorders, diffBorders, hasChanges, looksLikeBorderTable, tableToText } from "../src/lib/border-watch";

const PAGE = "https://www.immd.gov.hk/hks/contactus/control_points.html";
const SNAPSHOT = fileURLToPath(new URL("../.github/border-watch/borders.json", import.meta.url));
const REPORT = process.env.REPORT_PATH ?? "border-watch-report.md";

/** 這張表「還是不是我們認識的那張」——用來分辨「沒變」與「改版了」。 */
const EXPECT_AT_LEAST = 10;
const MUST_INCLUDE = ["罗湖", "落马洲支线", "深圳湾", "香园围", "文锦渡", "高铁西九龙"];

function fail(msg: string): never {
  console.error(`\n❌ ${msg}`);
  process.exit(1);
}

/** 抓頁面，失敗重試 3 次（官方站偶爾會慢，不想為此發假警報）。 */
async function fetchPage(): Promise<string> {
  let last = "未知錯誤";
  for (let i = 1; i <= 3; i++) {
    try {
      const res = await fetch(PAGE, {
        headers: { "User-Agent": "szchatbot-border-watch/1.0 (+https://github.com/jiangzhihong02/szchatbot)" },
      });
      if (res.ok) return await res.text();
      last = `HTTP ${res.status}`;
    } catch (e) {
      last = e instanceof Error ? e.message : String(e);
    }
    if (i < 3) await new Promise((r) => setTimeout(r, i * 3000));
  }
  fail(`抓不到官方頁面（${last}）—— 這不是「沒變」，是「查不到」。`);
}

/** 有變更的口岸，逐個列出前後，供人核對。 */
function renderDetail(prev: Record<string, string>, next: Record<string, string>, changed: string[]): string {
  return changed
    .map((name) => {
      const before = prev[name].split("\n").map((l) => `> ${l}`).join("\n");
      const after = next[name].split("\n").map((l) => `> ${l}`).join("\n");
      return `#### ${name}\n\n**之前**\n\n${before}\n\n**現在**\n\n${after}\n`;
    })
    .join("\n");
}

async function main() {
  const html = await fetchPage();

  const table = /<table[\s\S]*?<\/table>/i.exec(html)?.[0];
  if (!table) fail("頁面上找不到表格 —— 版面可能改版了。");

  const borders = extractBorders(tableToText(table));
  if (!borders) fail("表格解析不出任何口岸 —— 版面可能改版了。");

  const shape = looksLikeBorderTable(borders, EXPECT_AT_LEAST, MUST_INCLUDE);
  if (!shape.ok) {
    fail(
      `表格結構與預期不符：${shape.reason}\n` +
        `   這不是「資料變了」，是「我們看不懂這一頁了」—— 請人工開一次 ${PAGE} 確認。`
    );
  }

  const firstRun = !existsSync(SNAPSHOT);
  const prev: Record<string, string> = firstRun ? {} : JSON.parse(readFileSync(SNAPSHOT, "utf8"));
  const diff = diffBorders(prev, borders);

  mkdirSync(dirname(SNAPSHOT), { recursive: true });
  writeFileSync(SNAPSHOT, JSON.stringify(borders, null, 2) + "\n", "utf8");

  if (firstRun) {
    console.log(`首次建立快照：${Object.keys(borders).length} 個口岸 → ${SNAPSHOT}`);
    return;
  }

  if (!hasChanges(diff)) {
    console.log(`無變更（${Object.keys(borders).length} 個口岸）`);
    return;
  }

  const section = (label: string, names: string[]) =>
    names.length ? `| ${label} | ${names.join("、")} |\n` : "";

  const report = [
    "## 官方口岸頁面有變動",
    "",
    `抓取時間：${new Date().toISOString()}`,
    `來源：${PAGE}`,
    "",
    "| | 口岸 |",
    "|---|---|",
    section("內容變更", diff.changed),
    section("新增", diff.added),
    section("消失", diff.removed),
    "",
    "---",
    "",
    "### 詳細差異",
    "",
    renderDetail(prev, borders, diff.changed),
    diff.added.length ? `**新增的口岸**：${diff.added.join("、")}\n` : "",
    diff.removed.length ? `**消失的口岸**：${diff.removed.join("、")}\n` : "",
    "---",
    "",
    "**這份 PR 只更新快照。** `src/lib/data/borders.ts` 由人來改 —— 請照上面的差異核對。",
    "若差異是版面改版造成的誤判，直接關掉這個 PR 即可。",
    "",
  ].join("\n");

  writeFileSync(REPORT, report, "utf8");
  console.log(`有變更：變更 ${diff.changed.length}、新增 ${diff.added.length}、消失 ${diff.removed.length}`);
  console.log(`報告：${REPORT}`);
}

main();

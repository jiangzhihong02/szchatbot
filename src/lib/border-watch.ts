/**
 * 官方口岸頁面的**變更偵測** —— 純函式，不碰網路。
 *
 * ⚠️ 這裡刻意**不做時刻解析**。原本想「把官方頁的時刻轉成我們的正規形式再改寫
 *    `data/borders.ts`」，但真實頁面做不到可靠解析：
 *      · 深圳灣一段裡有**兩條**時刻（「旅檢大樓及私家車客運」與「貨車」），
 *        純文字挑不出旅客該看哪一條；
 *      · 時刻用語是自由散文（上午6时30分至午夜12时／全日24小时／上午5时15分至翌日上午12时15分）。
 *    硬解析等於在賭，而賭錯的產物是「錯的開放時間」——那正是讓人誤車的那種錯。
 *
 * 所以退一步：**只偵測「哪個口岸的段落變了」**，並把新段落原樣交給人看。
 * 這條路不可能產出錯資料，因為它根本不產出資料。
 * 改 `borders.ts` 的動作留給人——成本是一行，而且有人過目。
 *
 * 命名一律用**口岸／border**（CONTEXT.md 的規範詞）；不用 `checkpoint`／`station`，
 * 前者是 `_Avoid_` 的「檢查站」，後者會與路線的**站點（Stop）**撞車。
 */

/** 表格文字 → 每個口岸的段落（口岸名 → 該口岸底下所有行，直到下一個編號口岸）。 */
export function extractBorders(tableText: string): Record<string, string> | null {
  const lines = tableText
    .split("\n")
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const out: Record<string, string> = {};
  let current: string | null = null;
  let buf: string[] = [];

  for (const line of lines) {
    // 「N.口岸名」是段落分隔。官方頁固定用半角句點加編號。
    const m = /^(\d{1,2})\s*[.．、]\s*(\S.*)$/.exec(line);
    if (m) {
      if (current) out[current] = buf.join("\n");
      current = m[2].trim();
      buf = [];
    } else if (current) {
      buf.push(line);
    }
  }
  if (current) out[current] = buf.join("\n");

  return Object.keys(out).length ? out : null;
}

export interface BorderDiff {
  added: string[];
  removed: string[];
  changed: string[];
}

/** 比對兩份快照。 */
export function diffBorders(prev: Record<string, string>, next: Record<string, string>): BorderDiff {
  return {
    added: Object.keys(next).filter((k) => !(k in prev)),
    removed: Object.keys(prev).filter((k) => !(k in next)),
    changed: Object.keys(next).filter((k) => k in prev && prev[k] !== next[k]),
  };
}

export function hasChanges(d: BorderDiff): boolean {
  return d.added.length + d.removed.length + d.changed.length > 0;
}

/**
 * 結構斷言：頁面必須仍然長得像我們認識的那張表。
 *
 * 這是**唯一**能分辨「頁面沒變」與「頁面改版了、我們抓到垃圾」的東西。
 * 沒有它，改版會表現成「十幾個口岸同時變更」——一則吵雜的 PR，而不是一個明確的失敗。
 *
 * @param borders 解析出來的口岸名
 * @param expectAtLeast 至少要抓到幾個口岸
 * @param mustInclude 必定要出現的口岸名（用來釘住「這還是同一張表」）
 */
export function looksLikeBorderTable(
  borders: Record<string, string>,
  expectAtLeast: number,
  mustInclude: string[]
): { ok: true } | { ok: false; reason: string } {
  const names = Object.keys(borders);
  if (names.length < expectAtLeast) {
    return { ok: false, reason: `只解析到 ${names.length} 個口岸（預期至少 ${expectAtLeast} 個）` };
  }
  const missing = mustInclude.filter((n) => !names.includes(n));
  if (missing.length) {
    return { ok: false, reason: `找不到預期中的口岸：${missing.join("、")}` };
  }
  return { ok: true };
}

/** 去掉標籤並把表格壓成「一行一列」的文字（快照的輸入）。 */
export function tableToText(tableHtml: string): string {
  return tableHtml
    .replace(/<[^>]+>/g, "\n")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .join("\n");
}

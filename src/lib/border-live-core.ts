import type { QueueLevel, BorderLiveCode } from "./types";
import { BORDER_LIVE_CODES } from "./types";

/**
 * 實時排隊的**純內部縫** —— 不碰網路、不碰快取，故可直接單測。
 * 取數與快取在 `border-live.ts`。
 *
 * 來源：香港入境處公開數據（data.gov.hk `hk-immd-set28`），每 15 分鐘更新。
 *
 * ⚠️ **涵蓋範圍只有港方**：數據是「旅客辦理**港方**出入境手續的輪候情況」，
 *    不含深圳側邊檢的隊。所以一個「正常」徽章只代表**香港出境大堂**順暢，
 *    不代表整趟過關都快——介面上那句 `borderUpdated` 就是為此而寫的。
 */

/** 入境處原始碼 → 等級。**未列出的碼一律略過**——寧可不顯示，也不顯示錯的。 */
const LEVELS: Record<number, QueueLevel> = {
  0: "normal",
  1: "busy",
  2: "veryBusy",
  4: "maintenance",
  99: "closed",
};

/** 入境處公開數據的形狀（只取本專案用到的欄位）。 */
export type ImmdQueueJson = Record<string, { arrQueue?: number; depQueue?: number } | undefined>;

function isLiveCode(s: string): s is BorderLiveCode {
  return (BORDER_LIVE_CODES as readonly string[]).includes(s);
}

/**
 * 純函式：入境處 JSON → 管制站代碼 → 等級。無資料或形狀不對 → null（前端不顯示徽章）。
 *
 * ⚠️ 讀的是 **`depQueue`（香港出境）**：本站的旅客是**由香港去深圳**，
 *    在港方排的是**出境**大堂。`arrQueue` 是回港方向，對這張卡無用。
 *
 * ⚠️ `99` 是「非服務時間」，**絕不可當成「暢通」**。沙頭角現在回傳的就是 99——
 *    若天真地把 0/1/2 映射過去，會把一個根本沒開的口岸顯示成一路順暢。
 *
 * 回傳型別是 `Partial<Record<BorderLiveCode, …>>`，所以不認識的管制站代碼會被過濾掉：
 * 要滿足這個型別就得先驗證，而驗證正是我們要的。
 */
export function mapQueueLevels(
  json: ImmdQueueJson | null
): Partial<Record<BorderLiveCode, QueueLevel>> | null {
  if (!json || typeof json !== "object") return null;
  const out: Partial<Record<BorderLiveCode, QueueLevel>> = {};
  for (const [code, v] of Object.entries(json)) {
    if (!isLiveCode(code)) continue;
    const level = LEVELS[v?.depQueue ?? -1];
    if (level) out[code] = level;
  }
  return out;
}

import { cacheLife } from "next/cache";
import type { QueueLevel, BorderLiveCode } from "./types";
import { mapQueueLevels } from "./border-live-core";
import type { ImmdQueueJson } from "./border-live-core";

/**
 * 實時排隊 adapter —— 伺服器端。取數 → 解析 → 快取。
 * 解析在 `border-live-core`（純、可單測）。
 *
 * **這是本專案唯一不需要金鑰的外部資料源** —— 公開數據，沒有 key 要保管、要輪換或要簽名。
 *
 * 失敗一律回 null（前端就不顯示徽章）：這張卡的其餘部分是靜態種子資料，
 * 實時那格取不到只是少一個徽章，不該讓整張卡消失。
 */

/**
 * 香港居民版（`R`）。另有 `CPQueueTimeV.json`（訪客），**兩者的分鐘門檻不同**
 * （例如「正常」在居民是 15 分鐘內、訪客是 30 分鐘內）。本站的旅客是香港居民，故取 R。
 * 也因為兩個版本門檻不同，徽章**只顯示等級、不顯示分鐘**——那個數字得先說清是哪一版才算誠實。
 */
const IMMD_QUEUE_URL = "https://secure1.info.gov.hk/immd/mobileapps/2bb9ae17/data/CPQueueTimeR.json";

/** 香港入境處公開數據每 15 分鐘更新，故快取 15 分鐘。無資料 → null。 */
export async function getQueueLevels(): Promise<Partial<Record<BorderLiveCode, QueueLevel>> | null> {
  "use cache";
  cacheLife({ revalidate: 900 });

  try {
    const res = await fetch(IMMD_QUEUE_URL);
    if (!res.ok) return null;
    return mapQueueLevels((await res.json()) as ImmdQueueJson);
  } catch {
    return null;
  }
}

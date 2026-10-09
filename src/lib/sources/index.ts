import type { DealData } from "../types";
import { DEALS } from "../data/deals";

/**
 * 优惠活动数据源（可插拔架构）
 * ────────────────────────────────────────────────────────────
 * 「自动更新数据」这个需求用这里的 DataSource 接口承载：
 * 每个来源实现 fetchDeals()，上层只认接口、不关心来源怎么拿到数据。
 *
 * 目前只注册了一个「人工精选」源。将来要接自动来源（公开 API / 官方公告 / RSS），
 * 实现 DataSource 再推进 SOURCES 即可——上层 `fetchAllDeals` 无需改动。
 *
 * ⚠️ 关于小红书 / 第三方平台抓取，见 docs/scraping-notes.md：
 * 其用户协议禁止抓取、法律属灰区、技术上不稳定，本 demo 不接。
 */

export interface DataSource {
  name: string;
  fetchDeals(): Promise<DealData[]>;
}

/** 默认数据源：人工维护的精选种子（来源与出处见 data/deals.ts）。 */
const curatedSource: DataSource = {
  name: "精選活動",
  async fetchDeals() {
    return DEALS;
  },
};

/** 已注册的数据源。加自动源时在此追加。 */
const SOURCES: DataSource[] = [curatedSource];

/** 汇总所有已注册数据源的优惠活动；单个源失败不影响其余。 */
export async function fetchAllDeals(): Promise<DealData[]> {
  const results = await Promise.allSettled(SOURCES.map((s) => s.fetchDeals()));
  const deals: DealData[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") deals.push(...r.value);
  }
  return deals;
}

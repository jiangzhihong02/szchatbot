import type { DealData } from "../types";

/**
 * 优惠活动数据源（可插拔架构）
 * ────────────────────────────────────────────────────────────
 * 「自动爬取数据」这个需求用这里的 DataSource 接口承载：
 * 每个来源实现 fetchDeals()，上层只认接口、不关心来源怎么拿到数据。
 *
 * ⚠️ 关于小红书 / 第三方平台抓取，请先读 docs/scraping-notes.md：
 *    - 小红书有登录态、签名、风控，且其用户协议禁止抓取，法律上属灰区；
 *    - 不建议直接硬爬，优先用官方开放接口 / 商户官方公告 / 人工精选。
 * 所以这里默认只提供「精选数据源」(CuratedSource)。小红书适配器仅留
 * 骨架，默认不启用，由你评估合规后再决定是否接入。
 */

export interface DataSource {
  name: string;
  fetchDeals(): Promise<DealData[]>;
}

/** 精选 / 人工维护的数据源（默认启用，合规、稳定） */
class CuratedSource implements DataSource {
  name = "精選活動";
  async fetchDeals(): Promise<DealData[]> {
    // 真实项目里：从你自己的数据库 / CMS / 官方公告接口读取
    return [
      {
        id: "d1",
        title: "深圳歡樂谷 親子套票限時優惠",
        merchant: "歡樂谷",
        area: "南山",
        summary: "2大1小套票平日約 9 折，官方小程序購票免排隊。",
        validUntil: "長期",
        sourceName: "精選活動",
      },
      {
        id: "d2",
        title: "東門老街美食券",
        merchant: "多家老字號",
        area: "羅湖",
        summary: "部分商戶支持 AlipayHK 立減，掃碼即享。",
        sourceName: "精選活動",
      },
    ];
  }
}

/**
 * 小红书适配器（骨架，默认不启用）
 * 若评估合规后要接入：优先走官方开放平台 / 内容合作接口，
 * 不要直连 app 私有接口做无登录态硬爬。启用需设置 ENABLE_XHS=1。
 */
class XiaohongshuSource implements DataSource {
  name = "小紅書";
  async fetchDeals(): Promise<DealData[]> {
    // 故意留空：合规方案确定前不抓取。
    return [];
  }
}

/** 根据环境变量组装启用的数据源 */
export function getSources(): DataSource[] {
  const sources: DataSource[] = [new CuratedSource()];
  if (process.env.ENABLE_XHS === "1") {
    sources.push(new XiaohongshuSource());
  }
  return sources;
}

/** 汇总所有启用数据源的优惠活动 */
export async function fetchAllDeals(): Promise<DealData[]> {
  const sources = getSources();
  const results = await Promise.allSettled(sources.map((s) => s.fetchDeals()));
  const deals: DealData[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") deals.push(...r.value);
  }
  return deals;
}

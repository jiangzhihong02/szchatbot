import type { PricingData, TransportPlan, DiscountItem } from "./types";

/**
 * 优惠 / 交通规则引擎（确定性逻辑）
 *
 * ⚠️ 这里是「钱 + 规则」，必须用代码写死、可测试，绝不交给大模型自由计算。
 * 下面的具体数额/折扣只是示例规则，请按真实运营策略调整。
 */

/** 根据人数和小孩数量推荐交通方式 */
function planTransport(adults: number, children: number): TransportPlan {
  const total = adults + children;
  const hasChild = children > 0;

  if (total <= 2 && !hasChild) {
    return {
      mode: "地鐵 + 步行",
      reason: "人數少、無小孩，地鐵最靈活省錢，深圳地鐵覆蓋大部分景點。",
      roughCost: "每程約 ¥2–9 / 人",
    };
  }
  if (total <= 5) {
    return {
      mode: hasChild ? "網約車 / 的士（帶小孩）" : "網約車 / 的士",
      reason: hasChild
        ? "帶小孩出行，網約車門到門更省心，可要求兒童座椅。"
        : "3–5 人拼網約車，人均成本接近地鐵但更舒適。",
      roughCost: "每程約 ¥20–60 / 車",
    };
  }
  return {
    mode: "包車 / 商務車",
    reason: "超過 5 人，包車一次坐齊，適合家庭或團體，省去等車。",
    roughCost: "半天約 ¥300–500 / 車",
  };
}

/** 根据人数和小孩计算可享优惠 */
function planDiscounts(adults: number, children: number): DiscountItem[] {
  const total = adults + children;
  const items: DiscountItem[] = [];

  if (children > 0) {
    items.push({
      name: "兒童優惠",
      detail: "身高 1.2m 以下兒童地鐵免費；多數景點 1.2–1.5m 享半價兒童票。",
    });
  }
  if (adults >= 1 && children >= 1) {
    items.push({
      name: "親子套票",
      detail: "大部分樂園 / 景點有「1大1小」或「2大1小」家庭套票，比單買約省 15%。",
    });
  }
  if (total >= 4) {
    items.push({
      name: "團體票",
      detail: "4 人或以上多數景點可買團體票，約 9 折；提前網上購票再減。",
    });
  }
  if (items.length === 0) {
    items.push({
      name: "線上購票優惠",
      detail: "提前在官方小程序 / 購票平台購票，普遍比現場便宜，且免排隊。",
    });
  }
  return items;
}

/** 面向香港游客的跨境支付提示 */
function paymentTips(): string[] {
  return [
    "支付寶（AlipayHK 可直接掃深圳商戶，自動換算港幣）。",
    "微信支付（香港錢包 WeChat Pay HK 已支持內地跨境消費）。",
    "雲閃付 / 銀聯卡：大型商場、連鎖餐廳普遍支持。",
    "建議備少量現金傍身，部分小店僅收內地收款碼。",
  ];
}

export function buildPricingPlan(
  adultsRaw: number,
  childrenRaw: number
): PricingData {
  const adults = Math.max(0, Math.min(50, Math.floor(adultsRaw || 0)));
  const children = Math.max(0, Math.min(50, Math.floor(childrenRaw || 0)));

  return {
    adults,
    children,
    transport: planTransport(adults, children),
    discounts: planDiscounts(adults, children),
    paymentTips: paymentTips(),
    estimateNote:
      "以上為示例規則與大致費用，實際以商戶 / 景點當日公告為準。",
  };
}

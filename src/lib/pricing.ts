import type { PricingData, Travellers, TransportKey, DiscountKey } from "./types";

/**
 * 交通方案 + 優惠項規則引擎（確定性邏輯）
 *
 * ⚠️ 这里是「钱 + 规则」，必须用代码写死、可测试，绝不交给大模型自由计算。
 * ⚠️ 本檔**只回傳結構化結果**（用哪一種交通方案、哪幾項優惠），**不含任何文案** ——
 *    文案在 `i18n/messages.ts` 的 `engine` 段，由前端按語言查表，
 *    這樣切換語言時既有的卡也會即時跟著變。
 */

/** 把出行組合夹到 0–50 的整数。 */
function clampCount(n: number): number {
  return Math.max(0, Math.min(50, Math.floor(n || 0)));
}

/** 按出行組合挑交通方案。 */
function pickTransport(t: Travellers, total: number): TransportKey {
  if (total <= 2 && t.children === 0) return "metro";
  if (total <= 5) return t.children > 0 ? "carChild" : "car";
  return "charter";
}

/** 按出行組合挑適用的優惠項。 */
function pickDiscounts(t: Travellers, total: number): DiscountKey[] {
  const keys: DiscountKey[] = [];
  if (t.children > 0) keys.push("child");
  if (t.adults >= 1 && t.children >= 1) keys.push("family");
  if (total >= 4) keys.push("group");
  if (keys.length === 0) keys.push("online");
  return keys;
}

export function buildPricingPlan(travellers: Travellers): PricingData {
  const t: Travellers = {
    adults: clampCount(travellers.adults),
    children: clampCount(travellers.children),
  };
  const total = t.adults + t.children;

  return {
    travellers: t,
    transport: pickTransport(t, total),
    discounts: pickDiscounts(t, total),
  };
}

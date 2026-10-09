import type { PricingData, TransportPlan, DiscountItem, Travellers } from "./types";
import { getMessages } from "./i18n/messages";
import type { Locale } from "./i18n/config";

/**
 * 优惠 / 交通规则引擎（确定性逻辑）
 *
 * ⚠️ 这里是「钱 + 规则」，必须用代码写死、可测试，绝不交给大模型自由计算。
 * ⚠️ 文案（交通方案、优惠项、支付提示）在三语文案表 `i18n/messages.ts` 的 `engine` 段，
 *    本檔只負責**判斷**（用哪一種），不寫死任何字串。
 */

/** 把人数夹到 0–50 的整数（两个入口共用，避免重复）。 */
function clampCount(n: number): number {
  return Math.max(0, Math.min(50, Math.floor(n || 0)));
}

export function buildPricingPlan(travellers: Travellers, locale: Locale): PricingData {
  const e = getMessages(locale).engine;
  const t: Travellers = {
    adults: clampCount(travellers.adults),
    children: clampCount(travellers.children),
  };
  const total = t.adults + t.children;
  const hasChild = t.children > 0;

  // ── 交通：只判斷「用哪一種」，文案查表 ──
  const tp =
    total <= 2 && !hasChild ? e.transport.metro : total <= 5 ? (hasChild ? e.transport.carChild : e.transport.car) : e.transport.charter;
  const transport: TransportPlan = { mode: tp.mode, reason: tp.reason, roughCost: tp.cost };

  // ── 優惠項：按人數組合挑選 ──
  const discounts: DiscountItem[] = [];
  if (hasChild) discounts.push(e.discount.child);
  if (t.adults >= 1 && hasChild) discounts.push(e.discount.family);
  if (total >= 4) discounts.push(e.discount.group);
  if (discounts.length === 0) discounts.push(e.discount.online);

  return {
    travellers: t,
    transport,
    discounts,
    paymentTips: [...e.paymentTips],
    estimateNote: e.estimateNote,
  };
}

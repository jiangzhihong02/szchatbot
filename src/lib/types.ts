// 共享类型定义（深圳旅游助手）

/** 聊天消息里可以承载的卡片类型 */
export type CardType = "route" | "weather" | "pricing" | "deal" | "food";

/** 单条聊天消息。assistant 的消息可以是纯文本，也可以附带结构化卡片 */
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  /** 纯文本内容（气泡里显示的话） */
  text?: string;
  /** 结构化卡片（固定格式呈现，不依赖大模型自由发挥） */
  cards?: Card[];
}

export interface Card {
  type: CardType;
  data: unknown;
}

/** 旅游路线卡片 */
export interface RouteData {
  id: string;
  title: string;
  theme: string; // 主题标签，如「美食」「亲子」「文艺」
  durationHours: number;
  stops: RouteStop[];
  bestFor: string; // 适合人群
  tips?: string;
}

export interface RouteStop {
  name: string;
  area: string; // 所在区域
  desc: string;
  type: "food" | "sight" | "shop" | "transport";
}

/** 天气卡片 */
export interface WeatherData {
  city: string;
  date: string;
  tempNow: number;
  tempMax: number;
  tempMin: number;
  text: string; // 天气现象，如「多云」
  humidity: number;
  advice: string; // 出行建议
  source: "qweather" | "mock";
}

/** 优惠 / 支付方案 + 交通建议卡片 */
export interface PricingData {
  adults: number;
  children: number;
  transport: TransportPlan;
  discounts: DiscountItem[];
  paymentTips: string[];
  estimateNote: string;
}

export interface TransportPlan {
  mode: string; // 推荐出行方式
  reason: string;
  roughCost: string;
}

export interface DiscountItem {
  name: string;
  detail: string;
}

/** 优惠活动卡片（来自可插拔数据源） */
export interface DealData {
  id: string;
  title: string;
  merchant: string;
  area: string;
  summary: string;
  validUntil?: string;
  sourceName: string; // 数据来源名称
  sourceUrl?: string;
}

/** 美食推荐卡片 */
export interface FoodData {
  name: string;
  area: string;
  category: string; // 菜系
  mustTry: string;
  priceLevel: "$" | "$$" | "$$$";
}

// 共享类型定义（深圳旅游助手）

export type StopType = "food" | "sight" | "shop" | "transport";

/** 人均价位。"$$–$$$" 用于研究库里给出区间的项，避免把信息压成单值。 */
export type PriceLevel = "$" | "$$" | "$$$" | "$$–$$$";

/** 出行人数。adults/children 总是成对出现，故立一个类型（消 Data Clump）。 */
export interface Travellers {
  adults: number;
  children: number;
}

export interface RouteStop {
  name: string;
  area: string;
  desc: string;
  type: StopType;
}

/** 旅游路线。pool 决定它属于「一日遊」还是「親子」按钮的候选池（支持「換一條」）。 */
export interface RouteData {
  id: string;
  title: string;
  theme: string;
  durationHours: number;
  area: string;
  bestFor: string;
  tips?: string;
  pool: "day" | "family";
  stops: RouteStop[];
}

/** 路线卡片的载荷：带候选索引，供前端「換一條」。 */
export interface RouteCardData {
  route: RouteData;
  index: number;
  total: number;
}

export interface WeatherDay {
  date: string; // 日期，或「今日 / 明日 / 後日」
  text: string; // 天气现象
  tempMax: number;
  tempMin: number;
  humidity: number;
}

/** 天气卡片：按按钮契约显示「今日 + 未来 2 天」。 */
export interface WeatherData {
  city: string;
  days: WeatherDay[];
  advice: string;
  source: "qweather" | "mock";
}

export interface TransportPlan {
  mode: string;
  reason: string;
  roughCost: string;
}

export interface DiscountItem {
  name: string;
  detail: string;
}

/** 优惠 + 交通卡片（「算優惠＋交通」按钮）。 */
export interface PricingData {
  travellers: Travellers;
  transport: TransportPlan;
  discounts: DiscountItem[];
  paymentTips: string[];
  estimateNote: string;
}

/** 美食清单卡里的一项。featured 决定是否进入首发「找美食」的 3–4 家。 */
export interface FoodData {
  name: string;
  area: string;
  category: string;
  mustTry: string;
  priceLevel: PriceLevel;
  priceRMB: string; // 人均参考（人民币）
  featured?: boolean;
}

/** 优惠活动（来自可插拔数据源）。 */
export interface DealData {
  id: string;
  title: string;
  merchant: string;
  area: string;
  summary: string;
  validUntil?: string;
  sourceName: string;
  sourceUrl?: string;
}

/**
 * 聊天消息里的卡片 —— 可辨识联合（discriminated union）。
 * 调用方对 data 无需再强制转换，减少 Primitive Obsession 与重复 cast。
 */
export type Card =
  | { type: "route"; data: RouteCardData }
  | { type: "weather"; data: WeatherData }
  | { type: "pricing"; data: PricingData }
  | { type: "foodList"; data: FoodData[] }
  | { type: "dealList"; data: DealData[] };

export type CardType = Card["type"];

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text?: string;
  cards?: Card[];
}

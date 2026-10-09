// 共享类型定义（深圳旅游助手）

export type StopType = "food" | "sight" | "shop" | "transport";

/** 人均价位。"$$–$$$" 用于研究库里给出区间的项，避免把信息压成单值。 */
export type PriceLevel = "$" | "$$" | "$$$" | "$$–$$$";

/** 出行组合（CONTEXT.md 的规范词；勿用「人數」）。adults/children 总是成对出现。 */
export interface Travellers {
  adults: number;
  children: number;
}

export interface RouteStop {
  name: string;
  area: string;
  desc: string;
  type: StopType;
  /** 經緯度（高德座標系），供路線地圖使用（票 10）。 */
  lng: number;
  lat: number;
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

/**
 * 一天的天气。
 * `text` / `textNight` / `wind` 是高德的**原始词条**（简体），
 * 由前端用 `i18n/weather-text.ts` 的词表转成界面语言；`dayOffset` 0=今日。
 */
export interface WeatherDay {
  dayOffset: number;
  text: string;
  textNight?: string;
  tempMax: number;
  tempMin: number;
  wind?: string;
}

/** 天气卡片。文案（城市名、日名、出行建议）由前端按语言生成。 */
export interface WeatherData {
  days: WeatherDay[];
  source: "amap" | "mock";
}

/** 交通方案的类型键（文案在 i18n/messages.ts 的 engine.transport）。 */
export type TransportKey = "metro" | "carChild" | "car" | "charter";

/** 优惠项的类型键（文案在 i18n/messages.ts 的 engine.discount）。 */
export type DiscountKey = "child" | "family" | "group" | "online";

/**
 * 優惠交通卡（按鈕「算優惠＋交通」）。
 * ⚠️ 只裝**結構化結果**（哪一種交通方案、哪幾項優惠），不含任何文案 —— 文案由前端按語言查表，
 *    故切換語言時既有的卡也會即時跟著變。
 */
export interface PricingData {
  travellers: Travellers;
  transport: TransportKey;
  discounts: DiscountKey[];
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
 * 卡片类型名用**领域词**（見 CONTEXT.md），不用實作詞：
 * 「優惠交通卡」= 交通方案 + 優惠項，故鍵為 `transportDeals` 而非 `pricing`。
 */
export type Card =
  | { type: "route"; data: RouteCardData }
  | { type: "weather"; data: WeatherData }
  | { type: "transportDeals"; data: PricingData }
  | { type: "foodList"; data: FoodData[] }
  | { type: "dealList"; data: DealData[] };

export type CardType = Card["type"];

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text?: string;
  cards?: Card[];
}

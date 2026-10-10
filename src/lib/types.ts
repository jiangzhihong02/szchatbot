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
  /** 穩定識別碼 —— 譯文疊層以此為鍵。**勿用顯示名當身份**：改名會讓譯文靜默丟失。 */
  id: string;
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

/** 口岸的通關方式鍵（文案在 i18n/messages.ts 的 engine.borderMode）。 */
export type BorderMode = "rail" | "coach" | "car" | "walk" | "hsr";

/**
 * 實時排隊等級 —— 香港入境處公開數據的三級狀態，另加維護與未開放。
 * ⚠️ `closed` 與 `normal` 是**兩件相反的事**：沙頭角現在就回傳「未開放」。
 *    把它當成「暢通」渲染，比不顯示更糟。
 */
export type QueueLevel = "normal" | "busy" | "veryBusy" | "maintenance" | "closed";

/**
 * 香港入境處公開數據實際提供的管制站代碼。
 * 放在 `types.ts` 是因為它是**共享詞彙**：`BorderData` 與排隊 adapter 都要用它，
 * 而把它拆去 runtime 模組會造成循環 import。
 * ⚠️ 這也讓「代碼必須是真的」從測試斷言升級成**型別**——打錯字編譯就過不了。
 */
export const BORDER_LIVE_CODES = ["HYW", "HZM", "LMC", "LSC", "LWS", "MKT", "SBC", "STK"] as const;
export type BorderLiveCode = (typeof BORDER_LIVE_CODES)[number];

/**
 * 一個深港口岸。
 * ⚠️ 只裝**結構**（方式鍵、時刻）；面向使用者的文案由前端按語言渲染。
 * `hours` 是例外：時刻是數字，三語相同，故不入譯文疊層。
 */
export interface BorderData {
  /** 穩定識別碼 —— 譯文疊層以此為鍵。 */
  id: string;
  /** 香港入境處公開數據的管制站代碼；無實時數據者為 null（如高鐵西九龍）。 */
  liveCode: BorderLiveCode | null;
  nameHk: string;
  nameSz?: string;
  modes: BorderMode[];
  hours: string;
  hkAccess: string;
  szAccess: string;
  note: string;
  tip?: string;
}

/** 口岸卡：靜態口岸資料 + 實時排隊等級（取不到資料時為 null，前端不顯示徽章）。 */
export interface BorderCardData {
  borders: BorderData[];
  queue: Partial<Record<BorderLiveCode, QueueLevel>> | null;
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
  | { type: "dealList"; data: DealData[] }
  | { type: "border"; data: BorderCardData };

export type CardType = Card["type"];

import type { FoodData } from "../types";

/**
 * 精选美食。来源：research/03-shenzhen-content.md。价格为量级参考。
 * featured=true 的 4 项进入首发「找美食」清单卡（契约要求 3–4 家）；
 * 其余保留，供后续搜索 / 换一批使用。
 *
 * `id` 是**穩定識別碼**，譯文疊層（`data/i18n-generated.ts`）以它為鍵 —— 改 `name` 不會影響譯文。
 */
export const FOODS: FoodData[] = [
  { id: "dongmen-street-snacks", name: "東門老街小食", area: "羅湖・東門", category: "廣式小吃 / 街頭小吃", mustTry: "牛雜、腸粉、烤生蠔、糖水", priceLevel: "$", priceRMB: "20–40", featured: true },
  { id: "wonton-noodles-roast", name: "廣式雲吞麵 / 燒臘", area: "羅湖・蔡屋圍 / 向西村", category: "廣府菜", mustTry: "鮮蝦雲吞麵、燒鵝、叉燒", priceLevel: "$", priceRMB: "30–60" },
  { id: "chaoshan-congee", name: "潮汕砂鍋粥", area: "羅湖・向西村 / 福田・新村", category: "潮汕菜", mustTry: "蝦蟹砂鍋粥、滷水拼盤、蠔仔烙", priceLevel: "$$", priceRMB: "100–110", featured: true },
  { id: "chaoshan-braised-goose", name: "潮汕滷鵝 / 打冷", area: "福田・皇庭廣場 / 羅湖・KK Mall", category: "潮汕菜", mustTry: "獅頭鵝滷水拼盤、鵝腸、普寧炸豆腐", priceLevel: "$$", priceRMB: "80–150" },
  { id: "cantonese-dim-sum", name: "粵式早茶 / 點心", area: "羅湖 / 福田（口岸沿線）", category: "粵菜・飲茶", mustTry: "蝦餃、金沙海蝦紅米腸、酥皮叉燒包", priceLevel: "$$", priceRMB: "40–130", featured: true },
  { id: "shekou-seafood", name: "蛇口海上世界海鮮", area: "南山・蛇口", category: "海鮮", mustTry: "清蒸海魚、椒鹽海蝦、生蠔", priceLevel: "$$–$$$", priceRMB: "100–250", featured: true },
  { id: "hakka-longgang", name: "客家菜（龍崗 / 甘坑）", area: "龍崗・甘坑古鎮", category: "客家菜", mustTry: "鹽焗雞、梅菜扣肉、客家釀豆腐、窯雞", priceLevel: "$$", priceRMB: "60–90" },
  { id: "longgang-poon-choi", name: "龍崗大盆菜", area: "龍崗 / 深圳東部圍村", category: "客家菜・節慶", mustTry: "圍村盆菜（紅燜豬肉、山珍層層疊）", priceLevel: "$$", priceRMB: "按盆計，需預訂" },
  { id: "guangming-squab", name: "光明乳鴿", area: "光明區", category: "深圳本地特產", mustTry: "紅燒乳鴿", priceLevel: "$$", priceRMB: "50–80" },
  { id: "shajing-oysters-nanao-abalone", name: "沙井蠔 / 南澳鮑魚", area: "寶安・沙井 / 大鵬・南澳", category: "深圳本地特產", mustTry: "炭烤生蠔、清蒸沙井蠔、鹽焗鮑魚", priceLevel: "$$", priceRMB: "60–150" },
  { id: "coconut-chicken-hotpot", name: "椰子雞火鍋", area: "羅湖 / 福田", category: "深圳流行菜", mustTry: "椰子雞煲、竹笙、文昌雞", priceLevel: "$$", priceRMB: "60–90" },
  { id: "night-market-bbq", name: "深圳夜市燒烤 / 宵夜", area: "羅湖・東門 / 南山・海上世界", category: "宵夜", mustTry: "炭烤生蠔、烤魷魚、砂鍋粥", priceLevel: "$$", priceRMB: "60–120" },
];

/** 首发「找美食」清单卡的 3–4 家（契约要求）。 */
export function featuredFoods(): FoodData[] {
  return FOODS.filter((f) => f.featured);
}

import type { RouteData, FoodData } from "../types";

/** 预设旅游路线（深圳）。固定格式呈现，点击预设按钮即可返回。 */
export const ROUTES: RouteData[] = [
  {
    id: "foodie-old-town",
    title: "深圳老城美食一日遊",
    theme: "美食",
    durationHours: 6,
    bestFor: "情侶 / 二人世界、吃貨",
    tips: "避開中午高峰，老街小店多，建議多人分食多嚐幾樣。",
    stops: [
      { name: "東門老街", area: "羅湖", desc: "老字號雲吞麵、腸粉、糖水街", type: "food" },
      { name: "蔡屋圍", area: "羅湖", desc: "本地燒臘與潮汕砂鍋粥", type: "food" },
      { name: "深業上城", area: "福田", desc: "飯後散步 + 文創小店", type: "shop" },
    ],
  },
  {
    id: "family-fun",
    title: "親子樂園歡樂日",
    theme: "親子",
    durationHours: 8,
    bestFor: "帶小孩的家庭",
    tips: "樂園建議提前網上購親子套票；備防曬與小孩水壺。",
    stops: [
      { name: "歡樂谷", area: "南山", desc: "機動遊戲 + 兒童專區", type: "sight" },
      { name: "歡樂海岸", area: "南山", desc: "海濱餐廳午餐、燈光水秀", type: "food" },
      { name: "深圳人才公園", area: "南山", desc: "傍晚散步看海景", type: "sight" },
    ],
  },
  {
    id: "art-coastal",
    title: "文藝海濱慢行",
    theme: "文藝",
    durationHours: 5,
    bestFor: "喜歡文藝、拍照的朋友",
    stops: [
      { name: "海上世界", area: "南山", desc: "明華輪、藝術街區", type: "sight" },
      { name: "海上世界文化藝術中心", area: "南山", desc: "設計展覽、海景書店", type: "sight" },
      { name: "蛇口漁街", area: "南山", desc: "海鮮晚餐", type: "food" },
    ],
  },
];

/** 预设美食推荐 */
export const FOODS: FoodData[] = [
  { name: "東門腸粉", area: "羅湖·東門", category: "廣式小吃", mustTry: "鮮蝦腸粉", priceLevel: "$" },
  { name: "潮汕砂鍋粥", area: "羅湖·蔡屋圍", category: "潮汕菜", mustTry: "蟹肉粥", priceLevel: "$$" },
  { name: "蛇口海鮮", area: "南山·蛇口", category: "海鮮", mustTry: "清蒸海上鮮", priceLevel: "$$$" },
  { name: "客家盆菜", area: "龍崗", category: "客家菜", mustTry: "圍村盆菜", priceLevel: "$$" },
];

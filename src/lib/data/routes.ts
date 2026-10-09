import type { RouteData } from "../types";

/**
 * 预设旅游路线（深圳）。来源：.scratch/.../research/03-shenzhen-content.md
 * pool=day → 「一日遊路線」按钮；pool=family → 「親子路線」按钮。各池支持「換一條」。
 *
 * 站點座標由 scripts/geocode-stops.ts 經高德 POI 搜索一次取得並烘入（票 10 路線地圖）。
 */
export const ROUTES: RouteData[] = [
  {
    id: "foodie-old-town",
    title: "羅湖老城覓食一日遊",
    theme: "美食",
    durationHours: 6,
    area: "羅湖",
    bestFor: "情侶 / 三五知己、吃貨、想一次過嚐多款小吃",
    tips: "避開 12:00–14:00 及 18:00–20:00 兩個高峰；東門小吃多為一人份，建議 3–4 人分食多點幾款。",
    pool: "day",
    stops: [
      { name: "東門老街 / 東門町美食街", area: "羅湖", desc: "老街牌坊、騎樓街景；東門町聚集牛雜、烤生蠔、腸粉、糖水等小吃", type: "food", lng: 114.115817, lat: 22.544098 },
      { name: "向西村 / 蔡屋圍", area: "羅湖", desc: "潮汕砂鍋粥、滷水拼盤、燒臘；本地人宵夜場", type: "food", lng: 114.125767, lat: 22.539792 },
      { name: "羅湖萬象城", area: "羅湖", desc: "飯後逛商場、買手信（Ole' 超市）；地鐵大劇院站直達", type: "shop", lng: 114.11068, lat: 22.53923 },
      { name: "KK TIME / 萬象食家", area: "羅湖", desc: "新式餐飲樓層，可作宵夜或甜品收尾", type: "food", lng: 114.110613, lat: 22.561698 },
    ],
  },
  {
    id: "art-coastal",
    title: "蛇口文藝海濱慢行（半日）",
    theme: "文藝",
    durationHours: 5,
    area: "南山",
    bestFor: "情侶、喜歡拍照與設計展的朋友",
    tips: "建議下午 3 點後出發，看完展正好趕上日落與海上世界音樂噴泉；噴泉一般 19:00–22:00 每半小時一場。",
    pool: "day",
    stops: [
      { name: "海上世界文化藝術中心（設計互聯）", area: "南山", desc: "海景建築、設計與當代藝術展、海景書店", type: "sight", lng: 113.916901, lat: 22.4802 },
      { name: "明華輪 / 海上世界廣場", area: "南山", desc: "地標郵輪、噴泉表演、露天餐飲", type: "sight", lng: 113.917846, lat: 22.482264 },
      { name: "蛇口漁街 / 海上世界食街", area: "南山", desc: "海鮮晚餐：砂鍋粥、蒸海鮮、生蠔", type: "food", lng: 113.927226, lat: 22.488257 },
      { name: "蛇口郵輪母港 / K11 ECOAST", area: "南山", desc: "海濱散步與新商場（K11 ECOAST 一帶）", type: "shop", lng: 113.913338, lat: 22.468754 },
    ],
  },
  {
    id: "hakka-longgang",
    title: "龍崗客家古鎮一日遊",
    theme: "文化",
    durationHours: 7,
    area: "龍崗",
    bestFor: "想避開人潮、喜歡古村與客家菜的家庭、長輩同行",
    tips: "甘坑古鎮街區免費、全日開放；地鐵 10 號線甘坑站 B 出口步行約 15 分鐘。個別場館（二十四史書院、鳳凰谷）另收費。",
    pool: "day",
    stops: [
      { name: "甘坑客家小鎮（甘坑古鎮）", area: "龍崗", desc: "客家圍村、燈籠街、文創小店；國家 3A 級景區，街區免費", type: "sight", lng: 114.103888, lat: 22.656694 },
      { name: "甘坑客家菜餐廳", area: "龍崗", desc: "鹽焗雞、客家釀豆腐、梅菜扣肉、窯雞", type: "food", lng: 114.1045, lat: 22.6572 },
      { name: "大芬油畫村", area: "龍崗", desc: "油畫街區、畫廊，可訂製畫作；免費", type: "shop", lng: 114.136236, lat: 22.609661 },
    ],
  },
  {
    id: "east-coast-dapeng",
    title: "東部海岸大鵬一日遊",
    theme: "海岸",
    durationHours: 10,
    area: "大鵬新區 / 鹽田",
    bestFor: "喜歡海、想逃離市區的年輕人與家庭（建議自駕或報一日團）",
    tips: "路程遠，回程易塞車。地鐵 2/8 號線已延伸至溪涌站（2025 年底通車），再接巴士入大鵬。較場尾沙灘有急流、無救生員，切勿下水。",
    pool: "day",
    stops: [
      { name: "大鵬所城", area: "大鵬", desc: "明清海防古城、將軍府；免費", type: "sight", lng: 114.512449, lat: 22.595213 },
      { name: "較場尾", area: "大鵬", desc: "海邊民宿群、沙灘日落；免費", type: "sight", lng: 114.509678, lat: 22.588178 },
      { name: "南澳海鮮 / 楊梅坑", area: "大鵬", desc: "南澳海鮮街；楊梅坑免費，可海濱騎行", type: "food", lng: 114.571177, lat: 22.544965 },
      { name: "鹽田海鮮街 / 大小梅沙", area: "鹽田", desc: "回程順路的海鮮街與海濱公園", type: "food", lng: 114.278706, lat: 22.585298 },
    ],
  },
  {
    id: "halfday-futian-cbd",
    title: "福田 CBD 半日：展覽 + 商圈",
    theme: "文藝",
    durationHours: 4,
    area: "福田",
    bestFor: "由福田口岸過關、只有半日時間的旅客",
    tips: "深圳市當代藝術與城市規劃館免門票、免預約，逢週一閉館；旁邊就是市民中心與蓮花山公園。",
    pool: "day",
    stops: [
      { name: "深圳市當代藝術與城市規劃館", area: "福田", desc: "免費常設展（城市規劃、改革開放展）；週一閉館", type: "sight", lng: 114.061828, lat: 22.545783 },
      { name: "蓮花山公園", area: "福田", desc: "登頂看福田 CBD 天際線；免費", type: "sight", lng: 114.058673, lat: 22.553594 },
      { name: "COCO Park / 卓悅中心", area: "福田", desc: "晚餐、天台酒吧、蔦屋書店", type: "food", lng: 114.065277, lat: 22.536805 },
    ],
  },
  {
    id: "family-safari-park",
    title: "南山親子主題樂園日",
    theme: "親子",
    durationHours: 8,
    area: "南山",
    bestFor: "帶 3–12 歲小孩的家庭",
    tips: "樂園門票提前網上買通常比現場便宜，且可免排隊；帶防曬、帽子、小孩水壺。1.2 米以下兒童多數樂園免費。",
    pool: "family",
    stops: [
      { name: "深圳野生動物園", area: "南山", desc: "放養式動物園，有海洋動物館與遊樂區；09:30–18:00", type: "sight", lng: 113.972146, lat: 22.596039 },
      { name: "歡樂海岸", area: "南山", desc: "海濱餐飲街 + 水舞燈光秀，適合午餐與傍晚散步", type: "food", lng: 113.987914, lat: 22.523405 },
      { name: "深圳人才公園", area: "南山", desc: "看深圳灣夜景、看春筍大廈燈光，免費", type: "sight", lng: 113.946958, lat: 22.511353 },
    ],
  },
  {
    id: "family-happy-valley",
    title: "華僑城親子機動遊戲日",
    theme: "親子",
    durationHours: 8,
    area: "南山",
    bestFor: "想玩機動遊戲的家庭 / 青少年",
    tips: "歡樂谷成人票約 ¥228、兒童及長者票約 ¥130；70 歲以上、1.2 米以下免費。夏天建議下午入場玩到夜場。",
    pool: "family",
    stops: [
      { name: "深圳歡樂谷", area: "南山", desc: "機動遊戲 + 兒童專區 + 夜場表演", type: "sight", lng: 113.980295, lat: 22.54159 },
      { name: "華僑城創意文化園 OCT-LOFT", area: "南山", desc: "舊廠房文創街區，咖啡、書店、小店；免費", type: "sight", lng: 113.993477, lat: 22.537349 },
      { name: "歡樂海岸", area: "南山", desc: "晚餐 + 水舞秀", type: "food", lng: 113.987914, lat: 22.523405 },
    ],
  },
];

export function routesByPool(pool: RouteData["pool"]): RouteData[] {
  return ROUTES.filter((r) => r.pool === pool);
}

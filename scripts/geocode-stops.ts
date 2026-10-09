// 一次性開發腳本：把路線各站點地理編碼成經緯度（供烘進 data/routes.ts）。
// 執行：AMAP_KEY=xxx npx tsx scripts/geocode-stops.ts
//
// 註：高德資料庫為**簡體**，而站名為繁體，故先查 POI 搜索（place/text）並帶簡體檢索詞，
// 失敗才退回地理編碼（geocode/geo）。
import { ROUTES } from "../src/lib/data/routes";

const KEY = process.env.AMAP_KEY;
if (!KEY) {
  console.error("缺少 AMAP_KEY 環境變數");
  process.exit(1);
}

/** 繁體站名 → 簡體檢索詞（高德為簡體庫）。 */
const QUERY: Record<string, string> = {
  "東門老街 / 東門町美食街": "东门老街",
  "向西村 / 蔡屋圍": "向西村 罗湖",
  "羅湖萬象城": "深圳万象城",
  "KK TIME / 萬象食家": "万象食家 罗湖",
  "海上世界文化藝術中心（設計互聯）": "海上世界文化艺术中心",
  "明華輪 / 海上世界廣場": "海上世界 南山",
  "蛇口漁街 / 海上世界食街": "蛇口渔街",
  "蛇口郵輪母港 / K11 ECOAST": "蛇口邮轮母港",
  "甘坑客家小鎮（甘坑古鎮）": "甘坑客家小镇",
  "甘坑客家菜餐廳": "甘坑古镇",
  "大芬油畫村": "大芬油画村",
  "大鵬所城": "大鹏所城",
  "較場尾": "较场尾",
  "南澳海鮮 / 楊梅坑": "杨梅坑",
  "鹽田海鮮街 / 大小梅沙": "盐田海鲜街",
  "深圳市當代藝術與城市規劃館": "深圳市当代艺术与城市规划馆",
  "蓮花山公園": "莲花山公园",
  "COCO Park / 卓悅中心": "卓悦中心 福田",
  "深圳野生動物園": "深圳野生动物园",
  "歡樂海岸": "欢乐海岸 南山",
  "深圳人才公園": "深圳人才公园",
  "深圳歡樂谷": "深圳欢乐谷",
  "華僑城創意文化園 OCT-LOFT": "华侨城创意文化园",
};

async function poi(query: string): Promise<{ loc: string | null; info: string }> {
  const url = `https://restapi.amap.com/v3/place/text?key=${KEY}&keywords=${encodeURIComponent(
    query
  )}&city=440300&citylimit=true&offset=1&page=1`;
  const j = (await (await fetch(url)).json()) as {
    status: string;
    info?: string;
    pois?: Array<{ location: string; name: string }>;
  };
  if (j.status === "1" && j.pois?.length) return { loc: j.pois[0].location, info: j.info ?? "OK" };
  return { loc: null, info: j.info ?? "?" };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const names = [...new Set(ROUTES.flatMap((r) => r.stops.map((s) => s.name)))];
  console.log(`共 ${names.length} 個站點名稱\n`);
  for (const n of names) {
    const q = QUERY[n] ?? n;
    const { loc, info } = await poi(q);
    console.log(loc ? `OK   ${loc}\t"${n}"` : `MISS\t\t"${n}"  (query: ${q}, info: ${info})`);
    await sleep(400); // 高德免費版有 QPS 限制，拉開間隔
  }
}

main();

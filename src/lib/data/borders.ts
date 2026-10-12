import type { BorderData } from "../types";

/**
 * 深港口岸（票 12）。**繁體為正本**；`zh-Hans` 與 `en` 在 `data/i18n-generated.ts` 疊加。
 *
 * ⚠️ 開放時間與接駁**會變動**——這裡是靜態種子資料，卡片尾固定附「以官方為準」。
 *
 * ⚠️ **皇崗／新皇崗已於 2026-10-12 06:30 啟用並補上**（見下方 `huanggang`）：同日舊皇崗
 *    旅檢與港方落馬洲管制站旅檢停運。啟用經港府 2026-10-09 聯合公告確認（info.gov.hk），
 *    不再是「拿不到運營方確認」的狀態。入境處實時數據的管制站代碼**由預期的 `LMC` 改為
 *    實測的 `HGP`**（落馬洲 `LMC` 已自公開數據消失）——這正是「啟用後再補、以實測為準」
 *    的理由：先前照新聞假設的 `LMC` 是錯的。
 *
 * ⚠️ **不寫跨境巴士路線編號**：查到的編號來自聚合站與巴士迷 wiki，非城巴／九巴／
 *    運輸署的原始頁面；旅客照一個錯的編號去等車，是這張卡最不該犯的錯。
 *    鐵路站名與地鐵線可查，故寫具體；巴士只寫定性的「跨境巴士」。
 *
 * `liveCode` 是香港入境處公開數據的管制站代碼（見 `border-live-core.ts`）。
 */
export const BORDERS: BorderData[] = [
  {
    id: "lo-wu",
    liveCode: "LWS",
    nameHk: "羅湖",
    nameSz: "羅湖",
    modes: ["rail"],
    hours: "06:30–24:00",
    hkAccess: "東鐵線 羅湖站（終點站）",
    szAccess: "深圳地鐵 1 號線 羅湖站",
    note: "最方便轉地鐵，人流最大",
    tip: "繁忙時段輪候較長；假日建議避開早上 7:30–9:30",
  },
  {
    id: "futian",
    liveCode: "LSC",
    nameHk: "落馬洲支線",
    nameSz: "福田口岸",
    modes: ["rail"],
    hours: "06:30–22:30",
    hkAccess: "東鐵線 落馬洲站（須在上水或大圍轉乘支線）",
    szAccess: "深圳地鐵 4 號線／10 號線 福田口岸站",
    note: "直入福田 CBD，港人最常用",
    tip: "東鐵線須轉乘支線；22:30 收關，夜返要改走其他口岸",
  },
  {
    id: "shenzhen-bay",
    liveCode: "SBC",
    nameHk: "深圳灣",
    nameSz: "深圳灣",
    modes: ["coach", "car"],
    hours: "06:30–24:00",
    hkAccess: "跨境巴士或私家車（香港側無鐵路）",
    szAccess: "深圳地鐵 13 號線 深圳灣口岸站",
    note: "香港側無鐵路，靠巴士或私家車",
    tip: "旅客通道只到午夜（24 小時的是貨檢）；私家車須辦一次性配額",
  },
  {
    id: "huanggang",
    liveCode: "HGP",
    nameHk: "新皇崗",
    nameSz: "皇崗",
    modes: ["coach", "car"],
    hours: "00:00–24:00",
    hkAccess: "專營巴士或專線小巴直達口岸大樓（設通宵線）",
    szAccess: "深圳地鐵 7 號線 皇崗口岸站",
    note: "唯一 24 小時陸路口岸，一地兩檢一次放行",
    tip: "2026-10-12 啟用，取代落馬洲／舊皇崗；舊「皇巴」已停辦，改乘專營巴士或小巴直入大樓",
  },
  {
    id: "liantang",
    liveCode: "HYW",
    nameHk: "香園圍",
    nameSz: "蓮塘",
    modes: ["coach", "car", "walk"],
    hours: "07:00–22:00",
    hkAccess: "跨境巴士、私家車或步行",
    szAccess: "深圳地鐵 2 號線 蓮塘口岸站",
    note: "最新、客流最少，可步行過關",
    tip: "客流最少，適合不想排隊；但香港側公共交通班次較疏",
  },
  {
    id: "man-kam-to",
    liveCode: "MKT",
    nameHk: "文錦渡",
    nameSz: "文錦渡",
    modes: ["coach", "car"],
    hours: "07:00–22:00",
    hkAccess: "跨境巴士",
    szAccess: "深圳地鐵 9 號線 文錦站",
    note: "人最少、通關最快",
    tip: "車位極少（約 30 個），不建議自駕前往",
  },
  {
    id: "west-kowloon",
    liveCode: null,
    nameHk: "高鐵西九龍站",
    nameSz: "深圳北 / 福田（高鐵站）",
    modes: ["hsr"],
    hours: "06:30–23:30",
    hkAccess: "港鐵 屯馬線 柯士甸站／東涌線 九龍站",
    szAccess: "高鐵直達 福田（約 14 分鐘）或 深圳北（約 17 分鐘）",
    note: "坐高鐵，最快但須購票",
    tip: "車站開放 06:00–24:00；實名制須預先購票，開車前 30 分鐘停止驗票",
  },
];

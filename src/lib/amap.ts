/**
 * 高德 Web 服務 —— **伺服器專用**。
 * key、base URL、fetch、錯誤 → null 的語義全部收在這裡；天氣與靜態地圖兩個 adapter 共用這一個 interface。
 *
 * ⚠️「key 絕不進瀏覽器」靠**兩層結構**，不是靠註解：
 *    1. `staticMapQuery()` 回傳的查詢字串**不含 key**（它根本看不到 key）—— 可安全落日誌或當快取鍵；
 *    2. 唯一帶 key 的出口是 `fetchStaticMapPng()`，只有伺服器路由 import 它。
 *    底下再加一道載入期斷言，若哪天被客戶端模組拖進 bundle 會立刻炸。
 *    （另：`AMAP_KEY` 沒有 `NEXT_PUBLIC_` 前綴，本來就不會被 inline 進客戶端 bundle。）
 */

if (typeof window !== "undefined") {
  throw new Error("lib/amap 是伺服器專用模組，不可被客戶端 import。");
}

const BASE = "https://restapi.amap.com/v3";

/** 是否已配置 key（不回傳 key 本身）。 */
export function hasAmapKey(): boolean {
  return !!process.env.AMAP_KEY;
}

/** 取高德 JSON。無 key / HTTP 失敗 / `status !== "1"` → null（呼叫方據此回退）。 */
export async function amapJson<T extends { status?: string }>(
  path: string,
  params: Record<string, string>
): Promise<T | null> {
  const key = process.env.AMAP_KEY;
  if (!key) return null;
  try {
    const res = await fetch(`${BASE}${path}?${new URLSearchParams({ key, ...params })}`);
    if (!res.ok) return null;
    const json = (await res.json()) as T;
    return json.status === "1" ? json : null;
  } catch {
    return null;
  }
}

export interface StaticMapOptions {
  /** 例如 `750*380` */
  size: string;
  zoom: number;
  /** `lng,lat` */
  center: string;
  /** `mid,0x0E7490,1:lng,lat|…` */
  markers: string;
  /** `weight,color,transparency,fill,fillTransparency:lng,lat;…` */
  path: string;
}

/** 靜態地圖的查詢字串 —— **不含 key**，故可安全地當快取鍵或落日誌。 */
export function staticMapQuery(o: StaticMapOptions): string {
  return [`size=${o.size}`, `zoom=${o.zoom}`, `center=${o.center}`, `markers=${o.markers}`, `paths=${o.path}`].join("&");
}

/** **唯一**帶 key 的出口：取靜態地圖 PNG 位元組。無 key / HTTP 失敗 → null。 */
export async function fetchStaticMapPng(query: string): Promise<ArrayBuffer | null> {
  const key = process.env.AMAP_KEY;
  if (!key) return null;
  try {
    const res = await fetch(`${BASE}/staticmap?key=${key}&${query}`);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

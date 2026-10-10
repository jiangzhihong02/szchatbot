import { amapSig } from "./amap-sign";

/**
 * 高德 Web 服務 —— **伺服器專用**。
 * key、私鑰、base URL、fetch、錯誤 → null 的語義全部收在這裡；天氣與靜態地圖兩個 adapter 共用這一個 interface。
 *
 * ⚠️「key 與私鑰絕不進瀏覽器」靠**兩層結構**，不是靠註解：
 *    1. `staticMapParams()` 回傳的參數表**不含 key**（它根本看不到 key）—— 可安全落日誌或當快取鍵；
 *    2. 唯一帶 key 的出口是 `fetchStaticMapPng()`，只有伺服器路由 import 它。
 *    底下再加一道載入期斷言，若哪天被客戶端模組拖進 bundle 會立刻炸。
 *    （另：`AMAP_KEY` / `AMAP_SECRET` 都沒有 `NEXT_PUBLIC_` 前綴，本來就不會被 inline 進客戶端 bundle。）
 *
 * **數字簽名（選配）**：設了 `AMAP_SECRET` 就附 `sig`，沒設就照舊送。
 * 開了之後，**洩漏的 key 在沒有私鑰時無法使用**——比輪換 key 徹底（輪換後的新 key
 * 一樣躺在 .env.local 裡）。兩側必須一致：控制台啟用了數字簽名、而這裡沒填私鑰，
 * 全部請求會以 10007 INVALID_USER_SIGNATURE 失敗。
 */

if (typeof window !== "undefined") {
  throw new Error("lib/amap 是伺服器專用模組，不可被客戶端 import。");
}

const BASE = "https://restapi.amap.com/v3";

/** 是否已配置 key（不回傳 key 本身）。 */
export function hasAmapKey(): boolean {
  return !!process.env.AMAP_KEY;
}

/**
 * 參數表 → **要送出去**的查詢字串；有私鑰就附上 sig。
 * 哈希與編碼刻意分開：官方要求用原始值哈希、用 urlencode 送出，而 sig 算完才追加，
 * 故不進哈希輸入（`amapSig` 另外再過濾一次，兩道保險）。
 */
function signedQuery(params: Record<string, string>): string {
  const wire = new URLSearchParams(params).toString();
  const secret = process.env.AMAP_SECRET;
  return secret ? `${wire}&sig=${amapSig(params, secret)}` : wire;
}

/** 取高德 JSON。無 key / HTTP 失敗 / `status !== "1"` → null（呼叫方據此回退）。 */
export async function amapJson<T extends { status?: string }>(
  path: string,
  params: Record<string, string>
): Promise<T | null> {
  const key = process.env.AMAP_KEY;
  if (!key) return null;
  try {
    const res = await fetch(`${BASE}${path}?${signedQuery({ key, ...params })}`);
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

/**
 * 靜態地圖的請求參數 —— **不含 key**，故可安全地當快取鍵或落日誌。
 * 回傳參數表而非字串：有私鑰時要從同一份真相源同時派生「哈希用的原始值」與
 * 「送出去的編碼值」，先拼成字串再解析回來既繞路又容易走樣。
 */
export function staticMapParams(o: StaticMapOptions): Record<string, string> {
  return {
    size: o.size,
    zoom: String(o.zoom),
    center: o.center,
    markers: o.markers,
    paths: o.path,
  };
}

/** **唯一**帶 key 的出口：取靜態地圖 PNG 位元組。無 key / HTTP 失敗 → null。 */
export async function fetchStaticMapPng(params: Record<string, string>): Promise<ArrayBuffer | null> {
  const key = process.env.AMAP_KEY;
  if (!key) return null;
  try {
    const res = await fetch(`${BASE}/staticmap?${signedQuery({ ...params, key })}`);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

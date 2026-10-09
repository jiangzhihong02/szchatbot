import { cacheLife } from "next/cache";
import { ROUTES } from "./data/routes";
import type { RouteStop } from "./types";
import { amapJson, hasAmapKey, staticMapQuery } from "./amap";

/**
 * 路線地圖（票 10）—— 伺服器端。
 * 用高德路徑規劃（駕車）逐段算真實走法，再組出**不含 key** 的靜態地圖查詢字串。
 * 帶 key 的取圖在 `amap.fetchStaticMapPng()`，故本檔輸出可以安全落日誌／當快取鍵。
 */

type DrivingResponse = {
  status?: string;
  route?: { paths?: Array<{ steps?: Array<{ polyline?: string }> }> };
};

async function drivingPolyline(a: RouteStop, b: RouteStop): Promise<string[] | null> {
  const j = await amapJson<DrivingResponse>("/direction/driving", {
    origin: `${a.lng},${a.lat}`,
    destination: `${b.lng},${b.lat}`,
    extensions: "base",
  });
  const steps = j?.route?.paths?.[0]?.steps;
  if (!steps?.length) return null;
  return steps.flatMap((s) => (s.polyline ?? "").split(";").filter(Boolean));
}

/** 抽稀到最多 max 點，控制 URL 長度。 */
function sample<T>(arr: T[], max: number): T[] {
  if (arr.length <= max) return arr;
  const step = arr.length / max;
  const out: T[] = [];
  for (let i = 0; i < max; i++) out.push(arr[Math.floor(i * step)]);
  out[out.length - 1] = arr[arr.length - 1];
  return out;
}

function zoomFor(stops: RouteStop[]): number {
  const lngs = stops.map((s) => s.lng);
  const lats = stops.map((s) => s.lat);
  const span = Math.max(Math.max(...lngs) - Math.min(...lngs), Math.max(...lats) - Math.min(...lats));
  if (span > 0.35) return 10;
  if (span > 0.15) return 11;
  if (span > 0.06) return 12;
  return 13;
}

/**
 * 逐段駕車路徑規劃 → 靜態地圖的**查詢字串**（不含 key）。無 key / 站點不足 → null。
 * `use cache`：路線與路網短期不變，快取一週。
 */
export async function buildRouteMapQuery(routeId: string): Promise<string | null> {
  "use cache";
  cacheLife({ revalidate: 604800 });

  const route = ROUTES.find((r) => r.id === routeId);
  if (!hasAmapKey() || !route || route.stops.length < 2) return null;

  const pts: string[] = [];
  for (let i = 0; i < route.stops.length - 1; i++) {
    const a = route.stops[i];
    const b = route.stops[i + 1];
    const poly = await drivingPolyline(a, b);
    if (poly?.length) pts.push(...poly);
    else pts.push(`${a.lng},${a.lat}`, `${b.lng},${b.lat}`); // 規劃失敗則退回直線
  }

  const lngs = route.stops.map((s) => s.lng);
  const lats = route.stops.map((s) => s.lat);
  const center = `${((Math.min(...lngs) + Math.max(...lngs)) / 2).toFixed(6)},${(
    (Math.min(...lats) + Math.max(...lats)) / 2
  ).toFixed(6)}`;

  return staticMapQuery({
    size: "750*380",
    zoom: zoomFor(route.stops),
    center,
    markers: route.stops.map((s, i) => `mid,0x0E7490,${i + 1}:${s.lng},${s.lat}`).join("|"),
    path: `6,0x0E7490,1,,:${sample(pts, 90).join(";")}`,
  });
}

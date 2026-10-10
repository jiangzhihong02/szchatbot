import { ROUTES } from "@/lib/data/routes";
import { buildRouteMapParams } from "@/lib/route-map";
import { fetchStaticMapPng } from "@/lib/amap";

/**
 * 路線地圖圖片代理（票 10）。
 * 前端用 `<img src="/api/route-map?routeId=xxx">`。
 * 帶 key 的取圖收在 `amap.fetchStaticMapPng()`，那是**唯一帶 key 的出口**；
 * `amap.ts` 另有載入期斷言（被客戶端模組拖進 bundle 會立刻炸），
 * 且 `AMAP_KEY` 沒有 `NEXT_PUBLIC_` 前綴，本來就不會被 inline。
 */
export async function GET(req: Request): Promise<Response> {
  const id = new URL(req.url).searchParams.get("routeId");
  if (!id || !ROUTES.some((r) => r.id === id)) {
    return new Response("route not found", { status: 404 });
  }

  const params = await buildRouteMapParams(id);
  if (!params) return new Response("map unavailable", { status: 404 });

  const png = await fetchStaticMapPng(params);
  if (!png) return new Response("map unavailable", { status: 404 });

  return new Response(png, {
    headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=604800, immutable" },
  });
}

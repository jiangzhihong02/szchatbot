import { ROUTES } from "@/lib/data/routes";
import { buildRouteMapQuery } from "@/lib/route-map";
import { fetchStaticMapPng } from "@/lib/amap";

/**
 * 路線地圖圖片代理（票 10）。
 * 前端用 `<img src="/api/route-map?routeId=xxx">`。
 * 本路由是**唯一**把高德 key 帶出去的地方（透過 `amap.fetchStaticMapPng`），
 * 而該模組有 `server-only`，所以 key 不可能被打進瀏覽器。
 */
export async function GET(req: Request): Promise<Response> {
  const id = new URL(req.url).searchParams.get("routeId");
  if (!id || !ROUTES.some((r) => r.id === id)) {
    return new Response("route not found", { status: 404 });
  }

  const query = await buildRouteMapQuery(id);
  if (!query) return new Response("map unavailable", { status: 404 });

  const png = await fetchStaticMapPng(query);
  if (!png) return new Response("map unavailable", { status: 404 });

  return new Response(png, {
    headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=604800, immutable" },
  });
}

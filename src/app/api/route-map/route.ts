import { ROUTES } from "@/lib/data/routes";
import { buildRouteMapUrl } from "@/lib/route-map";

/**
 * 路線地圖圖片代理（票 10）。
 * 前端用 <img src="/api/route-map?routeId=xxx">；本路由在伺服器端帶 key 取高德靜態地圖，
 * **key 不會出現在瀏覽器**。無 key / 路線不存在時回 404，前端據此隱藏圖片。
 */
export async function GET(req: Request): Promise<Response> {
  const id = new URL(req.url).searchParams.get("routeId");
  if (!id || !ROUTES.some((r) => r.id === id)) {
    return new Response("route not found", { status: 404 });
  }

  const url = await buildRouteMapUrl(id);
  if (!url) return new Response("map unavailable", { status: 404 });

  try {
    const res = await fetch(url);
    if (!res.ok) return new Response("map upstream error", { status: 502 });
    const buf = await res.arrayBuffer();
    return new Response(buf, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=604800, immutable",
      },
    });
  } catch {
    return new Response("map fetch failed", { status: 502 });
  }
}

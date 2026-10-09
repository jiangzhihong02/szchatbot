import { buildCards, dispatch } from "@/lib/dispatcher";
import type { DispatchOptions } from "@/lib/dispatcher";
import { PRESET_BUTTONS } from "@/lib/presets";
import type { IntentKey } from "@/lib/presets";
import type { Travellers } from "@/lib/types";

/**
 * 意圖分發 API。分發器依賴 Next 執行時（`use cache`）與伺服器端資料，故前端不直接呼叫它。
 *
 * ⚠️ **不收 locale**：分發器只回傳**結構化資料**，文案由前端按語言渲染，
 *    這樣切換語言時既有的卡片才會即時跟著變。
 *
 * 請求：{ text? , intent? , travellers? , routeIndex? }
 * 回應：{ matched, intent?, cards?, needsInput? } —— matched:false 時前端改打 /api/chat。
 */
const INTENTS = new Set<string>(PRESET_BUTTONS.map((b) => b.key));

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });

export async function POST(req: Request): Promise<Response> {
  let body: {
    text?: string;
    intent?: string;
    travellers?: Travellers;
    routeIndex?: number;
  };
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid JSON body" }, 400);
  }

  const opts: DispatchOptions = { travellers: body.travellers, routeIndex: body.routeIndex };

  try {
    // 按鈕：直接給定意圖
    if (typeof body.intent === "string" && INTENTS.has(body.intent)) {
      const intent = body.intent as IntentKey;
      if (intent === "transportDeals" && !opts.travellers) {
        return json({ matched: true, intent, needsInput: "travellers", cards: [] });
      }
      return json({ matched: true, intent, cards: await buildCards(intent, opts) });
    }

    // 手打：走關鍵詞匹配
    if (typeof body.text === "string") {
      return json(await dispatch(body.text, opts));
    }

    return json({ error: "need `text` or `intent`" }, 400);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "dispatch failed";
    return json({ error: msg }, 500);
  }
}

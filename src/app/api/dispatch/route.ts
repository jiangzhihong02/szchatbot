import { dispatch, dispatchIntent } from "@/lib/dispatcher";
import type { DispatchOptions } from "@/lib/dispatch-contract";
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
    // 按鈕與手打共用**同一個**分發入口 —— 「需要出行組合」的規則只在 dispatcher 裡表述一次。
    if (typeof body.intent === "string" && INTENTS.has(body.intent)) {
      return json(await dispatchIntent(body.intent as IntentKey, opts));
    }

    if (typeof body.text === "string") {
      return json(await dispatch(body.text, opts));
    }

    return json({ error: "need `text` or `intent`" }, 400);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "dispatch failed";
    return json({ error: msg }, 500);
  }
}

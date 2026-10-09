import { buildCards, dispatch, PRESET_BUTTONS } from "@/lib/dispatcher";
import type { DispatchOptions, IntentKey } from "@/lib/dispatcher";
import type { Travellers } from "@/lib/types";
import { resolveLocale } from "@/lib/i18n/config";

/**
 * 意圖分發 API。分發器依賴 Next 執行時（`use cache`）與伺服器端資料，
 * 故前端不直接呼叫它，而是打這裡。
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
    locale?: string;
  };
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid JSON body" }, 400);
  }

  const opts: DispatchOptions = { travellers: body.travellers, routeIndex: body.routeIndex };
  // 規則引擎的文案（交通方案 / 優惠項 / 支付提示 / 天氣建議）隨語言。
  const locale = resolveLocale(body.locale);

  try {
    // 按鈕：直接給定意圖
    if (typeof body.intent === "string" && INTENTS.has(body.intent)) {
      const intent = body.intent as IntentKey;
      if (intent === "pricing" && !opts.travellers) {
        return json({ matched: true, intent, needsInput: "travellers", cards: [] });
      }
      return json({ matched: true, intent, cards: await buildCards(intent, opts, locale) });
    }

    // 手打：走關鍵詞匹配
    if (typeof body.text === "string") {
      return json(await dispatch(body.text, opts, locale));
    }

    return json({ error: "need `text` or `intent`" }, 400);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "dispatch failed";
    return json({ error: msg }, 500);
  }
}

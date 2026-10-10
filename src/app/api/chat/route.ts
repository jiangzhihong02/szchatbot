import Anthropic from "@anthropic-ai/sdk";
import { systemPromptFor } from "@/lib/system-prompt";
import { resolveLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { isSameOrigin, forbidden } from "@/lib/same-origin";

/**
 * 自由問答 API（票 04）。
 * 只服務「未命中按鈕／關鍵詞」的自由輸入；確定性路徑不經此處。
 * 串流回傳 Server-Sent Events：每行 `data: {"text": "..."}`，以 `data: [DONE]` 結束。
 *
 * 注：本倉的 cacheComponents 不允許 `runtime` 路由段配置，故不設。
 *     但 `maxDuration` 可以（v16 移除的只有 dynamic / dynamicParams / revalidate / fetchCache）；
 *     設 60s，以免 Vercel 平台預設（可能 10s）截斷流式回答。
 */
export const maxDuration = 60;

// 只讀 app 自己的設定，**顯式**傳給 SDK，避免繼承 shell 裡 Claude Code 的環境。
// （本機 shell 設有 ANTHROPIC_BASE_URL / ANTHROPIC_MODEL / ANTHROPIC_AUTH_TOKEN，
//   指向第三方代理；若讓 SDK 自行讀取，app 會靜默走那條線、用錯模型。）
// 使用者點名的模型：Opus 4.8。可用 APP_ANTHROPIC_MODEL 換（最新為 claude-opus-5）。
const MODEL = process.env.APP_ANTHROPIC_MODEL ?? "claude-opus-4-8";
const BASE_URL = process.env.APP_ANTHROPIC_BASE_URL ?? "https://api.anthropic.com";
const API_KEY = process.env.ANTHROPIC_API_KEY;

type Turn = { role: "user" | "assistant"; content: string };

const SSE_HEADERS = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
} as const;

const sse = (obj: unknown) => `data: ${JSON.stringify(obj)}\n\n`;

/** 單發一串文字（無 key 的降級，或收尾訊息）。 */
function textStream(text: string): Response {
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(sse({ text })));
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });
  return new Response(body, { headers: SSE_HEADERS });
}

export async function POST(req: Request): Promise<Response> {
  // 這是**花錢的**端點：只服務本網站自己的頁面。理由、界線與它的不足見 lib/same-origin。
  if (!isSameOrigin(req.headers)) return forbidden();

  let turns: Turn[];
  let localeRaw: string | undefined;
  try {
    const body = (await req.json()) as { messages?: Turn[]; locale?: string };
    localeRaw = body.locale;
    turns = (body.messages ?? []).filter(
      (m) =>
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0
    );
  } catch {
    return new Response(JSON.stringify({ error: "invalid JSON body" }), { status: 400 });
  }

  // API 要求首條為 user；丟掉開頭的 assistant 訊息。
  const firstUser = turns.findIndex((t) => t.role === "user");
  if (firstUser === -1) {
    return new Response(JSON.stringify({ error: "no user message" }), { status: 400 });
  }
  turns = turns.slice(firstUser).slice(-20); // 只保留最近 20 輪，控制上下文長度

  // 文案（降級 / 拒絕 / 出錯）與 system prompt 都隨界面語言。
  const locale = resolveLocale(localeRaw);
  const m = getMessages(locale);

  if (!API_KEY) {
    return textStream(m.errors.llmNoKey);
  }

  const client = new Anthropic({ apiKey: API_KEY, baseURL: BASE_URL });
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 4096, // 聊天回答刻意簡短；串流下無 HTTP timeout 之虞
    thinking: { type: "adaptive" },
    output_config: { effort: "low" }, // 聊天屬延遲敏感，低 effort 足夠
    system: [{ type: "text", text: systemPromptFor(locale), cache_control: { type: "ephemeral" } }],
    messages: turns.map((t) => ({ role: t.role, content: t.content })),
  });

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(sse({ text: event.delta.text })));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(encoder.encode(sse({ text: m.errors.llmRefusal })));
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch {
        controller.enqueue(encoder.encode(sse({ error: m.errors.llmFailed })));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(body, { headers: SSE_HEADERS });
}

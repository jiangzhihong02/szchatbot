import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";

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
  let turns: Turn[];
  try {
    const body = (await req.json()) as { messages?: Turn[] };
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

  if (!API_KEY) {
    return textStream(
      "（未配置 ANTHROPIC_API_KEY，暫時未能回答自由問題。你可以改用下方的按鈕，或請管理員配置密鑰。）"
    );
  }

  const client = new Anthropic({ apiKey: API_KEY, baseURL: BASE_URL });
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 4096, // 聊天回答刻意簡短；串流下無 HTTP timeout 之虞
    thinking: { type: "adaptive" },
    output_config: { effort: "low" }, // 聊天屬延遲敏感，低 effort 足夠
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
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
          controller.enqueue(
            encoder.encode(sse({ text: "抱歉，這個問題我未能回答，你可以試試深圳旅遊相關的提問。" }))
          );
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (err) {
        const msg =
          err instanceof Anthropic.APIError
            ? `服務暫時不可用（${err.status}），請稍後再試。`
            : "服務暫時不可用，請稍後再試。";
        controller.enqueue(encoder.encode(sse({ error: msg })));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(body, { headers: SSE_HEADERS });
}

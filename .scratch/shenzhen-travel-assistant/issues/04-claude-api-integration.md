# 任务：接入 Claude API + system prompt 到 /api/chat

Type: task
Status: claimed
Label: wayfinder:task

## Question

在 Next.js 16 的 `/api/chat` 路由里接入 **Anthropic Claude Opus 4.8**，承载**自由输入**的问答（预设按钮走规则引擎，不经过 LLM）。

要做的：

- 用 `@anthropic-ai/sdk`（或 fetch）调用 Opus 4.8，key 放环境变量 `ANTHROPIC_API_KEY`（本地 `.env.local`，线上 Vercel env）。
- 组装 **system prompt**：深圳旅游专员人设 + 繁体中文 + 面向香港游客 + 精选知识（来自内容库票）+ 边界（只答深圳旅游）。
- **流式输出**（SSE）到前端，逐字显示。
- 错误与降级：无 key / 超时 / 限流时的优雅回退文案。
- 预留：把对话历史传进去做多轮（上下文策略待「Not yet specified」毕业）。

产出：可用的 `/api/chat` + 前端流式渲染。

## Blocked by

- 03（内容库，提供 system prompt 的知识）—— 已 resolved。

## Answer

**產出並驗證（降級路徑）。**

- **`src/app/api/chat/route.ts`** —— POST，串流 SSE（`data: {"text":…}` … `data: [DONE]`）：
  - `@anthropic-ai/sdk` 的 `client.messages.stream()`，逐 `text_delta` 轉發。
  - 模型 `claude-opus-4-8`（使用者點名）；可用 `APP_ANTHROPIC_MODEL` 換。
  - `thinking: {type:"adaptive"}` + `output_config:{effort:"low"}`（聊天屬延遲敏感）。
  - system prompt 帶 `cache_control: {type:"ephemeral"}`。
  - 首條非 user 丟棄；只留最近 20 輪；空 body → 400。
  - 無 key → 降級文案；API 錯誤 → `{error}`；`stop_reason==="refusal"` → 友善文案。
- **`src/lib/system-prompt.ts`** —— 約 1000 字繁體知識（取自研究庫），含新皇崗口岸 2026-10-12 時效事實。
- **`.env.example`** —— `ANTHROPIC_API_KEY` + `APP_ANTHROPIC_MODEL` + `APP_ANTHROPIC_BASE_URL`；`.gitignore` 加 `!.env.example`。

**⚠️ 環境隔離（重要）**：本機 shell 設有 Claude Code 的第三方代理環境（`ANTHROPIC_BASE_URL=agentrouter.org`、`ANTHROPIC_AUTH_TOKEN`、`ANTHROPIC_MODEL=deepseek-v4-flash`）。故 route 內**顯式**傳 `apiKey` 與 `baseURL` 給 SDK，並用 `APP_` 前綴的模型變數——否則 app 會**靜默走代理、用 DeepSeek 而非 Opus**。

**驗證**：`tsc` 乾淨；`next build` 綠（`/api/chat` 為動態路由）；無 key 時 curl 得 HTTP 200 + 降級 SSE。**真實 LLM 路徑待使用者填入 `ANTHROPIC_API_KEY` 後驗證。**

**注意（更正）**：初版此處寫「`cacheComponents: true` 不允許 `runtime` / `maxDuration` 路由段配置，故未設」——**不準確**。v16 在 Cache Components 下移除的只有 `dynamic` / `dynamicParams` / `revalidate` / `fetchCache`；`runtime` 確因不相容被拒，但 **`maxDuration` 可用**，已在後續提交（`6b5c1c4`）設為 60 秒，以免 Vercel 平台預設（可能 10s）截斷流式回答。

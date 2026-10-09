# 任务：接入 Claude API + system prompt 到 /api/chat

Type: task
Status: open
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

- 03（内容库，提供 system prompt 的知识）

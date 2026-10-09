# 任务：部署到 Vercel + 环境变量

Type: task
Status: open
Label: wayfinder:task

## Question

把 MVP 部署到 **Vercel**，作品集可直接用链接展示。

要做的：

- 推 GitHub 仓库（当前无 remote）→ Vercel 项目。
- 配环境变量：`ANTHROPIC_API_KEY`、`QWEATHER_KEY`、`QWEATHER_HOST`。
- 确认 serverless 下 `/api/chat` 的**流式响应**正常；确认无长时爬虫（demo 不用）。
- README：本地启动、env 说明、架构一两段（便于交接工程师）。

产出：一条可访问的线上 demo 链接。

## Blocked by

- 04（Claude API）
- 05（语音输入）
- 06（天气 API）
- 08（规则引擎分發器 + 數據落地）
- 09（聊天界面與卡片組件）

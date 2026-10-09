# 任务：天气 API 接入（和风天气）

Type: task
Status: open
Label: wayfinder:task

## Question

把已写的 `src/lib/weather.ts`（现为 mock 回退）接上**真实天气**。

要做的：

- 申请**和风天气**免费 key，配到 `.env.local`（`QWEATHER_KEY` + 你账号专属的 `QWEATHER_HOST`）。
- ✅ **3 日預報代碼已完成**（票 08）：`src/lib/weather.ts` 已改用 `/v7/weather/3d`，`WeatherData` 已為 `days: WeatherDay[]`。本票**只剩申請 key + 配環境變數**。
- 线上 Vercel 配同名环境变量。
- 保留无 key 时的 mock 回退（demo 可离线演示）。

产出：真实天气数据 + 出行建议文案。

## Blocked by

（无）

# 任务：天气 API 接入（和风天气）

Type: task
Status: open
Label: wayfinder:task

## Question

把已写的 `src/lib/weather.ts`（现为 mock 回退）接上**真实天气**。

要做的：

- 申请**和风天气**免费 key，配到 `.env.local`（`QWEATHER_KEY` + 你账号专属的 `QWEATHER_HOST`）。
- 深圳 LocationID 已用 `101280601`；确认返回字段映射正确。
- **需改为 3 日预报**：按钮契约（票 01）要求天气卡显示「今日 + 未来 2 天」，故 `src/lib/weather.ts` 须由 `/v7/weather/now` 改用 **`/v7/weather/3d`**，`WeatherData` 型别相应扩充。
- 线上 Vercel 配同名环境变量。
- 保留无 key 时的 mock 回退（demo 可离线演示）。

产出：真实天气数据 + 出行建议文案。

## Blocked by

（无）

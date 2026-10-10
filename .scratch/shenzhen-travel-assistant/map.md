# Map: 深圳旅游助手 MVP

Label: wayfinder:map
Status: open

## Destination

一个跑在 Vercel 上的「深圳旅游助手」chatbot 网站 MVP：面向**香港游客**，聊天框内可点**预设按钮**，以**固定格式卡片**呈现旅游路线 / 美食 / 天气 / 优惠 / 交通方案；自由输入交给 **Claude Opus 4.8** 回答。走到头 = **能演示、可交接给工程师**。

> **语言**：经票 11 扩为**三语**（English / 简体中文 / 繁體中文）。**测试期默认简体**是临时开关，正式上线改回繁体（客群是香港旅客）。

## Notes

- **域**：深圳旅游（吃 / 玩 / 优惠 / 交通 / 天气）；受众 = 香港游客。
- **执行在本图范围内**：非常规 wayfinder 的「只规划」。本图既含决策票，也含构建票，终点是可运行的 MVP。
- **节奏**：每个 session 只解一张票（`research` 票例外，可并行/批量）。
- **可用技能**：`grilling`、`domain-modeling`、`research`、`prototype`。
- **合规红线**：不硬爬小红书；不做真实支付/下单；不做用户账号系统。

### 已定基线决策（charting 时敲定，非票产出）

- **技术选型**：手搓 Next.js 16 + React 19 + Tailwind 4，**不用 FastGPT/Dify**。
- **架构原则**：钱与规则（优惠/交通/票价）走**确定性规则引擎**；LLM 只负责**自由输入**的问答。
- **LLM**：**Claude Opus 4.8**（Anthropic API）。
- **知识**：不做 RAG，用 **system prompt + 精选知识**。
- **机器人边界**：**只专注深圳旅游**（吃/玩/优惠/交通/天气）。
- **语音**：浏览器原生 **Web Speech API**（`zh-HK` 优先，回落 `zh-CN`），留云端 ASR 接缝。
- **数据源**：**示例数据 + 可插拔 `DataSource` 接口**。
- **部署**：**Vercel**。
- **持久化**：**不做**（无账号、偏好不存）。

## Decisions so far

<!-- 已完成票的索引，一行一票：链接 + 一句话要点。 -->

- [研究：深圳美食 / 景点 / 优惠精选内容库](issues/03-shenzhen-content-library.md)：产出精选内容库（7 路线 / 12 美食 / 10 优惠 + 8 类稳定优惠形态 / 港客实用信息 + system prompt 段落），来源偏官方一手，未核实项已标注。**时效：新皇岗口岸 2026-10-12 开通。** 详情见 `research/03-shenzhen-content.md`。
- [决策：预设按钮清单与每个按钮的固定输出格式](issues/01-preset-buttons-and-output-formats.md)：定下 **7** 按钮 → 关键词 → 卡片契约；一键一卡、路线可「換一條」、美食/优惠为清单卡、人数弹快捷选项、手打命中走同一确定性路径。**这是前端与规则引擎的共同契约。**
  > 對帳（2026-10-10）：原寫「定下 6 按钮」。口岸按票 12 加入后为 **7 个**，契约表已同步。
- [原型：聊天界面与卡片视觉](issues/02-chat-ui-and-card-visuals.md)：**按 UA 自动分发**——手機用 A 對話優先、桌面用 C 分欄指令台；B 卡片牆落选。已实现并验证（`src/app/page.tsx`），结合响应式微调。原型在 `src/components/prototype/`。
- [任務：規則引擎分發器 + 內容數據落地](issues/08-rule-engine-dispatcher.md)：分發器（關鍵詞 → 卡片）+ 數據落地（7 路線 / 12 美食 / 10 優惠）+ 型別擴充（foodList/dealList + 3 日天氣）。19 個匹配用例全過，build 綠。**順帶完成票 06 的天氣代碼部分。**
- [任務：接入 Claude API + system prompt 到 /api/chat](issues/04-claude-api-integration.md)：串流 SSE 的 `/api/chat`（Opus 4.8，adaptive thinking + low effort）+ 約 1000 字繁體 system prompt。**顯式隔離 shell 的 Claude Code 代理環境**，否則會靜默用 DeepSeek。降級路徑已驗證；真實路徑待填 key。
- [任務：聊天界面與卡片組件](issues/09-chat-ui-implementation.md)：正式聊天界面——按 UA 分發（手機對話優先 / 桌面分欄指令台）+ 5 種卡片 + `/api/dispatch`。純定義拆到客戶端安全的 `src/lib/intents.ts`。已驗證。
- [任務：路線地圖（高德路徑規劃）](issues/10-amap-route-map.md)：站點座標一次地理編碼烘入資料；伺服器端逐段駕車路徑規劃 → **高德靜態地圖**，經 `/api/route-map` **代理取圖**（key 不外洩）。原定 JS 互動地圖因缺第二把 key 改為靜態圖。已驗證。
- [任務：語音輸入（瀏覽器 Web Speech）](issues/05-voice-input.md)：`useSpeechInput` hook（`zh-HK` 優先、回落 `zh-CN`；留雲端 ASR 接縫）+ `MicButton`（臨時文字填框、定稿即送；出錯/權限/隱私以對話訊息提示）。tsc 與冒煙通過；瀏覽器行為待人工驗證。
- [任務：三語國際化](issues/11-i18n.md)：English / 简体 / 繁體 三語全站（UI 文案 + 195 條內容數據 + 規則引擎文案 + LLM 回答語言）。測試期預設簡體（臨時開關）；繁體為正本；英文地名採「拼音 + 英文 +（簡體）」。**已超出原 MVP 終點，等於擴展了目的地。**
- [任務：深港口岸（口岸卡 + 實時排隊）](issues/12-border-crossings.md)：第 7 個按鈕 🛂，出**口岸卡**——6 個口岸 + 香港入境處**實時排隊**（公開數據，零密鑰）。**刻意不列皇崗**：新皇崗 2026-10-12 啟用，但拿不到運營方確認（入境處頁面還停在 2026-06）。**刻意不寫跨境巴士路線編號**（來源非客運方原始頁）。
- [任務：口岸資料變更監看](issues/13-border-watch.md)：每日 GitHub Actions 抓入境處口岸頁 → 比對快照 → **變了就開 PR**。**不解析時刻、不改 `borders.ts`**（官方頁做不到可靠解析：深圳灣一段有兩條時刻、時刻是自由散文）。跑 Actions 而非 Vercel Cron —— 後者要往對外服務的 app 塞一把倉庫寫入 token。

## Not yet specified

<!-- 一切在范围内、但还锐利到能立票的雾。随前沿推进毕业为票。 -->

- **多轮上下文**：自由问答时是否记住本轮会话里用户已说的人数/口味；跨度多长。
- **香港游客特有合规**：录音（语音输入）的权限与隐私提示怎么说；是否需要位置权限。
- **降级与错误处理**：LLM 超时/无 key、天气 API 失败时，界面如何优雅回退。
- **内容更新机制**：示例数据之外，未来优惠内容由谁、以何频率更新。

## Out of scope

<!-- 超出终点的工作；关闭，永不毕业。若终点被重画才作为新 effort 回来。 -->

- **真实爬取小红书**：违反平台用户协议、法律灰区、技术上不稳定；demo 用示例数据 + 可插拔接口替代。
- **MCP 实时更新 / 全自动优惠聚合**：经 grilling 收敛并经独立研究核实——`research/mcp-deals-check.md` 扫描官方 MCP Registry 18,640 个服务器名，**无一**提供深圳／香港消费优惠；现存优惠类 MCP 全为欧美市场，美团／携程／飞猪／Klook 的官方 MCP 皆无券数据。MCP 是**接口而非数据源**，且普通 Next.js 网页应用并非 MCP host。优惠数据先走人工精选种子；`DataSource` 接口即未来接自动源的插座（Vercel Cron → 鉴权路由 → 归一化 → KV → ISR），无需 MCP。
- **真实支付 / 下单闭环**：优惠只做展示与规则计算，不接真实交易。
- **用户账号与登录**：demo 不做账号系统，偏好不持久化。
- **FastGPT / Dify 低代码方案**：已决策手搓 Next.js（见上方「已定基线决策」）。

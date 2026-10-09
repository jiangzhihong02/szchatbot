# 研究：MCP Server 能否提供深圳 / 香港「實時優惠」資料？

- **Type**：research（wayfinder）
- **研究日期**：2026-10-09
- **問題**：是否存在官方或社群的 MCP server，為深圳／香港旅遊助手 App 提供**實時消費者優惠／折扣／促銷／餐飲優惠／景點票價**資料？
- **結論（一句）**：**沒有。** 官方 MCP Registry 抽樣 18,640 個伺服器中，**只有 1 個**同時提及「優惠」概念與「中國／香港」地域概念（麥當勞中國），而它與本 App 的需求無關。而且 **MCP 從架構上就不是 App 內部資料更新的正確工具**。

---

## 0. 結論摘要（Verdict）

| 問題 | 答案 |
|---|---|
| 1. 有公開 MCP server 提供中國大陸／香港的消費者優惠、券、促銷、餐飲折扣、景點票價嗎？ | **基本沒有。** 抽樣 18,640 個伺服器中，跨「優惠概念 × 中港地域」的交集**只有 1 個**（麥當勞中國）。 |
| 2. 有**官方**來源的 MCP 嗎（美團／大眾點評、攜程、Klook、深圳文旅、AlipayHK／WeChat Pay HK）？ | **部分有，但都不是本 App 要的東西。** 美團、攜程、飛豬、瑞幸、麥當勞中國有官方 MCP／Skill，但全是**單一品牌、交易導向、會員制**，不是「全城優惠精選」。Klook、大眾點評、深圳文旅、AlipayHK／WeChat Pay HK **沒有官方 MCP**。 |
| 3. MCP 生態實際上是什麼？ | **以開發者工具與 SaaS／電商 API 為主**，加上大量 2026 年的「agent 商務 / x402 支付」投機性伺服器。官方 reference servers 只有 7 個，全是檔案／Git／記憶等開發工具。 |
| 4. 對一個只有 Next.js web app（沒有 MCP client）的 App，實務上怎麼做新鮮的優惠內容？ | **cron 定時任務 → 抓取 → KV／DB 落地 → ISR／revalidate。** MCP **不是** App 內部資料更新的正確抽象。 |

---

## 1. 方法與證據基礎

### 1.1 直接掃描官方 MCP Registry（一手來源）

官方 Registry 提供未認證的唯讀 REST API（`modelcontextprotocol.io/registry/registry-aggregators`）：

```
GET https://registry.modelcontextprotocol.io/v0.1/servers?limit=100
GET ...?limit=100&cursor=<nextCursor>        # cursor 分頁
```

本研究逐頁抓取 **60,000 筆 registry 條目**（registry 總量比這更大；60,000 筆時尚未到底），去重後得到 **18,640 個唯一伺服器名稱**，再對 `name + title + description` 做關鍵字分析。

> 註：Registry 是 registry 官方認可的權威清單；README 版伺服器清單已於 2026-04-14 退役。

### 1.2 關鍵字命中數（18,640 個唯一伺服器）

| 類別 | 命中數 | 說明 |
|---|---|---|
| coupon / voucher / promo-code | **20** | 幾乎全是歐美／拉美市場（Coupondroid 各國版、Clippy、Pinchy、Pechincha 巴西…） |
| discount / deal / promo | 149 | 多數是**B2B CRM 的 "deals"（銷售漏斗）**，不是消費者折扣 |
| 中國大陸消費者平台（美團／點評／淘寶／支付寶／小紅書／飛豬／攜程…） | **12** | 多為小紅書／抖音／微博**社群資料**、微信開發者工具、支付——**沒有一個是優惠聚合** |
| 香港（Hong Kong / HK / MTR / 香港） | **21** | MTR 車費、HK 公共交通工具規劃、HK 股票、HK 保險價格、公司註冊處——**沒有消費優惠** |
| 深圳 / 廣東 | **1** | `cn.housingsentinel/housing-sentinel`（12 城**房產**成交數據，含深圳） |
| 景點票價 / 主題樂園 | **3** | 全部是西方市場（`com.attractiontickets.mcp`、洛杉磯活動、Eventbrite） |
| 餐廳／餐飲優惠 | **4** | Lanzarote 菜單、DuckHub、沙烏地、Thmenu——**無中港** |

### 1.3 決定性交叉查詢

對「**優惠概念** ∩ **中港地域概念**」求交集（regex 同時命中兩邊）：

```
=== servers mentioning BOTH a deal-concept AND a China/HK-geo concept: 1 ===
  * io.github.M-China-Official/mcd-mcp | McDonald's China MCP Server with event calendar,
    coupon inquiries and redemption features.

total servers mentioning any deal-concept: 216 of 18640
```

**18,640 個伺服器中，只有 1 個同時沾到「優惠」與「中港」——就是麥當勞中國。** 這一個還是單一品牌、會員制、且**明確排除港澳台**（見 §2.5）。換句話說：**沒有任何 MCP server 提供深圳／香港的通用消費者優惠資料。**

---

## 2. 逐一核對「官方來源」

### 2.1 美團 / 大眾點評

**美團有官方 MCP 平台，但是「商家／ISV 工具」而非「消費者優惠」。**

- 官方入口：**美團技術服務合作中心 AI Hub** — <https://developer.meituan.com/ai-hub>（頁面為 SPA，實測只有標題與頁尾「优惠政策。」可讀）。
- 該平台列出的 MCP 服務類型為**商家側**：視覺 AI、時間服務、天氣服務、CPC 廣告報告、**團購項目結算**、**商家券信息（券狀態與驗券歷史查詢）**、門店查詢、商品查詢、評價查詢等。「商家券信息」是**商家查自己門店的驗券紀錄**，不是消費者找優惠。
- **官方酒旅 MCP**：npm `@meituan-travel/ht-ai`（README 直取 <https://cdn.jsdelivr.net/npm/@meituan-travel/ht-ai@0.0.6/README.md>）。自述「**由美團官方出品**」，走 `https://mcp-open-cater.meituan.com`，需 `MEITUAN_HT_TOKEN`（申請自 `developer.meituan.com/zh/v2/dev/token`）。涵蓋機票／酒店／火車票／景點／行程。
  - ⚠️ README **完全沒有提到 coupon / 折扣 / 促銷**；回應描述為「連結、營銷文案或結構化信息」。**是搜尋與行銷文案，不是優惠資料。**
- **大眾點評沒有官方 MCP。** 官方「點評購物開放平台」（`openshopping.dianping.com`）是商家側、需 `client_id` + MD5 簽名。
  社群上所有點評 MCP 都是**非官方爬蟲**，且都需登入態：
  - `github.com/shawnq-msft/mcp-dianping` — Playwright + `auth.json` 登入 session，只有 `dianping_category_rank` / `dianping_shop_detail`，**無優惠券工具**（2 stars）。
  - `github.com/goesByhc/cn-scraper-mcp` — 爬蟲，點評工具為 `dianping_search` / `dianping_shop` / `dianping_reviews`，**明確無 coupon/deal**；README 自述「僅用於學習和研究目的」。
  - `qianwj/dp-mcp`（Glama 收錄）— 需瀏覽器登入與安全驗證。
  - ⚠️ 這類爬蟲同時違反本倉 `docs/scraping-notes.md` 已記錄的合規立場，以及本次任務「不抓取登入牆內容」的約束。

### 2.2 攜程 / Trip.com

- **沒有官方 MCP server 的公告。** 官方對外只有合作社區流程：
  - **Affiliate program**（北美／英國走 Awin）：提供 deep link、widget、佣金報表；Awin 頁面聲稱有「Data feed and API」。
  - **Distribution API**：真正能拿房價／庫存／下單的通道，**簽約後才看得到文件**（StayAPI 分析：「the docs are the reward for approval」）。
- 最接近的是 **官方 Agent Skill（不是 MCP server）**：`github.com/trips-ai/tripai-skill`，含 TripGenie（Trip.com）與 TripAI（攜程問道）兩個 skill，需 API Key（`TRIPGENIE_API_KEY` / `TRIPAI_API_KEY`，申請自 `trip.com/tripgenie/openclaw`、`ctrip.com/wendao/openclaw`），端點 `tripgenie-openclaw-prod.trip.com` / `wendao-skill-prod.ctrip.com`。
  - ⚠️ README **完全沒有提到 coupon / discount / promotion**。是「搜尋 + 真實預訂連結」。
  - ⚠️ Repo 掛在個人帳號 `trips-ai` 而非攜程企業帳號，只自述「攜程官方傾力打造」；14 stars。
- 社群那個 `mako202605/china-travel-mcp`（0 stars）自稱 Trip.com affiliate partner（Alliance ID 8405769）——**是聯盟行銷包裝，不是 Trip.com 官方**，且無 coupon 功能。

### 2.3 Klook

- **沒有官方 MCP。** Klook 官方 API 是給**商家／渠道商**的：<https://klook.gitbook.io/openapi>，明言 "intended for merchants, reservation systems & channel managers"——商品內容、可訂狀態、定價、鎖價、下單／取消。**不提 affiliate API**。
- 聯盟推廣走第三方 ASP（ValueCommerce）或官方 Creator Program（社群平台、需 1,000+ 粉絲），**都非開發者 API**。
- 唯一程式化拿到 Klook promo code 的東西是**第三方 Apify Actor**：`apify.com/dariomory/klook-affiliate-partner-actor`（"Dario Mory (community)"），有 `browse_promo_codes` / `convert_affiliate_links` / `search_commission_products`，$5.00 / 1,000 results。**它不是 MCP server，只是可經 Apify 的 hosted MCP 間接呼叫的 Actor**，且需要你自己的 Klook 聯盟 AID/WID。

### 2.4 深圳文旅

- 官方入口是**「文旅深圳」小程序**與深圳線上游客中心（`shenzhentour.com`）。優惠發放走的是**活動式渠道**而不是資料 API：票根促消費活動（票根上傳到**「灣游记」平台**領券）、福田區文旅券（**透過飛豬**發放）、同程「深圳旅游品牌館」。
- 可確認的資料接口只有**政務官網接口維護**與**交通／氣象資料共用**。**沒有公開的「優惠活動資料 API」**。
- 政府開放資料平台是 `opendata.sz.gov.cn`（深圳市政府數據開放平台），**不是優惠活動來源**。
- 18,640 個 registry 伺服器中，深圳相關的只有 1 個房地產資料伺服器。

### 2.5 麥當勞中國（唯一的中港交集，但仍不適用）

- **是的，這是真的官方 MCP**：provider「麥當勞中國」，endpoint `https://mcp.mcd.cn`（Streamable HTTP，MCP 協定 `2025-06-18`），官方文件 `https://open.mcd.cn/mcp`（實測 HTTP 200），官方 repo `github.com/M-China/mcd-mcp-server`。
- 鑑權：`Authorization: Bearer <MCD_MCP_TOKEN>`，token 由 `open.mcd.cn/mcp` 手機號登入 → 控制台 → 激活 取得；限流 600 req/min/token。
- 優惠相關工具：`available-coupons`、`auto-bind-coupons`（一鍵領券）、`query-my-coupons`、`query-store-coupons`、`campaign-calendar`、`calculate-price`。
- **覆蓋範圍：「提供方：麥當勞中國，覆蓋中國大陸（不含港澳台）」**。
- **為何不適用**：token 等同**會員身分**，回傳的是「**你自己的**」券；單一品牌；**不含香港**。無法成為旅遊 App 的「全城優惠精選」內容源。

### 2.6 瑞幸 / 其他中國品牌

- **瑞幸咖啡 AI 開放平台**（`open.lkcoffee.com`，實測 HTTP 200，頁面標題「瑞幸咖啡AI开放平台」）把門店查詢、商品搜尋、下單、訂單管理**封裝成標準 MCP 接口**，支援 MCP／CLL／Skill，主打「自動匹配各種優惠券」。
- **肯德基、星巴克、蜜雪冰城**走的是**阿里千問（Qwen）App 的第三方 Agent／Skill 接入**（結帳時自動套用會員折扣與數位券），**沒有各自獨立的官方 MCP server**。
- 這些共同證明一個趨勢：**品牌方願意開放「自己的」MCP（下單＋自有券）**，但仍然**沒有**任何「城市級／跨品牌優惠聚合」的 MCP。這對本 App 是關鍵區別。

### 2.7 AlipayHK / WeChat Pay HK

- **沒有官方促銷 MCP。** Registry 中最接近的是第三方 `app.wishpool/hong-kong-payments-mcp`（"Hong Kong payments for AI agents — Alipay / WeChat Pay via Stripe. Never holds funds."）——這是**支付通道**，不是優惠。
- 香港旅遊發展局（HKTB）**沒有官方 MCP**。Registry 中的香港相關伺服器（`app.rowb.hk-transit/fares` MTR 車費、`com.getaroundhongkong/trip-planner` 公共交通規劃）都與優惠無關。

---

## 3. MCP 生態今日實貌：以開發者工具為主

### 3.1 官方 reference servers（一手）

`github.com/modelcontextprotocol/servers` 現役 reference servers **只有 7 個**，且自述是**教育性範例、非 production**：

| Server | 功能 |
|---|---|
| Everything | 測試／示範 |
| Fetch | 抓網頁轉文字 |
| Filesystem | 檔案操作 |
| Git | Git repo 操作 |
| Memory | 知識圖譜記憶 |
| Sequential Thinking | 分步推理 |
| Time | 時間／時區 |

其餘（GitHub、GitLab、Google Drive、Google Maps、PostgreSQL、Puppeteer、Redis、Sentry、Slack、SQLite、Brave Search…）**已於 2025 末至 2026 初被 archive 並移到 `servers-archived`**。**沒有任何消費資料類 server。**

### 3.2 Registry 的實際組成（本研究抽樣觀察）

除了開發者工具與 SaaS，18,640 個伺服器裡有**大量**這幾類：

- **Agent 商務／支付投機盤**：`app.wishpool/*-payments-mcp`（幾乎一國一個）＋ 大量 x402／USDC／Lightning 微支付伺服器。
- **B2B CRM／sales pipeline**（一堆 "deals" 其實是這個）。
- **地區性價格／優惠情報**（但全在西市場）：`app.swissdeals/mcp`（瑞士 22 家零售商，$0.01 USDC/call）、`ai.offerhopper.mcp/german-grocery-assistant`（德國超市藥妝即時價＋優惠）、`ai.pechincha/deals`（巴西）、`cl/ca/com/de/es/fr.coupondroid/public`（智利／加拿大／美國／德國／西班牙／法國）。

**這些正是本 App 想要的東西——只是全部不在中國／香港。** 有一個明顯的地域空位（market gap）。

### 3.3 業界對 MCP 的批評（補充視角）

2026 年普遍出現「MCP 進入幻滅期」的討論：Perplexity 放棄 MCP 改用 API/CLI；Gary Tan「MCP sucks」（context 膨脹、auth 笨重）；Sentry 的 David Cramer 說很多 MCP server「no reason to exist」。核心技術批評：**MCP 把所有工具名／描述／schema 塞進 context**（GitHub 的 MCP server 據稱吃掉 ~50,000 tokens，而一行「use the gh command」只要 ~200 tokens）；工具選擇崩壞；**stateful SSE 與無狀態企業介面衝突**。共識：**MCP 的甜蜜點是開發者工具，不是 consumer data plumbing。**

---

## 4. 對「只有 Next.js web app、沒有 MCP client」的 App，實務機制是什麼？

### 4.1 為什麼 MCP 是錯的工具（架構理由）

MCP 是 **client–server** 協定，但那個 "client" 是 **MCP Host＝AI 應用**（Claude Desktop、Claude Code、VS Code 等），每個 host 為每個 server 開一條 client 連線，把 **tools / resources / prompts** 餵給「LLM」用（`modelcontextprotocol.io/docs/learn/architecture`）。

- 本 App 是**使用者直接瀏覽的 Next.js web app**，不是 AI host。要「當 MCP client」你得在伺服器端塞一份 MCP SDK、管理 stdio 子行程或 SSE 連線、處理協定版本協商——**換來的只是一個 your-own-server 的 HTTP 呼叫也能做到的事**。
- MCP 的價值在於**讓 LLM 動態發現並呼叫外部工具**。而本 App 的需求是「**定期把優惠資料抓進自己的資料庫**」——這是 **ETL / 快取**，不是 tool discovery。用 MCP 包一層只會多兩個故障點（子行程 + 協定）。
- 更根本的：Registry 裡**根本沒有本 App 要的優惠資料源**（§1.3），所以「該不該用 MCP 接」這個問題在資料層就已經不成立。

### 4.2 正確的做法：cron → 抓取 → KV/DB → ISR

現有架構其實已經預留好了位置 —— `src/lib/sources/index.ts`：

```ts
export interface DataSource { name: string; fetchDeals(): Promise<DealData[]>; }
const SOURCES: DataSource[] = [curatedSource];   // 目前只有「人工精選」
export async function fetchAllDeals(): Promise<DealData[]> { /* allSettled… */ }
```

`fetchDeals()` 就是「自動更新資料」的承載點。建議做法（**完全不涉及 MCP**）：

1. **Cron 觸發**（Vercel Cron Jobs，`vercel.json` 宣告，cron 對 production URL 發 HTTP GET，UA 為 `vercel-cron/1.0`；**時區固定 UTC**，分鐘／小時 5 欄位）。例如每日 03:00 UTC 打 `/api/cron/refresh-deals`。
   - ⚠️ 注意 plan 的頻率上限（Hobby 為每日一次）與 cron 數量上限。
   - 非 Vercel 環境則用系統 cron / GitHub Actions schedule / Cloudflare Cron Triggers。
2. **Route handler 做抓取與落地**：`app/api/cron/refresh-deals/route.ts` —— 驗證 `Authorization: Bearer $CRON_SECRET`，抓 OTA／官方公告／RSS，**正規化為 `DealData`**，寫進 **KV／Postgres／CMS**（不是 `src/lib/data/deals.ts`，那是 build-time 種子）。
3. **讀取層**：新增一個 `KvDealSource implements DataSource`（組裝／持久化分離），在 `SOURCES` 追加即可——`fetchAllDeals` 與上層卡片**完全不用改**（現有註解就是這麼設計的）。
4. **頁面刷新**：用 **ISR** `export const revalidate = 3600`（time-based），或抓取完成後在 route handler 裡 **`revalidateTag('deals')` / `revalidatePath('/deals')`**（on-demand）。**on-demand 是首選**；`revalidatePath` 只是讓快取失效，**再生發生在下一次請求**。
5. **無 cron 的降級方案**：CMS（Sanity／Contentful／Notion）由人維護優惠，App 端定時 ISR 抓 CMS；或純 `DEALS` 種子 + 人工版控。對 demo 而言，**「人工精選 + 定期覆核」就是最好且最合規的機制**（與 §2.4 的合規立場一致）。

### 4.3 實務建議（針對本專案）

- **不要**為了優惠資料引入 MCP client。收益為零、複雜度為正。
- **要**保持 `DataSource` 介面，把「自動來源」寫成第二個實作；資料先落地 KV/CMS，再由 ISR 曝露。
- **優惠內容來源**建議按合規性排序：① 官方公告／政府活動頁（深圳文旅、灣游记）→ ② OTA 聯盟連結（Trip.com Awin、Klook ValueCommerce／Creator Program）→ ③ 品牌官方 MCP/Skill（瑞幸、麥當勞中國）**但只在你真的要做「到店點餐」功能時**，不是做優惠精選。
- 若日後真的想做「Agent 也讀得到優惠」，正確做法是**自己把聚合結果曝露成一個 MCP server**（把 App 變成 server 而非 client），而不是去找一個現成的優惠 MCP。

---

## 5. 來源（Sources）

**一手（本研究直接呼叫／讀取）**
- MCP Registry REST API（官方）— <https://registry.modelcontextprotocol.io/v0.1/servers>（逐頁抓取 60,000 筆、去重 18,640 個唯一伺服器）
- MCP Registry Aggregators（registry 用法、分頁、狀態）— <https://modelcontextprotocol.io/registry/registry-aggregators>
- MCP Architecture（client-server、host、transports）— <https://modelcontextprotocol.io/docs/learn/architecture>
- 官方 reference servers 清單 — <https://github.com/modelcontextprotocol/servers>
- 美團技術服務合作中心 AI Hub（官方，SPA）— <https://developer.meituan.com/ai-hub>
- 美團官方酒旅 MCP README（npm，經 jsDelivr 直取）— <https://cdn.jsdelivr.net/npm/@meituan-travel/ht-ai@0.0.6/README.md>
- 攜程官方 AI Skill — <https://github.com/trips-ai/tripai-skill>
- 飛豬官方旅行 Skill（flyai，基於飛豬 MCP）— <https://github.com/infometa/workbuddyskills/blob/main/skills/flyai/SKILL.md>；CLI `npm i -g @fly-ai/flyai-cli`
- 麥當勞中國官方 MCP — <https://open.mcd.cn/mcp>（HTTP 200）、`https://mcp.mcd.cn`（HTTP 403 未鑑權）、skill 文件 <https://github.com/ArisuMika520/mcd-skill>、官方 repo <https://github.com/M-China/mcd-mcp-server>
- 瑞幸咖啡 AI 開放平台 — <https://open.lkcoffee.com>（HTTP 200）
- 大眾點評（非官方爬蟲）— <https://github.com/shawnq-msft/mcp-dianping>、<https://github.com/goesByhc/cn-scraper-mcp>
- Klook 官方 API（商家用）— <https://klook.gitbook.io/openapi>
- Klook 第三方 Apify Actor — <https://apify.com/dariomory/klook-affiliate-partner-actor>
- 深圳市政府數據開放平台 — <https://opendata.sz.gov.cn/>

**二手（交叉印證）**
- Vercel Cron Jobs 文件 — <https://vercel.com/docs/cron-jobs>
- Next.js ISR / on-demand revalidation — <https://nextjs.org/docs/15/app/guides/incremental-static-regeneration>、<https://vercel.com/kb/guide/how-to-move-to-on-demand-revalidation>
- Trip.com 開發者通道分析（StayAPI）— <https://stayapi.com/blog/trip-com-api-documentation>
- 政策／業界對 MCP 的批評 — <https://tyk.io/learning-center/is-mcp-dead-in-2026-why-enterprises-still-need-mcp/>、<https://aibusiness.com/agentic-ai/mcp-alive-faces-challenges>
- 飛豬 flyai 發布報導 — <https://ttgchina.com/2026/03/26/...>、PhocusWire、環球旅訊

**本倉內部**
- `src/lib/sources/index.ts`（`DataSource.fetchDeals()` 擴充點）
- `src/lib/types.ts`（`DealData` / `DiscountItem`）
- `docs/scraping-notes.md`（既有抓取合規立場）
- `.scratch/shenzhen-travel-assistant/research/03-shenzhen-content.md`

---

## 附錄：抽樣方法可重現步驟

```bash
# 1. 逐頁抓 registry 至 nextCursor 消失（本機用 node fetch，因環境無 python）
#    每頁 100 筆；60,000 筆時仍未到底，去重後 18,640 個唯一 name
# 2. 對 name+title+description 做 regex 分類（coupon / deal / china / hong kong / shenzhen…）
# 3. 決策查詢： dealsRe.test(t) && geoRe.test(t)  → 命中 1 個
```

> 限制：本研究抽樣 60,000 筆（registry 仍在成長）。結論「中港優惠 MCP 不存在」是基於此樣本 ＋ 對所有已知官方來源（美團／點評／攜程／Klook／飛豬／深圳文旅／HKTB／AlipayHK／WeChat Pay HK）的逐一核對；若日後出現新伺服器，應重跑上述決策查詢。

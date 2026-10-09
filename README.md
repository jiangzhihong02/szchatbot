# 深圳旅遊助手（Shenzhen Travel Assistant）

面向**香港旅客**的深圳旅遊聊天助手。以按鈕／關鍵詞觸發**固定格式的卡片**，未命中的自由輸入交給大語言模型串流回答。

- **對話優先的雙端界面**：手機用對話流，桌面用分欄指令台（按 User-Agent 分發，見 [`docs/adr/0002`](docs/adr/0002-device-based-layout-routing.md)）。
- **錢與規則走確定性引擎**，LLM 只負責自由問答（見 [`docs/adr/0001`](docs/adr/0001-deterministic-rules-over-llm.md)）。
- 詞彙定義見 [`CONTEXT.md`](CONTEXT.md)；規劃地圖與決策見 [`.scratch/shenzhen-travel-assistant/map.md`](.scratch/shenzhen-travel-assistant/map.md)。

## 功能

| 按鈕 | 輸出 |
|---|---|
| 🍜 找美食 | 美食清單卡（3–4 家精選） |
| 🗺️ 一日遊路線 / 👨‍👩‍👧 親子路線 | 路線卡（站點時序 + **高德路線地圖** + 「換一條」） |
| 🌤️ 查天氣 | 深圳今日＋未來 2 天（高德天氣） |
| 💰 算優惠＋交通 | 按人數算交通方案與優惠項（規則引擎） |
| 🎫 深圳優惠活動 | 優惠清單卡（含來源） |

另支援：**自由問答**（Claude 串流）、**語音輸入**（瀏覽器 Web Speech，`zh-HK` 優先）。

## 架構

```
瀏覽器 ──→ /api/dispatch ──→ 意圖分發（規則引擎）
                             ├─ 命中 → 卡片資料
                             └─ 未命中 ──→ /api/chat ──→ Claude（SSE 串流）
          /api/route-map ──→ 高德路徑規劃 + 靜態地圖（伺服器代理，key 不外洩）
```

- `src/lib/intents.ts` —— 純定義與關鍵詞匹配（**客戶端安全**）
- `src/lib/dispatcher.ts` —— 意圖分發（伺服器端）
- `src/lib/{pricing,weather,route-map}.ts` + `src/lib/data/*` —— 規則、外部服務與種子資料
- `src/components/chat/*` —— 卡片、共用 hook、兩個版面

## 本地開發

```bash
npm install
cp .env.example .env.local   # 填入下方環境變數
npm run dev                  # http://localhost:3000
```

冒煙測試（規則分發器，81 項斷言）：

```bash
npx tsx scripts/check-dispatcher.ts
```

## 環境變數

| 變數 | 必填 | 說明 |
|---|---|---|
| `ANTHROPIC_API_KEY` | 是 | LLM 金鑰（自由問答）。未設時 `/api/chat` 走降級文案。 |
| `APP_ANTHROPIC_BASE_URL` | 否 | LLM 端點，預設 `https://api.anthropic.com`。 |
| `APP_ANTHROPIC_MODEL` | 否 | 預設 `claude-opus-4-8`。 |
| `AMAP_KEY` | 是 | 高德開放平台「**Web 服務**」key（天氣 + 路線規劃）。未設時天氣回退 mock、地圖 404。 |

> `APP_` 前綴是刻意的：避免繼承 shell 中 Claude Code 的 `ANTHROPIC_*` 環境（那會指向第三方代理）。

## 部署到 Vercel

1. 匯入本倉庫（或 `npx vercel`）。
2. 在 Project Settings → Environment Variables 設定上表四個變數。
3. 部署。`/`、`/api/chat`、`/api/dispatch`、`/api/route-map` 皆為動態路由，無需特別設定。

**注意**：`/api/chat` 會從 Vercel 的伺服器連到 `APP_ANTHROPIC_BASE_URL`。若該端點有 Cloudflare 之類的機器人防護，可能擋掉資料中心 IP——部署後請先驗證。

## 資料與合規

優惠資料為**人工精選種子**（`src/lib/data/deals.ts`），經可插拔的 `DataSource` 介面（`src/lib/sources/`）暴露。**不抓取小紅書等第三方平台**——理由與替代方案見 [`docs/scraping-notes.md`](docs/scraping-notes.md)。

站點座標由 `scripts/geocode-stops.ts` 經高德 POI 搜索一次性取得並烘入資料。

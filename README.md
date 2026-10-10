# 深圳旅遊助手（Shenzhen Travel Assistant）

面向**香港旅客**的深圳旅遊聊天助手。以按鈕／關鍵詞觸發**固定格式的卡片**，未命中的自由輸入交給大語言模型串流回答。

- **對話優先的雙端界面**：手機用對話流，桌面用分欄指令台（按 User-Agent 分發，見 [`docs/adr/0002`](docs/adr/0002-device-based-layout-routing.md)）。
- **錢與規則走確定性引擎**，LLM 只負責自由問答（見 [`docs/adr/0001`](docs/adr/0001-deterministic-rules-over-llm.md)）。
- 詞彙定義見 [`CONTEXT.md`](CONTEXT.md)；規劃地圖與決策見 [`.scratch/shenzhen-travel-assistant/map.md`](.scratch/shenzhen-travel-assistant/map.md)。

## 功能

| 按鈕 | 輸出 |
|---|---|
| 🛂 口岸通關 | 口岸卡（六個深港口岸 + **香港入境處實時排隊**） |
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
          香港入境處公開數據 ──→ 口岸實時排隊（公開數據，無需金鑰）
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

冒煙測試（規則分發器 + 譯文覆蓋 + 同源閘 + 高德簽名 + 口岸資料 + 變更偵測，共 296 項斷言）：

```bash
npm run check
```

## 環境變數

| 變數 | 必填 | 說明 |
|---|---|---|
| `ANTHROPIC_API_KEY` | 是 | LLM 金鑰（自由問答）。未設時 `/api/chat` 走降級文案。 |
| `APP_ANTHROPIC_BASE_URL` | 否 | LLM 端點，預設 `https://api.anthropic.com`。 |
| `APP_ANTHROPIC_MODEL` | 否 | 預設 `claude-opus-4-8`。 |
| `AMAP_KEY` | 是 | 高德開放平台「**Web 服務**」key（天氣 + 路線規劃）。未設時天氣回退 mock、地圖 404。 |
| `AMAP_SECRET` | 否 | 高德「數字簽名」**私鑰**。設了就每個請求附 `sig`；未設則不簽。 |

> `APP_` 前綴是刻意的：避免繼承 shell 中 Claude Code 的 `ANTHROPIC_*` 環境（那會指向第三方代理）。

## 安全

**金鑰只存在兩處**：本機 `.env.local`（`.gitignore` 已忽略，永不提交）與 Vercel 的環境變數。兩把 key 都沒有 `NEXT_PUBLIC_` 前綴，所以不會被 inline 進瀏覽器的那份 JS；`/api/route-map` 是唯一把高德 key 帶出去的地方，且只從伺服器端帶。

**`/api/chat` 是公網上的付費代理**：它拿伺服器端的金鑰去呼叫 LLM，每問一次花一次錢，而網址是公開的。它有一道同源閘（`src/lib/same-origin.ts`），擋掉非本網站頁面發起的請求——但**擋不住手動補上標頭的人**。

所以真正的底線是這兩件事，缺一不可：

1. **在 LLM 後台給金鑰設用量／餘額上限。** 把最大損失釘死在一個你願意承擔的數字上——這是唯一不依賴任何程式碼的兜底。
2. **在 Vercel Project Settings → Firewall 加一條限流規則。** Hobby 方案含 1 條（100 萬請求額度），不必寫程式、不必引 KV。

另外建議把 Vercel 的環境變數標為 **Secret**（write-only，存進去就讀不回來）。注意：**改了環境變數只對新部署生效**，改完要重新部署一次。

**高德 key 請加開「數字簽名」**：在高德控制台為這把 Web 服務 key 啟用數字簽名後會拿到一個**私鑰**，填進 `AMAP_SECRET`。之後每個請求都附 `sig`，而**洩漏的 key 在沒有私鑰時無法使用**——這比輪換 key 徹底：輪換後的新 key 一樣明文躺在 `.env.local` 裡。兩側必須一致，**控制台開了而環境變數沒填 → 所有高德請求以 `10007` 失敗**（天氣靜默回退 mock、地圖 404）。演算法與測試見 `src/lib/amap-sign.ts`。

**這個倉庫是公開的。** GitHub 對公開倉庫免費提供 secret scanning 與 push protection（私有倉庫要付費的 GitHub Secret Protection），開啟路徑：Settings → Security and quality。

## 部署到 Vercel

1. 匯入本倉庫（或 `npx vercel`）。
2. 在 Project Settings → Environment Variables 設定上表四個變數。
3. 部署。`/`、`/api/chat`、`/api/dispatch`、`/api/route-map` 皆為動態路由，無需特別設定。

**注意**：`/api/chat` 會從 Vercel 的伺服器連到 `APP_ANTHROPIC_BASE_URL`。若該端點有 Cloudflare 之類的機器人防護，可能擋掉資料中心 IP——部署後請先驗證。

## 資料從哪來

三種取得方式，分界是**變化速度**：

| | 來源 | 怎麼取得 | 變化 |
|---|---|---|---|
| **運行時實時取** | 高德天氣、香港入境處排隊 | 每次有人問就取，`use cache` 15–30 分鐘 | 分鐘級 |
| **靜態種子** | 路線、美食、優惠活動、口岸時刻 | 烘焙進 `src/lib/data/*`，跟著部署走 | 週／月級 |
| **變更監看** | 入境處管制站頁面 | 每日比對快照，變了就開 PR | 週／月級 |

**為什麼不全部自動抓**：自動抓來的東西**不會報錯，只會靜默產出錯資料**。而錯的口岸開放時間是讓人誤車的那種錯。分界線是——變化越快越值得實時取；變化越慢，自動化的收益越小，而「抓錯」的風險一點沒少。

### 口岸監看（`.github/workflows/watch-borders.yml`）

每日抓一次入境處管制站頁面，和 `.github/border-watch/stations.json` 的快照比對，**變了就開 PR**，說明裡列出哪個口岸變了、前後各是什麼。

**它不改 `borders.ts`** —— 那一步留給人。因為官方頁面做不到可靠解析：深圳灣一段裡有**兩條**時刻（旅檢與貨運），時刻本身又是自由散文。硬解析等於在賭，而這條路**不可能產出錯資料，因為它不產出資料，只產出「變了」**。

兩個要知道的坑：

- **公開倉庫的排程工作流，倉庫連續 60 天沒有活動會被自動停用。** 所以「一直沒收到 PR」有兩種可能：真的沒變，或工作流被停用了（GitHub 會通知擁有者，重新啟用是 Actions 頁面點一下）。
- **失敗是大聲的**：抓不到頁面、或頁面改版到解析不出管制站 → 這個 job 直接失敗。這是刻意的，用來把「看不懂」和「沒變」分開。

本機手動跑一次：`npm run watch:borders`

## 資料與合規

優惠資料為**人工精選種子**（`src/lib/data/deals.ts`），經可插拔的 `DataSource` 介面（`src/lib/sources/`）暴露。**不抓取小紅書等第三方平台**——理由與替代方案見 [`docs/scraping-notes.md`](docs/scraping-notes.md)。

站點座標由 `scripts/geocode-stops.ts` 經高德 POI 搜索一次性取得並烘入資料。

# Phase 4 · 逐面套用

**類型**：頁面套用（§11–§20）｜**日期**：2026-10-11｜**commit**：4a `7d6b68c` · 4b `c143e4b`

把 token + 組件 + V2 按鈕 + Solar 圖標真正接到 UI。分兩批，各自 build + 真跑 dev(200, 手機+桌面)。

## 4a · chrome（兩版面 + 輸入 + 選擇器）

- **MobileChat / DesktopConsole**：拿掉 teal→cyan 漸變頭與 🌆 品牌 emoji，改中性 surface + 髮絲底線。用戶氣泡 → 淡綠 `primary-weak`；助手回覆 → **純文字編輯感**（不再厚白卡）。桌面空態改 `EmptyState + Icon(pin)`。
- **Composer / MicButton**：`IconButton + Icon`（Solar 發送/麥），focus ring；麥收音中＝danger tone + pulse。
- **PresetBar / TravellersPicker**：`Chip / Button / Card / Input`；類別 emoji 保留。
- **LocaleSwitcher**：token 分段控件（選中段白底浮起）。
- 無任何邏輯/props 改動。

## 4b · 六張卡片

- 全部改用 `ui/Card` 外殼 + 語義 token，取代硬編碼 teal/slate/amber/emerald/rose。
- **排隊徽章**：`QueueLevel → Tag` 色調（正常=success／繁忙=warning／非常繁忙=danger／維護·未開=neutral）。
- **天氣卡**：去掉 sky→cyan 漸變（§5），改乾淨 surface + sunken 日塊。
- **路線**：「換一條」用 Solar `cycle` 圖標（原 🔄）；美食/口岸/優惠標題的類別 emoji 保留作內容。
- 六卡資料契約與 `CardView` 登記表（架構第 3 輪）不變。

## 驗證

| | build | check | dev |
|---|---|---|---|
| 4a | 綠 | — | 200 ×3，grep 確認頁面已無 `from-teal/🌆` |
| 4b | 綠 | 9 ✅ 不變 | 200 ×3 |

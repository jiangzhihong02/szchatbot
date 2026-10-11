# 第 2 輪 · 譯文欄位清單去重（`localizeX` 由 `*_FIELDS` 推導）

**候選**：報告 Candidate 3（Strong，最安全）｜**類型**：locality
**日期**：2026-10-11｜**commit**：見本輪末

## 問題

`i18n/content.ts` 把每種內容的可譯欄位宣告了**兩份**：

- 一份在 `ROUTE_FIELDS` / `FOOD_FIELDS` / …（供 `allContentKeys()` 生鍵、給 `check-i18n` 校驗覆蓋）；
- 再一份在 `localizeRoute` / `localizeFood` / … 的**手寫 spread**（渲染時實際讀）。

加一個欄位要同時改兩處。漏改渲染那半 → `check-i18n` 照樣綠（鍵覆蓋沒變），但畫面**靜默回退原文**。兩份必須一致，卻沒有東西逼它們一致——純粹的意外重複。

## 方案（deepened interface）

讓 localize **由** `*_FIELDS` 推導，欄位清單只住一處：

```ts
function localizeFields<T extends object>(e, fields, key: (f)=>string, locale): T
```

逐欄照 `fields` 查譯文；繁體或缺值的可選欄位原樣保留。四個 `localizeX` 坍縮成一行呼叫；`localizeRoute` 另把 `stops` 用同一個 `localizeFields`＋`STOP_FIELDS` 處理。**localize 不可能漏掉 `*_FIELDS` 裡有的欄位——漂移在構造上消失。**

## 檢查／debug 過程

| 步驟 | 指令 | 結果 |
|---|---|---|
| 基線 | `npm run check` | 綠 |
| 改 content.ts ＋ 新增 check-localize | `npm run check` | 綠。新增 **check-localize 13 項** |
| 型別＋編譯 | `npm run build` | 綠。`Finished TypeScript` |

**要記下的兩點：**

1. **泛型 spread 要 `T extends object`。** 第一版寫 `localizeFields<T>`，`const out = { ...e }` 會踩 TS 的「Spread types may only be created from object types」。約束成 `<T extends object>` 即解——`RouteData`／`FoodData` 等都是物件，無損。
2. **特地補了 `check-localize`。** 原本只有 `check-i18n` 守「鍵覆蓋」，**沒有任何測試行使 `localizeX`**。本輪把欄位清單變成單一真相源後，風險從「兩份清單漂移」移到「推導對不對」。`check-localize` 獨立讀疊層算出期望值，再比對 localize 的產出，端到端釘住推導——順便覆蓋 zh-Hant 的參照相等（零拷貝）與可選欄位缺值的情形。

**行為保持**：可選欄位（tips / validUntil / nameSz / tip）缺值時原樣保留，與舊版 `x ? tr(...) : x` 的守衛等價；zh-Hant 仍回傳正本參照。

## 結果

- 新檔：`scripts/check-localize.ts`
- 改檔：`src/lib/i18n/content.ts`（四份手寫 spread → 一個泛型＋四行包裝）、`package.json`
- **刪除測試回看**：刪掉手寫 spread、改由 `*_FIELDS` 推導——複雜度沒搬家，少了一份要維護的真相。
- `npm run check` 綠、`npm run build` 綠。

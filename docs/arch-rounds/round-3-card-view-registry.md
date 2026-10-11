# 第 3 輪 · 卡片視圖登記表（前端這一半）

**候選**：報告 Candidate 1（Worth exploring，navigability 收益最大）｜**類型**：缺失的 seam
**日期**：2026-10-11｜**commit**：見本輪末

## 決策（動手前先 grill）

這一輪有真正的架構抉擇，因為登記表會碰到 client／server 切分（`dispatch-contract.ts` 存在的理由）。問了範圍，選了 **B**：

- **只做前端 `CARD_VIEWS`**，把 `cards.tsx` 的 `CardView` switch 收成一張表；
- server 的 `buildCards` switch **原樣留著**——不碰那條 client／server 接縫，零風險；
- 放棄 A（連 server `CARD_BUILDERS` 一起拆）：收益最大但要沿接縫拆成兩半，風險也最大，兩個 Strong 已落袋，不划算現在賭。

## 問題

加一種卡片要在七處各改一次，綁它們的只有一個 `"border"` 字串。其中 `cards.tsx` 的 `CardView` 是最痛的一處 switch：漏一個 case，TS 的窮盡性在 `switch` 上**不會**報錯（函式回傳型別允許 `undefined`）。

## 方案（deepened interface）

一張 **mapped-type 登記表**，型別強制「每種卡片都有視圖」：

```ts
const CARD_VIEWS: { [K in Card["type"]]: FC<CardViewProps<Extract<Card,{type:K}>["data"]>> } = {
  route: RouteCard, weather: WeatherCard, transportDeals: TransportDealsCard,
  foodList: FoodListCard, dealList: DealListCard, border: BorderCard,
};
export function CardView({ card, onCycleRoute }) {
  const View = CARD_VIEWS[card.type] as FC<CardViewProps<unknown>>;
  return <View data={card.data} onCycleRoute={onCycleRoute} />;
}
```

漏一種 → `{ [K in Card["type"]]: ... }` 直接編譯不過。這就是 leverage：把「漏 case」從靜默變成編譯錯。

## 檢查／debug 過程

| 步驟 | 指令 | 結果 |
|---|---|---|
| 改 cards.tsx | `npm run build` | 綠。`Finished TypeScript`——mapped type 窮盡性＋可賦值性都過 |
| 回歸 | `npm run check` | 綠，數字不變（卡片是 client，check 本就不 import 它） |

**要記下的三點：**

1. **`RouteCard` 的 `onCycle` 改名 `onCycleRoute`**，讓六個視圖共用一個 props 形狀 `CardViewProps<D>`。只有 route 用到那個回呼，其餘視圖多一個可選 prop 無傷（會被忽略）。
2. **派發點一個受限的 `as` 轉型。** `card.type` 索引表之後，TS 證不出 `card.data` 與選到的 `View` 相關（判別聯合派發表的經典限制）。轉型只此一處、範圍最小；**真正的型別安全在 `CARD_VIEWS` 的構造處**——每個條目都按自己的 data 型別查過。
3. **沒有加 runtime check——而且刻意不加。** 窮盡性已由 mapped type 在**編譯期**釘死，`npm run build` 就是那道測試。要加 runtime 斷言得把 `cards.tsx` 這個 `"use client"` 元件 import 進 node 跑的 check 腳本——本倉所有 check 只碰純 lib、從不碰元件，破這規矩只為測一個編譯器已經保證的性質，不值。

## 結果

- 改檔：`src/components/chat/cards.tsx`（switch → 登記表；`onCycle`→`onCycleRoute`；加 `FC` import）
- **刪除測試回看**：登記表不是 pass-through——刪了它，`CardView` 的派發與窮盡性保證就散回 switch，窮盡性還變回靜默。它補的是缺失的 seam。
- 範圍限定在前端一半，server `buildCards` 未動，client／server 接縫未碰。
- `npm run check` 綠、`npm run build` 綠。

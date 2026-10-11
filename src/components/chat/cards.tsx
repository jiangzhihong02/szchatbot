"use client";

import type { FC } from "react";
import type {
  Card,
  RouteCardData,
  WeatherData,
  PricingData,
  FoodData,
  DealData,
  BorderCardData,
  QueueLevel,
} from "@/lib/types";
import { fmt } from "@/lib/i18n/format";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { localizeRoute, localizeFood, localizeDeal, localizeBorder } from "@/lib/i18n/content";
import { weatherTerm, windTerm, adviceKeyFor } from "@/lib/i18n/weather-text";
import { Card as Surface, Tag, Button, Icon } from "@/components/ui";

/**
 * 卡片渲染。契约见票 01；型別為可辨識聯合，故各分支的 data 自動收窄。
 *
 * ⚠️ **所有文案都在前端按當前語言渲染**（含天氣建議與優惠交通卡的方案/優惠項），
 *    故切換語言時既有的卡片會即時跟著變。
 * 外殼統一用 ui/Card（＝ Surface），顏色走語義 token，類別 emoji（🍜🛂🎫）保留作內容識別。
 */

function RouteCard({ data, onCycleRoute }: { data: RouteCardData; onCycleRoute?: () => void }) {
  const { m, locale } = useI18n();
  const route = localizeRoute(data.route, locale);
  const { index, total } = data;
  return (
    <Surface className="p-4">
      <div className="flex items-center gap-2">
        <Tag tone="primary">{route.theme}</Tag>
        <span className="text-xs text-ink-3">
          {route.area} · {fmt(m.cards.hours, { n: route.durationHours })}
        </span>
      </div>
      <h3 className="mt-2 text-base font-semibold text-ink">{route.title}</h3>
      <p className="mt-0.5 text-xs text-ink-3">
        {m.cards.bestFor}：{route.bestFor}
      </p>

      {/* 站點與地圖：窄屏上下堆疊，寬屏並排（票 10） */}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <ol className="relative space-y-3">
          {route.stops.length > 1 && (
            <span aria-hidden className="absolute bottom-2 left-3 top-2 w-px bg-line" />
          )}
          {route.stops.map((s, i) => (
            <li key={`${s.name}-${i}`} className="flex gap-3">
              <span className="relative mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-primary text-xs font-semibold text-on-primary">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-medium text-ink">
                  {s.name} <span className="text-xs font-normal text-ink-3">· {s.area}</span>
                </p>
                <p className="text-xs text-ink-3">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* 路線地圖：伺服器代理取圖，key 不出現在瀏覽器 */}
        <img
          src={`/api/route-map?routeId=${encodeURIComponent(route.id)}`}
          alt={route.title}
          loading="lazy"
          className="w-full self-start rounded-xl border border-line"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      </div>

      {route.tips && <p className="mt-3 rounded-xl bg-warning-weak px-3 py-2 text-xs text-warning">💡 {route.tips}</p>}

      {onCycleRoute && total > 1 && (
        <Button variant="secondary" size="sm" onClick={onCycleRoute} className="mt-3 w-full">
          <Icon name="cycle" size={15} /> {m.cards.cycle}（{index + 1}/{total}）
        </Button>
      )}
    </Surface>
  );
}

function WeatherCard({ data }: { data: WeatherData }) {
  const { m, locale } = useI18n();
  const advice = m.engine.weatherAdvice[adviceKeyFor(data.days)];
  return (
    <Surface className="p-4">
      <p className="text-xs text-ink-3">
        {m.city} · {fmt(m.cards.weatherTitle, { n: data.days.length })}
        {data.source === "mock" && ` (${m.cards.weatherSample})`}
      </p>
      <div className="mt-2 grid grid-cols-3 gap-2 text-center">
        {data.days.map((d) => (
          <div key={d.dayOffset} className="rounded-xl bg-sunken py-2.5">
            <p className="text-xs text-ink-3">{m.dayLabels[d.dayOffset] ?? `Day ${d.dayOffset + 1}`}</p>
            <p className="mt-0.5 text-sm font-medium text-ink">{weatherTerm(d.text, locale)}</p>
            {d.textNight && d.textNight !== d.text && (
              <p className="text-2xs text-ink-3">
                {m.cards.night}：{weatherTerm(d.textNight, locale)}
              </p>
            )}
            <p className="mt-1 text-sm font-semibold text-ink">
              {d.tempMax}° <span className="font-normal text-ink-3">{d.tempMin}°</span>
            </p>
            {d.wind && <p className="text-2xs text-ink-3">{fmt(m.cards.windLabel, { w: windTerm(d.wind, locale) })}</p>}
          </div>
        ))}
      </div>
      <p className="mt-3 rounded-xl bg-primary-weak px-3 py-2 text-xs text-primary">💡 {advice}</p>
    </Surface>
  );
}

function TransportDealsCard({ data }: { data: PricingData }) {
  const { m } = useI18n();
  const t = data.travellers;
  const transport = m.engine.transport[data.transport];
  return (
    <Surface className="p-4">
      <p className="text-xs text-ink-3">
        {m.cards.pricingFor}：{t.adults} {m.cards.adultsSuffix}
        {t.children > 0 ? ` + ${t.children} ${m.cards.childrenSuffix}` : ""}
      </p>

      <div className="mt-2 rounded-xl bg-sunken p-3">
        <p className="text-sm font-semibold text-ink">🚕 {transport.mode}</p>
        <p className="mt-0.5 text-xs text-ink-3">{transport.reason}</p>
        <p className="mt-1 text-xs font-medium text-primary">{transport.cost}</p>
      </div>

      <div className="mt-3 space-y-2">
        {data.discounts.map((key) => {
          const d = m.engine.discount[key];
          return (
            <div key={key} className="flex gap-2">
              <span className="text-sm">🎟️</span>
              <div>
                <p className="text-sm font-medium text-ink">{d.name}</p>
                <p className="text-xs text-ink-3">{d.detail}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 rounded-xl bg-primary-weak p-3">
        <p className="text-xs font-medium text-primary">💳 {m.cards.pay}</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-primary/80">
          {m.engine.paymentTips.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </div>

      <p className="mt-2 text-2xs text-ink-3">{m.engine.estimateNote}</p>
    </Surface>
  );
}

function FoodListCard({ data }: { data: FoodData[] }) {
  const { m, locale } = useI18n();
  const foods = data.map((f) => localizeFood(f, locale));
  return (
    <Surface className="p-4">
      <p className="text-sm font-semibold text-ink">🍜 {m.cards.foodTitle}</p>
      <div className="mt-2 divide-y divide-line">
        {foods.map((f) => (
          <div key={f.name} className="flex items-start justify-between gap-3 py-2">
            <div>
              <p className="text-sm font-medium text-ink">{f.name}</p>
              <p className="text-xs text-ink-3">
                {f.area} · {f.category}
              </p>
              <p className="text-xs text-ink-3">
                {m.cards.mustTry} {f.mustTry}
              </p>
            </div>
            <span className="flex-none text-xs font-medium text-primary">¥{f.priceRMB}</span>
          </div>
        ))}
      </div>
    </Surface>
  );
}

function DealListCard({ data }: { data: DealData[] }) {
  const { m, locale } = useI18n();
  const deals = data.map((d) => localizeDeal(d, locale));
  return (
    <Surface className="p-4">
      <p className="text-sm font-semibold text-ink">🎫 {m.cards.dealTitle}</p>
      <div className="mt-2 space-y-2">
        {deals.map((d) => (
          <div key={d.id} className="rounded-xl border border-line p-3">
            <p className="text-sm font-medium text-ink">{d.title}</p>
            <p className="text-xs text-ink-3">
              {d.merchant} · {d.area}
            </p>
            <p className="mt-1 text-xs text-ink-2">{d.summary}</p>
            {d.validUntil && <p className="mt-1 text-2xs text-ink-3">{d.validUntil}</p>}
            <p className="mt-1 text-2xs text-ink-3">
              {m.cards.source}：{d.sourceName}
            </p>
          </div>
        ))}
      </div>
    </Surface>
  );
}

/** 排隊等級 → 徽章語義色調。`closed/maintenance` 用中性，與「正常」的綠相反。 */
const QUEUE_TONE: Record<QueueLevel, "success" | "warning" | "danger" | "neutral"> = {
  normal: "success",
  busy: "warning",
  veryBusy: "danger",
  maintenance: "neutral",
  closed: "neutral",
};

function BorderCard({ data }: { data: BorderCardData }) {
  const { m, locale } = useI18n();
  const borders = data.borders.map((b) => localizeBorder(b, locale));
  return (
    <Surface className="p-4">
      <p className="text-sm font-semibold text-ink">🛂 {m.cards.borderTitle}</p>

      <div className="mt-2 space-y-3">
        {borders.map((b) => {
          // liveCode 為 null（如西九龍）或實時資料取不到 → 就沒有徽章，其餘照常顯示。
          const level = b.liveCode ? data.queue?.[b.liveCode] : undefined;
          return (
            <div key={b.id} className="rounded-xl border border-line p-3">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p className="text-sm font-medium text-ink">
                  {b.nameHk}
                  {b.nameSz && b.nameSz !== b.nameHk && <span className="text-ink-3"> ⇄ {b.nameSz}</span>}
                </p>
                {level && (
                  <Tag tone={QUEUE_TONE[level]}>
                    {m.cards.borderLive}：{m.engine.queue[level]}
                  </Tag>
                )}
              </div>

              <p className="mt-0.5 text-xs text-ink-3">
                {b.modes.map((k) => m.engine.borderMode[k]).join(" · ")} · {b.hours}
              </p>
              <p className="mt-1 text-xs text-ink-2">
                <span className="text-ink-3">{m.cards.borderHkSide}：</span>
                {b.hkAccess}
              </p>
              <p className="text-xs text-ink-2">
                <span className="text-ink-3">{m.cards.borderSzSide}：</span>
                {b.szAccess}
              </p>
              <p className="mt-1 text-xs font-medium text-primary">{b.note}</p>
              {b.tip && <p className="mt-1 text-2xs text-warning">💡 {b.tip}</p>}
            </div>
          );
        })}
      </div>

      <p className="mt-3 rounded-xl bg-primary-weak px-3 py-2 text-xs text-primary">💳 {m.cards.borderPayment}</p>
      <p className="mt-2 text-2xs text-ink-3">
        {m.cards.borderUpdated} · {m.cards.borderDisclaimer}
      </p>
    </Surface>
  );
}

/**
 * 卡片種類 → 視圖的**登記表**（架構第 3 輪）。
 * mapped type `{ [K in Card["type"]]: ... }` **強制每種卡片都有一個視圖**——漏一種就編譯不過。
 */
type CardViewProps<D> = { data: D; onCycleRoute?: () => void };

const CARD_VIEWS: { [K in Card["type"]]: FC<CardViewProps<Extract<Card, { type: K }>["data"]>> } = {
  route: RouteCard,
  weather: WeatherCard,
  transportDeals: TransportDealsCard,
  foodList: FoodListCard,
  dealList: DealListCard,
  border: BorderCard,
};

export function CardView({ card, onCycleRoute }: { card: Card; onCycleRoute?: () => void }) {
  // card.type 與 card.data 的相關性，TS 在索引表後證不出來，故此處一個受限的轉型；
  // 真正的型別安全在 CARD_VIEWS 的構造處——每個條目都按自己的 data 型別檢查過。
  const View = CARD_VIEWS[card.type] as FC<CardViewProps<unknown>>;
  return <View data={card.data} onCycleRoute={onCycleRoute} />;
}





"use client";

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

/**
 * 卡片渲染。契约见票 01；型別為可辨識聯合，故各分支的 data 自動收窄。
 *
 * ⚠️ **所有文案都在前端按當前語言渲染**（含天氣建議與優惠交通卡的方案/優惠項），
 *    故切換語言時既有的卡片會即時跟著變。
 */

function RouteCard({ data, onCycle }: { data: RouteCardData; onCycle?: () => void }) {
  const { m, locale } = useI18n();
  const route = localizeRoute(data.route, locale);
  const { index, total } = data;
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-700">{route.theme}</span>
        <span className="text-xs text-slate-500">
          {route.area} · {fmt(m.cards.hours, { n: route.durationHours })}
        </span>
      </div>
      <h3 className="mt-2 text-base font-semibold text-slate-900">{route.title}</h3>
      <p className="mt-0.5 text-xs text-slate-500">
        {m.cards.bestFor}：{route.bestFor}
      </p>

      {/* 站點與地圖：窄屏上下堆疊，寬屏並排（票 10） */}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <ol className="space-y-3">
          {route.stops.map((s, i) => (
            <li key={`${s.name}-${i}`} className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-teal-600 text-xs font-semibold text-white">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {s.name} <span className="text-xs font-normal text-slate-400">· {s.area}</span>
                </p>
                <p className="text-xs text-slate-500">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* 路線地圖：伺服器代理取圖，key 不出現在瀏覽器 */}
        <img
          src={`/api/route-map?routeId=${encodeURIComponent(route.id)}`}
          alt={route.title}
          loading="lazy"
          className="w-full self-start rounded-xl ring-1 ring-slate-900/5"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      </div>

      {route.tips && <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">💡 {route.tips}</p>}

      {onCycle && total > 1 && (
        <button
          onClick={onCycle}
          className="mt-3 w-full rounded-xl border border-teal-600 py-2 text-sm font-medium text-teal-700 transition hover:bg-teal-50"
        >
          🔄 {m.cards.cycle}（{index + 1}/{total}）
        </button>
      )}
    </div>
  );
}

function WeatherCard({ data }: { data: WeatherData }) {
  const { m, locale } = useI18n();
  const advice = m.engine.weatherAdvice[adviceKeyFor(data.days)];
  return (
    <div className="rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 p-4 text-white shadow-sm">
      <p className="text-xs opacity-80">
        {m.city} · {fmt(m.cards.weatherTitle, { n: data.days.length })}
        {data.source === "mock" && ` (${m.cards.weatherSample})`}
      </p>
      <div className="mt-2 grid grid-cols-3 gap-2 text-center">
        {data.days.map((d) => (
          <div key={d.dayOffset} className="rounded-xl bg-white/15 py-2">
            <p className="text-xs opacity-90">{m.dayLabels[d.dayOffset] ?? `Day ${d.dayOffset + 1}`}</p>
            <p className="mt-0.5 text-sm font-medium">{weatherTerm(d.text, locale)}</p>
            {d.textNight && d.textNight !== d.text && (
              <p className="text-[10px] opacity-75">
                {m.cards.night}：{weatherTerm(d.textNight, locale)}
              </p>
            )}
            <p className="mt-1 text-sm font-semibold">
              {d.tempMax}° <span className="font-normal opacity-70">{d.tempMin}°</span>
            </p>
            {d.wind && <p className="text-[10px] opacity-75">{fmt(m.cards.windLabel, { w: windTerm(d.wind, locale) })}</p>}
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs opacity-95">💡 {advice}</p>
    </div>
  );
}

function TransportDealsCard({ data }: { data: PricingData }) {
  const { m } = useI18n();
  const t = data.travellers;
  const transport = m.engine.transport[data.transport];
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
      <p className="text-xs text-slate-500">
        {m.cards.pricingFor}：{t.adults} {m.cards.adultsSuffix}
        {t.children > 0 ? ` + ${t.children} ${m.cards.childrenSuffix}` : ""}
      </p>

      <div className="mt-2 rounded-xl bg-slate-50 p-3">
        <p className="text-sm font-semibold text-slate-900">🚕 {transport.mode}</p>
        <p className="mt-0.5 text-xs text-slate-500">{transport.reason}</p>
        <p className="mt-1 text-xs font-medium text-teal-700">{transport.cost}</p>
      </div>

      <div className="mt-3 space-y-2">
        {data.discounts.map((key) => {
          const d = m.engine.discount[key];
          return (
            <div key={key} className="flex gap-2">
              <span className="text-sm">🎟️</span>
              <div>
                <p className="text-sm font-medium text-slate-900">{d.name}</p>
                <p className="text-xs text-slate-500">{d.detail}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 rounded-xl bg-teal-50 p-3">
        <p className="text-xs font-medium text-teal-800">💳 {m.cards.pay}</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-teal-900/80">
          {m.engine.paymentTips.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </div>

      <p className="mt-2 text-[10px] text-slate-400">{m.engine.estimateNote}</p>
    </div>
  );
}

function FoodListCard({ data }: { data: FoodData[] }) {
  const { m, locale } = useI18n();
  const foods = data.map((f) => localizeFood(f, locale));
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
      <p className="text-sm font-semibold text-slate-900">🍜 {m.cards.foodTitle}</p>
      <div className="mt-2 divide-y divide-slate-100">
        {foods.map((f) => (
          <div key={f.name} className="flex items-start justify-between gap-3 py-2">
            <div>
              <p className="text-sm font-medium text-slate-900">{f.name}</p>
              <p className="text-xs text-slate-500">
                {f.area} · {f.category}
              </p>
              <p className="text-xs text-slate-400">
                {m.cards.mustTry} {f.mustTry}
              </p>
            </div>
            <span className="flex-none text-xs font-medium text-teal-700">¥{f.priceRMB}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DealListCard({ data }: { data: DealData[] }) {
  const { m, locale } = useI18n();
  const deals = data.map((d) => localizeDeal(d, locale));
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
      <p className="text-sm font-semibold text-slate-900">🎫 {m.cards.dealTitle}</p>
      <div className="mt-2 space-y-2">
        {deals.map((d) => (
          <div key={d.id} className="rounded-xl border border-slate-100 p-3">
            <p className="text-sm font-medium text-slate-900">{d.title}</p>
            <p className="text-xs text-slate-400">
              {d.merchant} · {d.area}
            </p>
            <p className="mt-1 text-xs text-slate-600">{d.summary}</p>
            {d.validUntil && <p className="mt-1 text-[10px] text-slate-400">{d.validUntil}</p>}
            <p className="mt-1 text-[10px] text-slate-400">
              {m.cards.source}：{d.sourceName}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** 排隊徽章的配色。`closed` 與 `normal` 顏色必須相反——一個是「唔使排」，一個是「冇開」。 */
const QUEUE_STYLE: Record<QueueLevel, string> = {
  normal: "bg-emerald-100 text-emerald-700",
  busy: "bg-amber-100 text-amber-700",
  veryBusy: "bg-rose-100 text-rose-700",
  maintenance: "bg-slate-200 text-slate-600",
  closed: "bg-slate-200 text-slate-500",
};

function BorderCard({ data }: { data: BorderCardData }) {
  const { m, locale } = useI18n();
  const borders = data.borders.map((b) => localizeBorder(b, locale));
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
      <p className="text-sm font-semibold text-slate-900">🛂 {m.cards.borderTitle}</p>

      <div className="mt-2 space-y-3">
        {borders.map((b) => {
          // liveCode 為 null（如西九龍）或實時資料取不到 → 就沒有徽章，其餘照常顯示。
          const level = data.queue?.[b.liveCode ?? ""];
          return (
            <div key={b.id} className="rounded-xl border border-slate-100 p-3">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p className="text-sm font-medium text-slate-900">
                  {b.nameHk}
                  {b.nameSz && b.nameSz !== b.nameHk && <span className="text-slate-400"> ⇄ {b.nameSz}</span>}
                </p>
                {level && (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${QUEUE_STYLE[level]}`}>
                    {m.cards.borderLive}：{m.engine.queue[level]}
                  </span>
                )}
              </div>

              <p className="mt-0.5 text-xs text-slate-400">
                {b.modes.map((k) => m.engine.borderMode[k]).join(" · ")} · {b.hours}
              </p>
              <p className="mt-1 text-xs text-slate-600">
                <span className="text-slate-400">{m.cards.borderHkSide}：</span>
                {b.hkAccess}
              </p>
              <p className="text-xs text-slate-600">
                <span className="text-slate-400">{m.cards.borderSzSide}：</span>
                {b.szAccess}
              </p>
              <p className="mt-1 text-xs font-medium text-teal-700">{b.note}</p>
              {b.tip && <p className="mt-1 text-[10px] text-amber-700">💡 {b.tip}</p>}
            </div>
          );
        })}
      </div>

      <p className="mt-3 rounded-xl bg-teal-50 px-3 py-2 text-xs text-teal-900/80">💳 {m.cards.borderPayment}</p>
      <p className="mt-2 text-[10px] text-slate-400">
        {m.cards.borderUpdated} · {m.cards.borderDisclaimer}
      </p>
    </div>
  );
}

export function CardView({ card, onCycleRoute }: { card: Card; onCycleRoute?: () => void }) {
  switch (card.type) {
    case "route":
      return <RouteCard data={card.data} onCycle={onCycleRoute} />;
    case "weather":
      return <WeatherCard data={card.data} />;
    case "transportDeals":
      return <TransportDealsCard data={card.data} />;
    case "foodList":
      return <FoodListCard data={card.data} />;
    case "dealList":
      return <DealListCard data={card.data} />;
    case "border":
      return <BorderCard data={card.data} />;
  }
}

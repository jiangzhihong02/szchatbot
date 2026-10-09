"use client";

import type {
  Card,
  RouteCardData,
  WeatherData,
  PricingData,
  FoodData,
  DealData,
} from "@/lib/types";

/**
 * 卡片渲染。契约见票 01；型別為可辨識聯合，故各分支的 data 自動收窄。
 * 兩種版面（手機對話 / 桌面分欄）共用此元件。
 */

function RouteCard({ data, onCycle }: { data: RouteCardData; onCycle?: () => void }) {
  const { route, index, total } = data;
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-700">
          {route.theme}
        </span>
        <span className="text-xs text-slate-500">
          {route.area} · 約 {route.durationHours} 小時
        </span>
      </div>
      <h3 className="mt-2 text-base font-semibold text-slate-900">{route.title}</h3>
      <p className="mt-0.5 text-xs text-slate-500">適合：{route.bestFor}</p>

      <ol className="mt-3 space-y-3">
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

      {/* 路線地圖（票 10）：伺服器代理取圖，key 不出現在瀏覽器 */}
      <img
        src={`/api/route-map?routeId=${encodeURIComponent(route.id)}`}
        alt={`${route.title} 路線圖`}
        loading="lazy"
        className="mt-3 w-full rounded-xl ring-1 ring-slate-900/5"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />

      {route.tips && (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">💡 {route.tips}</p>
      )}

      {onCycle && total > 1 && (
        <button
          onClick={onCycle}
          className="mt-3 w-full rounded-xl border border-teal-600 py-2 text-sm font-medium text-teal-700 transition hover:bg-teal-50"
        >
          🔄 換一條（{index + 1}/{total}）
        </button>
      )}
    </div>
  );
}

function WeatherCard({ data }: { data: WeatherData }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 p-4 text-white shadow-sm">
      <p className="text-xs opacity-80">
        {data.city}・未來 {data.days.length} 天
        {data.source === "mock" && "（示例）"}
      </p>
      <div className="mt-2 grid grid-cols-3 gap-2 text-center">
        {data.days.map((d) => (
          <div key={d.date} className="rounded-xl bg-white/15 py-2">
            <p className="text-xs opacity-90">{d.date}</p>
            <p className="mt-0.5 text-sm font-medium">{d.text}</p>
            {d.textNight && d.textNight !== d.text && (
              <p className="text-[10px] opacity-75">夜：{d.textNight}</p>
            )}
            <p className="mt-1 text-sm font-semibold">
              {d.tempMax}° <span className="font-normal opacity-70">{d.tempMin}°</span>
            </p>
            {d.wind && <p className="text-[10px] opacity-75">{d.wind}風</p>}
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs opacity-95">💡 {data.advice}</p>
    </div>
  );
}

function PricingCard({ data }: { data: PricingData }) {
  const { travellers: t } = data;
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
      <p className="text-xs text-slate-500">
        為你計算：{t.adults} 位大人{t.children > 0 ? ` + ${t.children} 位小孩` : ""}
      </p>

      <div className="mt-2 rounded-xl bg-slate-50 p-3">
        <p className="text-sm font-semibold text-slate-900">🚕 {data.transport.mode}</p>
        <p className="mt-0.5 text-xs text-slate-500">{data.transport.reason}</p>
        <p className="mt-1 text-xs font-medium text-teal-700">{data.transport.roughCost}</p>
      </div>

      <div className="mt-3 space-y-2">
        {data.discounts.map((d) => (
          <div key={d.name} className="flex gap-2">
            <span className="text-sm">🎟️</span>
            <div>
              <p className="text-sm font-medium text-slate-900">{d.name}</p>
              <p className="text-xs text-slate-500">{d.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-xl bg-teal-50 p-3">
        <p className="text-xs font-medium text-teal-800">💳 香港旅客支付</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-teal-900/80">
          {data.paymentTips.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function FoodListCard({ data }: { data: FoodData[] }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
      <p className="text-sm font-semibold text-slate-900">🍜 精選美食</p>
      <div className="mt-2 divide-y divide-slate-100">
        {data.map((f) => (
          <div key={f.name} className="flex items-start justify-between gap-3 py-2">
            <div>
              <p className="text-sm font-medium text-slate-900">{f.name}</p>
              <p className="text-xs text-slate-500">
                {f.area} · {f.category}
              </p>
              <p className="text-xs text-slate-400">必試 {f.mustTry}</p>
            </div>
            <span className="flex-none text-xs font-medium text-teal-700">¥{f.priceRMB}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DealListCard({ data }: { data: DealData[] }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
      <p className="text-sm font-semibold text-slate-900">🎫 深圳優惠活動</p>
      <div className="mt-2 space-y-2">
        {data.map((d) => (
          <div key={d.id} className="rounded-xl border border-slate-100 p-3">
            <p className="text-sm font-medium text-slate-900">{d.title}</p>
            <p className="text-xs text-slate-400">
              {d.merchant} · {d.area}
            </p>
            <p className="mt-1 text-xs text-slate-600">{d.summary}</p>
            <p className="mt-1 text-[10px] text-slate-400">來源：{d.sourceName}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardView({ card, onCycleRoute }: { card: Card; onCycleRoute?: () => void }) {
  switch (card.type) {
    case "route":
      return <RouteCard data={card.data} onCycle={onCycleRoute} />;
    case "weather":
      return <WeatherCard data={card.data} />;
    case "pricing":
      return <PricingCard data={card.data} />;
    case "foodList":
      return <FoodListCard data={card.data} />;
    case "dealList":
      return <DealListCard data={card.data} />;
  }
}

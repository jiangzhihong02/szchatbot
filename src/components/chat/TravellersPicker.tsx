"use client";

import { useState } from "react";
import type { Travellers } from "@/lib/types";
import { useI18n } from "@/components/i18n/LocaleProvider";

/** 出行組合快捷選項（契約規則 3）。 */
export function TravellersPicker({ onPick }: { onPick: (t: Travellers) => void }) {
  const { m } = useI18n();
  const [custom, setCustom] = useState(false);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(1);

  if (custom) {
    return (
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
        <p className="text-sm font-medium text-slate-900">{m.travellers.customTitle}</p>
        <div className="mt-3 flex items-center gap-4">
          <label className="text-sm text-slate-600">
            {m.travellers.adults}
            <input
              type="number"
              min={0}
              max={50}
              value={adults}
              onChange={(e) => setAdults(Number(e.target.value))}
              className="ml-2 w-16 rounded-lg border border-slate-200 px-2 py-1 text-center"
            />
          </label>
          <label className="text-sm text-slate-600">
            {m.travellers.children}
            <input
              type="number"
              min={0}
              max={50}
              value={children}
              onChange={(e) => setChildren(Number(e.target.value))}
              className="ml-2 w-16 rounded-lg border border-slate-200 px-2 py-1 text-center"
            />
          </label>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => onPick({ adults, children })}
            className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-medium text-white"
          >
            {m.travellers.calculate}
          </button>
          <button onClick={() => setCustom(false)} className="rounded-xl px-4 py-2 text-sm text-slate-500">
            {m.travellers.back}
          </button>
        </div>
      </div>
    );
  }

  const quick: { label: string; t: Travellers }[] = [
    { label: m.travellers.oneAdult, t: { adults: 1, children: 0 } },
    { label: m.travellers.twoAdults, t: { adults: 2, children: 0 } },
    { label: m.travellers.twoPlusOne, t: { adults: 2, children: 1 } },
  ];

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
      <p className="text-sm font-medium text-slate-900">{m.travellers.prompt}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {quick.map((q) => (
          <button
            key={q.label}
            onClick={() => onPick(q.t)}
            className="rounded-full border border-teal-600 px-3 py-1.5 text-sm font-medium text-teal-700 transition hover:bg-teal-50"
          >
            {q.label}
          </button>
        ))}
        <button
          onClick={() => setCustom(true)}
          className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition hover:border-slate-400"
        >
          {m.travellers.custom}
        </button>
      </div>
    </div>
  );
}

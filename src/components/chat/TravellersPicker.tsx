"use client";

import { useState } from "react";
import type { Travellers } from "@/lib/types";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { Card, Button, Chip, Input } from "@/components/ui";

/** 出行組合快捷選項（契約規則 3）。 */
export function TravellersPicker({ onPick }: { onPick: (t: Travellers) => void }) {
  const { m } = useI18n();
  const [custom, setCustom] = useState(false);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(1);

  if (custom) {
    return (
      <Card className="p-4">
        <p className="text-sm font-semibold text-ink">{m.travellers.customTitle}</p>
        <div className="mt-3 flex items-center gap-4">
          <label className="text-sm text-ink-2">
            {m.travellers.adults}
            <Input
              type="number"
              min={0}
              max={50}
              value={adults}
              onChange={(e) => setAdults(Number(e.target.value))}
              className="ml-2 h-9 w-16 !rounded-lg px-2 text-center"
            />
          </label>
          <label className="text-sm text-ink-2">
            {m.travellers.children}
            <Input
              type="number"
              min={0}
              max={50}
              value={children}
              onChange={(e) => setChildren(Number(e.target.value))}
              className="ml-2 h-9 w-16 !rounded-lg px-2 text-center"
            />
          </label>
        </div>
        <div className="mt-4 flex gap-2">
          <Button onClick={() => onPick({ adults, children })}>{m.travellers.calculate}</Button>
          <Button variant="ghost" onClick={() => setCustom(false)}>
            {m.travellers.back}
          </Button>
        </div>
      </Card>
    );
  }

  const quick: { label: string; t: Travellers }[] = [
    { label: m.travellers.oneAdult, t: { adults: 1, children: 0 } },
    { label: m.travellers.twoAdults, t: { adults: 2, children: 0 } },
    { label: m.travellers.twoPlusOne, t: { adults: 2, children: 1 } },
  ];

  return (
    <Card className="p-4">
      <p className="text-sm font-semibold text-ink">{m.travellers.prompt}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {quick.map((q) => (
          <Chip key={q.label} onClick={() => onPick(q.t)}>
            {q.label}
          </Chip>
        ))}
        <Chip onClick={() => setCustom(true)}>{m.travellers.custom}</Chip>
      </div>
    </Card>
  );
}

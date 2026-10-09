"use client";

import { PRESET_BUTTONS } from "@/lib/presets";
import type { IntentKey } from "@/lib/presets";
import { useI18n } from "@/components/i18n/LocaleProvider";

/** 六個預設按鈕（票 01 契約；文案隨語言）。 */
export function PresetBar({
  onPick,
  disabled,
  layout = "row",
}: {
  onPick: (key: IntentKey) => void;
  disabled?: boolean;
  layout?: "row" | "grid";
}) {
  const { m } = useI18n();
  const cls = layout === "row" ? "flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]" : "grid grid-cols-2 gap-2";
  return (
    <div className={cls}>
      {PRESET_BUTTONS.map((b) => (
        <button
          key={b.key}
          onClick={() => onPick(b.key)}
          disabled={disabled}
          className={`flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:border-teal-500 hover:text-teal-700 disabled:opacity-50 ${
            layout === "grid" ? "justify-start rounded-2xl px-3 py-2.5" : "flex-none"
          }`}
        >
          <span className="text-base">{b.emoji}</span>
          <span className="font-medium">{m.presets[b.key].label}</span>
        </button>
      ))}
    </div>
  );
}

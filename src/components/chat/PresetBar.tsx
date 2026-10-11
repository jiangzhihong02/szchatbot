"use client";

import { PRESET_BUTTONS } from "@/lib/presets";
import type { IntentKey } from "@/lib/presets";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { Chip } from "@/components/ui";

/** 七個預設按鈕（票 01 契約；文案隨語言）。類別 emoji 保留作內容識別。 */
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
  const cls =
    layout === "row" ? "flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]" : "grid grid-cols-2 gap-2";
  return (
    <div className={cls}>
      {PRESET_BUTTONS.map((b) => (
        <Chip
          key={b.key}
          onClick={() => onPick(b.key)}
          disabled={disabled}
          className={layout === "grid" ? "justify-start" : "flex-none"}
        >
          <span className="text-base leading-none">{b.emoji}</span>
          <span className="font-medium">{m.presets[b.key].label}</span>
        </Chip>
      ))}
    </div>
  );
}

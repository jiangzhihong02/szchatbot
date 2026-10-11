"use client";

import { LOCALES, LOCALE_NAMES, LOCALE_SHORT } from "@/lib/i18n/config";
import { useI18n } from "./LocaleProvider";

/**
 * 語言選擇器（右上角）。分段控件：選中段為白底浮起，其餘弱化。
 * tone 保留以兼容舊呼叫處；本次設計頭部已改中性底，一律 light。
 */
export function LocaleSwitcher({ tone = "light" }: { tone?: "light" | "dark" }) {
  const { locale, setLocale, m } = useI18n();

  const container = tone === "dark" ? "bg-white/15" : "bg-sunken";
  const activeCls = tone === "dark" ? "bg-white/90 text-ink" : "bg-surface text-ink shadow-e1";
  const idleCls = tone === "dark" ? "text-white/90 hover:bg-white/10" : "text-ink-2 hover:text-ink";

  return (
    <div
      role="group"
      aria-label={m.localeLabel}
      className={`flex items-center gap-0.5 rounded-full p-0.5 ${container}`}
    >
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          aria-pressed={locale === l}
          title={LOCALE_NAMES[l]}
          className={`rounded-full px-2.5 py-1 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
            locale === l ? activeCls : idleCls
          }`}
        >
          {LOCALE_SHORT[l]}
        </button>
      ))}
    </div>
  );
}

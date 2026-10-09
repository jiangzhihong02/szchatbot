"use client";

import { LOCALES, LOCALE_NAMES, LOCALE_SHORT } from "@/lib/i18n/config";
import { useI18n } from "./LocaleProvider";

/** 語言選擇器（右上角）。短標籤，桌面顯示全名。 */
export function LocaleSwitcher({ tone = "light" }: { tone?: "light" | "dark" }) {
  const { locale, setLocale, m } = useI18n();

  const base =
    tone === "dark"
      ? "text-white/90 hover:bg-white/20"
      : "text-slate-600 hover:bg-slate-100";
  const active = tone === "dark" ? "bg-white/25 text-white" : "bg-slate-900 text-white";

  return (
    <div
      role="group"
      aria-label={m.localeLabel}
      className={`flex items-center gap-0.5 rounded-full p-0.5 ${tone === "dark" ? "bg-white/10" : "bg-slate-100"}`}
    >
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          aria-pressed={locale === l}
          title={LOCALE_NAMES[l]}
          className={`rounded-full px-2 py-1 text-xs font-medium transition ${
            locale === l ? active : base
          }`}
        >
          {LOCALE_SHORT[l]}
        </button>
      ))}
    </div>
  );
}

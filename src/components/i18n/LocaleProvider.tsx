"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { HTML_LANG, LOCALE_COOKIE, type Locale } from "@/lib/i18n/config";
import { getMessages, type Messages } from "@/lib/i18n/messages";

/**
 * 語言上下文（票 11）。
 * 初始值由伺服器（layout）依 cookie 決定，避免首屏閃爍；
 * 切換時同時寫 cookie 並更新 <html lang>。
 */
interface LocaleCtxValue {
  locale: Locale;
  m: Messages;
  setLocale: (l: Locale) => void;
}

const LocaleCtx = createContext<LocaleCtxValue | null>(null);

export function LocaleProvider({
  initial,
  children,
}: {
  initial: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initial);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
      document.documentElement.lang = HTML_LANG[next];
    } catch {
      /* cookie 不可用時仍切換本次會話 */
    }
  }, []);

  const value = useMemo<LocaleCtxValue>(
    () => ({ locale, m: getMessages(locale), setLocale }),
    [locale, setLocale]
  );

  return <LocaleCtx.Provider value={value}>{children}</LocaleCtx.Provider>;
}

export function useI18n(): LocaleCtxValue {
  const ctx = useContext(LocaleCtx);
  if (!ctx) throw new Error("useI18n 必須在 <LocaleProvider> 內使用");
  return ctx;
}

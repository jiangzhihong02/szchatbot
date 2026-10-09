/**
 * 裝置分發的判斷（票 02 / ADR-0002）。
 * 純函式、無 header 讀取 —— 故 UA 與覆寫優先序可以**用表驅動測試**，
 * 不必跑起伺服器。ADR-0002 說「別把它當 bug 修」的那個判斷就住在這裡。
 */

export type Variant = "mobile" | "desktop";

/** 手機 UA 的特徵。刻意不含 iPad：平板螢幕夠大，分欄版更合用。 */
const MOBILE_RE = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i;

/**
 * 決定用哪套介面結構。
 * `override` 是 ADR-0002 要求的覆寫入口（`?variant=mobile|desktop`），優先於 UA。
 */
export function resolveVariant(userAgent: string, override?: string): Variant {
  if (override === "mobile") return "mobile";
  if (override === "desktop") return "desktop";
  return MOBILE_RE.test(userAgent) ? "mobile" : "desktop";
}

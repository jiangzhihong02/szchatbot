import type { ButtonHTMLAttributes, ReactNode } from "react";
import { FOCUS } from "./styles";

/**
 * 可點選的膠囊 chip（預設按鈕、出行組合快捷選項）。
 * active＝選中態（primary 淡底 + 綠邊）。類別 emoji 由呼叫方放進 children。
 */
export function Chip({
  active = false,
  className = "",
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean; children: ReactNode }) {
  const look = active
    ? "border-primary bg-primary-weak text-primary"
    : "border-line bg-surface text-ink-2 hover:border-ink-3 hover:text-ink";
  return (
    <button
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition disabled:pointer-events-none disabled:opacity-40 ${FOCUS} ${look} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

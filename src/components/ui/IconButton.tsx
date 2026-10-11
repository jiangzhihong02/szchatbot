import type { ButtonHTMLAttributes, ReactNode } from "react";
import { FOCUS, PRIMARY_SURFACE } from "./styles";

/**
 * 圓形圖標鈕（發送、麥克風等）。children 放 `ui/Icon`（Solar Duotone）。
 * tone：primary（實心綠）／neutral（sunken）／danger（淡紅，如收音中）。
 */
type Tone = "primary" | "neutral" | "danger";
type Size = "sm" | "md";

const TONE: Record<Tone, string> = {
  primary: PRIMARY_SURFACE,
  neutral: "bg-sunken text-ink-2 hover:bg-line",
  danger: "bg-danger-weak text-danger",
};

const SIZE: Record<Size, string> = {
  sm: "h-9 w-9",
  md: "h-10 w-10",
};

export function IconButton({
  tone = "neutral",
  size = "md",
  className = "",
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone; size?: Size; children: ReactNode }) {
  return (
    <button
      className={`inline-flex flex-none items-center justify-center rounded-full transition active:translate-y-0 disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-40 disabled:shadow-none ${FOCUS} ${TONE[tone]} ${SIZE[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

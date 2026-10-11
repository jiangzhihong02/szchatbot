import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * 圓形圖標鈕（發送、麥克風等）。children 放 lucide 圖標。
 * tone：primary（實心綠）／neutral（sunken）／danger（淡紅，如收音中）。
 */
type Tone = "primary" | "neutral" | "danger";
type Size = "sm" | "md";

const TONE: Record<Tone, string> = {
  primary: "bg-primary text-on-primary hover:bg-primary-hover",
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
      className={`inline-flex flex-none items-center justify-center rounded-full transition disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${TONE[tone]} ${SIZE[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

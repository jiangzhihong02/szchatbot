import type { HTMLAttributes, ReactNode } from "react";

/**
 * 狀態標籤（實色文字 + 淡底）。排隊徽章、優惠出處、tips 都用它。
 * tone 映射語義色；不再散用 emerald/amber/rose。
 */
type Tone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

const TONE: Record<Tone, string> = {
  neutral: "bg-sunken text-ink-3",
  primary: "bg-primary-weak text-primary",
  success: "bg-success-weak text-success",
  warning: "bg-warning-weak text-warning",
  danger: "bg-danger-weak text-danger",
  info: "bg-info-weak text-info",
};

export function Tag({
  tone = "neutral",
  className = "",
  children,
  ...rest
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE[tone]} ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
}

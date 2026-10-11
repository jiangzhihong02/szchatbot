import type { ButtonHTMLAttributes } from "react";

/**
 * 按鈕 —— 唯一定義。取代散落在 Composer/PresetBar/TravellersPicker 的 raw <button>。
 * variant：primary（旅行綠）／secondary（表面+髮絲描邊）／ghost（純文字）／accent（黑，罕用，最高強度）。
 * 全組件統一：hover、focus-visible ring、disabled opacity-40。
 */
type Variant = "primary" | "secondary" | "ghost" | "accent";
type Size = "sm" | "md";

const VARIANT: Record<Variant, string> = {
  primary: "bg-primary text-on-primary hover:bg-primary-hover",
  secondary: "bg-surface text-ink border border-line hover:bg-sunken",
  ghost: "bg-transparent text-ink-2 hover:bg-sunken",
  accent: "bg-accent-ink text-white hover:opacity-90",
};

const SIZE: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-full font-semibold transition disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${VARIANT[variant]} ${SIZE[size]} ${className}`}
      {...rest}
    />
  );
}

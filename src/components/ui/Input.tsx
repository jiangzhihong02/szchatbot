import type { InputHTMLAttributes } from "react";

/**
 * 文字輸入 —— sunken 底 + focus 顯 primary ring（補今天 `outline-none` 無替代 ring 的 a11y 缺口）。
 */
export function Input({ className = "", ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`rounded-full bg-sunken px-4 text-sm text-ink outline-none transition placeholder:text-ink-3 focus:ring-2 focus:ring-primary/40 ${className}`}
      {...rest}
    />
  );
}

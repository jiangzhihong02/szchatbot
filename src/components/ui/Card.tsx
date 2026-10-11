import type { HTMLAttributes } from "react";

/**
 * 卡片外殼 —— 唯一定義。取代今天手抄 7 次的
 * `rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5`。
 * 只負責表面/描邊/圓角/陰影；內距由使用者加 `p-4` 之類（或用 className）。
 */
export function Card({ className = "", ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-line bg-surface shadow-e1 ${className}`}
      {...rest}
    />
  );
}

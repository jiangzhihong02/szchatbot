import type { HTMLAttributes } from "react";

/**
 * 通用視覺外殼（surface + 髮絲描邊 + 圓角 + 克制陰影）—— 取代手抄 7 次的卡殼。
 * 刻意**不叫 Card**：CONTEXT.md 的「卡片／Card」是領域概念（固定格式的結構化回覆，六種），
 * 一個通用容器不該佔用那個名字。這裡只是一個表面。
 */
export function Surface({ className = "", ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-line bg-surface shadow-e1 ${className}`}
      {...rest}
    />
  );
}

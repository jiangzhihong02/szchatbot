import type { ReactNode } from "react";

/**
 * 空狀態 —— 線性圖標 + 一句引導 +（可選）動作。取代 `👈/👋` emoji 空頁。
 */
export function EmptyState({
  icon,
  title,
  hint,
  action,
  className = "",
}: {
  icon?: ReactNode;
  title: string;
  hint?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center px-6 py-10 text-center ${className}`}>
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-weak text-primary">
          {icon}
        </div>
      )}
      <p className="mt-3 font-semibold text-ink">{title}</p>
      {hint && <p className="mt-1 text-sm text-ink-3">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

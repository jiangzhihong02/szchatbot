/**
 * 骨架屏積木。取數時用它佔位，取代「整頁 Loading…」或只有串流游標。
 * 用法：<Skeleton className="h-3 w-2/3" /> 等。
 */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-line/70 ${className}`} />;
}

/** 卡片載入佔位：縮略圖 + 三行。 */
export function CardSkeleton() {
  return (
    <div className="flex items-start gap-3">
      <Skeleton className="h-13 w-13 flex-none rounded-xl" />
      <div className="flex-1 space-y-2 py-1">
        <Skeleton className="h-3 w-3/5" />
        <Skeleton className="h-2.5 w-2/5" />
        <Skeleton className="h-2.5 w-4/5" />
      </div>
    </div>
  );
}

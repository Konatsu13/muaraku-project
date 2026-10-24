import React from "react";

export function SkeletonLine({
  className = "",
  width = "w-full",
  height = "h-4",
}: {
  className?: string;
  width?: string;
  height?: string;
}) {
  return (
    <div
      className={`bg-zinc-200/80 dark:bg-zinc-800 rounded-md animate-pulse ${width} ${height} ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`p-5 rounded-2xl bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <SkeletonLine width="w-24" height="h-5" className="rounded-full" />
        <SkeletonLine width="w-16" height="h-4" />
      </div>
      <div className="space-y-2">
        <SkeletonLine width="w-3/4" height="h-5" />
        <SkeletonLine width="w-full" height="h-4" />
        <SkeletonLine width="w-2/3" height="h-4" />
      </div>
      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
        <SkeletonLine width="w-28" height="h-4" />
        <SkeletonLine width="w-20" height="h-4" />
      </div>
    </div>
  );
}

export function SkeletonFeed({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

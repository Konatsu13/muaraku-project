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
      className={`rounded-2xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 overflow-hidden space-y-3 p-4 ${className}`}
    >
      <div className="aspect-[16/10] bg-zinc-200/60 dark:bg-zinc-850 rounded-xl animate-pulse" />
      <div className="space-y-2 pt-2">
        <SkeletonLine width="w-3/4" height="h-4" />
        <SkeletonLine width="w-full" height="h-3" />
        <SkeletonLine width="w-1/2" height="h-3" />
      </div>
      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
        <SkeletonLine width="w-20" height="h-3" />
        <SkeletonLine width="w-16" height="h-3" />
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

export function LoadingPattern({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

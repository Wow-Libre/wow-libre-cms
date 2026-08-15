"use client";

export function NewsCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/70">
      <div className="aspect-[16/9] animate-pulse bg-slate-700/40" />
      <div className="space-y-2 p-3">
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-700/50" />
        <div className="h-3 w-full animate-pulse rounded bg-slate-700/40" />
        <div className="flex justify-between">
          <div className="h-2 w-16 animate-pulse rounded bg-slate-700/40" />
          <div className="h-2 w-12 animate-pulse rounded bg-slate-700/40" />
        </div>
      </div>
    </div>
  );
}

export function NewsCardSkeletonList({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <NewsCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default NewsCardSkeletonList;

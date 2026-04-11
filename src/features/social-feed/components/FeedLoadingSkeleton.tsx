"use client";

import { communityCard } from "../constants/communityStyles";

export function FeedLoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {[0, 1, 2].map((i) => (
        <div key={i} className={`overflow-hidden p-6 sm:p-7 ${communityCard}`}>
          <div className="flex gap-4">
            <div className="h-12 w-12 shrink-0 rounded-full bg-white/10 ring-2 ring-white/5 sm:h-14 sm:w-14" />
            <div className="flex-1 space-y-2.5 pt-1">
              <div className="h-4 w-40 rounded-full bg-white/10" />
              <div className="h-3.5 w-28 rounded-full bg-white/5" />
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <div className="h-4 w-full rounded-full bg-white/10" />
            <div className="h-4 w-[92%] rounded-full bg-white/10" />
            <div className="h-4 w-[58%] rounded-full bg-white/5" />
          </div>
          <div className="mt-6 aspect-video rounded-xl bg-gradient-to-br from-white/10 to-white/5" />
          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-5">
            <div className="h-12 rounded-xl bg-white/5" />
            <div className="h-12 rounded-xl bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

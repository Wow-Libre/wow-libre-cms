"use client";

import { NewsModel } from "@/model/News";
import { summarize } from "./newsHelpers";

export function NewsStats({ list }: { list: NewsModel[] }) {
  const s = summarize(list);
  const tiles = [
    { id: "total", label: "Total", value: s.total, tone: "from-indigo-500/80 to-violet-500/80" },
    { id: "recent", label: "Últimos 7 días", value: s.recent, tone: "from-sky-500/80 to-blue-500/80" },
    { id: "withImage", label: "Con imagen", value: s.withImage, tone: "from-emerald-500/80 to-teal-500/80" },
    { id: "subtitled", label: "Con subtítulo", value: s.subtitled, tone: "from-amber-500/80 to-orange-500/80" },
  ] as const;
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {tiles.map((tile) => (
        <div
          key={tile.id}
          className="relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/70 p-4 sm:p-5"
        >
          <div
            className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${tile.tone}`}
            aria-hidden
          />
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {tile.label}
          </p>
          <p className="mt-1.5 text-3xl font-bold tabular-nums text-white">
            {tile.value}
          </p>
        </div>
      ))}
    </div>
  );
}

export default NewsStats;

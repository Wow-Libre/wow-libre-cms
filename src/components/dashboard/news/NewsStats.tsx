"use client";

import { NewsModel } from "@/model/News";
import { summarize } from "./newsHelpers";

const TILES = [
  { id: "total", label: "Total", tone: "from-indigo-500/80 to-violet-500/80" },
  { id: "published", label: "Publicadas", tone: "from-emerald-500/80 to-teal-500/80" },
  { id: "drafts", label: "Borradores", tone: "from-amber-500/80 to-orange-500/80" },
  { id: "recent", label: "Últimos 7 días", tone: "from-sky-500/80 to-blue-500/80" },
] as const;

export function NewsStats({ list }: { list: NewsModel[] }) {
  const s = summarize(list);
  const values: Record<(typeof TILES)[number]["id"], number> = {
    total: s.total,
    published: s.published,
    drafts: s.drafts,
    recent: s.recent,
  };
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {TILES.map((tile) => (
        <div
          key={tile.id}
          className="relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/70 p-3 sm:p-4"
        >
          <div
            className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${tile.tone}`}
            aria-hidden
          />
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {tile.label}
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-white">
            {values[tile.id]}
          </p>
        </div>
      ))}
    </div>
  );
}

export default NewsStats;

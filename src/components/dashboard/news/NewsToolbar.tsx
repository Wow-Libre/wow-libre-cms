"use client";

import { useState } from "react";
import { NEWS_SORTS, NewsSort } from "./newsHelpers";

export function NewsToolbar({
  query,
  onQueryChange,
  sort,
  onSortChange,
  count,
  onNew,
}: {
  query: string;
  onQueryChange: (q: string) => void;
  sort: NewsSort;
  onSortChange: (s: NewsSort) => void;
  count: number;
  onNew: () => void;
}) {
  const [openSort, setOpenSort] = useState(false);
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
          />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Buscar por título, subtítulo o autor…"
          className="w-full rounded-xl border border-slate-600/50 bg-slate-800/50 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      <div className="flex items-center gap-2">
        <div className="text-xs text-slate-500 tabular-nums">
          {count} resultado{count === 1 ? "" : "s"}
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenSort((v) => !v)}
            onBlur={() => setTimeout(() => setOpenSort(false), 150)}
            aria-haspopup="listbox"
            aria-expanded={openSort}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-600/50 bg-slate-800/50 px-3 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700/50"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
              />
            </svg>
            {NEWS_SORTS.find((s) => s.id === sort)?.label}
          </button>
          {openSort && (
            <ul
              role="listbox"
              className="absolute right-0 z-30 mt-1 w-44 overflow-hidden rounded-xl border border-slate-600/50 bg-slate-900 shadow-2xl"
            >
              {NEWS_SORTS.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onMouseDown={() => onSortChange(s.id)}
                    className={`block w-full px-3 py-2 text-left text-sm transition-colors hover:bg-slate-800 ${s.id === sort ? "bg-indigo-500/10 text-indigo-300" : "text-slate-200"}`}
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="button"
          onClick={onNew}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white transition-opacity hover:bg-indigo-500"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Nueva noticia
        </button>
      </div>
    </div>
  );
}

export default NewsToolbar;

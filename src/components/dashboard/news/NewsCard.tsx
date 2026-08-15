"use client";

import { NewsModel } from "@/model/News";
import { formatRelative, getNewsStatus } from "./newsHelpers";
import { NewsStatusBadge } from "./NewsStatusBadge";

export function NewsCard({
  news,
  selected,
  onSelect,
  onEdit,
  onDelete,
  onShowSubnews,
  onCreateSubnews,
  subnewsCount,
}: {
  news: NewsModel;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onShowSubnews: () => void;
  onCreateSubnews: () => void;
  subnewsCount?: number;
}) {
  const status = getNewsStatus(news);
  return (
    <article
      className={[
        "group relative overflow-hidden rounded-xl border bg-slate-800/70 transition-all duration-150",
        selected
          ? "border-indigo-500/60 ring-2 ring-indigo-500/30"
          : "border-slate-700/50 hover:border-slate-600/80",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        aria-label={`Editar ${news.title}`}
        className="block w-full text-left"
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-slate-900">
          {news.img_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={news.img_url}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-600">
              <svg
                className="h-12 w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
          <div className="absolute left-2 top-2">
            <NewsStatusBadge status={status} size="sm" />
          </div>
          {selected && (
            <div className="absolute right-2 top-2 rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              Editando
            </div>
          )}
        </div>
        <div className="space-y-1.5 p-3">
          <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-white">
            {news.title || "Sin título"}
          </h3>
          <p className="line-clamp-2 text-xs leading-relaxed text-slate-400">
            {news.sub_title || "Sin subtítulo"}
          </p>
          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
            <span className="truncate font-medium text-slate-400">
              {news.author || "—"}
            </span>
            <span className="tabular-nums">{formatRelative(news.created_at)}</span>
          </div>
        </div>
      </button>

      <div className="flex items-center gap-1 border-t border-slate-700/50 bg-slate-900/40 px-2 py-2">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-700/60"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Editar
        </button>
        <button
          type="button"
          onClick={onShowSubnews}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-700/60"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          Subnoticias
          {typeof subnewsCount === "number" && subnewsCount > 0 && (
            <span className="ml-1 rounded-full bg-slate-700 px-1.5 text-[10px] tabular-nums text-slate-200">
              {subnewsCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={onCreateSubnews}
          className="inline-flex items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs font-semibold text-indigo-300 transition-colors hover:bg-indigo-500/10"
          aria-label="Crear subnoticia"
          title="Crear subnoticia"
        >
          <svg
            className="h-3.5 w-3.5"
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
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center justify-center rounded-md px-2 py-1.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/10"
          aria-label={`Eliminar ${news.title}`}
          title="Eliminar"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </article>
  );
}

export default NewsCard;

"use client";

import type { NewsModel } from "@/model/News";
import Link from "next/link";
import { formatNewsDate } from "../utils/formatNewsDate";

function StoryRow({ card }: { card: NewsModel }) {
  return (
    <li>
      <Link
        href={`/news/${card.id}`}
        className="group flex flex-col gap-4 rounded-xl border border-transparent p-3 transition hover:border-white/10 hover:bg-white/[0.04] sm:flex-row sm:items-center sm:gap-6 sm:p-4"
      >
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl bg-black/40 ring-1 ring-white/10 sm:aspect-auto sm:h-28 sm:w-44">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={card.img_url}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="line-clamp-2 text-lg font-semibold leading-snug text-slate-100 transition group-hover:text-amber-200">
            {card.title}
          </h4>
          <p className="mt-1.5 line-clamp-2 text-sm text-slate-400">
            {card.sub_title}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <time dateTime={card.created_at} className="text-slate-400">
              {formatNewsDate(card.created_at)}
            </time>
            {card.author ? (
              <span>
                <span className="text-slate-600">·</span> @{card.author}
              </span>
            ) : null}
          </div>
        </div>
        <span
          className="hidden shrink-0 text-amber-400/0 transition group-hover:text-amber-400/90 sm:block"
          aria-hidden
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </Link>
    </li>
  );
}

export function NewsStoriesSection({
  items,
  loading,
  loadMoreLoading,
  hasMore,
  onLoadMore,
}: {
  items: NewsModel[];
  loading?: boolean;
  loadMoreLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}) {
  if (!loading && items.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-950/40 shadow-[0_20px_45px_rgba(0,0,0,0.25)] backdrop-blur-[2px]">
      <div className="border-b border-white/10 px-5 py-5 sm:px-8 sm:py-6">
        <h2 className="font-gaming text-xl font-semibold tracking-wide text-white sm:text-2xl">
          Más historias
        </h2>
        <p className="mt-1.5 text-sm text-slate-400">
          Explora el archivo completo de noticias y actualizaciones.
        </p>
      </div>

      <div className="px-3 py-4 sm:px-6 sm:py-5">
        {loading ? (
          <ul className="space-y-2" aria-busy>
            {Array.from({ length: 4 }).map((_, i) => (
              <li
                key={i}
                className="flex animate-pulse gap-4 rounded-xl p-4 sm:items-center"
              >
                <div className="h-28 w-full shrink-0 rounded-xl bg-white/10 sm:w-44" />
                <div className="flex flex-1 flex-col gap-2">
                  <div className="h-5 w-full rounded bg-white/10" />
                  <div className="h-4 w-4/5 rounded bg-white/5" />
                  <div className="h-3 w-1/4 rounded bg-white/5" />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="divide-y divide-white/5">
            {items.map((card) => (
              <StoryRow key={card.id} card={card} />
            ))}
          </ul>
        )}

        {hasMore && !loading && (
          <div className="mt-6 flex justify-center border-t border-white/5 pt-6">
            <button
              type="button"
              onClick={onLoadMore}
              disabled={loadMoreLoading}
              className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-8 py-2.5 text-sm font-semibold tracking-wide text-amber-200 transition hover:border-amber-300/60 hover:bg-amber-500/20 hover:text-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadMoreLoading ? "Cargando…" : "Ver más historias"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

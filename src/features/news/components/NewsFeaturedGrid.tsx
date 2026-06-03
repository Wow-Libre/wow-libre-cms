"use client";

import type { NewsModel } from "@/model/News";
import Link from "next/link";
import { formatNewsDate } from "../utils/formatNewsDate";

function FeaturedCard({
  card,
  featured,
}: {
  card: NewsModel;
  featured: boolean;
}) {
  return (
    <Link
      href={`/news/${card.id}`}
      className={`group relative flex min-h-[220px] overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40 shadow-[0_20px_45px_rgba(0,0,0,0.35)] transition-all duration-500 hover:scale-[1.01] hover:border-amber-300/25 hover:shadow-[0_24px_52px_rgba(0,0,0,0.45)] sm:min-h-[200px] ${
        featured ? "sm:col-span-2 sm:row-span-2 sm:min-h-[360px] lg:min-h-0" : ""
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={card.img_url}
        alt={card.title}
        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
        loading={featured ? "eager" : "lazy"}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/45 to-slate-950/10 transition duration-500 group-hover:from-slate-950/98 group-hover:via-slate-950/55" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative mt-auto flex w-full flex-col p-5 md:p-6">
        {featured && (
          <span className="mb-3 w-fit rounded-full border border-amber-400/35 bg-amber-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-200">
            Destacado
          </span>
        )}
        <h3
          className={`line-clamp-2 font-bold leading-tight text-amber-300 transition-colors duration-300 group-hover:text-amber-200 ${
            featured ? "text-xl md:text-2xl lg:text-3xl" : "text-lg md:text-xl"
          }`}
        >
          {card.title}
        </h3>
        <p
          className={`mt-2 line-clamp-2 text-slate-300 ${
            featured ? "text-sm md:text-base" : "text-sm"
          }`}
        >
          {card.sub_title}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
          <time dateTime={card.created_at}>{formatNewsDate(card.created_at)}</time>
          {card.author ? (
            <span className="text-slate-500">
              <span className="text-slate-600">·</span> @{card.author}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

function FeaturedSkeleton({ featured }: { featured: boolean }) {
  return (
    <div
      className={`animate-pulse overflow-hidden rounded-2xl border border-white/5 bg-slate-900/80 ${
        featured ? "sm:col-span-2 sm:row-span-2 min-h-[360px]" : "min-h-[220px]"
      }`}
    >
      <div className="flex h-full min-h-[inherit] flex-col justify-end p-6">
        <div className="mb-3 h-5 w-24 rounded-full bg-white/10" />
        <div className="mb-2 h-7 w-4/5 rounded bg-white/10" />
        <div className="mb-1 h-4 w-full rounded bg-white/5" />
        <div className="h-3 w-1/3 rounded bg-white/5" />
      </div>
    </div>
  );
}

export function NewsFeaturedGrid({
  items,
  loading,
}: {
  items: NewsModel[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:grid-rows-3 lg:gap-6 lg:min-h-[640px]">
        {Array.from({ length: 6 }).map((_, idx) => (
          <FeaturedSkeleton key={idx} featured={idx === 0} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-slate-950/50 px-8 py-24 text-center backdrop-blur-sm">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-500/10">
          <svg
            className="h-8 w-8 text-amber-400/80"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m2.25-15H6.75A2.25 2.25 0 004.5 6.75v10.5A2.25 2.25 0 006.75 19.5h10.5A2.25 2.25 0 0019.5 17.25V6.75A2.25 2.25 0 0017.25 4.5z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white">Sin noticias por ahora</h2>
        <p className="mt-2 max-w-md text-slate-400">
          Aún no hay artículos publicados. Vuelve pronto para ver las últimas
          novedades del servidor.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:grid-rows-3 lg:gap-6 lg:min-h-[640px]">
      {items.map((card, idx) => (
        <FeaturedCard key={card.id} card={card} featured={idx === 0} />
      ))}
    </div>
  );
}

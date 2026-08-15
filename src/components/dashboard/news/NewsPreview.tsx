"use client";

import { NewsModel } from "@/model/News";
import { formatNewsDate } from "./newsHelpers";

export function NewsPreview({ news }: { news: NewsModel }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/60">
      <div className="border-b border-slate-700/40 px-3 py-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Vista previa
        </p>
      </div>
      <div className="aspect-[16/9] overflow-hidden bg-slate-900">
        {news.img_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={news.img_url}
            alt=""
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-slate-600">
            Sube una imagen para verla aquí
          </div>
        )}
      </div>
      <div className="space-y-1.5 p-3">
        <h4 className="line-clamp-2 text-sm font-semibold text-white">
          {news.title || <span className="italic text-slate-500">Título…</span>}
        </h4>
        <p className="line-clamp-3 text-xs text-slate-300">
          {news.sub_title || (
            <span className="italic text-slate-500">Subtítulo…</span>
          )}
        </p>
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>{news.author || "—"}</span>
          <span>{formatNewsDate(news.created_at || new Date().toISOString())}</span>
        </div>
      </div>
    </div>
  );
}

export default NewsPreview;

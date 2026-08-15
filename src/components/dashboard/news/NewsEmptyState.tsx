"use client";

import { NewsModel } from "@/model/News";

export function NewsEmptyState({
  hasQuery,
  onClear,
  onNew,
}: {
  hasQuery: boolean;
  onClear: () => void;
  onNew: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/80 text-slate-500">
        <svg
          className="h-8 w-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V9m2 9l-3-3m3 3l-3 3m0-13v2m0 0V7m0 2h2"
          />
        </svg>
      </div>
      <div>
        <p className="text-base font-semibold text-white">
          {hasQuery ? "Sin coincidencias" : "Aún no hay noticias"}
        </p>
        <p className="mt-1 text-sm text-slate-400">
          {hasQuery
            ? "Prueba con otro texto o limpia los filtros."
            : "Empieza creando la primera noticia del servidor."}
        </p>
      </div>
      <div className="flex gap-2">
        {hasQuery ? (
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl border border-slate-600/50 bg-slate-800/50 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-700/50"
          >
            Limpiar filtros
          </button>
        ) : (
          <button
            type="button"
            onClick={onNew}
            className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            Crear primera noticia
          </button>
        )}
      </div>
    </div>
  );
}

export default NewsEmptyState;

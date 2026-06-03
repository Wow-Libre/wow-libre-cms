"use client";

import type { ReactNode } from "react";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

interface WalletPaginationProps {
  currentPage: number;
  pageCount: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (size: number) => void;
  /** Etiqueta del ítem contado, ej. "usuarios" o "suscripciones" */
  itemLabel?: string;
  ariaLabel?: string;
}

function getVisiblePages(current: number, total: number): number[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i);
  }
  const pages = new Set<number>([0, total - 1, current]);
  if (current > 0) pages.add(current - 1);
  if (current < total - 1) pages.add(current + 1);
  if (current > 1) pages.add(current - 2);
  if (current < total - 2) pages.add(current + 2);
  return [...pages].sort((a, b) => a - b);
}

export default function WalletPagination({
  currentPage,
  pageCount,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemLabel = "usuarios",
  ariaLabel = "Paginación",
}: WalletPaginationProps) {
  if (totalItems === 0) return null;

  const rangeStart = currentPage * itemsPerPage + 1;
  const rangeEnd = Math.min((currentPage + 1) * itemsPerPage, totalItems);
  const visiblePages = getVisiblePages(currentPage, pageCount);
  const canGoPrev = currentPage > 0;
  const canGoNext = currentPage < pageCount - 1;

  const go = (page: number) => {
    if (page >= 0 && page < pageCount) {
      onPageChange(page);
    }
  };

  return (
    <nav
      className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5 backdrop-blur-sm sm:p-6"
      aria-label={ariaLabel}
    >
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="text-base leading-relaxed text-slate-400">
          <span className="text-slate-300">
            Mostrando{" "}
            <span className="text-lg font-bold text-white tabular-nums">
              {rangeStart}–{rangeEnd}
            </span>{" "}
            de{" "}
            <span className="text-lg font-bold text-white tabular-nums">
              {totalItems.toLocaleString()}
            </span>{" "}
            {itemLabel}
          </span>
          <span className="mx-2 hidden text-slate-600 sm:inline">·</span>
          <span className="mt-1 block sm:mt-0 sm:inline">
            Página{" "}
            <span className="text-lg font-bold text-cyan-200 tabular-nums">
              {currentPage + 1}
            </span>{" "}
            de{" "}
            <span className="text-lg font-semibold tabular-nums text-slate-200">
              {Math.max(pageCount, 1)}
            </span>
          </span>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
          <label className="flex items-center gap-3 text-base text-slate-400">
            <span className="whitespace-nowrap font-medium">Filas por página</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="rounded-xl border border-slate-600/50 bg-slate-800/80 px-4 py-2.5 text-base font-medium text-white focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/25"
              aria-label={`${itemLabel} por página`}
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap items-center gap-1.5">
            <PaginationButton
              onClick={() => go(0)}
              disabled={!canGoPrev}
              ariaLabel="Primera página"
            >
              «
            </PaginationButton>
            <PaginationButton
              onClick={() => go(currentPage - 1)}
              disabled={!canGoPrev}
              ariaLabel="Página anterior"
            >
              Anterior
            </PaginationButton>

            <div className="flex items-center gap-1.5 px-1">
              {visiblePages.map((page, index) => {
                const prev = visiblePages[index - 1];
                const showEllipsis = prev !== undefined && page - prev > 1;
                return (
                  <span key={page} className="flex items-center gap-1.5">
                    {showEllipsis && (
                      <span className="px-1 text-lg text-slate-500" aria-hidden>
                        …
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => go(page)}
                      aria-label={`Página ${page + 1}`}
                      aria-current={page === currentPage ? "page" : undefined}
                      className={`inline-flex h-11 min-w-[2.75rem] items-center justify-center rounded-xl border px-3 text-base font-semibold tabular-nums transition ${
                        page === currentPage
                          ? "border-cyan-400/50 bg-cyan-500/20 text-cyan-100 shadow-[0_0_16px_rgba(34,211,238,0.15)]"
                          : "border-slate-600/50 bg-slate-800/60 text-slate-300 hover:border-cyan-500/40 hover:text-white"
                      }`}
                    >
                      {page + 1}
                    </button>
                  </span>
                );
              })}
            </div>

            <PaginationButton
              onClick={() => go(currentPage + 1)}
              disabled={!canGoNext}
              ariaLabel="Página siguiente"
            >
              Siguiente
            </PaginationButton>
            <PaginationButton
              onClick={() => go(pageCount - 1)}
              disabled={!canGoNext}
              ariaLabel="Última página"
            >
              »
            </PaginationButton>
          </div>
        </div>
      </div>
    </nav>
  );
}

function PaginationButton({
  children,
  onClick,
  disabled,
  ariaLabel,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled: boolean;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-600/50 bg-slate-800/60 px-4 text-base font-medium text-slate-300 transition hover:border-cyan-500/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

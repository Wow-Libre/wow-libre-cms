"use client";

import { PURCHASES_PAGE_SIZE_OPTIONS } from "@/features/purchases/constants";
import type { ReactNode } from "react";

interface PurchasesPaginationProps {
  currentPage: number;
  pageCount: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (size: number) => void;
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

export default function PurchasesPagination({
  currentPage,
  pageCount,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: PurchasesPaginationProps) {
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
      className="mt-8 rounded-2xl border border-slate-700/50 bg-slate-900/50 p-4 backdrop-blur-sm sm:p-5"
      aria-label="Paginación de compras"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="text-sm text-slate-400">
          <span className="text-slate-300">
            Mostrando{" "}
            <span className="font-semibold text-white tabular-nums">
              {rangeStart}–{rangeEnd}
            </span>{" "}
            de{" "}
            <span className="font-semibold text-white tabular-nums">
              {totalItems}
            </span>{" "}
            transacciones
          </span>
          <span className="mx-2 text-slate-600">·</span>
          <span>
            Página{" "}
            <span className="font-semibold text-cyan-200 tabular-nums">
              {currentPage + 1}
            </span>{" "}
            de{" "}
            <span className="tabular-nums">{Math.max(pageCount, 1)}</span>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-400">
            <span className="whitespace-nowrap">Por página</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="rounded-lg border border-slate-600/50 bg-slate-800/80 px-2.5 py-1.5 text-sm text-white focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/25"
              aria-label="Transacciones por página"
            >
              {PURCHASES_PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center gap-1">
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
              ‹
            </PaginationButton>

            <div className="flex items-center gap-1 px-1">
              {visiblePages.map((page, index) => {
                const prev = visiblePages[index - 1];
                const showEllipsis = prev !== undefined && page - prev > 1;
                return (
                  <span key={page} className="flex items-center gap-1">
                    {showEllipsis && (
                      <span className="px-1 text-slate-500" aria-hidden>
                        …
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => go(page)}
                      aria-label={`Página ${page + 1}`}
                      aria-current={page === currentPage ? "page" : undefined}
                      className={`inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg border px-2 text-sm font-medium tabular-nums transition ${
                        page === currentPage
                          ? "border-cyan-400/50 bg-cyan-500/20 text-cyan-100 shadow-[0_0_12px_rgba(34,211,238,0.12)]"
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
              ›
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
      className="inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg border border-slate-600/50 bg-slate-800/60 px-2 text-sm text-slate-300 transition hover:border-cyan-500/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

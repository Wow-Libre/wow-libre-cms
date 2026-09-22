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
      className="rounded-2xl border border-black/[0.06] bg-white p-5 sm:p-6"
      aria-label={ariaLabel}
    >
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="text-base leading-relaxed text-[#6e6e73]">
          <span>
            Mostrando{" "}
            <span className="text-lg font-bold text-[#1d1d1f] tabular-nums">
              {rangeStart}–{rangeEnd}
            </span>{" "}
            de{" "}
            <span className="text-lg font-bold text-[#1d1d1f] tabular-nums">
              {totalItems.toLocaleString()}
            </span>{" "}
            {itemLabel}
          </span>
          <span className="mx-2 hidden text-[#d2d2d7] sm:inline">·</span>
          <span className="mt-1 block sm:mt-0 sm:inline">
            Página{" "}
            <span className="text-lg font-bold text-[#0071e3] tabular-nums">
              {currentPage + 1}
            </span>{" "}
            de{" "}
            <span className="text-lg font-semibold tabular-nums text-[#1d1d1f]">
              {Math.max(pageCount, 1)}
            </span>
          </span>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
          <label className="flex items-center gap-3 text-base text-[#6e6e73]">
            <span className="whitespace-nowrap font-medium">Filas por página</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="rounded-xl border border-black/10 bg-[#fbfbfd] px-4 py-2.5 text-base font-medium text-[#1d1d1f] focus:border-[#0071e3] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20"
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
                      <span className="px-1 text-lg text-[#86868b]" aria-hidden>
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
                          ? "border-[#0071e3] bg-[#0071e3] text-white dashboard-on-accent"
                          : "border-black/10 bg-white text-[#1d1d1f] hover:border-[#0071e3]/40 hover:text-[#0071e3]"
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
      className="inline-flex h-11 items-center justify-center rounded-xl border border-black/10 bg-white px-4 text-base font-medium text-[#1d1d1f] transition hover:border-[#0071e3]/40 hover:text-[#0071e3] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

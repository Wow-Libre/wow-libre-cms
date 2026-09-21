"use client";

import {
  TRANSACTION_QUICK_FILTER_OPTIONS,
  TRANSACTION_STATUS_FILTER_OPTIONS,
} from "@/lib/transaction/transactionStatus";

interface PurchasesToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  sortBy: "date" | "name" | "price";
  onSortByChange: (value: "date" | "name" | "price") => void;
  sortOrder: "asc" | "desc";
  onToggleSortOrder: () => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  filteredCount: number;
}

export default function PurchasesToolbar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onToggleSortOrder,
  hasActiveFilters,
  onClearFilters,
  filteredCount,
}: PurchasesToolbarProps) {
  return (
    <section
      className="rounded-2xl border border-cyan-500/15 bg-slate-900/40 p-5 shadow-xl backdrop-blur-md sm:p-6"
      aria-label="Filtros de compras"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white sm:text-xl">
            Filtrar pedidos
          </h2>
          <p className="mt-1 text-base text-slate-400">
            {filteredCount} resultado{filteredCount === 1 ? "" : "s"} en esta
            página
          </p>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="text-base font-medium text-cyan-300 underline-offset-2 hover:text-cyan-200 hover:underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="relative flex-1">
          <label htmlFor="purchases-search" className="sr-only">
            Buscar compra
          </label>
          <svg
            className="pointer-events-none absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            id="purchases-search"
            type="search"
            placeholder="Producto o referencia..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-xl border border-cyan-500/20 bg-slate-800/60 py-3.5 pl-14 pr-4 text-lg text-white placeholder:text-slate-500 transition-colors focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/25"
          />
        </div>

        <div className="flex flex-wrap gap-2 lg:max-w-[55%]">
          {TRANSACTION_QUICK_FILTER_OPTIONS.map((option) => {
            const active = statusFilter === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onStatusFilterChange(option.value)}
                className={`rounded-full border px-4 py-2 text-base font-semibold transition-all ${
                  active
                    ? "border-cyan-400/50 bg-cyan-500/20 text-cyan-100"
                    : "border-cyan-500/15 bg-slate-800/40 text-slate-300 hover:border-cyan-400/40 hover:text-white"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-cyan-500/15 pt-5 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-3">
          <label
            htmlFor="purchases-status-all"
            className="shrink-0 text-base text-slate-400"
          >
            Estado
          </label>
          <select
            id="purchases-status-all"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-cyan-500/20 bg-slate-800/60 px-4 py-3 text-lg text-white focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/25"
          >
            {TRANSACTION_STATUS_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor="purchases-sort" className="shrink-0 text-base text-slate-400">
            Orden
          </label>
          <select
            id="purchases-sort"
            value={sortBy}
            onChange={(e) =>
              onSortByChange(e.target.value as "date" | "name" | "price")
            }
            className="rounded-xl border border-cyan-500/20 bg-slate-800/60 px-4 py-3 text-lg text-white focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/25"
          >
            <option value="date">Fecha</option>
            <option value="name">Producto</option>
            <option value="price">Precio</option>
          </select>
          <button
            type="button"
            onClick={onToggleSortOrder}
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-500/20 bg-slate-800/60 text-slate-200 transition-colors hover:border-cyan-400/40 hover:text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/25"
            title={sortOrder === "asc" ? "Ascendente" : "Descendente"}
            aria-label={sortOrder === "asc" ? "Orden ascendente" : "Orden descendente"}
          >
            <svg
              className={`h-5 w-5 transition-transform ${sortOrder === "desc" ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

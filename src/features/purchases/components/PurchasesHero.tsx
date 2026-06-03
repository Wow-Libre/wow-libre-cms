"use client";

import Link from "next/link";

interface PurchasesHeroProps {
  totalTransactions: number;
  filteredCount: number;
  hasActiveFilters: boolean;
}

export default function PurchasesHero({
  totalTransactions,
  filteredCount,
  hasActiveFilters,
}: PurchasesHeroProps) {
  return (
    <header className="mb-8">
      <nav className="mb-4 flex items-center gap-2 text-sm text-slate-400">
        <Link
          href="/profile"
          className="transition-colors hover:text-cyan-300"
        >
          Mi perfil
        </Link>
        <span aria-hidden>/</span>
        <span className="text-slate-300">Mis compras</span>
      </nav>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400/90">
            Historial de pagos
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Mis compras
          </h1>
          <p className="mt-2 text-base leading-relaxed text-slate-400">
            Consulta el estado de tus pedidos, referencias de pago y progreso de
            entrega en un solo lugar.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="min-w-[8.5rem] rounded-2xl border border-slate-700/50 bg-slate-900/50 px-4 py-3 backdrop-blur-sm">
            <p className="text-xs text-slate-500">Total registradas</p>
            <p className="mt-0.5 text-2xl font-bold tabular-nums text-white">
              {totalTransactions}
            </p>
          </div>
          <div className="min-w-[8.5rem] rounded-2xl border border-cyan-500/25 bg-cyan-500/10 px-4 py-3 backdrop-blur-sm">
            <p className="text-xs text-cyan-200/70">
              {hasActiveFilters ? "Coincidencias" : "En esta página"}
            </p>
            <p className="mt-0.5 text-2xl font-bold tabular-nums text-cyan-100">
              {filteredCount}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

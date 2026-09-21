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
    <header className="mb-8 sm:mb-10">
      <nav className="mb-5 flex items-center gap-2 text-lg text-slate-300">
        <Link
          href="/profile"
          className="transition-colors hover:text-cyan-300"
        >
          Mi perfil
        </Link>
        <span aria-hidden>/</span>
        <span className="text-white">Mis compras</span>
      </nav>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="mb-3 text-base font-semibold uppercase tracking-[0.2em] text-cyan-300/90">
            Historial de pagos
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Mis compras
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-300 sm:text-xl">
            Consulta el estado de tus pedidos, referencias de pago y progreso de
            entrega en un solo lugar.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="min-w-[10rem] rounded-2xl border border-cyan-500/15 bg-slate-900/50 px-5 py-4 backdrop-blur-sm">
            <p className="text-base text-slate-400">Total registradas</p>
            <p className="mt-1 text-3xl font-bold tabular-nums text-white sm:text-4xl">
              {totalTransactions}
            </p>
          </div>
          <div className="min-w-[10rem] rounded-2xl border border-cyan-500/25 bg-cyan-500/10 px-5 py-4 backdrop-blur-sm">
            <p className="text-base text-cyan-200/80">
              {hasActiveFilters ? "Coincidencias" : "En esta página"}
            </p>
            <p className="mt-1 text-3xl font-bold tabular-nums text-cyan-100 sm:text-4xl">
              {filteredCount}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

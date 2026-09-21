"use client";

import NavbarAuthenticated from "@/components/navbar-authenticated";
import LoadingSpinner from "@/components/utilities/loading-spinner";
import PurchaseCard from "@/features/purchases/components/PurchaseCard";
import PurchaseDetailModal from "@/features/purchases/components/PurchaseDetailModal";
import PurchasesPagination from "@/features/purchases/components/PurchasesPagination";
import PurchasesHero from "@/features/purchases/components/PurchasesHero";
import PurchasesToolbar from "@/features/purchases/components/PurchasesToolbar";
import { PURCHASES_DECORATIVE_TREANT } from "@/features/purchases/constants";
import { usePurchases } from "@/features/purchases/hooks/usePurchases";
import useAuth from "@/hook/useAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

function PurchasesReveal({
  delayMs = 0,
  className,
  fadeOnly = false,
  children,
}: {
  delayMs?: number;
  className?: string;
  fadeOnly?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`${
        fadeOnly ? "opacity-0" : "animate-fade-in-up"
      } motion-reduce:animate-none motion-reduce:opacity-100 ${className ?? ""}`}
      style={
        fadeOnly
          ? { animation: `fadeIn 0.8s ease-out ${delayMs}ms forwards` }
          : { animationDelay: `${delayMs}ms` }
      }
    >
      {children}
    </div>
  );
}

export default function PurchasesPageClient() {
  const { t } = useTranslation();
  const router = useRouter();
  useAuth(t("errors.message.expiration-session"));

  const {
    token,
    loading,
    error,
    sortedTransactions,
    totalTransactions,
    filteredCount,
    currentPage,
    pageCount,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    sortOrder,
    toggleSortOrder,
    hasActiveFilters,
    clearFilters,
    isModalOpen,
    selectedTransaction,
    modalLoading,
    modalError,
    handleTransactionDetail,
    handleRetryDetail,
    handleCloseModal,
  } = usePurchases();

  useEffect(() => {
    if (!token && !loading) {
      router.replace("/login");
    }
  }, [token, loading, router]);

  const showError = !loading && Boolean(error);
  const showGlobalEmpty =
    !loading && !error && totalTransactions === 0;
  const showList = !loading && !error && totalTransactions > 0;

  return (
    <div className="relative min-h-screen overflow-visible bg-midnight pb-16">
      <div className="pointer-events-none absolute inset-0 fire-embers-blue opacity-50" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(56,189,248,0.10),transparent_38%),radial-gradient(circle_at_82%_84%,rgba(14,165,233,0.08),transparent_40%)]" />
      <PurchasesReveal delayMs={520} fadeOnly>
        <img
          src={PURCHASES_DECORATIVE_TREANT}
          alt=""
          className="accounts-decoration-animated pointer-events-none absolute bottom-0 right-4 z-[1] hidden w-[20rem] opacity-80 drop-shadow-[0_0_28px_rgba(56,189,248,0.35)] md:block lg:right-10 lg:w-[24rem] xl:right-16 xl:w-[28rem]"
        />
      </PurchasesReveal>

      <div className="contenedor relative z-30 mb-6">
        <NavbarAuthenticated />
      </div>

      <div className="contenedor relative z-10 mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
        <PurchasesReveal delayMs={80}>
          <PurchasesHero
            totalTransactions={totalTransactions}
            filteredCount={filteredCount}
            hasActiveFilters={hasActiveFilters}
          />
        </PurchasesReveal>

        <PurchasesReveal delayMs={220} className="mb-8">
          <PurchasesToolbar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            sortOrder={sortOrder}
            onToggleSortOrder={toggleSortOrder}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
            filteredCount={filteredCount}
          />
        </PurchasesReveal>

        {loading ? (
          <PurchasesReveal delayMs={340}>
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-cyan-500/15 bg-slate-900/40 py-16 backdrop-blur-sm">
              <LoadingSpinner />
              <p className="mt-4 text-lg text-slate-300">
                Cargando tu historial de compras...
              </p>
            </div>
          </PurchasesReveal>
        ) : showError ? (
          <PurchasesReveal delayMs={340}>
            <div className="rounded-2xl border border-dashed border-rose-500/30 bg-rose-500/5 px-6 py-16 text-center backdrop-blur-sm">
              <h2 className="text-2xl font-semibold text-white sm:text-3xl">
                No pudimos cargar tus compras
              </h2>
              <p className="mx-auto mt-3 max-w-md text-lg text-slate-300">{error}</p>
            </div>
          </PurchasesReveal>
        ) : showGlobalEmpty ? (
          <PurchasesReveal delayMs={340}>
            <div className="rounded-2xl border border-dashed border-cyan-500/20 bg-slate-900/30 px-6 py-16 text-center backdrop-blur-sm">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/20 bg-slate-800/50">
                <svg
                  className="h-8 w-8 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-white sm:text-3xl">Sin compras aún</h2>
              <p className="mx-auto mt-3 max-w-md text-lg leading-relaxed text-slate-300">
                Explora la tienda y encuentra beneficios para tu cuenta.
              </p>
              <Link
                href="/store"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3.5 text-lg font-semibold text-slate-950 shadow-lg transition hover:bg-cyan-400"
              >
                Ir a la tienda
              </Link>
            </div>
          </PurchasesReveal>
        ) : showList ? (
          <>
            {sortedTransactions.length === 0 ? (
              <PurchasesReveal delayMs={340}>
                <div className="rounded-2xl border border-dashed border-cyan-500/20 bg-slate-900/30 px-6 py-12 text-center">
                  <p className="text-lg text-slate-300">
                    Ninguna compra en esta página coincide con los filtros.
                  </p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-4 text-lg font-medium text-cyan-300 hover:text-cyan-200"
                  >
                    Limpiar filtros
                  </button>
                </div>
              </PurchasesReveal>
            ) : (
              <ul className="space-y-5" role="list">
                {sortedTransactions.map((transaction, index) => (
                  <li key={transaction.id}>
                    <PurchasesReveal delayMs={340 + Math.min(index, 6) * 70}>
                      <PurchaseCard
                        transaction={transaction}
                        onViewDetail={handleTransactionDetail}
                      />
                    </PurchasesReveal>
                  </li>
                ))}
              </ul>
            )}

            <PurchasesReveal delayMs={520}>
              <PurchasesPagination
                currentPage={currentPage}
                pageCount={pageCount}
                totalItems={totalTransactions}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            </PurchasesReveal>
          </>
        ) : null}
      </div>

      <PurchaseDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        transaction={selectedTransaction}
        loading={modalLoading}
        error={modalError}
        onRetry={handleRetryDetail}
      />
    </div>
  );
}

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
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
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
      <img
        src={PURCHASES_DECORATIVE_TREANT}
        alt=""
        className="accounts-decoration-animated pointer-events-none absolute bottom-0 right-4 z-[1] hidden w-[20rem] opacity-80 drop-shadow-[0_0_28px_rgba(56,189,248,0.35)] md:block lg:right-10 lg:w-[24rem] xl:right-16 xl:w-[28rem]"
      />

      <div className="contenedor relative z-30 mb-6">
        <NavbarAuthenticated />
      </div>

      <div className="contenedor relative z-10 mx-auto max-w-5xl px-4 pb-12 sm:px-6 lg:px-8">
        <PurchasesHero
          totalTransactions={totalTransactions}
          filteredCount={filteredCount}
          hasActiveFilters={hasActiveFilters}
        />

        <div className="mb-6">
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
        </div>

        {loading ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-slate-700/50 bg-slate-900/40 py-16 backdrop-blur-sm">
            <LoadingSpinner />
            <p className="mt-4 text-sm text-slate-400">
              Cargando tu historial de compras...
            </p>
          </div>
        ) : showError ? (
          <div className="rounded-2xl border border-dashed border-rose-500/30 bg-rose-500/5 px-6 py-16 text-center backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-white">
              No pudimos cargar tus compras
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">{error}</p>
          </div>
        ) : showGlobalEmpty ? (
          <div className="rounded-2xl border border-dashed border-slate-600/50 bg-slate-900/30 px-6 py-16 text-center backdrop-blur-sm">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-600/50 bg-slate-800/50">
              <svg
                className="h-8 w-8 text-slate-500"
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
            <h2 className="text-xl font-semibold text-white">Sin compras aún</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-400">
              Explora la tienda y encuentra beneficios para tu cuenta.
            </p>
            <Link
              href="/store"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:from-cyan-500 hover:to-sky-500"
            >
              Ir a la tienda
            </Link>
          </div>
        ) : showList ? (
          <>
            {sortedTransactions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-600/50 bg-slate-900/30 px-6 py-12 text-center">
                <p className="text-sm text-slate-400">
                  Ninguna compra en esta página coincide con los filtros.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 text-sm font-medium text-cyan-300 hover:text-cyan-200"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <ul className="space-y-4" role="list">
                {sortedTransactions.map((transaction) => (
                  <li key={transaction.id}>
                    <PurchaseCard
                      transaction={transaction}
                      onViewDetail={handleTransactionDetail}
                    />
                  </li>
                ))}
              </ul>
            )}

            <PurchasesPagination
              currentPage={currentPage}
              pageCount={pageCount}
              totalItems={totalTransactions}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
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

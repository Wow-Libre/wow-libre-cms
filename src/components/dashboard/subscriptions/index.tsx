"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getSubscriptionAdminList } from "@/api/subscriptions";
import type { SubscriptionAdminItem } from "@/api/subscriptions";
import { dashboardSwal as Swal } from "@/components/dashboard/dashboardSwal";
import { DashboardSection } from "../layout";
import { DASHBOARD_PALETTE } from "../styles/dashboardPalette";
import WalletPagination from "../wallet/WalletPagination";
import { SubscriptionCreateModal } from "./SubscriptionCreateModal";

const DEFAULT_PAGE_SIZE = 10;

interface SubscriptionsDashboardProps {
  token: string;
  t: (key: string, options?: Record<string, string | number>) => string;
}

type StatAccent = "amber" | "cyan" | "emerald" | "slate";

interface StatCardProps {
  label: string;
  value: string;
  hint: string;
  accent: StatAccent;
  icon: React.ReactNode;
}

function StatCard({ label, value, hint, accent, icon }: StatCardProps) {
  const styles = {
    amber: {
      border: "border-amber-500/30",
      bg: "from-amber-500/15 via-slate-800 to-slate-900",
      shadow: "shadow-amber-500/10 hover:shadow-amber-500/20",
      value: "text-amber-400",
      icon: "text-amber-400",
    },
    cyan: {
      border: "border-cyan-500/30",
      bg: "from-cyan-500/15 via-slate-800 to-slate-900",
      shadow: "shadow-cyan-500/10 hover:shadow-cyan-500/20",
      value: "text-cyan-400",
      icon: "text-cyan-400",
    },
    emerald: {
      border: "border-emerald-500/30",
      bg: "from-emerald-500/15 via-slate-800 to-slate-900",
      shadow: "shadow-emerald-500/10 hover:shadow-emerald-500/20",
      value: "text-emerald-400",
      icon: "text-emerald-400",
    },
    slate: {
      border: "border-slate-500/30",
      bg: "from-slate-500/10 via-slate-800 to-slate-900",
      shadow: "shadow-slate-900/40 hover:border-slate-400/30",
      value: "text-slate-300",
      icon: "text-slate-400",
    },
  }[accent];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${styles.border} bg-gradient-to-br ${styles.bg} p-6 shadow-lg ${styles.shadow} transition sm:p-7`}
    >
      <div className={`absolute right-4 top-4 opacity-15 ${styles.icon}`}>{icon}</div>
      <p className={`text-base font-semibold sm:text-lg ${DASHBOARD_PALETTE.textMuted}`}>{label}</p>
      <p className={`mt-3 text-3xl font-bold tabular-nums sm:text-4xl ${styles.value}`}>{value}</p>
      <p className={`mt-2 text-sm sm:text-base ${DASHBOARD_PALETTE.textMuted}`}>{hint}</p>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3 p-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex animate-pulse items-center gap-5 rounded-xl border border-slate-700/40 bg-slate-800/30 px-6 py-5"
        >
          <div className="h-14 w-14 rounded-xl bg-slate-700/60" />
          <div className="flex-1 space-y-2.5">
            <div className="h-4 w-40 rounded bg-slate-700/60" />
            <div className="h-4 w-56 rounded bg-slate-700/40" />
          </div>
          <div className="h-10 w-32 rounded-full bg-slate-700/50" />
          <div className="hidden h-4 w-36 rounded bg-slate-700/40 sm:block" />
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isActive = status === "ACTIVE";
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold sm:text-base ${
        isActive
          ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-200"
          : "border-slate-600/50 bg-slate-800/80 text-slate-400"
      }`}
    >
      <span
        className={`h-2.5 w-2.5 rounded-full ${isActive ? "bg-emerald-400" : "bg-slate-500"}`}
        aria-hidden
      />
      {status}
    </span>
  );
}

function PriceBadge({
  price,
  currency,
}: {
  price: number | null;
  currency: string | null;
}) {
  if (price == null) {
    return (
      <span className="text-base text-slate-500 sm:text-lg">—</span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-base font-bold tabular-nums text-amber-100 ring-1 ring-amber-500/20 sm:text-lg">
      {Number(price).toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })}{" "}
      <span className="font-semibold text-amber-200/80">{currency ?? ""}</span>
    </span>
  );
}

const SubscriptionsDashboard: React.FC<SubscriptionsDashboardProps> = ({
  token,
  t,
}) => {
  const [data, setData] = useState<import("@/api/subscriptions").SubscriptionAdminListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [referenceFilter, setReferenceFilter] = useState("");
  const [referenceInput, setReferenceInput] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchData = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (opts?.silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      try {
        const result = await getSubscriptionAdminList(token);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("subscriptions-dashboard.error-fetch"));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, t]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubscriptionCreated = useCallback(async () => {
    await fetchData({ silent: true });
    Swal.fire({
      icon: "success",
      title: t("subscriptions-dashboard.create.success"),
      color: "white",
      background: "#0B1218",
      timer: 2500,
    });
  }, [fetchData, t]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setReferenceFilter(referenceInput.trim());
    setPage(0);
  };

  const formatDate = (iso: string) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return iso;
    }
  };

  const formatDateTime = (iso: string) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  const activeCount =
    data?.subscriptions?.filter((s) => s.status === "ACTIVE").length ?? 0;
  const totalCount = data?.total_count ?? 0;
  const totalEarned = data?.total_earned ?? 0;
  const mainCurrency = data?.total_earned_currency ?? "";

  const filteredSubscriptions = useMemo(() => {
    const list = data?.subscriptions ?? [];
    const term = referenceFilter.trim().toLowerCase();
    if (!term) return list;
    return list.filter((s) =>
      (s.reference_number ?? "").toLowerCase().includes(term)
    );
  }, [data?.subscriptions, referenceFilter]);

  const totalFiltered = filteredSubscriptions.length;
  const pageCount = Math.max(1, Math.ceil(totalFiltered / pageSize));

  const displayedSubscriptions = useMemo(() => {
    const start = page * pageSize;
    return filteredSubscriptions.slice(start, start + pageSize);
  }, [filteredSubscriptions, page, pageSize]);

  useEffect(() => {
    if (page > 0 && page >= pageCount) {
      setPage(Math.max(0, pageCount - 1));
    }
  }, [page, pageCount]);

  const earnedDisplay = `${totalEarned.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}${mainCurrency ? ` ${mainCurrency}` : ""}`;

  return (
    <div className={`space-y-8 ${DASHBOARD_PALETTE.text}`}>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className={`inline-flex shrink-0 items-center justify-center gap-2.5 px-6 py-3.5 text-base font-semibold ${DASHBOARD_PALETTE.btnPrimary}`}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t("subscriptions-dashboard.create.button")}
        </button>
      </div>

      <SubscriptionCreateModal
        open={createModalOpen}
        token={token}
        creating={creating}
        t={t}
        onClose={() => setCreateModalOpen(false)}
        onCreatingChange={setCreating}
        onCreated={handleSubscriptionCreated}
      />

      {/* Métricas */}
      {!loading && !error && (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label={t("subscriptions-dashboard.stats.total-earned")}
            value={earnedDisplay}
            hint={t("subscriptions-dashboard.stats.total-earned-desc")}
            accent="amber"
            icon={
              <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            label={t("subscriptions-dashboard.stats.total")}
            value={totalCount.toLocaleString()}
            hint={t("subscriptions-dashboard.stats.total-desc")}
            accent="cyan"
            icon={
              <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />
          <StatCard
            label={t("subscriptions-dashboard.stats.active")}
            value={activeCount.toLocaleString()}
            hint={t("subscriptions-dashboard.stats.active-desc")}
            accent="emerald"
            icon={
              <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            label={t("subscriptions-dashboard.stats.inactive")}
            value={(totalCount - activeCount).toLocaleString()}
            hint={t("subscriptions-dashboard.stats.inactive-desc")}
            accent="slate"
            icon={
              <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>
      )}

      {/* Listado */}
      <DashboardSection
        title={t("subscriptions-dashboard.list.title")}
        description={t("subscriptions-dashboard.list.description")}
      >
        <div className="space-y-6">
          <div
            className={`flex flex-col gap-5 rounded-2xl border ${DASHBOARD_PALETTE.border} bg-slate-800/30 p-5 sm:p-6`}
          >
            <form
              onSubmit={handleSearch}
              className="flex min-w-0 flex-1 flex-col gap-4 lg:flex-row lg:items-center"
            >
              <div className="relative min-w-0 flex-1">
                <svg
                  className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
                </svg>
                <input
                  id="filter-reference"
                  type="search"
                  value={referenceInput}
                  onChange={(e) => setReferenceInput(e.target.value)}
                  placeholder={t("subscriptions-dashboard.list.filter-reference-placeholder")}
                  className={`${DASHBOARD_PALETTE.input} py-3.5 pl-12 text-base`}
                />
              </div>
              <div className="flex shrink-0 flex-wrap gap-3">
                <button type="submit" className={`${DASHBOARD_PALETTE.btnPrimary} px-6 py-3.5 text-base`}>
                  {t("subscriptions-dashboard.list.search")}
                </button>
                <button
                  type="button"
                  onClick={() => fetchData({ silent: true })}
                  disabled={refreshing || loading}
                  className={`rounded-xl border ${DASHBOARD_PALETTE.border} px-5 py-3.5 text-base font-semibold text-slate-300 transition-colors hover:bg-slate-700/50 disabled:opacity-50`}
                >
                  {refreshing
                    ? t("subscriptions-dashboard.list.refreshing")
                    : t("subscriptions-dashboard.list.refresh")}
                </button>
              </div>
            </form>

            {referenceFilter && (
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-sm font-semibold text-cyan-100 sm:text-base">
                  {t("subscriptions-dashboard.list.filter-results", {
                    count: filteredSubscriptions.length,
                  })}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setReferenceInput("");
                    setReferenceFilter("");
                    setPage(0);
                  }}
                  className="text-base font-medium text-slate-400 transition-colors hover:text-cyan-300"
                >
                  {t("subscriptions-dashboard.list.clear-filter")}
                </button>
              </div>
            )}
          </div>

          {error && !loading && (
            <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-5 sm:flex-row">
              <p className="text-base text-red-300">{error}</p>
              <button
                type="button"
                onClick={() => fetchData()}
                className="rounded-xl border border-red-500/40 px-5 py-2.5 text-base font-semibold text-red-200 hover:bg-red-500/15"
              >
                {t("subscriptions-dashboard.list.retry")}
              </button>
            </div>
          )}

          <div className={`overflow-hidden rounded-2xl border ${DASHBOARD_PALETTE.border} bg-slate-900/40`}>
            {loading ? (
              <TableSkeleton />
            ) : !data?.subscriptions?.length ? (
              <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-700/50 bg-slate-800/60 text-slate-500">
                  <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-xl font-semibold text-slate-200">
                  {t("subscriptions-dashboard.list.empty")}
                </p>
              </div>
            ) : referenceFilter && !filteredSubscriptions.length ? (
              <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
                <p className="text-xl font-semibold text-slate-200">
                  {t("subscriptions-dashboard.list.filter-no-results")}
                </p>
              </div>
            ) : (
              <div className="max-h-[65vh] overflow-auto">
                <table className="w-full min-w-[960px]">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b border-slate-700/60 bg-slate-800/90 text-left text-sm font-bold uppercase tracking-wide text-slate-300 backdrop-blur-sm sm:text-base">
                      <th className="px-6 py-5">{t("subscriptions-dashboard.list.userId")}</th>
                      <th className="px-6 py-5">{t("subscriptions-dashboard.list.plan")}</th>
                      <th className="px-6 py-5">{t("subscriptions-dashboard.list.price")}</th>
                      <th className="px-6 py-5">{t("subscriptions-dashboard.list.activatedAt")}</th>
                      <th className="px-6 py-5">{t("subscriptions-dashboard.list.expiresAt")}</th>
                      <th className="px-6 py-5">{t("subscriptions-dashboard.list.status")}</th>
                      <th className="px-6 py-5">{t("subscriptions-dashboard.list.reference")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {displayedSubscriptions.map((sub: SubscriptionAdminItem) => (
                      <tr
                        key={sub.id}
                        className="group transition-colors hover:bg-slate-800/35"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700/80 to-slate-800 text-lg font-bold text-slate-200 ring-1 ring-slate-600/50 group-hover:from-cyan-500/20 group-hover:to-blue-600/10 group-hover:text-cyan-100">
                              U
                            </div>
                            <div>
                              <p className="text-lg font-semibold text-white">
                                {t("subscriptions-dashboard.list.user-label", { id: sub.user_id })}
                              </p>
                              <p className="font-mono text-sm text-slate-500">#{sub.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-base font-semibold text-white sm:text-lg">
                            {sub.plan_name ?? "—"}
                          </p>
                          {sub.frequency_type && (
                            <p className="mt-0.5 text-sm text-slate-500 sm:text-base">
                              {sub.frequency_type} × {sub.frequency_value ?? 1}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          <PriceBadge
                            price={sub.transaction_price}
                            currency={sub.transaction_currency}
                          />
                        </td>
                        <td className="px-6 py-5 text-base text-slate-300 sm:text-lg">
                          {formatDateTime(sub.activated_at)}
                        </td>
                        <td className="px-6 py-5 text-base text-slate-300 sm:text-lg">
                          {formatDate(sub.expires_at)}
                        </td>
                        <td className="px-6 py-5">
                          <StatusBadge status={sub.status} />
                        </td>
                        <td className="px-6 py-5">
                          <code className="rounded-lg border border-slate-700/60 bg-slate-800/60 px-3 py-1.5 font-mono text-sm text-slate-300 sm:text-base">
                            {sub.reference_number ?? "—"}
                          </code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {!loading && totalFiltered > 0 && (
            <WalletPagination
              currentPage={page}
              pageCount={pageCount}
              totalItems={totalFiltered}
              itemsPerPage={pageSize}
              onPageChange={setPage}
              onItemsPerPageChange={(nextSize) => {
                setPageSize(nextSize);
                setPage(0);
              }}
              itemLabel={t("subscriptions-dashboard.list.pagination-item-label")}
              ariaLabel={t("subscriptions-dashboard.list.pagination-aria")}
            />
          )}
        </div>
      </DashboardSection>
    </div>
  );
};

export default SubscriptionsDashboard;

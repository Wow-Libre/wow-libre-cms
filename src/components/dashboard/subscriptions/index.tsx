"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { getSubscriptionAdminList } from "@/api/subscriptions";
import type { SubscriptionAdminItem } from "@/api/subscriptions";
import { DashboardSection } from "../layout";
import { DASHBOARD_PALETTE } from "../styles/dashboardPalette";

const PAGE_SIZE = 40;

interface SubscriptionsDashboardProps {
  token: string;
  t: (key: string, options?: Record<string, string | number>) => string;
}

const SubscriptionsDashboard: React.FC<SubscriptionsDashboardProps> = ({
  token,
  t,
}) => {
  const [data, setData] = useState<import("@/api/subscriptions").SubscriptionAdminListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [referenceFilter, setReferenceFilter] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const loadMoreRef = useRef<HTMLTableRowElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getSubscriptionAdminList(token);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("subscriptions-dashboard.error-fetch"));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, t]);

  const formatDate = (iso: string) => {
    if (!iso) return "—";
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, {
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
      const d = new Date(iso);
      return d.toLocaleString(undefined, {
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

  const formatPrice = (price: number | null, currency: string | null) => {
    if (price == null) return "—";
    const curr = currency ?? "";
    return `${Number(price).toLocaleString()} ${curr}`.trim();
  };

  const activeCount =
    data?.subscriptions?.filter((s) => s.status === "ACTIVE").length ?? 0;
  const totalCount = data?.total_count ?? 0;
  const totalEarned =
    data?.subscriptions?.reduce((sum, s) => sum + (s.plan_price ?? 0), 0) ?? 0;
  const mainCurrency =
    data?.subscriptions?.find((s) => s.currency)?.currency ?? "";

  const filteredSubscriptions = useMemo(() => {
    const list = data?.subscriptions ?? [];
    const term = referenceFilter.trim().toLowerCase();
    if (!term) return list;
    return list.filter((s) =>
      (s.reference_number ?? "").toLowerCase().includes(term)
    );
  }, [data?.subscriptions, referenceFilter]);

  const displayedSubscriptions = useMemo(
    () => filteredSubscriptions.slice(0, visibleCount),
    [filteredSubscriptions, visibleCount]
  );

  const hasMore = visibleCount < filteredSubscriptions.length;

  const loadMore = useCallback(() => {
    setVisibleCount((prev) =>
      Math.min(prev + PAGE_SIZE, filteredSubscriptions.length)
    );
  }, [filteredSubscriptions.length]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [referenceFilter]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) loadMore();
      },
      { root: null, rootMargin: "100px", threshold: 0 }
    );
    const el = loadMoreRef.current;
    if (el) observerRef.current.observe(el);
    return () => {
      observerRef.current?.disconnect();
    };
  }, [hasMore, loadMore]);

  if (loading) {
    return (
      <div className="space-y-6">
        <DashboardSection title={t("subscriptions-dashboard.title")}>
          <p className={`py-12 text-center ${DASHBOARD_PALETTE.textMuted}`}>
            {t("subscriptions-dashboard.loading")}
          </p>
        </DashboardSection>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <DashboardSection title={t("subscriptions-dashboard.title")}>
          <p className={`py-8 text-center text-red-400`}>{error}</p>
        </DashboardSection>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total ganado - card destacada */}
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/15 via-slate-800 to-slate-900 p-5 shadow-lg shadow-amber-500/10 transition hover:shadow-amber-500/20">
          <div className="absolute right-3 top-3 opacity-20">
            <svg className="h-14 w-14 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className={`text-sm font-medium ${DASHBOARD_PALETTE.textMuted}`}>
            {t("subscriptions-dashboard.stats.total-earned")}
          </p>
          <p className="mt-2 text-2xl font-bold text-amber-400 sm:text-3xl">
            {totalEarned.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {mainCurrency}
          </p>
          <p className={`mt-1 text-xs ${DASHBOARD_PALETTE.textMuted}`}>
            {t("subscriptions-dashboard.stats.total-earned-desc")}
          </p>
        </div>

        {/* Total suscripciones */}
        <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/15 via-slate-800 to-slate-900 p-5 shadow-lg shadow-cyan-500/10 transition hover:shadow-cyan-500/20">
          <div className="absolute right-3 top-3 opacity-20">
            <svg className="h-14 w-14 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className={`text-sm font-medium ${DASHBOARD_PALETTE.textMuted}`}>
            {t("subscriptions-dashboard.stats.total")}
          </p>
          <p className={`mt-2 text-2xl font-bold sm:text-3xl ${DASHBOARD_PALETTE.accent}`}>
            {totalCount}
          </p>
          <p className={`mt-1 text-xs ${DASHBOARD_PALETTE.textMuted}`}>
            {t("subscriptions-dashboard.stats.total-desc")}
          </p>
        </div>

        {/* Activas */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 via-slate-800 to-slate-900 p-5 shadow-lg shadow-emerald-500/10 transition hover:shadow-emerald-500/20">
          <div className="absolute right-3 top-3 opacity-20">
            <svg className="h-14 w-14 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className={`text-sm font-medium ${DASHBOARD_PALETTE.textMuted}`}>
            {t("subscriptions-dashboard.stats.active")}
          </p>
          <p className="mt-2 text-2xl font-bold text-emerald-400 sm:text-3xl">
            {activeCount}
          </p>
          <p className={`mt-1 text-xs ${DASHBOARD_PALETTE.textMuted}`}>
            {t("subscriptions-dashboard.stats.active-desc")}
          </p>
        </div>

        {/* Inactivas */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-500/30 bg-gradient-to-br from-slate-500/10 via-slate-800 to-slate-900 p-5 shadow-lg transition hover:border-slate-400/30">
          <div className="absolute right-3 top-3 opacity-20">
            <svg className="h-14 w-14 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className={`text-sm font-medium ${DASHBOARD_PALETTE.textMuted}`}>
            {t("subscriptions-dashboard.stats.inactive")}
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-400 sm:text-3xl">
            {totalCount - activeCount}
          </p>
          <p className={`mt-1 text-xs ${DASHBOARD_PALETTE.textMuted}`}>
            {t("subscriptions-dashboard.stats.inactive-desc")}
          </p>
        </div>
      </div>

      <DashboardSection title={t("subscriptions-dashboard.list.title")}>
        {!data?.subscriptions?.length ? (
          <p className={`py-8 text-center ${DASHBOARD_PALETTE.textMuted}`}>
            {t("subscriptions-dashboard.list.empty")}
          </p>
        ) : (
          <>
            <div className="mb-4">
              <label htmlFor="filter-reference" className="sr-only">
                {t("subscriptions-dashboard.list.filter-reference-label")}
              </label>
              <input
                id="filter-reference"
                type="text"
                value={referenceFilter}
                onChange={(e) => setReferenceFilter(e.target.value)}
                placeholder={t("subscriptions-dashboard.list.filter-reference-placeholder")}
                className={`w-full max-w-sm rounded-lg border ${DASHBOARD_PALETTE.border} bg-slate-800/50 px-3 py-2 text-sm ${DASHBOARD_PALETTE.text} placeholder:text-slate-400 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30`}
              />
              {referenceFilter.trim() && (
                <p className={`mt-1 text-xs ${DASHBOARD_PALETTE.textMuted}`}>
                  {t("subscriptions-dashboard.list.filter-results", {
                    count: filteredSubscriptions.length,
                  })}
                </p>
              )}
            </div>
            <div className="-mx-5 max-h-[60vh] overflow-auto sm:mx-0">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="sticky top-0 z-10 bg-slate-900 shadow-sm">
                  <tr className={`border-b ${DASHBOARD_PALETTE.border}`}>
                    <th className={`py-3 pr-2 font-semibold ${DASHBOARD_PALETTE.text}`}>
                      {t("subscriptions-dashboard.list.userId")}
                    </th>
                    <th className={`py-3 pr-2 font-semibold ${DASHBOARD_PALETTE.text}`}>
                      {t("subscriptions-dashboard.list.plan")}
                    </th>
                    <th className={`py-3 pr-2 font-semibold ${DASHBOARD_PALETTE.text}`}>
                      {t("subscriptions-dashboard.list.price")}
                    </th>
                    <th className={`py-3 pr-2 font-semibold ${DASHBOARD_PALETTE.text}`}>
                      {t("subscriptions-dashboard.list.activatedAt")}
                    </th>
                    <th className={`py-3 pr-2 font-semibold ${DASHBOARD_PALETTE.text}`}>
                      {t("subscriptions-dashboard.list.expiresAt")}
                    </th>
                    <th className={`py-3 pr-2 font-semibold ${DASHBOARD_PALETTE.text}`}>
                      {t("subscriptions-dashboard.list.status")}
                    </th>
                    <th className={`py-3 font-semibold ${DASHBOARD_PALETTE.text}`}>
                      {t("subscriptions-dashboard.list.reference")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayedSubscriptions.map((sub: SubscriptionAdminItem) => (
                    <tr
                      key={sub.id}
                      className={`border-b ${DASHBOARD_PALETTE.border} hover:bg-slate-700/30`}
                    >
                      <td className={`py-3 pr-2 ${DASHBOARD_PALETTE.text}`}>
                        #{sub.user_id}
                      </td>
                      <td className={`py-3 pr-2 ${DASHBOARD_PALETTE.text}`}>
                        {sub.plan_name ?? "—"}
                      </td>
                      <td className={`py-3 pr-2 ${DASHBOARD_PALETTE.text}`}>
                        {formatPrice(sub.plan_price, sub.currency)}
                      </td>
                      <td className={`py-3 pr-2 ${DASHBOARD_PALETTE.textMuted}`}>
                        {formatDateTime(sub.activated_at)}
                      </td>
                      <td className={`py-3 pr-2 ${DASHBOARD_PALETTE.textMuted}`}>
                        {formatDate(sub.expires_at)}
                      </td>
                      <td className="py-3 pr-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            sub.status === "ACTIVE"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-slate-500/20 text-slate-400"
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td className={`py-3 font-mono text-xs ${DASHBOARD_PALETTE.textMuted}`}>
                        {sub.reference_number ?? "—"}
                      </td>
                    </tr>
                  ))}
                  {hasMore && (
                    <tr
                      ref={loadMoreRef}
                      className={`border-b ${DASHBOARD_PALETTE.border}`}
                    >
                      <td
                        colSpan={7}
                        className={`py-4 text-center text-sm ${DASHBOARD_PALETTE.textMuted}`}
                      >
                        {t("subscriptions-dashboard.list.loading-more")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {referenceFilter.trim() && !filteredSubscriptions.length && (
              <p className={`mt-4 py-4 text-center ${DASHBOARD_PALETTE.textMuted}`}>
                {t("subscriptions-dashboard.list.filter-no-results")}
              </p>
            )}
          </>
        )}
      </DashboardSection>
    </div>
  );
};

export default SubscriptionsDashboard;

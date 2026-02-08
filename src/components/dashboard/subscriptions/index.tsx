"use client";

import React, { useState, useEffect } from "react";
import { getSubscriptionAdminList } from "@/api/subscriptions";
import { DashboardSection } from "../layout";
import { DASHBOARD_PALETTE } from "../styles/dashboardPalette";

interface SubscriptionsDashboardProps {
  token: string;
  t: (key: string) => string;
}

const SubscriptionsDashboard: React.FC<SubscriptionsDashboardProps> = ({
  token,
  t,
}) => {
  const [data, setData] = useState<import("@/api/subscriptions").SubscriptionAdminListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardSection
          title={t("subscriptions-dashboard.stats.total")}
          noPadding
        >
          <div className="p-5">
            <p className={`text-3xl font-bold ${DASHBOARD_PALETTE.accent}`}>
              {totalCount}
            </p>
            <p className={`mt-1 text-sm ${DASHBOARD_PALETTE.textMuted}`}>
              {t("subscriptions-dashboard.stats.total-desc")}
            </p>
          </div>
        </DashboardSection>
        <DashboardSection
          title={t("subscriptions-dashboard.stats.active")}
          noPadding
        >
          <div className="p-5">
            <p className={`text-3xl font-bold text-emerald-400`}>
              {activeCount}
            </p>
            <p className={`mt-1 text-sm ${DASHBOARD_PALETTE.textMuted}`}>
              {t("subscriptions-dashboard.stats.active-desc")}
            </p>
          </div>
        </DashboardSection>
        <DashboardSection
          title={t("subscriptions-dashboard.stats.inactive")}
          noPadding
        >
          <div className="p-5">
            <p className={`text-3xl font-bold ${DASHBOARD_PALETTE.textMuted}`}>
              {totalCount - activeCount}
            </p>
            <p className={`mt-1 text-sm ${DASHBOARD_PALETTE.textMuted}`}>
              {t("subscriptions-dashboard.stats.inactive-desc")}
            </p>
          </div>
        </DashboardSection>
      </div>

      <DashboardSection title={t("subscriptions-dashboard.list.title")}>
        {!data?.subscriptions?.length ? (
          <p className={`py-8 text-center ${DASHBOARD_PALETTE.textMuted}`}>
            {t("subscriptions-dashboard.list.empty")}
          </p>
        ) : (
          <div className="overflow-x-auto -mx-5 sm:mx-0">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
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
                {data.subscriptions.map((sub) => (
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
              </tbody>
            </table>
          </div>
        )}
      </DashboardSection>
    </div>
  );
};

export default SubscriptionsDashboard;

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createAdminSubscription } from "@/api/subscriptions";
import { getPlanAdminList, type PlanAdminItem } from "@/api/plan/admin";
import { getWebUsersPage, type WebUserRowDto } from "@/api/users/admin";
import { DashboardModalShell } from "@/components/dashboard/DashboardModalShell";
import { DASHBOARD_PALETTE } from "@/components/dashboard/styles/dashboardPalette";

const LANGUAGE_OPTIONS = [
  { value: "es", labelKey: "subscriptions-dashboard.create.language-es" },
  { value: "en", labelKey: "subscriptions-dashboard.create.language-en" },
  { value: "pt", labelKey: "subscriptions-dashboard.create.language-pt" },
] as const;

const USER_SEARCH_SIZE = 10;

function isPaidPlan(plan: PlanAdminItem): boolean {
  return (plan.price ?? 0) > 0;
}

function normalizeLanguage(lang: string | null | undefined): string {
  if (!lang) return "es";
  const code = lang.trim().toLowerCase().slice(0, 2);
  if (code === "en" || code === "pt") return code;
  return "es";
}

function getUserDisplayName(user: WebUserRowDto): string {
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
  return name || user.email;
}

function getUserInitials(user: WebUserRowDto): string {
  const a = user.first_name?.trim()?.[0] ?? "";
  const b = user.last_name?.trim()?.[0] ?? "";
  if (a || b) return `${a}${b}`.toUpperCase();
  return (user.email?.trim()?.[0] ?? "?").toUpperCase();
}

function formatPlanPrice(plan: PlanAdminItem): string {
  const price = plan.discounted_price ?? plan.price;
  const currency = plan.currency ?? "";
  return `${Number(price).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} ${currency}`.trim();
}

function formatPlanFrequency(plan: PlanAdminItem): string | null {
  if (!plan.frequency_type) return null;
  return `${plan.frequency_type} × ${plan.frequency_value ?? 1}`;
}

interface PlanOptionCardProps {
  selected: boolean;
  onSelect: () => void;
  title: string;
  subtitle?: string;
  price?: string;
  badge?: string;
}

function PlanOptionCard({
  selected,
  onSelect,
  title,
  subtitle,
  price,
  badge,
}: PlanOptionCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative flex w-full flex-col rounded-xl border p-4 text-left transition-all sm:p-5 ${
        selected
          ? "border-cyan-400/50 bg-gradient-to-br from-cyan-500/15 to-slate-900/80 shadow-[0_0_20px_rgba(34,211,238,0.12)] ring-1 ring-cyan-400/30"
          : "border-slate-600/50 bg-slate-800/40 hover:border-slate-500/70 hover:bg-slate-800/70"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className={`text-base font-semibold sm:text-lg ${selected ? "text-cyan-50" : "text-white"}`}>
            {title}
          </p>
          {subtitle && (
            <p className={`mt-1 text-sm ${selected ? "text-cyan-100/70" : "text-slate-400"}`}>
              {subtitle}
            </p>
          )}
        </div>
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
            selected
              ? "border-cyan-400 bg-cyan-500 text-white"
              : "border-slate-500 bg-slate-900/60 text-transparent group-hover:border-slate-400"
          }`}
          aria-hidden
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </span>
      </div>
      {(price || badge) && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {price && (
            <span className="inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-sm font-bold tabular-nums text-amber-100">
              {price}
            </span>
          )}
          {badge && (
            <span className="inline-flex rounded-full border border-slate-600/50 bg-slate-900/60 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-300">
              {badge}
            </span>
          )}
        </div>
      )}
    </button>
  );
}

interface SubscriptionCreateModalProps {
  open: boolean;
  token: string;
  creating: boolean;
  t: (key: string, options?: Record<string, string | number>) => string;
  onClose: () => void;
  onCreatingChange: (creating: boolean) => void;
  onCreated: () => Promise<void>;
}

export function SubscriptionCreateModal({
  open,
  token,
  creating,
  t,
  onClose,
  onCreatingChange,
  onCreated,
}: SubscriptionCreateModalProps) {
  const [plans, setPlans] = useState<PlanAdminItem[]>([]);
  const [language, setLanguage] = useState("es");
  const [planId, setPlanId] = useState("");
  const [selectedUser, setSelectedUser] = useState<WebUserRowDto | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<WebUserRowDto[]>([]);

  const resetState = useCallback(() => {
    setLanguage("es");
    setPlanId("");
    setSelectedUser(null);
    setSearchInput("");
    setSearchQuery("");
    setSearchError(null);
    setFormError(null);
    setSearchResults([]);
  }, []);

  useEffect(() => {
    if (!open) {
      resetState();
      return;
    }
    getPlanAdminList(token)
      .then((list) =>
        setPlans((list ?? []).filter((p) => p.status && isPaidPlan(p)))
      )
      .catch(() => setPlans([]));
  }, [open, token, resetState]);

  const paidPlans = useMemo(
    () => plans.filter((p) => p.status && isPaidPlan(p)),
    [plans]
  );

  const runUserSearch = useCallback(
    async (query: string) => {
      const term = query.trim();
      if (term.length < 2) {
        setSearchError(t("subscriptions-dashboard.create.search-min-length"));
        setSearchResults([]);
        return;
      }
      setSearchLoading(true);
      setSearchError(null);
      try {
        const result = await getWebUsersPage(token, 0, USER_SEARCH_SIZE, term);
        setSearchResults(result.content ?? []);
        if (!(result.content?.length ?? 0)) {
          setSearchError(t("subscriptions-dashboard.create.search-no-results"));
        }
      } catch (err) {
        setSearchResults([]);
        setSearchError(
          err instanceof Error
            ? err.message
            : t("subscriptions-dashboard.create.search-error")
        );
      } finally {
        setSearchLoading(false);
      }
    },
    [token, t]
  );

  useEffect(() => {
    if (!open || !searchQuery) return;
    void runUserSearch(searchQuery);
  }, [open, searchQuery, runUserSearch]);

  const handleSelectUser = (user: WebUserRowDto) => {
    setSelectedUser(user);
    setLanguage(normalizeLanguage(user.language));
    setSearchError(null);
  };

  const triggerUserSearch = () => {
    setSearchQuery(searchInput.trim());
  };

  const handleCreate = async () => {
    if (!selectedUser) return;

    onCreatingChange(true);
    setFormError(null);
    try {
      await createAdminSubscription(token, {
        user_id: selectedUser.id,
        language,
        ...(planId ? { plan_id: Number(planId) } : {}),
      });
      resetState();
      onClose();
      await onCreated();
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : t("subscriptions-dashboard.create.error")
      );
    } finally {
      onCreatingChange(false);
    }
  };

  return (
    <DashboardModalShell
      open={open}
      onClose={onClose}
      title={t("subscriptions-dashboard.create.title")}
      subtitle={t("subscriptions-dashboard.create.description")}
      accent="emerald"
      maxWidthClass="max-w-2xl"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={creating}
            className={`rounded-xl border ${DASHBOARD_PALETTE.border} px-6 py-3 text-base font-semibold text-slate-300 transition-colors hover:bg-slate-700/50 disabled:opacity-50`}
          >
            {t("subscriptions-dashboard.create.cancel")}
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating || !selectedUser}
            className={`${DASHBOARD_PALETTE.btnPrimary} px-8 py-3 text-base disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {creating
              ? t("subscriptions-dashboard.create.submitting")
              : t("subscriptions-dashboard.create.submit")}
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Búsqueda de usuario */}
        <div
          className={`space-y-4 rounded-2xl border ${DASHBOARD_PALETTE.border} bg-slate-800/30 p-5`}
        >
          <div>
            <p className="text-base font-semibold text-white">
              {t("subscriptions-dashboard.create.user-search-title")}
            </p>
            <p className={`mt-1 text-sm ${DASHBOARD_PALETTE.textMuted}`}>
              {t("subscriptions-dashboard.create.user-search-hint")}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <svg
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
                />
              </svg>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    triggerUserSearch();
                  }
                }}
                placeholder={t("subscriptions-dashboard.create.user-search-placeholder")}
                className={`${DASHBOARD_PALETTE.input} py-3.5 pl-12 text-base`}
              />
            </div>
            <button
              type="button"
              onClick={triggerUserSearch}
              disabled={searchLoading}
              className={`${DASHBOARD_PALETTE.btnPrimary} shrink-0 px-6 py-3.5 text-base`}
            >
              {searchLoading
                ? t("subscriptions-dashboard.create.searching")
                : t("subscriptions-dashboard.create.search-button")}
            </button>
          </div>

          {selectedUser && (
            <div className="flex items-center justify-between gap-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-base font-bold text-emerald-100">
                  {getUserInitials(selectedUser)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-white">
                    {getUserDisplayName(selectedUser)}
                  </p>
                  <p className="truncate text-sm text-emerald-200/80">{selectedUser.email}</p>
                  <p className="font-mono text-xs text-slate-400">ID #{selectedUser.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="shrink-0 text-sm font-medium text-slate-400 hover:text-white"
              >
                {t("subscriptions-dashboard.create.change-user")}
              </button>
            </div>
          )}

          {!selectedUser && searchResults.length > 0 && (
            <ul className="max-h-56 space-y-2 overflow-y-auto rounded-xl border border-slate-700/50 bg-slate-900/50 p-2">
              {searchResults.map((user) => (
                <li key={user.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectUser(user)}
                    className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left transition-colors hover:bg-slate-800/80"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-700/80 text-sm font-bold text-slate-200">
                      {getUserInitials(user)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-medium text-white">
                        {getUserDisplayName(user)}
                      </p>
                      <p className="truncate text-sm text-slate-400">{user.email}</p>
                    </div>
                    <span className="shrink-0 font-mono text-xs text-slate-500">#{user.id}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {searchError && (
            <p className="text-sm text-amber-300">{searchError}</p>
          )}
        </div>

        {formError && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {formError}
          </div>
        )}

        {/* Idioma y plan */}
        <div
          className={`space-y-5 rounded-2xl border ${DASHBOARD_PALETTE.border} bg-slate-800/30 p-5`}
        >
          <div>
            <p className="text-base font-semibold text-white">
              {t("subscriptions-dashboard.create.language-label")}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {LANGUAGE_OPTIONS.map((opt) => {
                const active = language === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setLanguage(opt.value)}
                    className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all sm:text-base ${
                      active
                        ? "border-cyan-400/50 bg-cyan-500/15 text-cyan-100 ring-1 ring-cyan-400/25"
                        : "border-slate-600/50 bg-slate-900/50 text-slate-300 hover:border-slate-500 hover:text-white"
                    }`}
                  >
                    {t(opt.labelKey)}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-base font-semibold text-white">
              {t("subscriptions-dashboard.create.plan-label")}
            </p>
            <p className={`mt-1 text-sm ${DASHBOARD_PALETTE.textMuted}`}>
              {t("subscriptions-dashboard.create.plan-picker-hint")}
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <PlanOptionCard
                selected={planId === ""}
                onSelect={() => setPlanId("")}
                title={t("subscriptions-dashboard.create.plan-auto")}
                subtitle={t("subscriptions-dashboard.create.plan-auto-desc")}
              />
              {paidPlans.map((plan) => (
                <PlanOptionCard
                  key={plan.id}
                  selected={planId === String(plan.id)}
                  onSelect={() => setPlanId(String(plan.id))}
                  title={plan.name}
                  price={formatPlanPrice(plan)}
                  badge={formatPlanFrequency(plan) ?? undefined}
                />
              ))}
            </div>

            {paidPlans.length === 0 && (
              <p className={`mt-3 text-sm ${DASHBOARD_PALETTE.textMuted}`}>
                {t("subscriptions-dashboard.create.no-paid-plans")}
              </p>
            )}
          </div>
        </div>
      </div>
    </DashboardModalShell>
  );
}

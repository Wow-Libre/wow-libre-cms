"use client";

import React, { useState, useEffect, useMemo } from "react";
import { dashboardSwal as Swal } from "@/components/dashboard/dashboardSwal";
import LoadingSpinnerCentral from "@/components/utilities/loading-spinner-v2";
import {
  createProvider,
  deleteProvider,
  getNotificationProviders,
} from "@/service/NotificationProviderService";
import { NotificationProviders } from "@/model/NotificationProviders";
import { DashboardSection } from "../layout";
import { DASHBOARD_PALETTE } from "../styles/dashboardPalette";

type ProviderKey = "METRICS" | "MAILS";

interface ProviderTypeConfig {
  key: ProviderKey;
  icon: React.ReactNode;
  accent: "cyan" | "emerald";
  testId: string;
}

const PROVIDER_TYPES: ProviderTypeConfig[] = [
  {
    key: "METRICS",
    accent: "cyan",
    testId: "metrics",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
  {
    key: "MAILS",
    accent: "emerald",
    testId: "mails",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  },
];

interface FormConnection {
  type: ProviderKey | "";
  host: string;
  client: string;
  secret: string;
}

interface ProvidersDashboardProps {
  token: string;
  t: (key: string, options?: Record<string, string | number>) => string;
}

const normalizeProviderKey = (raw: string | null | undefined): ProviderKey | null => {
  if (!raw) return null;
  const v = raw.trim().toUpperCase();
  if (v === "METRICS" || v === "METRIC" || v === "METRICA" || v === "METRICS_SERVICE") return "METRICS";
  if (v === "MAILS" || v === "MAIL" || v === "EMAIL" || v === "EMAILS" || v === "CORREO" || v === "CORREOS") return "MAILS";
  return null;
};

const providerLabelKey = (key: ProviderKey): string =>
  `providers-dashboard.form.${key === "METRICS" ? "metrics-option" : "mails-option"}`;

const providerDescriptionKey = (key: ProviderKey): string =>
  `providers-dashboard.form.${key === "METRICS" ? "metrics-description" : "mails-description"}`;

const formatDate = (iso: string): string => {
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

const ProvidersDashboard: React.FC<ProvidersDashboardProps> = ({ token, t }) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [connections, setConnections] = useState<NotificationProviders[]>([]);
  const [form, setForm] = useState<FormConnection>({
    type: "",
    host: "",
    client: "",
    secret: "",
  });

  const fetchData = async () => {
    try {
      const data = await getNotificationProviders(token);
      setConnections(data ?? []);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : t("providers-dashboard.errors.fetch");
      Swal.fire({
        icon: "error",
        title: t("providers-dashboard.errors.title"),
        text: message,
        color: "white",
        background: "#0B1218",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const stats = useMemo(() => {
    const total = connections.length;
    let metrics = 0;
    let mails = 0;
    for (const c of connections) {
      const key = normalizeProviderKey(c.name);
      if (key === "METRICS") metrics += 1;
      else if (key === "MAILS") mails += 1;
    }
    return { total, metrics, mails };
  }, [connections]);

  const sortedConnections = useMemo(() => {
    return [...connections].sort((a, b) => {
      const ak = normalizeProviderKey(a.name);
      const bk = normalizeProviderKey(b.name);
      if (ak !== bk) {
        if (ak === "MAILS") return 1;
        if (bk === "MAILS") return -1;
        if (ak === "METRICS") return 1;
        if (bk === "METRICS") return -1;
      }
      const ad = new Date(a.created_at).getTime();
      const bd = new Date(b.created_at).getTime();
      if (!Number.isNaN(ad) && !Number.isNaN(bd) && ad !== bd) return bd - ad;
      return a.id - b.id;
    });
  }, [connections]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value.length > 100) {
      Swal.fire({
        icon: "warning",
        title: t("providers-dashboard.errors.warning"),
        text: t("providers-dashboard.errors.long-value"),
        color: "white",
        background: "#0B1218",
      });
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeSelect = (key: ProviderKey) => {
    setForm((prev) => ({ ...prev, type: key }));
  };

  const resetForm = () => {
    setForm({ type: "", host: "", client: "", secret: "" });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.type || submitting) return;
    setSubmitting(true);
    try {
      await createProvider(form.type, form.host.trim(), form.client.trim(), form.secret.trim(), token);
      await fetchData();
      resetForm();
      Swal.fire({
        icon: "success",
        title: t("providers-dashboard.success.title"),
        text: t("providers-dashboard.success.created"),
        color: "white",
        background: "#0B1218",
        timer: 2500,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : t("providers-dashboard.errors.create");
      Swal.fire({
        icon: "error",
        title: t("providers-dashboard.errors.title"),
        text: message,
        color: "white",
        background: "#0B1218",
        timer: 4500,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: t("providers-dashboard.confirm.title"),
      text: t("providers-dashboard.confirm.text"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("providers-dashboard.confirm.confirm"),
      cancelButtonText: t("providers-dashboard.confirm.cancel"),
      color: "white",
      background: "#0B1218",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteProvider(id, token);
      await fetchData();
      Swal.fire({
        icon: "success",
        title: t("providers-dashboard.success.title"),
        text: t("providers-dashboard.success.deleted"),
        color: "white",
        background: "#0B1218",
        timer: 2500,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t("providers-dashboard.errors.delete");
      Swal.fire({
        icon: "error",
        title: t("providers-dashboard.errors.title"),
        text: message,
        color: "white",
        background: "#0B1218",
        timer: 4500,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center" aria-busy>
        <LoadingSpinnerCentral />
      </div>
    );
  }

  const currentType = form.type === "" ? null : form.type;

  return (
    <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
      {/* Panel editor */}
      <div className="w-full shrink-0 xl:sticky xl:top-6 xl:max-w-[30rem]">
        <div className="relative overflow-hidden rounded-2xl border border-slate-600/50 bg-gradient-to-b from-slate-800/95 via-slate-900/90 to-slate-950/95 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.45)] ring-1 ring-white/[0.06] backdrop-blur-sm">
          <div
            className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-emerald-500 to-teal-500"
            aria-hidden
          />
          <div className="relative p-6 sm:p-7">
            <div className="flex gap-4">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/25 bg-gradient-to-br from-cyan-500/20 to-blue-600/10 shadow-inner ring-1 ring-cyan-400/10"
                aria-hidden
              >
                <svg
                  className="h-7 w-7 text-cyan-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <h2 className={`text-xl font-semibold tracking-tight sm:text-2xl ${DASHBOARD_PALETTE.text}`}>
                  {t("providers-dashboard.form.title")}
                </h2>
                <p className={`mt-1.5 text-base leading-relaxed ${DASHBOARD_PALETTE.textMuted}`}>
                  {t("providers-dashboard.form.subtitle")}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div className="space-y-3">
                <span className={`flex items-center gap-2 text-lg font-medium ${DASHBOARD_PALETTE.label}`}>
                  <svg className="h-6 w-6 shrink-0 text-cyan-500/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h7"
                    />
                  </svg>
                  {t("providers-dashboard.form.type-label")}
                </span>
                <div
                  role="radiogroup"
                  aria-label={t("providers-dashboard.form.type-label")}
                  className="grid grid-cols-2 gap-3"
                >
                  {PROVIDER_TYPES.map((opt) => {
                    const active = currentType === opt.key;
                    const activeCls =
                      opt.accent === "cyan"
                        ? "border-cyan-400/60 bg-gradient-to-br from-cyan-500/20 to-cyan-700/10 text-white shadow-md shadow-cyan-950/30 ring-1 ring-cyan-400/40"
                        : "border-emerald-400/60 bg-gradient-to-br from-emerald-500/20 to-emerald-700/10 text-white shadow-md shadow-emerald-950/30 ring-1 ring-emerald-400/40";
                    const iconCls =
                      opt.accent === "cyan"
                        ? "text-cyan-200"
                        : "text-emerald-200";
                    return (
                      <button
                        type="button"
                        key={opt.key}
                        role="radio"
                        aria-checked={active}
                        data-testid={`provider-type-${opt.testId}`}
                        onClick={() => handleTypeSelect(opt.key)}
                        className={`group relative flex flex-col items-start gap-2 rounded-xl border px-4 py-4 text-left transition-all ${
                          active
                            ? activeCls
                            : "border-slate-600/50 bg-slate-800/40 text-slate-300 hover:border-slate-500 hover:bg-slate-800/70"
                        }`}
                      >
                        <span className="flex items-center gap-2 text-lg font-semibold">
                          <span
                            className={`shrink-0 transition-colors [&_svg]:h-6 [&_svg]:w-6 ${
                              active ? iconCls : "text-slate-400 group-hover:text-slate-300"
                            }`}
                          >
                            {opt.icon}
                          </span>
                          <span>{t(providerLabelKey(opt.key))}</span>
                        </span>
                        <span
                          className={`text-base leading-snug ${active ? "text-white/85" : "text-slate-400"}`}
                        >
                          {t(providerDescriptionKey(opt.key))}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="provider-host"
                  className={`flex items-center gap-2 text-lg font-medium ${DASHBOARD_PALETTE.label}`}
                >
                  <svg className="h-6 w-6 shrink-0 text-cyan-500/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  {t("providers-dashboard.form.host-label")}
                </label>
                <input
                  id="provider-host"
                  type="url"
                  name="host"
                  maxLength={50}
                  placeholder={t("providers-dashboard.form.host-placeholder")}
                  value={form.host}
                  onChange={handleChange}
                  className={DASHBOARD_PALETTE.input}
                  required
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="provider-client"
                  className={`flex items-center gap-2 text-lg font-medium ${DASHBOARD_PALETTE.label}`}
                >
                  <svg className="h-6 w-6 shrink-0 text-pink-400/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {t("providers-dashboard.form.client-label")}
                </label>
                <input
                  id="provider-client"
                  type="text"
                  name="client"
                  maxLength={50}
                  placeholder={t("providers-dashboard.form.client-placeholder")}
                  value={form.client}
                  onChange={handleChange}
                  className={DASHBOARD_PALETTE.input}
                  required
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="provider-secret"
                  className={`flex items-center gap-2 text-lg font-medium ${DASHBOARD_PALETTE.label}`}
                >
                  <svg className="h-6 w-6 shrink-0 text-amber-400/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  {t("providers-dashboard.form.secret-label")}
                </label>
                <input
                  id="provider-secret"
                  type="password"
                  name="secret"
                  maxLength={50}
                  placeholder={t("providers-dashboard.form.secret-placeholder")}
                  value={form.secret}
                  onChange={handleChange}
                  className={DASHBOARD_PALETTE.input}
                  required
                  autoComplete="off"
                />
              </div>

              <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  disabled={submitting || !form.type}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 px-5 py-3.5 text-base font-semibold text-white shadow-lg shadow-cyan-900/30 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />
                      {t("providers-dashboard.form.submitting")}
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {t("providers-dashboard.form.submit-button")}
                    </>
                  )}
                </button>
                {(form.type || form.host || form.client || form.secret) && !submitting && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className={`rounded-xl border px-4 py-3.5 text-base font-semibold ${DASHBOARD_PALETTE.border} ${DASHBOARD_PALETTE.textMuted} hover:bg-slate-700/50`}
                  >
                    {t("providers-dashboard.form.cancel")}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="min-w-0 flex-1 space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
          <StatTile
            label={t("providers-dashboard.stats.total")}
            value={stats.total}
            iconColor="text-sky-300"
            border="border-sky-500/25"
            bg="from-sky-500/[0.10] to-slate-900/70"
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            }
          />
          <StatTile
            label={t("providers-dashboard.form.metrics-option")}
            value={stats.metrics}
            iconColor="text-cyan-300"
            border="border-cyan-500/25"
            bg="from-cyan-500/[0.10] to-slate-900/70"
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
          <StatTile
            label={t("providers-dashboard.form.mails-option")}
            value={stats.mails}
            iconColor="text-emerald-300"
            border="border-emerald-500/25"
            bg="from-emerald-500/[0.10] to-slate-900/70"
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />
        </div>

        <DashboardSection
          title={t("providers-dashboard.list.title")}
          description={t("providers-dashboard.list.subtitle")}
        >
          {sortedConnections.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-600/50 bg-slate-800/20 py-16 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-600/50 bg-slate-800/60">
                <svg className="h-10 w-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <p className={`max-w-md text-lg leading-relaxed ${DASHBOARD_PALETTE.textMuted}`}>
                {t("providers-dashboard.list.empty")}
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {sortedConnections.map((conn) => {
                const key = normalizeProviderKey(conn.name);
                const isMail = key === "MAILS";
                const isMetrics = key === "METRICS";
                const accentBorder = isMail
                  ? "border-emerald-500/35"
                  : isMetrics
                    ? "border-cyan-500/35"
                    : "border-slate-600/45";
                const accentBar = isMail
                  ? "from-emerald-500 to-emerald-700"
                  : isMetrics
                    ? "from-cyan-500 to-blue-600"
                    : "from-slate-500 to-slate-700";
                return (
                  <li
                    key={conn.id}
                    className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br from-slate-800/90 to-slate-900/95 shadow-md ring-1 ring-white/[0.04] transition hover:shadow-lg ${accentBorder}`}
                  >
                    <div
                      className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b opacity-90 ${accentBar}`}
                      aria-hidden
                    />
                    <div className="relative flex flex-col gap-4 pl-5 pr-4 pt-4 pb-4 sm:flex-row sm:items-start sm:pl-6">
                      <div className="min-w-0 flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <ProviderTypeBadge name={conn.name} t={t} />
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-600/45 bg-slate-800/60 px-2.5 py-1 text-xs font-medium text-slate-400">
                            <span className="font-semibold text-slate-300">#{conn.id}</span>
                          </span>
                        </div>

                        <div className="space-y-2">
                          <Field
                            label={t("providers-dashboard.list.host")}
                            icon={
                              <svg className="h-5 w-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                              </svg>
                            }
                          >
                            <a
                              href={conn.host}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`break-all text-base font-medium ${DASHBOARD_PALETTE.accent} hover:underline`}
                            >
                              {conn.host}
                            </a>
                          </Field>

                          <Field
                            label={t("providers-dashboard.list.client")}
                            icon={
                              <svg className="h-5 w-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            }
                          >
                            <span className={`break-all text-base font-medium ${DASHBOARD_PALETTE.text}`}>
                              {conn.client}
                            </span>
                          </Field>

                          {conn.description && (
                            <div className="mt-1 flex items-start gap-2 rounded-lg border border-slate-700/40 bg-slate-900/40 p-3.5 text-base leading-relaxed text-slate-200">
                              <svg className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="min-w-0 break-words">{conn.description}</span>
                            </div>
                          )}
                        </div>

                        <p className={`text-base ${DASHBOARD_PALETTE.textMuted}`}>
                          {t("providers-dashboard.list.created-at", {
                            date: formatDate(conn.created_at),
                          })}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-stretch">
                        <button
                          type="button"
                          onClick={() => handleDelete(conn.id)}
                          className={`inline-flex items-center justify-center gap-1.5 ${DASHBOARD_PALETTE.btnDanger}`}
                          aria-label={t("providers-dashboard.list.remove")}
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                          {t("providers-dashboard.list.remove")}
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </DashboardSection>
      </div>
    </div>
  );
};

function StatTile({
  label,
  value,
  icon,
  iconColor,
  border,
  bg,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconColor: string;
  border: string;
  bg: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${border} bg-gradient-to-br ${bg} p-5 shadow-md ring-1 ring-white/[0.04] transition hover:shadow-lg sm:p-6`}
    >
      <div className={`absolute right-4 top-4 ${iconColor} opacity-40 sm:right-5 sm:top-5`} aria-hidden>
        <div className="h-8 w-8 sm:h-9 sm:w-9">{icon}</div>
      </div>
      <p className={`text-sm font-semibold uppercase tracking-wider ${DASHBOARD_PALETTE.textMuted} sm:text-base`}>
        {label}
      </p>
      <p className={`mt-3 text-4xl font-bold tabular-nums leading-none ${DASHBOARD_PALETTE.text}`}>
        {value}
      </p>
    </div>
  );
}

function ProviderTypeBadge({ name, t }: { name: string; t: (k: string) => string }) {
  const key = normalizeProviderKey(name);
  if (key === "MAILS") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/35 bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-200">
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        {t("providers-dashboard.form.mails-option")}
      </span>
    );
  }
  if (key === "METRICS") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/35 bg-cyan-500/15 px-2.5 py-1 text-xs font-semibold text-cyan-200">
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        {t("providers-dashboard.form.metrics-option")}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-500/40 bg-slate-800/60 px-2.5 py-1 text-xs font-semibold text-slate-400">
      {name || "—"}
    </span>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className={`mb-1 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider ${DASHBOARD_PALETTE.textMuted}`}>
        {icon}
        <span>{label}</span>
      </p>
      {children}
    </div>
  );
}

export default ProvidersDashboard;

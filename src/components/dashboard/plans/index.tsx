"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  getPlanAdminList,
  createPlanAdmin,
  updatePlanAdmin,
  deletePlanAdmin,
  type PlanAdminItem,
  type PlanAdminCreateDto,
} from "@/api/plan/admin";
import { dashboardSwal as Swal } from "@/components/dashboard/dashboardSwal";
import { DashboardSection } from "../layout";
import { DASHBOARD_PALETTE } from "../styles/dashboardPalette";

interface PlansDashboardProps {
  token: string;
  t: (key: string, options?: Record<string, string | number>) => string;
}

type FrequencyKey = "MONTHLY" | "YEARLY";

const FREQUENCY_OPTIONS: { key: FrequencyKey; icon: React.ReactNode; testId: string }[] = [
  {
    key: "MONTHLY",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
    testId: "monthly",
  },
  {
    key: "YEARLY",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    testId: "yearly",
  },
];

const defaultForm: PlanAdminCreateDto = {
  name: "",
  price: 0,
  currency: "",
  discount: 0,
  status: true,
  frequency_type: "MONTHLY",
  frequency_value: 1,
  features: [],
};

const PAGE_SIZE = 4;

function normalizeFrequencyKey(raw: string | null | undefined): FrequencyKey | null {
  if (!raw) return null;
  const v = raw.trim().toUpperCase();
  if (v === "MONTHLY" || v === "MONTH" || v === "MES" || v === "MENSUAL" || v === "M") return "MONTHLY";
  if (v === "YEARLY" || v === "YEAR" || v === "ANIO" || v === "ANUAL" || v === "Y") return "YEARLY";
  return null;
}

function frequencyLabelKey(freq: FrequencyKey): string {
  return `plans-dashboard.frequency.${freq.toLowerCase()}`;
}

function frequencyDisplay(
  freq: string | null | undefined,
  t: (k: string) => string,
): { label: string; iconColor: string; bg: string; border: string; key: FrequencyKey | null } {
  const key = normalizeFrequencyKey(freq);
  if (key === "MONTHLY") {
    return {
      label: t("plans-dashboard.frequency.monthly"),
      iconColor: "text-cyan-300",
      bg: "from-cyan-500/[0.12] via-slate-900/40 to-slate-900/70",
      border: "border-cyan-500/30",
      key,
    };
  }
  if (key === "YEARLY") {
    return {
      label: t("plans-dashboard.frequency.yearly"),
      iconColor: "text-violet-300",
      bg: "from-violet-500/[0.12] via-slate-900/40 to-slate-900/70",
      border: "border-violet-500/30",
      key,
    };
  }
  return {
    label: freq || "—",
    iconColor: "text-slate-300",
    bg: "from-slate-500/[0.10] via-slate-900/40 to-slate-900/70",
    border: "border-slate-500/30",
    key: null,
  };
}

function FrequencyBadge({
  freq,
  value,
  t,
}: {
  freq: string | null;
  value: number | null;
  t: (k: string) => string;
}) {
  const display = frequencyDisplay(freq, t);
  const everyText = t("plans-dashboard.list.every");
  const amount = value && value > 0 ? value : 1;
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-lg border bg-gradient-to-br ${display.bg} ${display.border} px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm ring-1 ring-white/[0.04]`}
    >
      <span className={display.iconColor}>
        {display.key === "YEARLY" ? (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
      </span>
      <span className="text-white/95">{display.label}</span>
      <span className="text-slate-400">·</span>
      <span className="tabular-nums text-slate-300">
        {everyText} {amount}
      </span>
    </span>
  );
}

const formatPrice = (value: number | null | undefined, currency: string | null | undefined): string => {
  if (value == null) return "—";
  const num = Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return currency ? `${num} ${currency}` : num;
};

const PlansDashboard: React.FC<PlansDashboardProps> = ({ token, t }) => {
  const [list, setList] = useState<PlanAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<PlanAdminCreateDto>(defaultForm);
  const [featureInput, setFeatureInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<"ALL" | FrequencyKey>("ALL");

  const fetchList = async () => {
    try {
      const data = await getPlanAdminList(token);
      setList(data ?? []);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : t("plans-dashboard.alerts.fetch-error");
      Swal.fire({
        icon: "warning",
        title: "Oops...",
        text: message,
        color: "white",
        background: "#0B1218",
        timer: 4500,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [token]);

  const stats = useMemo(() => {
    const total = list.length;
    const active = list.filter((p) => p.status).length;
    const inactive = total - active;
    const monthly = list.filter((p) => normalizeFrequencyKey(p.frequency_type) === "MONTHLY").length;
    const yearly = list.filter((p) => normalizeFrequencyKey(p.frequency_type) === "YEARLY").length;
    return { total, active, inactive, monthly, yearly };
  }, [list]);

  const filteredList = useMemo(() => {
    if (filter === "ALL") return list;
    return list.filter((p) => normalizeFrequencyKey(p.frequency_type) === filter);
  }, [list, filter]);

  const [currentPage, setCurrentPage] = useState(0);

  const pageCount = Math.max(1, Math.ceil(filteredList.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage(0);
  }, [filter]);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, Math.max(0, pageCount - 1)));
  }, [pageCount]);

  const visibleList = useMemo(() => {
    const start = currentPage * PAGE_SIZE;
    return filteredList.slice(start, start + PAGE_SIZE);
  }, [filteredList, currentPage]);

  const rangeStart = filteredList.length === 0 ? 0 : currentPage * PAGE_SIZE + 1;
  const rangeEnd = Math.min((currentPage + 1) * PAGE_SIZE, filteredList.length);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    if (name === "status") {
      setForm((prev) => ({ ...prev, status: checked }));
      return;
    }
    if (name === "price" || name === "discount" || name === "frequency_value") {
      setForm((prev) => ({
        ...prev,
        [name]: value === "" ? 0 : Number(value),
      }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const setFrequency = (key: FrequencyKey) => {
    setForm((prev) => ({ ...prev, frequency_type: key }));
  };

  const resetForm = () => {
    setForm(defaultForm);
    setEditingId(null);
    setFeatureInput("");
  };

  const addFeature = () => {
    const trimmed = featureInput.trim();
    if (!trimmed) return;
    setForm((prev) => ({
      ...prev,
      features: [...(prev.features ?? []), trimmed],
    }));
    setFeatureInput("");
  };

  const removeFeature = (index: number) => {
    setForm((prev) => {
      const next = prev.features ?? [];
      return {
        ...prev,
        features: next.filter((_, i) => i !== index),
      };
    });
  };

  const handleFeatureKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addFeature();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name.trim() || submitting) return;
    const payload = {
      ...form,
      features: (form.features ?? []).filter((f) => f.trim().length > 0),
    };
    setSubmitting(true);
    try {
      if (editingId !== null) {
        await updatePlanAdmin(token, { ...payload, id: editingId });
      } else {
        await createPlanAdmin(token, payload);
      }
      resetForm();
      await fetchList();
      Swal.fire({
        icon: "success",
        title: t("plans-dashboard.alerts.save-success"),
        color: "white",
        background: "#0B1218",
        timer: 2500,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : t("plans-dashboard.alerts.save-error");
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: message,
        color: "white",
        background: "#0B1218",
        timer: 4500,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: PlanAdminItem) => {
    const features =
      item.features != null && Array.isArray(item.features)
        ? item.features.map((f) => (typeof f === "string" ? f : String(f)))
        : [];
    const normalizedKey = normalizeFrequencyKey(item.frequency_type) ?? "MONTHLY";
    setForm({
      name: item.name,
      price: item.price,
      currency: item.currency ?? "",
      discount: item.discount ?? 0,
      status: item.status,
      frequency_type: normalizedKey,
      frequency_value: item.frequency_value ?? 1,
      features,
    });
    setEditingId(item.id);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: t("plans-dashboard.alerts.delete-confirm-title"),
      text: t("plans-dashboard.alerts.delete-confirm-message"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("plans-dashboard.alerts.delete-confirm-yes"),
      cancelButtonText: t("plans-dashboard.alerts.delete-confirm-no"),
      color: "white",
      background: "#0B1218",
    });
    if (!result.isConfirmed) return;
    try {
      await deletePlanAdmin(token, id);
      if (editingId === id) resetForm();
      await fetchList();
      Swal.fire({
        icon: "success",
        title: t("plans-dashboard.alerts.delete-success"),
        color: "white",
        background: "#0B1218",
        timer: 2500,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : t("plans-dashboard.alerts.delete-error");
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: message,
        color: "white",
        background: "#0B1218",
        timer: 4500,
      });
    }
  };

  const isEditing = editingId !== null;
  const currentFrequency = normalizeFrequencyKey(form.frequency_type) ?? "MONTHLY";
  const previewPrice = form.discount && form.discount > 0
    ? Math.max(0, Number(form.price) * (1 - Number(form.discount) / 100))
    : Number(form.price) || 0;
  const previewFrequencyLabel = t(frequencyLabelKey(currentFrequency));
  const previewFrequencyValue = form.frequency_value && form.frequency_value > 0 ? form.frequency_value : 1;

  return (
    <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
      {/* Panel editor */}
      <div className="w-full shrink-0 xl:sticky xl:top-6 xl:max-w-[30rem]">
        <div className="relative overflow-hidden rounded-2xl border border-slate-600/50 bg-gradient-to-b from-slate-800/95 via-slate-900/90 to-slate-950/95 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.45)] ring-1 ring-white/[0.06] backdrop-blur-sm">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-sky-500 to-violet-500" aria-hidden />
          <div className="relative p-6 sm:p-7">
            <div className="flex gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/25 bg-gradient-to-br from-cyan-500/20 to-blue-600/10 shadow-inner ring-1 ring-cyan-400/10" aria-hidden>
                <svg className="h-7 w-7 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <h2 className={`text-xl font-semibold tracking-tight sm:text-2xl ${DASHBOARD_PALETTE.text}`}>
                  {isEditing
                    ? t("plans-dashboard.title-edit")
                    : t("plans-dashboard.title-create")}
                </h2>
                <p className={`mt-1.5 text-base leading-relaxed ${DASHBOARD_PALETTE.textMuted}`}>
                  {t("plans-dashboard.form.panel-description")}
                </p>
              </div>
            </div>

            {isEditing && (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.07] px-4 py-3">
                <span className="text-base font-medium text-amber-200/95">
                  {t("plans-dashboard.form.editing-badge", { id: editingId })}
                </span>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-slate-600/60 bg-slate-800/80 px-3.5 py-2 text-base font-medium text-slate-200 transition-colors hover:border-slate-500 hover:bg-slate-700/80"
                >
                  {t("plans-dashboard.form.cancel-edit")}
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="plan-name"
                  className={`flex items-center gap-2 text-base font-medium ${DASHBOARD_PALETTE.label}`}
                >
                  <svg className="h-5 w-5 shrink-0 text-cyan-500/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h12" />
                  </svg>
                  {t("plans-dashboard.form.name-label")}
                </label>
                <input
                  id="plan-name"
                  type="text"
                  name="name"
                  placeholder={t("plans-dashboard.form.name-placeholder")}
                  value={form.name}
                  onChange={handleChange}
                  className={DASHBOARD_PALETTE.input}
                  required
                  autoComplete="off"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="plan-price"
                    className={`flex items-center gap-2 text-base font-medium ${DASHBOARD_PALETTE.label}`}
                  >
                    <svg className="h-5 w-5 shrink-0 text-amber-400/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t("plans-dashboard.form.price-label")}
                  </label>
                  <input
                    id="plan-price"
                    type="number"
                    name="price"
                    min={0}
                    step={0.01}
                    value={form.price || ""}
                    onChange={handleChange}
                    className={DASHBOARD_PALETTE.input}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="plan-currency"
                    className={`flex items-center gap-2 text-base font-medium ${DASHBOARD_PALETTE.label}`}
                  >
                    <svg className="h-5 w-5 shrink-0 text-emerald-400/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2zm6 12h4" />
                    </svg>
                    {t("plans-dashboard.form.currency-label")}
                  </label>
                  <input
                    id="plan-currency"
                    type="text"
                    name="currency"
                    placeholder="USD"
                    value={form.currency}
                    onChange={handleChange}
                    className={DASHBOARD_PALETTE.input}
                    autoComplete="off"
                    maxLength={8}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <span className={`flex items-center gap-2 text-base font-medium ${DASHBOARD_PALETTE.label}`}>
                  <svg className="h-5 w-5 shrink-0 text-violet-400/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t("plans-dashboard.form.frequency-type-label")}
                </span>
                <div
                  role="radiogroup"
                  aria-label={t("plans-dashboard.form.frequency-type-label")}
                  className="grid grid-cols-2 gap-3"
                >
                  {FREQUENCY_OPTIONS.map((opt) => {
                    const active = currentFrequency === opt.key;
                    return (
                      <button
                        type="button"
                        key={opt.key}
                        role="radio"
                        aria-checked={active}
                        data-testid={`frequency-${opt.testId}`}
                        onClick={() => setFrequency(opt.key)}
                        className={`group relative flex items-center justify-center gap-2.5 rounded-xl border px-4 py-3.5 text-base font-semibold transition-all ${
                          active
                            ? opt.key === "YEARLY"
                              ? "border-violet-400/60 bg-gradient-to-br from-violet-500/20 to-violet-700/10 text-white shadow-md shadow-violet-950/30 ring-1 ring-violet-400/40"
                              : "border-cyan-400/60 bg-gradient-to-br from-cyan-500/20 to-cyan-700/10 text-white shadow-md shadow-cyan-950/30 ring-1 ring-cyan-400/40"
                            : "border-slate-600/50 bg-slate-800/40 text-slate-300 hover:border-slate-500 hover:bg-slate-800/70"
                        }`}
                      >
                        <span
                          className={`shrink-0 transition-colors ${
                            active
                              ? opt.key === "YEARLY"
                                ? "text-violet-200"
                                : "text-cyan-200"
                              : "text-slate-400 group-hover:text-slate-300"
                          }`}
                        >
                          {opt.icon}
                        </span>
                        <span>{t(frequencyLabelKey(opt.key))}</span>
                      </button>
                    );
                  })}
                </div>
                <p className={`text-sm leading-relaxed ${DASHBOARD_PALETTE.textMuted}`}>
                  {t("plans-dashboard.form.frequency-type-helper")}
                </p>
                <input type="hidden" name="frequency_type" value={currentFrequency} />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="plan-frequency-value"
                  className={`flex items-center gap-2 text-base font-medium ${DASHBOARD_PALETTE.label}`}
                >
                  <svg className="h-5 w-5 shrink-0 text-pink-400/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t("plans-dashboard.form.frequency-value-label")}
                </label>
                <input
                  id="plan-frequency-value"
                  type="number"
                  name="frequency_value"
                  min={1}
                  value={form.frequency_value || ""}
                  onChange={handleChange}
                  className={DASHBOARD_PALETTE.input}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="plan-discount"
                    className={`flex items-center gap-2 text-base font-medium ${DASHBOARD_PALETTE.label}`}
                  >
                    <svg className="h-5 w-5 shrink-0 text-rose-400/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {t("plans-dashboard.form.discount-label")}
                  </label>
                  <input
                    id="plan-discount"
                    type="number"
                    name="discount"
                    min={0}
                    max={100}
                    step={0.01}
                    value={form.discount ?? ""}
                    onChange={handleChange}
                    className={DASHBOARD_PALETTE.input}
                  />
                </div>
                <div className="space-y-2">
                  <span className={`flex items-center gap-2 text-base font-medium ${DASHBOARD_PALETTE.label}`}>
                    <svg className="h-5 w-5 shrink-0 text-emerald-400/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t("plans-dashboard.form.status-label")}
                  </span>
                  <label
                    htmlFor="plan-status"
                    className={`flex h-[42px] cursor-pointer items-center gap-3 rounded-xl border px-4 text-base font-medium transition-colors ${
                      form.status
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                        : "border-slate-600/50 bg-slate-800/40 text-slate-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      id="plan-status"
                      name="status"
                      checked={form.status}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/30"
                    />
                    <span>{form.status ? t("plans-dashboard.form.status-on") : t("plans-dashboard.form.status-off")}</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="plan-feature-input"
                  className={`flex items-center gap-2 text-base font-medium ${DASHBOARD_PALETTE.label}`}
                >
                  <svg className="h-5 w-5 shrink-0 text-indigo-400/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t("plans-dashboard.form.features-label")}
                </label>
                <div className="flex gap-2">
                  <input
                    id="plan-feature-input"
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={handleFeatureKeyDown}
                    placeholder={t("plans-dashboard.form.features-placeholder")}
                    className={`flex-1 min-w-0 ${DASHBOARD_PALETTE.input}`}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="shrink-0 rounded-xl border border-cyan-500/40 bg-cyan-500/15 px-4 py-2.5 text-base font-semibold text-cyan-200 transition-colors hover:bg-cyan-500/25 disabled:opacity-50"
                    disabled={!featureInput.trim()}
                  >
                    + {t("plans-dashboard.form.features-add")}
                  </button>
                </div>
                {(form.features ?? []).length > 0 && (
                  <ul
                    className="mt-3 max-h-[240px] space-y-2 overflow-y-auto rounded-xl border border-slate-700/40 bg-slate-800/30 p-2.5"
                    aria-label={t("plans-dashboard.form.features-label")}
                  >
                    {(form.features ?? []).map((feature, index) => (
                      <li
                        key={`${index}-${feature}`}
                        className="group flex items-start gap-2.5 rounded-lg border border-slate-700/30 bg-slate-900/40 px-3 py-2 text-base text-slate-200"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.6)]" aria-hidden />
                        <span className="min-w-0 flex-1 break-words">{feature}</span>
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="shrink-0 rounded-md border border-transparent px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
                          aria-label={t("plans-dashboard.form.features-remove")}
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Live preview */}
              <div className="rounded-xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/[0.05] via-slate-900/40 to-slate-900/70 p-4">
                <p className={`mb-2 text-xs font-semibold uppercase tracking-wider ${DASHBOARD_PALETTE.textMuted}`}>
                  {t("plans-dashboard.form.preview-label")}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-bold tabular-nums ${DASHBOARD_PALETTE.text}`}>
                    {formatPrice(previewPrice, form.currency)}
                  </span>
                  <span className={`text-sm ${DASHBOARD_PALETTE.textMuted}`}>
                    / {previewFrequencyLabel.toLowerCase()}
                  </span>
                </div>
                <FrequencyBadge
                  freq={currentFrequency}
                  value={previewFrequencyValue}
                  t={t}
                />
              </div>

              <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 px-5 py-3.5 text-base font-semibold text-white shadow-lg shadow-cyan-900/30 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />
                      {t("plans-dashboard.form.submitting")}
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {isEditing
                        ? t("plans-dashboard.form.submit-edit")
                        : t("plans-dashboard.form.submit-create")}
                    </>
                  )}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className={`rounded-xl border px-4 py-3.5 text-base font-semibold ${DASHBOARD_PALETTE.border} ${DASHBOARD_PALETTE.textMuted} hover:bg-slate-700/50`}
                  >
                    {t("plans-dashboard.form.cancel")}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="min-w-0 flex-1 space-y-6">
        {/* Tarjetas de estadística */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          <StatTile
            label={t("plans-dashboard.stats.total")}
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
            label={t("plans-dashboard.stats.active")}
            value={stats.active}
            iconColor="text-emerald-300"
            border="border-emerald-500/25"
            bg="from-emerald-500/[0.10] to-slate-900/70"
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatTile
            label={t("plans-dashboard.stats.monthly")}
            value={stats.monthly}
            iconColor="text-cyan-300"
            border="border-cyan-500/25"
            bg="from-cyan-500/[0.10] to-slate-900/70"
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
          <StatTile
            label={t("plans-dashboard.stats.yearly")}
            value={stats.yearly}
            iconColor="text-violet-300"
            border="border-violet-500/25"
            bg="from-violet-500/[0.10] to-slate-900/70"
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        <DashboardSection
          title={t("plans-dashboard.list.title")}
          description={t("plans-dashboard.list.panel-description")}
        >
          {/* Filtros */}
          <div className="mb-4 flex flex-wrap items-center gap-2 border-b border-slate-700/50 pb-4">
            <FilterPill
              active={filter === "ALL"}
              onClick={() => setFilter("ALL")}
              label={t("plans-dashboard.filter.all")}
              count={stats.total}
              accent="slate"
            />
            <FilterPill
              active={filter === "MONTHLY"}
              onClick={() => setFilter("MONTHLY")}
              label={t("plans-dashboard.frequency.monthly")}
              count={stats.monthly}
              accent="cyan"
            />
            <FilterPill
              active={filter === "YEARLY"}
              onClick={() => setFilter("YEARLY")}
              label={t("plans-dashboard.frequency.yearly")}
              count={stats.yearly}
              accent="violet"
            />
          </div>

          {loading ? (
            <div className="space-y-3" aria-busy>
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-28 animate-pulse rounded-xl border border-slate-700/40 bg-slate-800/40"
                />
              ))}
            </div>
          ) : filteredList.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-600/50 bg-slate-800/20 py-16 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-600/50 bg-slate-800/60">
                <svg className="h-10 w-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7h18M3 12h18M3 17h12" />
                </svg>
              </div>
              <p className={`max-w-md text-base ${DASHBOARD_PALETTE.textMuted}`}>
                {list.length === 0
                  ? t("plans-dashboard.list.empty")
                  : t("plans-dashboard.list.empty-filtered")}
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {visibleList.map((item) => {
                const displayPrice =
                  item.discounted_price != null && item.discounted_price < item.price
                    ? item.discounted_price
                    : item.price;
                const hasDiscount =
                  item.discounted_price != null &&
                  item.discount != null &&
                  item.discount > 0 &&
                  item.discounted_price < item.price;
                const isActive = item.status;
                return (
                  <li
                    key={item.id}
                    className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br from-slate-800/90 to-slate-900/95 shadow-md ring-1 ring-white/[0.04] transition hover:shadow-lg ${
                      isEditing && editingId === item.id
                        ? "border-amber-500/50 ring-amber-400/30"
                        : "border-slate-600/45 hover:border-cyan-500/35"
                    }`}
                  >
                    <div
                      className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b opacity-90 ${
                        normalizeFrequencyKey(item.frequency_type) === "YEARLY"
                          ? "from-violet-500 to-violet-700"
                          : "from-cyan-500 to-blue-600"
                      }`}
                      aria-hidden
                    />
                    <div className="relative flex flex-col gap-4 pl-5 pr-4 pt-4 pb-4 sm:flex-row sm:items-center sm:pl-6">
                      {/* Identidad y precio */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className={`truncate text-lg font-semibold ${DASHBOARD_PALETTE.text}`}>
                            {item.name}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
                              isActive
                                ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-200"
                                : "border-slate-500/40 bg-slate-800/60 text-slate-400"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isActive
                                  ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]"
                                  : "bg-slate-500"
                              }`}
                              aria-hidden
                            />
                            {isActive
                              ? t("plans-dashboard.list.status-active")
                              : t("plans-dashboard.list.status-inactive")}
                          </span>
                          {isEditing && editingId === item.id && (
                            <span className="rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-200">
                              {t("plans-dashboard.list.editing-tag")}
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                          {hasDiscount ? (
                            <>
                              <span className={`text-2xl font-bold tabular-nums ${DASHBOARD_PALETTE.text}`}>
                                {formatPrice(displayPrice, item.currency)}
                              </span>
                              <span className="text-base text-slate-500 line-through tabular-nums">
                                {formatPrice(item.price, item.currency)}
                              </span>
                              <span className="ml-1 inline-flex items-center rounded-md border border-rose-500/35 bg-rose-500/10 px-2 py-0.5 text-xs font-bold text-rose-300">
                                -{item.discount}%
                              </span>
                            </>
                          ) : (
                            <span className={`text-2xl font-bold tabular-nums ${DASHBOARD_PALETTE.text}`}>
                              {formatPrice(displayPrice, item.currency)}
                            </span>
                          )}
                        </div>
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          <FrequencyBadge
                            freq={item.frequency_type}
                            value={item.frequency_value}
                            t={t}
                          />
                          {(item.features ?? []).length > 0 && (
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600/50 bg-slate-900/50 px-2.5 py-1.5 text-sm text-slate-300">
                              <svg className="h-4 w-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              {t("plans-dashboard.list.features-count", {
                                count: (item.features ?? []).length,
                              })}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-stretch">
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3.5 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-500/20"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          {t("plans-dashboard.list.edit")}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className={`inline-flex items-center justify-center gap-1.5 ${DASHBOARD_PALETTE.btnDanger}`}
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                          {t("plans-dashboard.list.delete")}
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {filteredList.length > 0 && (
            <PlansPagination
              currentPage={currentPage}
              pageCount={pageCount}
              totalItems={filteredList.length}
              pageSize={PAGE_SIZE}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              onPageChange={setCurrentPage}
              t={t}
            />
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
      className={`relative overflow-hidden rounded-2xl border ${border} bg-gradient-to-br ${bg} p-4 shadow-md ring-1 ring-white/[0.04] transition hover:shadow-lg sm:p-5`}
    >
      <div className={`absolute right-3 top-3 ${iconColor} opacity-40 sm:right-4 sm:top-4`} aria-hidden>
        <div className="h-7 w-7 sm:h-8 sm:w-8">{icon}</div>
      </div>
      <p className={`text-xs font-semibold uppercase tracking-wider ${DASHBOARD_PALETTE.textMuted} sm:text-sm`}>
        {label}
      </p>
      <p className={`mt-2 text-3xl font-bold tabular-nums leading-none ${DASHBOARD_PALETTE.text}`}>
        {value}
      </p>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  label,
  count,
  accent,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  accent: "slate" | "cyan" | "violet";
}) {
  const accentClasses = {
    slate: {
      active: "border-slate-400/60 bg-slate-700/60 text-white shadow-md",
      inactive: "border-slate-700/60 bg-slate-800/40 text-slate-300 hover:border-slate-500 hover:bg-slate-800/70",
    },
    cyan: {
      active: "border-cyan-400/60 bg-cyan-500/15 text-white shadow-md shadow-cyan-950/30",
      inactive: "border-slate-700/60 bg-slate-800/40 text-slate-300 hover:border-cyan-500/40 hover:text-cyan-200",
    },
    violet: {
      active: "border-violet-400/60 bg-violet-500/15 text-white shadow-md shadow-violet-950/30",
      inactive: "border-slate-700/60 bg-slate-800/40 text-slate-300 hover:border-violet-500/40 hover:text-violet-200",
    },
  }[accent];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition sm:text-base ${active ? accentClasses.active : accentClasses.inactive}`}
    >
      <span>{label}</span>
      <span
        className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-bold tabular-nums ${
          active ? "bg-white/15 text-white" : "bg-slate-900/70 text-slate-400"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function getVisiblePages(current: number, total: number): number[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i);
  }
  const pages = new Set<number>([0, total - 1, current]);
  if (current > 0) pages.add(current - 1);
  if (current < total - 1) pages.add(current + 1);
  if (current > 1) pages.add(current - 2);
  if (current < total - 2) pages.add(current + 2);
  return [...pages].sort((a, b) => a - b);
}

function PlansPagination({
  currentPage,
  pageCount,
  totalItems,
  rangeStart,
  rangeEnd,
  onPageChange,
  t,
}: {
  currentPage: number;
  pageCount: number;
  totalItems: number;
  pageSize: number;
  rangeStart: number;
  rangeEnd: number;
  onPageChange: (page: number) => void;
  t: (k: string, opts?: Record<string, string | number>) => string;
}) {
  const visiblePages = getVisiblePages(currentPage, pageCount);
  const canGoPrev = currentPage > 0;
  const canGoNext = currentPage < pageCount - 1;

  const go = (page: number) => {
    if (page < 0 || page >= pageCount) return;
    onPageChange(page);
  };

  return (
    <nav
      className="mt-6 rounded-2xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm sm:p-5"
      aria-label={t("plans-dashboard.list.pagination.aria")}
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="text-sm leading-relaxed text-slate-400 sm:text-base">
          <p>
            {t("plans-dashboard.list.pagination.range", {
              start: rangeStart,
              end: rangeEnd,
              total: totalItems,
            })}
          </p>
          <p className="mt-1">
            {t("plans-dashboard.list.pagination.page", {
              current: currentPage + 1,
              total: pageCount,
            })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <PaginationNavButton
            onClick={() => go(0)}
            disabled={!canGoPrev}
            ariaLabel={t("plans-dashboard.list.pagination.first")}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </PaginationNavButton>
          <PaginationNavButton
            onClick={() => go(currentPage - 1)}
            disabled={!canGoPrev}
            ariaLabel={t("plans-dashboard.list.pagination.prev")}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </PaginationNavButton>

          <div className="flex items-center gap-1.5 px-1">
            {visiblePages.map((page, index) => {
              const prev = visiblePages[index - 1];
              const showEllipsis = prev !== undefined && page - prev > 1;
              return (
                <span key={page} className="flex items-center gap-1.5">
                  {showEllipsis && (
                    <span className="px-1 text-base text-slate-500" aria-hidden>
                      …
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => go(page)}
                    aria-label={t("plans-dashboard.list.pagination.go-to", { page: page + 1 })}
                    aria-current={page === currentPage ? "page" : undefined}
                    className={`inline-flex h-10 min-w-[2.5rem] items-center justify-center rounded-xl border px-3 text-sm font-semibold tabular-nums transition sm:h-11 sm:text-base ${
                      page === currentPage
                        ? "border-cyan-400/50 bg-cyan-500/20 text-cyan-100 shadow-[0_0_16px_rgba(34,211,238,0.15)]"
                        : "border-slate-600/50 bg-slate-800/60 text-slate-300 hover:border-cyan-500/40 hover:text-white"
                    }`}
                  >
                    {page + 1}
                  </button>
                </span>
              );
            })}
          </div>

          <PaginationNavButton
            onClick={() => go(currentPage + 1)}
            disabled={!canGoNext}
            ariaLabel={t("plans-dashboard.list.pagination.next")}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </PaginationNavButton>
          <PaginationNavButton
            onClick={() => go(pageCount - 1)}
            disabled={!canGoNext}
            ariaLabel={t("plans-dashboard.list.pagination.last")}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </PaginationNavButton>
        </div>
      </div>
    </nav>
  );
}

function PaginationNavButton({
  children,
  onClick,
  disabled,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-600/50 bg-slate-800/60 text-slate-300 transition hover:border-cyan-500/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 sm:h-11 sm:w-11"
    >
      {children}
    </button>
  );
}

export default PlansDashboard;

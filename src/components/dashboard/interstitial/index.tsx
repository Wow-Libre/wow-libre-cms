"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  getInterstitialList,
  createInterstitial,
  updateInterstitial,
  deleteInterstitial,
  type InterstitialItem,
} from "@/api/interstitial";
import { dashboardSwal as Swal } from "@/components/dashboard/dashboardSwal";
import { DashboardSection } from "../layout";
import { DASHBOARD_PALETTE } from "../styles/dashboardPalette";
import { DashboardImageUploader } from "@/components/dashboard/image-uploader/DashboardImageUploader";
import { uploadInterstitialImage } from "@/lib/upload/interstitialImageUpload";

const INITIAL_VISIBLE = 6;
const LOAD_MORE_SIZE = 6;

interface InterstitialDashboardProps {
  token: string;
  t: (key: string, options?: Record<string, unknown>) => string;
}

function sanitizeHttpImageUrl(value: string): string {
  const v = value.trim();
  if (!v) return "";
  try {
    const u = new URL(v);
    if (u.protocol !== "https:" && u.protocol !== "http:") return "";
    return u.toString();
  } catch {
    return "";
  }
}

function isLikelyImageUrl(value: string): boolean {
  return sanitizeHttpImageUrl(value) !== "";
}

const InterstitialDashboard: React.FC<InterstitialDashboardProps> = ({ token, t }) => {
  const [formData, setFormData] = useState({
    urlImg: "",
    redirectUrl: "",
    badgeText: "",
    discountLabel: "",
    endsAt: "",
  });
  const [list, setList] = useState<InterstitialItem[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchList = async () => {
    try {
      const data = await getInterstitialList(token);
      setList(data ?? []);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t("interstitial-dashboard.alerts.fetch-error");
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

  const activeList = list.filter((item) => item.active);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE);
  }, [activeList.length]);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + LOAD_MORE_SIZE, activeList.length));
  }, [activeList.length]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    const sentinel = sentinelRef.current;
    if (!container || !sentinel || activeList.length <= INITIAL_VISIBLE) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { root: container, rootMargin: "100px", threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [activeList.length, loadMore]);

  const visibleList = activeList.slice(0, visibleCount);
  const hasMore = visibleCount < activeList.length;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const cancelEditing = () => {
    setFormData({ urlImg: "", redirectUrl: "", badgeText: "", discountLabel: "", endsAt: "" });
    setEditingId(null);
  };

  // Convierte "YYYY-MM-DDTHH:mm" (datetime-local) a ISO string con zona local.
  const toIsoFromLocal = (value: string): string => {
    if (!value) return "";
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? "" : d.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const safeImg = sanitizeHttpImageUrl(formData.urlImg);
    if (!safeImg || !formData.redirectUrl.trim()) return;
    const extras = {
      badgeText: formData.badgeText.trim(),
      discountLabel: formData.discountLabel.trim(),
      endsAt: toIsoFromLocal(formData.endsAt),
    };
    try {
      if (editingId !== null) {
        await updateInterstitial(token, editingId, safeImg, formData.redirectUrl.trim(), extras);
      } else {
        await createInterstitial(token, safeImg, formData.redirectUrl.trim(), extras);
      }
      setFormData({ urlImg: "", redirectUrl: "", badgeText: "", discountLabel: "", endsAt: "" });
      setEditingId(null);
      await fetchList();
      Swal.fire({
        icon: "success",
        title: t("interstitial-dashboard.alerts.save-success"),
        color: "white",
        background: "#0B1218",
        timer: 2500,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t("interstitial-dashboard.alerts.save-error");
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

  const handleEdit = (item: InterstitialItem) => {
    let localEndsAt = "";
    if (item.endsAt) {
      const d = new Date(item.endsAt);
      if (!Number.isNaN(d.getTime())) {
        const pad2 = (n: number) => n.toString().padStart(2, "0");
        localEndsAt = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
      }
    }
    setFormData({
      urlImg: item.urlImg ?? "",
      redirectUrl: item.redirectUrl ?? "",
      badgeText: item.badgeText ?? "",
      discountLabel: item.discountLabel ?? "",
      endsAt: localEndsAt,
    });
    setEditingId(item.id);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: t("interstitial-dashboard.alerts.delete-confirm-title"),
      text: t("interstitial-dashboard.alerts.delete-confirm-message"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("interstitial-dashboard.alerts.delete-confirm-yes"),
      cancelButtonText: t("interstitial-dashboard.alerts.delete-confirm-no"),
      color: "white",
      background: "#0B1218",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteInterstitial(token, id);
      await fetchList();
      if (editingId === id) cancelEditing();
      Swal.fire({
        icon: "success",
        title: t("interstitial-dashboard.alerts.delete-success"),
        color: "white",
        background: "#0B1218",
        timer: 2500,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t("interstitial-dashboard.alerts.delete-error");
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

  return (
    <div className="flex flex-col gap-8 xl:flex-row xl:items-start">
      {/* Panel editor */}
      <div className="w-full shrink-0 xl:sticky xl:top-6 xl:max-w-[28rem]">
        <div
          className={`relative overflow-hidden rounded-2xl border border-slate-600/50 bg-gradient-to-b from-slate-800/95 via-slate-900/90 to-slate-950/95 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.45)] ring-1 ring-white/[0.06] backdrop-blur-sm`}
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-sky-500 to-violet-500" aria-hidden />
          <div className="relative p-6 sm:p-7">
            <div className="flex gap-4">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/25 bg-gradient-to-br from-cyan-500/20 to-blue-600/10 shadow-inner ring-1 ring-cyan-400/10"
                aria-hidden
              >
                <svg className="h-7 w-7 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 5a1 1 0 011-1h14a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V5zM8 21h8M12 17v4"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <h2 className={`text-xl font-semibold tracking-tight sm:text-2xl ${DASHBOARD_PALETTE.text}`}>
                  {isEditing
                    ? t("interstitial-dashboard.title-edit")
                    : t("interstitial-dashboard.title-create")}
                </h2>
                <p className={`mt-1.5 text-base leading-relaxed ${DASHBOARD_PALETTE.textMuted}`}>
                  {t("interstitial-dashboard.form.panel-description")}
                </p>
              </div>
            </div>

            {isEditing && (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.07] px-4 py-3">
                <span className="text-base font-medium text-amber-200/95">
                  {t("interstitial-dashboard.form.editing-badge", { id: editingId })}
                </span>
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="rounded-lg border border-slate-600/60 bg-slate-800/80 px-3.5 py-2 text-base font-medium text-slate-200 transition-colors hover:border-slate-500 hover:bg-slate-700/80"
                >
                  {t("interstitial-dashboard.form.cancel-edit")}
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div>
                <DashboardImageUploader
                  token={token}
                  value={formData.urlImg}
                  uploadFn={uploadInterstitialImage}
                  onChange={(url) => setFormData((prev) => ({ ...prev, urlImg: url }))}
                  label={t("interstitial-dashboard.form.urlImg-label")}
                  hint={t("interstitial-dashboard.form.urlImg-upload-hint")}
                  context="interstitial"
                  accent="blue"
                  onError={(msg) =>
                    Swal.fire({
                      title: "Imagen no subida",
                      text: msg,
                      icon: "error",
                      color: "white",
                      background: "#0B1218",
                    })
                  }
                />
                <p className={`mt-2 text-sm leading-relaxed ${DASHBOARD_PALETTE.textMuted}`}>
                  {t("interstitial-dashboard.form.urlImg-hint")}
                </p>
              </div>

              <div className="space-y-2">
                <label
                  className={`flex items-center gap-2 text-base font-medium ${DASHBOARD_PALETTE.label}`}
                  htmlFor="interstitial-redirectUrl"
                >
                  <svg className="h-5 w-5 shrink-0 text-cyan-500/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  {t("interstitial-dashboard.form.redirectUrl-label")}
                </label>
                <input
                  id="interstitial-redirectUrl"
                  type="url"
                  name="redirectUrl"
                  placeholder={t("interstitial-dashboard.form.redirectUrl-placeholder")}
                  value={formData.redirectUrl}
                  onChange={handleChange}
                  className={DASHBOARD_PALETTE.input}
                  required
                  autoComplete="off"
                />
                <p className={`text-sm leading-relaxed ${DASHBOARD_PALETTE.textMuted}`}>
                  {t("interstitial-dashboard.form.redirectUrl-hint")}
                </p>
              </div>

              <div className="space-y-2">
                <label
                  className={`flex items-center gap-2 text-base font-medium ${DASHBOARD_PALETTE.label}`}
                  htmlFor="interstitial-badgeText"
                >
                  <svg className="h-5 w-5 shrink-0 text-pink-400/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  {t("interstitial-dashboard.form.badgeText-label")}
                </label>
                <input
                  id="interstitial-badgeText"
                  type="text"
                  name="badgeText"
                  placeholder={t("interstitial-dashboard.form.badgeText-placeholder")}
                  value={formData.badgeText}
                  onChange={handleChange}
                  className={DASHBOARD_PALETTE.input}
                  autoComplete="off"
                  maxLength={24}
                />
                <p className={`text-sm leading-relaxed ${DASHBOARD_PALETTE.textMuted}`}>
                  {t("interstitial-dashboard.form.badgeText-hint")}
                </p>
              </div>

              <div className="space-y-2">
                <label
                  className={`flex items-center gap-2 text-base font-medium ${DASHBOARD_PALETTE.label}`}
                  htmlFor="interstitial-discountLabel"
                >
                  <svg className="h-5 w-5 shrink-0 text-purple-400/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {t("interstitial-dashboard.form.discountLabel-label")}
                </label>
                <input
                  id="interstitial-discountLabel"
                  type="text"
                  name="discountLabel"
                  placeholder={t("interstitial-dashboard.form.discountLabel-placeholder")}
                  value={formData.discountLabel}
                  onChange={handleChange}
                  className={DASHBOARD_PALETTE.input}
                  autoComplete="off"
                  maxLength={16}
                />
                <p className={`text-sm leading-relaxed ${DASHBOARD_PALETTE.textMuted}`}>
                  {t("interstitial-dashboard.form.discountLabel-hint")}
                </p>
              </div>

              <div className="space-y-2">
                <label
                  className={`flex items-center gap-2 text-base font-medium ${DASHBOARD_PALETTE.label}`}
                  htmlFor="interstitial-endsAt"
                >
                  <svg className="h-5 w-5 shrink-0 text-amber-400/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t("interstitial-dashboard.form.endsAt-label")}
                </label>
                <input
                  id="interstitial-endsAt"
                  type="datetime-local"
                  name="endsAt"
                  value={formData.endsAt}
                  onChange={handleChange}
                  className={DASHBOARD_PALETTE.input}
                  autoComplete="off"
                />
                <p className={`text-sm leading-relaxed ${DASHBOARD_PALETTE.textMuted}`}>
                  {t("interstitial-dashboard.form.endsAt-hint")}
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 px-5 py-3.5 text-base font-semibold text-white shadow-lg shadow-cyan-900/30 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                >
                  <svg className="h-5 w-5 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {isEditing
                    ? t("interstitial-dashboard.form.submit-edit")
                    : t("interstitial-dashboard.form.submit-create")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="min-w-0 flex-1">
        <DashboardSection
          title={t("interstitial-dashboard.list.title")}
          description={t("interstitial-dashboard.list.panel-description")}
        >
          {loading ? (
            <div className="space-y-4 py-4" aria-busy>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-40 animate-pulse rounded-xl border border-slate-700/40 bg-slate-800/40"
                />
              ))}
            </div>
          ) : activeList.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-600/50 bg-slate-800/20 py-20 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-600/50 bg-slate-800/60">
                <svg className="h-10 w-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V7a2 2 0 00-2-2H6a2 2 0 00-2 2v6m16 0v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4m16 0h-2M4 13h2" />
                </svg>
              </div>
              <p className={`max-w-md text-base ${DASHBOARD_PALETTE.textMuted}`}>{t("interstitial-dashboard.list.empty")}</p>
            </div>
          ) : (
            <div
              ref={scrollContainerRef}
              className="max-h-[70vh] overflow-y-auto overflow-x-hidden pr-1"
              aria-label={t("interstitial-dashboard.list.title")}
            >
              <ul className="space-y-5">
                {visibleList.map((item) => (
                  <li
                    key={item.id}
                    className="group relative overflow-hidden rounded-2xl border border-slate-600/45 bg-gradient-to-br from-slate-800/90 to-slate-900/95 shadow-md ring-1 ring-white/[0.04] transition hover:border-cyan-500/35 hover:shadow-lg hover:shadow-cyan-950/20"
                  >
                    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-cyan-500 to-blue-600 opacity-90" aria-hidden />
                    <div className="relative pl-5 pr-4 pt-4 pb-4 sm:pl-6">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-lg border border-slate-600/60 bg-slate-900/80 px-2.5 py-1 text-sm font-semibold uppercase tracking-wide text-slate-300">
                            {t("interstitial-dashboard.list.campaign-label")} #{item.id}
                          </span>
                          <span className="hidden h-1 w-1 rounded-full bg-slate-600 sm:inline" aria-hidden />
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-sm font-medium text-emerald-300/95">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" aria-hidden />
                            {t("interstitial-dashboard.list.status-active")}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <div
                            title={t("interstitial-dashboard.list.stats-views-tooltip")}
                            className="group/stat flex items-center gap-3 rounded-xl border border-cyan-500/25 bg-gradient-to-br from-cyan-500/[0.08] via-slate-900/40 to-slate-900/70 px-3.5 py-2.5 min-w-[9rem] shadow-sm ring-1 ring-white/[0.03] transition hover:border-cyan-400/50 hover:shadow-md hover:shadow-cyan-950/20"
                          >
                            <div
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-400/30 bg-cyan-500/15 text-cyan-300 transition group-hover/stat:bg-cyan-500/25"
                              aria-hidden
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-[0.7rem] font-semibold uppercase tracking-wider text-cyan-300/80">
                                {t("interstitial-dashboard.list.stats-views")}
                              </p>
                              <p className="mt-0.5 text-2xl font-bold leading-none tabular-nums text-white">
                                {(item.totalViews ?? 0).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div
                            title={t("interstitial-dashboard.list.stats-viewers-tooltip")}
                            className="group/stat flex items-center gap-3 rounded-xl border border-violet-500/25 bg-gradient-to-br from-violet-500/[0.08] via-slate-900/40 to-slate-900/70 px-3.5 py-2.5 min-w-[9rem] shadow-sm ring-1 ring-white/[0.03] transition hover:border-violet-400/50 hover:shadow-md hover:shadow-violet-950/20"
                          >
                            <div
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-violet-400/30 bg-violet-500/15 text-violet-300 transition group-hover/stat:bg-violet-500/25"
                              aria-hidden
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-[0.7rem] font-semibold uppercase tracking-wider text-violet-300/80">
                                {t("interstitial-dashboard.list.stats-viewers")}
                              </p>
                              <p className="mt-0.5 text-2xl font-bold leading-none tabular-nums text-white">
                                {(item.uniqueViewers ?? 0).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-4 sm:flex-row">
                        <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-xl border border-slate-600/40 bg-slate-950/50 sm:h-32 sm:w-56">
                          {item.urlImg ? (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.urlImg}
                                alt=""
                                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                                loading="lazy"
                                onError={(e) => {
                                  const el = e.target as HTMLImageElement;
                                  el.style.display = "none";
                                  const ph = el.nextElementSibling as HTMLElement;
                                  if (ph) {
                                    ph.classList.remove("hidden");
                                    ph.classList.add("flex");
                                  }
                                }}
                              />
                              <div className="absolute inset-0 hidden items-center justify-center bg-slate-900/95 px-2 text-center text-sm text-slate-500">
                                {t("interstitial-dashboard.list.preview-no-image")}
                              </div>
                            </>
                          ) : (
                            <div className="flex h-full items-center justify-center px-3 text-center text-sm text-slate-500">
                              {t("interstitial-dashboard.list.preview-no-image")}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1 space-y-3">
                          <div>
                            <p className={`mb-1 text-sm font-medium uppercase tracking-wider ${DASHBOARD_PALETTE.textMuted}`}>
                              {t("interstitial-dashboard.list.redirectUrl")}
                            </p>
                            <a
                              href={item.redirectUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex max-w-full items-start gap-1.5 break-all text-base font-medium ${DASHBOARD_PALETTE.accent} hover:underline`}
                            >
                              <svg className="mt-0.5 h-5 w-5 shrink-0 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              {item.redirectUrl}
                            </a>
                          </div>
                          <div className="flex flex-wrap gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handleEdit(item)}
                              className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-base font-medium text-cyan-200 transition hover:bg-cyan-500/20"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              {t("interstitial-dashboard.list.edit")}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-base font-medium ${DASHBOARD_PALETTE.btnDanger}`}
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                              {t("interstitial-dashboard.list.delete")}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {hasMore && (
                <div ref={sentinelRef} className="h-4 w-full shrink-0" aria-hidden />
              )}
              {hasMore && (
                <p className={`py-4 text-center text-base ${DASHBOARD_PALETTE.textMuted}`}>
                  {t("interstitial-dashboard.list.load-more-hint")}
                </p>
              )}
            </div>
          )}
        </DashboardSection>
      </div>
    </div>
  );
};

export default InterstitialDashboard;

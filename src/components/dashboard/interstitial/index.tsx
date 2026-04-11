"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  getInterstitialList,
  createInterstitial,
  updateInterstitial,
  deleteInterstitial,
  type InterstitialItem,
} from "@/api/interstitial";
import Swal from "sweetalert2";
import { DashboardSection } from "../layout";
import { DASHBOARD_PALETTE } from "../styles/dashboardPalette";

const INITIAL_VISIBLE = 6;
const LOAD_MORE_SIZE = 6;

interface InterstitialDashboardProps {
  token: string;
  t: (key: string, options?: Record<string, unknown>) => string;
}

function isLikelyImageUrl(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

const InterstitialDashboard: React.FC<InterstitialDashboardProps> = ({ token, t }) => {
  const [formData, setFormData] = useState({ urlImg: "", redirectUrl: "" });
  const [list, setList] = useState<InterstitialItem[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [previewBroken, setPreviewBroken] = useState(false);
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

  useEffect(() => {
    setPreviewBroken(false);
  }, [formData.urlImg]);

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
    setFormData({ urlImg: "", redirectUrl: "" });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.urlImg.trim() || !formData.redirectUrl.trim()) return;
    try {
      if (editingId !== null) {
        await updateInterstitial(token, editingId, formData.urlImg.trim(), formData.redirectUrl.trim());
      } else {
        await createInterstitial(token, formData.urlImg.trim(), formData.redirectUrl.trim());
      }
      setFormData({ urlImg: "", redirectUrl: "" });
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
    setFormData({
      urlImg: item.urlImg ?? "",
      redirectUrl: item.redirectUrl ?? "",
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

  const showPreview = isLikelyImageUrl(formData.urlImg) && !previewBroken;

  return (
    <div className="flex flex-col gap-8 xl:flex-row xl:items-start">
      {/* Panel editor */}
      <div className="w-full shrink-0 xl:sticky xl:top-6 xl:max-w-[26rem]">
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
                <h2 className={`text-lg font-semibold tracking-tight sm:text-xl ${DASHBOARD_PALETTE.text}`}>
                  {editingId !== null
                    ? t("interstitial-dashboard.title-edit")
                    : t("interstitial-dashboard.title-create")}
                </h2>
                <p className={`mt-1.5 text-sm leading-relaxed ${DASHBOARD_PALETTE.textMuted}`}>
                  {t("interstitial-dashboard.form.panel-description")}
                </p>
              </div>
            </div>

            {editingId !== null && (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.07] px-4 py-3">
                <span className="text-sm font-medium text-amber-200/95">
                  {t("interstitial-dashboard.form.editing-badge", { id: editingId })}
                </span>
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="rounded-lg border border-slate-600/60 bg-slate-800/80 px-3 py-1.5 text-sm font-medium text-slate-200 transition-colors hover:border-slate-500 hover:bg-slate-700/80"
                >
                  {t("interstitial-dashboard.form.cancel-edit")}
                </button>
              </div>
            )}

            {/* Vista previa */}
            <div className="mt-6">
              <p className={`mb-2 text-xs font-semibold uppercase tracking-wider ${DASHBOARD_PALETTE.textMuted}`}>
                {t("interstitial-dashboard.form.preview-title")}
              </p>
              <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-600/40 bg-slate-950/80 shadow-inner ring-1 ring-black/20">
                {showPreview ? (
                  <img
                    src={formData.urlImg.trim()}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={() => setPreviewBroken(true)}
                  />
                ) : (
                  <div className="flex h-full min-h-[140px] flex-col items-center justify-center gap-2 px-4 text-center">
                    <svg
                      className="h-10 w-10 text-slate-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className={`max-w-[240px] text-sm ${DASHBOARD_PALETTE.textMuted}`}>
                      {t("interstitial-dashboard.form.preview-empty")}
                    </span>
                  </div>
                )}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent py-3 pl-4 pr-4 pt-10">
                  <span className="text-[11px] font-medium uppercase tracking-widest text-white/70">
                    {t("interstitial-dashboard.list.preview-label")}
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="space-y-2">
                <label
                  className={`flex items-center gap-2 text-sm font-medium ${DASHBOARD_PALETTE.label}`}
                  htmlFor="interstitial-urlImg"
                >
                  <svg className="h-4 w-4 shrink-0 text-cyan-500/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {t("interstitial-dashboard.form.urlImg-label")}
                </label>
                <input
                  id="interstitial-urlImg"
                  type="url"
                  name="urlImg"
                  placeholder={t("interstitial-dashboard.form.urlImg-placeholder")}
                  value={formData.urlImg}
                  onChange={handleChange}
                  className={DASHBOARD_PALETTE.input}
                  required
                  autoComplete="off"
                />
                <p className={`text-xs leading-relaxed ${DASHBOARD_PALETTE.textMuted}`}>
                  {t("interstitial-dashboard.form.urlImg-hint")}
                </p>
              </div>

              <div className="space-y-2">
                <label
                  className={`flex items-center gap-2 text-sm font-medium ${DASHBOARD_PALETTE.label}`}
                  htmlFor="interstitial-redirectUrl"
                >
                  <svg className="h-4 w-4 shrink-0 text-cyan-500/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
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
                <p className={`text-xs leading-relaxed ${DASHBOARD_PALETTE.textMuted}`}>
                  {t("interstitial-dashboard.form.redirectUrl-hint")}
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-900/30 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                >
                  <svg className="h-5 w-5 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {editingId !== null
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
            <div className="space-y-3 py-4" aria-busy>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-36 animate-pulse rounded-xl border border-slate-700/40 bg-slate-800/40"
                />
              ))}
            </div>
          ) : activeList.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-600/50 bg-slate-800/20 py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-600/50 bg-slate-800/60">
                <svg className="h-8 w-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V7a2 2 0 00-2-2H6a2 2 0 00-2 2v6m16 0v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4m16 0h-2M4 13h2" />
                </svg>
              </div>
              <p className={`max-w-md text-sm ${DASHBOARD_PALETTE.textMuted}`}>{t("interstitial-dashboard.list.empty")}</p>
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
                          <span className="rounded-lg border border-slate-600/60 bg-slate-900/80 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300">
                            {t("interstitial-dashboard.list.campaign-label")} #{item.id}
                          </span>
                          <span className="hidden h-1 w-1 rounded-full bg-slate-600 sm:inline" aria-hidden />
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300/95">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" aria-hidden />
                            {t("interstitial-dashboard.list.status-active")}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span
                            title={t("interstitial-dashboard.list.stats-views-tooltip")}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600/50 bg-slate-900/50 px-2.5 py-1 text-xs text-slate-300"
                          >
                            <svg className="h-3.5 w-3.5 text-cyan-400/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span className="text-slate-400">{t("interstitial-dashboard.list.stats-views")}</span>
                            <strong className={`tabular-nums ${DASHBOARD_PALETTE.text}`}>
                              {(item.totalViews ?? 0).toLocaleString()}
                            </strong>
                          </span>
                          <span
                            title={t("interstitial-dashboard.list.stats-viewers-tooltip")}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600/50 bg-slate-900/50 px-2.5 py-1 text-xs text-slate-300"
                          >
                            <svg className="h-3.5 w-3.5 text-violet-400/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span className="text-slate-400">{t("interstitial-dashboard.list.stats-viewers")}</span>
                            <strong className={`tabular-nums ${DASHBOARD_PALETTE.text}`}>
                              {(item.uniqueViewers ?? 0).toLocaleString()}
                            </strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-4 sm:flex-row">
                        <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-xl border border-slate-600/40 bg-slate-950/50 sm:h-28 sm:w-44">
                          {item.urlImg ? (
                            <>
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
                              <div className="absolute inset-0 hidden items-center justify-center bg-slate-900/95 px-2 text-center text-xs text-slate-500">
                                {t("interstitial-dashboard.list.preview-no-image")}
                              </div>
                            </>
                          ) : (
                            <div className="flex h-full items-center justify-center px-2 text-center text-xs text-slate-500">
                              {t("interstitial-dashboard.list.preview-no-image")}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1 space-y-3">
                          <div>
                            <p className={`mb-1 text-xs font-medium uppercase tracking-wider ${DASHBOARD_PALETTE.textMuted}`}>
                              {t("interstitial-dashboard.list.redirectUrl")}
                            </p>
                            <a
                              href={item.redirectUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex max-w-full items-start gap-1.5 break-all text-sm font-medium ${DASHBOARD_PALETTE.accent} hover:underline`}
                            >
                              <svg className="mt-0.5 h-4 w-4 shrink-0 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              {item.redirectUrl}
                            </a>
                          </div>
                          <div className="flex flex-wrap gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handleEdit(item)}
                              className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-500/20"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              {t("interstitial-dashboard.list.edit")}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${DASHBOARD_PALETTE.btnDanger}`}
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
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
                <p className={`py-4 text-center text-sm ${DASHBOARD_PALETTE.textMuted}`}>
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

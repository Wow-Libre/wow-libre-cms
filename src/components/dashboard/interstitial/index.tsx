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
  t: (key: string) => string;
}

const InterstitialDashboard: React.FC<InterstitialDashboardProps> = ({ token, t }) => {
  const [formData, setFormData] = useState({ urlImg: "", redirectUrl: "" });
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

  return (
    <div className="flex flex-col gap-6 sm:gap-8 lg:flex-row">
      <div className="w-full shrink-0 lg:max-w-[32rem]">
        <DashboardSection
          title={
            editingId !== null
              ? t("interstitial-dashboard.title-edit")
              : t("interstitial-dashboard.title-create")
          }
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={`mb-1.5 block text-sm font-medium ${DASHBOARD_PALETTE.label}`}>
                {t("interstitial-dashboard.form.urlImg-label")}
              </label>
              <input
                type="url"
                name="urlImg"
                placeholder={t("interstitial-dashboard.form.urlImg-placeholder")}
                value={formData.urlImg}
                onChange={handleChange}
                className={DASHBOARD_PALETTE.input}
                required
              />
            </div>
            <div>
              <label className={`mb-1.5 block text-sm font-medium ${DASHBOARD_PALETTE.label}`}>
                {t("interstitial-dashboard.form.redirectUrl-label")}
              </label>
              <input
                type="url"
                name="redirectUrl"
                placeholder={t("interstitial-dashboard.form.redirectUrl-placeholder")}
                value={formData.redirectUrl}
                onChange={handleChange}
                className={DASHBOARD_PALETTE.input}
                required
              />
            </div>
            <button type="submit" className={`w-full ${DASHBOARD_PALETTE.btnPrimary}`}>
              {editingId !== null
                ? t("interstitial-dashboard.form.submit-edit")
                : t("interstitial-dashboard.form.submit-create")}
            </button>
          </form>
        </DashboardSection>
      </div>

      <div className="min-w-0 flex-1">
        <DashboardSection title={t("interstitial-dashboard.list.title")}>
          {loading ? (
            <p className={`py-8 text-center ${DASHBOARD_PALETTE.textMuted}`}>
              {t("interstitial-dashboard.list.loading")}
            </p>
          ) : activeList.length === 0 ? (
            <p className={`py-8 text-center ${DASHBOARD_PALETTE.textMuted}`}>
              {t("interstitial-dashboard.list.empty")}
            </p>
          ) : (
            <div
              ref={scrollContainerRef}
              className="max-h-[70vh] overflow-y-auto overflow-x-hidden pr-1"
              aria-label={t("interstitial-dashboard.list.title")}
            >
              <ul className="space-y-4">
                {visibleList.map((item) => (
                  <li
                    key={item.id}
                    className={`rounded-xl overflow-hidden ${DASHBOARD_PALETTE.card} transition-colors hover:border-cyan-500/30`}
                  >
                    <p className={`px-3 py-1.5 text-xs font-medium ${DASHBOARD_PALETTE.textMuted} border-b ${DASHBOARD_PALETTE.border}`}>
                      {t("interstitial-dashboard.list.preview-label")}
                    </p>
                    <div className="flex gap-4 p-3">
                      <div className="relative h-24 w-32 shrink-0 rounded-lg bg-slate-800 overflow-hidden">
                        {item.urlImg ? (
                          <>
                            <img
                              src={item.urlImg}
                              alt={t("interstitial-dashboard.list.preview-label")}
                              className="h-full w-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                const el = e.target as HTMLImageElement;
                                el.style.display = "none";
                                const ph = el.nextElementSibling as HTMLElement;
                                if (ph) ph.classList.remove("hidden");
                              }}
                            />
                            <div className="absolute inset-0 hidden flex items-center justify-center bg-slate-800/90 text-slate-500 text-xs text-center px-1">
                              {t("interstitial-dashboard.list.preview-no-image")}
                            </div>
                          </>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-slate-800 text-slate-500 text-xs text-center px-1">
                            {t("interstitial-dashboard.list.preview-no-image")}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-2">
                        <p className={`text-sm ${DASHBOARD_PALETTE.textMuted}`}>
                          {t("interstitial-dashboard.list.redirectUrl")}:{" "}
                          <a
                            href={item.redirectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`break-all ${DASHBOARD_PALETTE.accent} hover:underline`}
                          >
                            {item.redirectUrl}
                          </a>
                        </p>
                        <div className={`flex flex-wrap gap-4 text-sm ${DASHBOARD_PALETTE.textMuted}`}>
                          <span title={t("interstitial-dashboard.list.stats-views-tooltip")} className="flex items-center gap-1.5">
                            <span aria-hidden>👁</span>
                            <span>{t("interstitial-dashboard.list.stats-views")}:</span>
                            <strong className={`text-base ${DASHBOARD_PALETTE.text}`}>{(item.totalViews ?? 0).toLocaleString()}</strong>
                          </span>
                          <span title={t("interstitial-dashboard.list.stats-viewers-tooltip")} className="flex items-center gap-1.5">
                            <span aria-hidden>👤</span>
                            <span>{t("interstitial-dashboard.list.stats-viewers")}:</span>
                            <strong className={`text-base ${DASHBOARD_PALETTE.text}`}>{(item.uniqueViewers ?? 0).toLocaleString()}</strong>
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-0.5">
                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            className={`rounded-lg border px-4 py-2 text-sm font-medium ${DASHBOARD_PALETTE.accentBorder} ${DASHBOARD_PALETTE.accent} hover:bg-cyan-500/10`}
                          >
                            {t("interstitial-dashboard.list.edit")}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className={DASHBOARD_PALETTE.btnDanger}
                          >
                            {t("interstitial-dashboard.list.delete")}
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {hasMore && (
                <div
                  ref={sentinelRef}
                  className="h-4 w-full shrink-0"
                  aria-hidden
                />
              )}
              {hasMore && (
                <p className={`py-3 text-center text-sm ${DASHBOARD_PALETTE.textMuted}`}>
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

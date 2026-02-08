"use client";

import React, { useState, useEffect } from "react";
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

interface InterstitialDashboardProps {
  token: string;
  t: (key: string) => string;
}

const InterstitialDashboard: React.FC<InterstitialDashboardProps> = ({ token, t }) => {
  const [formData, setFormData] = useState({ urlImg: "", redirectUrl: "" });
  const [list, setList] = useState<InterstitialItem[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

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
    setFormData({ urlImg: item.urlImg, redirectUrl: item.redirectUrl });
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

  const activeList = list.filter((item) => item.active);

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
            <ul className="space-y-6">
              {activeList.map((item) => (
                <li
                  key={item.id}
                  className={`rounded-xl overflow-hidden ${DASHBOARD_PALETTE.card} transition-colors hover:border-cyan-500/30`}
                >
                  <p className={`px-4 py-2 text-xs font-medium ${DASHBOARD_PALETTE.textMuted} border-b ${DASHBOARD_PALETTE.border}`}>
                    {t("interstitial-dashboard.list.preview-label")}
                  </p>
                  <div className="relative aspect-[2/1] w-full min-h-[180px] bg-slate-800">
                    {item.urlImg ? (
                      <img
                        src={item.urlImg}
                        alt={t("interstitial-dashboard.list.preview-label")}
                        className="absolute inset-0 h-full w-full object-contain"
                        loading="lazy"
                        onError={(e) => {
                          const el = e.target as HTMLImageElement;
                          el.style.display = "none";
                          const placeholder = el.nextElementSibling as HTMLElement;
                          if (placeholder) placeholder.classList.remove("hidden");
                        }}
                      />
                    ) : null}
                    <div className={`absolute inset-0 flex items-center justify-center bg-slate-800/90 text-slate-500 ${item.urlImg ? "hidden" : ""}`}>
                      <span className="text-sm">{t("interstitial-dashboard.list.preview-no-image")}</span>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
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
                    <div className={`flex flex-wrap gap-3 text-xs ${DASHBOARD_PALETTE.textMuted}`}>
                      <span title={t("interstitial-dashboard.list.stats-views-tooltip")}>
                        👁 {t("interstitial-dashboard.list.stats-views")}:{" "}
                        <strong className="text-slate-300">{(item.totalViews ?? 0).toLocaleString()}</strong>
                      </span>
                      <span title={t("interstitial-dashboard.list.stats-viewers-tooltip")}>
                        👤 {t("interstitial-dashboard.list.stats-viewers")}:{" "}
                        <strong className="text-slate-300">{(item.uniqueViewers ?? 0).toLocaleString()}</strong>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
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
                </li>
              ))}
            </ul>
          )}
        </DashboardSection>
      </div>
    </div>
  );
};

export default InterstitialDashboard;

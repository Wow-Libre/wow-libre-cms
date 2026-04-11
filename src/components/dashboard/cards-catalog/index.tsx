"use client";

import React, { useState, useEffect } from "react";
import {
  getCardCatalogAdminList,
  createCardCatalogAdmin,
  updateCardCatalogAdmin,
  deleteCardCatalogAdmin,
  type CardCatalogAdminItem,
  type CardCatalogAdminRequestDto,
} from "@/api/cards/admin";
import { dashboardSwal as Swal } from "@/components/dashboard/dashboardSwal";
import { DashboardSection } from "../layout";
import { DASHBOARD_PALETTE } from "../styles/dashboardPalette";

interface CardsCatalogDashboardProps {
  token: string;
  t: (key: string, options?: Record<string, string | number>) => string;
}

const defaultForm: CardCatalogAdminRequestDto = {
  code: "",
  image_url: "",
  display_name: "",
  probability: 50,
  active: true,
};

const CardsCatalogDashboard: React.FC<CardsCatalogDashboardProps> = ({ token, t }) => {
  const [list, setList] = useState<CardCatalogAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [form, setForm] = useState<CardCatalogAdminRequestDto>(defaultForm);

  const fetchList = async () => {
    try {
      const data = await getCardCatalogAdminList(token);
      setList(data ?? []);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : t("cards-catalog-dashboard.alerts.fetch-error");
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    if (name === "active") {
      setForm((prev) => ({ ...prev, active: checked }));
      return;
    }
    if (name === "probability") {
      setForm((prev) => ({
        ...prev,
        [name]: value === "" ? 50 : Math.min(100, Math.max(1, Number(value))),
      }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(defaultForm);
    setEditingCode(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    if (!form.code.trim() || !form.image_url.trim()) return;
    setSubmitting(true);
    try {
      const payload: CardCatalogAdminRequestDto = {
        code: form.code.trim(),
        image_url: form.image_url.trim(),
        display_name: form.display_name?.trim() ?? "",
        probability: form.probability ?? 50,
        active: form.active ?? true,
      };
      if (editingCode !== null) {
        await updateCardCatalogAdmin(token, editingCode, payload);
      } else {
        await createCardCatalogAdmin(token, payload);
      }
      resetForm();
      await fetchList();
      Swal.fire({
        icon: "success",
        title: t("cards-catalog-dashboard.alerts.save-success"),
        color: "white",
        background: "#0B1218",
        timer: 2500,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : t("cards-catalog-dashboard.alerts.save-error");
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

  const handleEdit = (item: CardCatalogAdminItem) => {
    setForm({
      code: item.code,
      image_url: item.image_url,
      display_name: item.display_name ?? "",
      probability: item.probability ?? 50,
      active: item.active ?? true,
    });
    setEditingCode(item.code);
  };

  const handleDelete = async (code: string) => {
    const result = await Swal.fire({
      title: t("cards-catalog-dashboard.alerts.delete-confirm-title"),
      text: t("cards-catalog-dashboard.alerts.delete-confirm-message"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("cards-catalog-dashboard.alerts.delete-confirm-yes"),
      cancelButtonText: t("cards-catalog-dashboard.alerts.delete-confirm-no"),
      color: "white",
      background: "#0B1218",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteCardCatalogAdmin(token, code);
      if (editingCode === code) resetForm();
      await fetchList();
      Swal.fire({
        icon: "success",
        title: t("cards-catalog-dashboard.alerts.delete-success"),
        color: "white",
        background: "#0B1218",
        timer: 2500,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : t("cards-catalog-dashboard.alerts.delete-error");
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
            editingCode !== null
              ? t("cards-catalog-dashboard.title-edit")
              : t("cards-catalog-dashboard.title-create")
          }
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={`mb-1.5 block text-sm font-medium ${DASHBOARD_PALETTE.label}`}>
                {t("cards-catalog-dashboard.form.code-label")}
              </label>
              <input
                type="text"
                name="code"
                placeholder={t("cards-catalog-dashboard.form.code-placeholder")}
                value={form.code}
                onChange={handleChange}
                className={DASHBOARD_PALETTE.input}
                required
                maxLength={32}
                disabled={editingCode !== null}
              />
              {editingCode !== null && (
                <p className={`mt-1 text-xs ${DASHBOARD_PALETTE.textMuted}`}>
                  {t("cards-catalog-dashboard.form.code-readonly")}
                </p>
              )}
            </div>
            <div>
              <label className={`mb-1.5 block text-sm font-medium ${DASHBOARD_PALETTE.label}`}>
                {t("cards-catalog-dashboard.form.image-url-label")}
              </label>
              <input
                type="url"
                name="image_url"
                placeholder="https://..."
                value={form.image_url}
                onChange={handleChange}
                className={DASHBOARD_PALETTE.input}
                required
              />
            </div>
            <div>
              <label className={`mb-1.5 block text-sm font-medium ${DASHBOARD_PALETTE.label}`}>
                {t("cards-catalog-dashboard.form.display-name-label")}
              </label>
              <input
                type="text"
                name="display_name"
                placeholder={t("cards-catalog-dashboard.form.display-name-placeholder")}
                value={form.display_name ?? ""}
                onChange={handleChange}
                className={DASHBOARD_PALETTE.input}
                maxLength={128}
              />
            </div>
            <div>
              <label className={`mb-1.5 block text-sm font-medium ${DASHBOARD_PALETTE.label}`}>
                {t("cards-catalog-dashboard.form.probability-label")}
              </label>
              <input
                type="number"
                name="probability"
                min={1}
                max={100}
                value={form.probability ?? 50}
                onChange={handleChange}
                className={DASHBOARD_PALETTE.input}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="card-active"
                name="active"
                checked={form.active ?? true}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/30"
              />
              <label htmlFor="card-active" className={`text-sm ${DASHBOARD_PALETTE.label}`}>
                {t("cards-catalog-dashboard.form.active-label")}
              </label>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className={`flex-1 ${DASHBOARD_PALETTE.btnPrimary} disabled:opacity-50 disabled:pointer-events-none`}
              >
                {submitting
                  ? t("cards-catalog-dashboard.form.submitting")
                  : editingCode !== null
                    ? t("cards-catalog-dashboard.form.submit-edit")
                    : t("cards-catalog-dashboard.form.submit-create")}
              </button>
              {editingCode !== null && (
                <button
                  type="button"
                  onClick={resetForm}
                  className={`rounded-xl border ${DASHBOARD_PALETTE.border} px-4 py-3 font-semibold ${DASHBOARD_PALETTE.textMuted} hover:bg-slate-700/50`}
                >
                  {t("cards-catalog-dashboard.form.cancel")}
                </button>
              )}
            </div>
          </form>
        </DashboardSection>
      </div>

      <div className="min-w-0 flex-1">
        <DashboardSection title={t("cards-catalog-dashboard.list.title")}>
          {loading ? (
            <p className={`py-8 text-center ${DASHBOARD_PALETTE.textMuted}`}>
              {t("cards-catalog-dashboard.list.loading")}
            </p>
          ) : list.length === 0 ? (
            <p className={`py-8 text-center ${DASHBOARD_PALETTE.textMuted}`}>
              {t("cards-catalog-dashboard.list.empty")}
            </p>
          ) : (
            <div className="overflow-x-auto -mx-5 sm:mx-0">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className={`border-b ${DASHBOARD_PALETTE.border}`}>
                    <th className={`py-3 pr-2 font-semibold ${DASHBOARD_PALETTE.text}`}>
                      {t("cards-catalog-dashboard.list.code")}
                    </th>
                    <th className={`py-3 pr-2 font-semibold ${DASHBOARD_PALETTE.text}`}>
                      {t("cards-catalog-dashboard.list.preview")}
                    </th>
                    <th className={`py-3 pr-2 font-semibold ${DASHBOARD_PALETTE.text}`}>
                      {t("cards-catalog-dashboard.list.name")}
                    </th>
                    <th className={`py-3 pr-2 font-semibold ${DASHBOARD_PALETTE.text}`}>
                      {t("cards-catalog-dashboard.list.probability")}
                    </th>
                    <th className={`py-3 pr-2 font-semibold ${DASHBOARD_PALETTE.text}`}>
                      {t("cards-catalog-dashboard.list.status")}
                    </th>
                    <th className={`py-3 font-semibold ${DASHBOARD_PALETTE.text}`}>
                      {t("cards-catalog-dashboard.list.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((item) => (
                    <tr
                      key={item.code}
                      className={`border-b ${DASHBOARD_PALETTE.border} hover:bg-slate-700/30`}
                    >
                      <td className={`py-3 pr-2 font-mono text-xs ${DASHBOARD_PALETTE.text}`}>
                        {item.code}
                      </td>
                      <td className="py-3 pr-2">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt=""
                            className="h-10 w-10 rounded object-cover bg-slate-700"
                          />
                        ) : (
                          <span className={DASHBOARD_PALETTE.textMuted}>—</span>
                        )}
                      </td>
                      <td className={`py-3 pr-2 ${DASHBOARD_PALETTE.text}`}>
                        {item.display_name || "—"}
                      </td>
                      <td className={`py-3 pr-2 ${DASHBOARD_PALETTE.text}`}>
                        {item.probability}%
                      </td>
                      <td className="py-3 pr-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            item.active
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-slate-500/20 text-slate-400"
                          }`}
                        >
                          {item.active
                            ? t("cards-catalog-dashboard.list.status-active")
                            : t("cards-catalog-dashboard.list.status-inactive")}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${DASHBOARD_PALETTE.accentBorder} ${DASHBOARD_PALETTE.accent} hover:bg-cyan-500/10`}
                          >
                            {t("cards-catalog-dashboard.list.edit")}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.code)}
                            className={DASHBOARD_PALETTE.btnDanger}
                          >
                            {t("cards-catalog-dashboard.list.delete")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DashboardSection>
      </div>
    </div>
  );
};

export default CardsCatalogDashboard;

"use client";

import React, { useState, useEffect } from "react";
import {
  getPlanAdminList,
  createPlanAdmin,
  updatePlanAdmin,
  deletePlanAdmin,
  type PlanAdminItem,
  type PlanAdminCreateDto,
} from "@/api/plan/admin";
import Swal from "sweetalert2";
import { DashboardSection } from "../layout";
import { DASHBOARD_PALETTE } from "../styles/dashboardPalette";

interface PlansDashboardProps {
  token: string;
  t: (key: string, options?: Record<string, string | number>) => string;
}

const defaultForm: PlanAdminCreateDto = {
  name: "",
  price: 0,
  currency: "",
  discount: 0,
  status: true,
  frequency_type: "MONTH",
  frequency_value: 1,
};

const PlansDashboard: React.FC<PlansDashboardProps> = ({ token, t }) => {
  const [list, setList] = useState<PlanAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<PlanAdminCreateDto>(defaultForm);

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
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

  const resetForm = () => {
    setForm(defaultForm);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      if (editingId !== null) {
        await updatePlanAdmin(token, { ...form, id: editingId });
      } else {
        await createPlanAdmin(token, form);
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
    }
  };

  const handleEdit = (item: PlanAdminItem) => {
    setForm({
      name: item.name,
      price: item.price,
      currency: item.currency ?? "",
      discount: item.discount ?? 0,
      status: item.status,
      frequency_type: item.frequency_type ?? "MONTH",
      frequency_value: item.frequency_value ?? 1,
    });
    setEditingId(item.id);
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

  return (
    <div className="flex flex-col gap-6 sm:gap-8 lg:flex-row">
      <div className="w-full shrink-0 lg:max-w-[32rem]">
        <DashboardSection
          title={
            editingId !== null
              ? t("plans-dashboard.title-edit")
              : t("plans-dashboard.title-create")
          }
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                className={`mb-1.5 block text-sm font-medium ${DASHBOARD_PALETTE.label}`}
              >
                {t("plans-dashboard.form.name-label")}
              </label>
              <input
                type="text"
                name="name"
                placeholder={t("plans-dashboard.form.name-placeholder")}
                value={form.name}
                onChange={handleChange}
                className={DASHBOARD_PALETTE.input}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  className={`mb-1.5 block text-sm font-medium ${DASHBOARD_PALETTE.label}`}
                >
                  {t("plans-dashboard.form.price-label")}
                </label>
                <input
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
              <div>
                <label
                  className={`mb-1.5 block text-sm font-medium ${DASHBOARD_PALETTE.label}`}
                >
                  {t("plans-dashboard.form.currency-label")}
                </label>
                <input
                  type="text"
                  name="currency"
                  placeholder="USD"
                  value={form.currency}
                  onChange={handleChange}
                  className={DASHBOARD_PALETTE.input}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  className={`mb-1.5 block text-sm font-medium ${DASHBOARD_PALETTE.label}`}
                >
                  {t("plans-dashboard.form.frequency-type-label")}
                </label>
                <select
                  name="frequency_type"
                  value={form.frequency_type}
                  onChange={handleChange}
                  className={DASHBOARD_PALETTE.input}
                >
                  <option value="DAY">DAY</option>
                  <option value="WEEK">WEEK</option>
                  <option value="MONTH">MONTH</option>
                  <option value="YEAR">YEAR</option>
                </select>
              </div>
              <div>
                <label
                  className={`mb-1.5 block text-sm font-medium ${DASHBOARD_PALETTE.label}`}
                >
                  {t("plans-dashboard.form.frequency-value-label")}
                </label>
                <input
                  type="number"
                  name="frequency_value"
                  min={1}
                  value={form.frequency_value || ""}
                  onChange={handleChange}
                  className={DASHBOARD_PALETTE.input}
                />
              </div>
            </div>
            <div>
              <label
                className={`mb-1.5 block text-sm font-medium ${DASHBOARD_PALETTE.label}`}
              >
                {t("plans-dashboard.form.discount-label")}
              </label>
              <input
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
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="plan-status"
                name="status"
                checked={form.status}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/30"
              />
              <label
                htmlFor="plan-status"
                className={`text-sm ${DASHBOARD_PALETTE.label}`}
              >
                {t("plans-dashboard.form.status-label")}
              </label>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className={`flex-1 ${DASHBOARD_PALETTE.btnPrimary}`}
              >
                {editingId !== null
                  ? t("plans-dashboard.form.submit-edit")
                  : t("plans-dashboard.form.submit-create")}
              </button>
              {editingId !== null && (
                <button
                  type="button"
                  onClick={resetForm}
                  className={`rounded-xl border ${DASHBOARD_PALETTE.border} px-4 py-3 font-semibold ${DASHBOARD_PALETTE.textMuted} hover:bg-slate-700/50`}
                >
                  {t("plans-dashboard.form.cancel")}
                </button>
              )}
            </div>
          </form>
        </DashboardSection>
      </div>

      <div className="min-w-0 flex-1">
        <DashboardSection title={t("plans-dashboard.list.title")}>
          {loading ? (
            <p className={`py-8 text-center ${DASHBOARD_PALETTE.textMuted}`}>
              {t("plans-dashboard.list.loading")}
            </p>
          ) : list.length === 0 ? (
            <p className={`py-8 text-center ${DASHBOARD_PALETTE.textMuted}`}>
              {t("plans-dashboard.list.empty")}
            </p>
          ) : (
            <div className="overflow-x-auto -mx-5 sm:mx-0">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className={`border-b ${DASHBOARD_PALETTE.border}`}>
                    <th
                      className={`py-3 pr-2 font-semibold ${DASHBOARD_PALETTE.text}`}
                    >
                      {t("plans-dashboard.list.name")}
                    </th>
                    <th
                      className={`py-3 pr-2 font-semibold ${DASHBOARD_PALETTE.text}`}
                    >
                      {t("plans-dashboard.list.price")}
                    </th>
                    <th
                      className={`py-3 pr-2 font-semibold ${DASHBOARD_PALETTE.text}`}
                    >
                      {t("plans-dashboard.list.frequency")}
                    </th>
                    <th
                      className={`py-3 pr-2 font-semibold ${DASHBOARD_PALETTE.text}`}
                    >
                      {t("plans-dashboard.list.status")}
                    </th>
                    <th
                      className={`py-3 font-semibold ${DASHBOARD_PALETTE.text}`}
                    >
                      {t("plans-dashboard.list.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((item) => (
                    <tr
                      key={item.id}
                      className={`border-b ${DASHBOARD_PALETTE.border} hover:bg-slate-700/30`}
                    >
                      <td className={`py-3 pr-2 font-medium ${DASHBOARD_PALETTE.text}`}>
                        {item.name}
                      </td>
                      <td className={`py-3 pr-2 ${DASHBOARD_PALETTE.text}`}>
                        {item.discounted_price != null && item.discounted_price < item.price
                          ? `${item.discounted_price} ${item.currency ?? ""}`
                          : `${item.price} ${item.currency ?? ""}`}
                      </td>
                      <td className={`py-3 pr-2 ${DASHBOARD_PALETTE.textMuted}`}>
                        {item.frequency_value} {item.frequency_type ?? ""}
                      </td>
                      <td className="py-3 pr-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            item.status
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-slate-500/20 text-slate-400"
                          }`}
                        >
                          {item.status
                            ? t("plans-dashboard.list.status-active")
                            : t("plans-dashboard.list.status-inactive")}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${DASHBOARD_PALETTE.accentBorder} ${DASHBOARD_PALETTE.accent} hover:bg-cyan-500/10`}
                        >
                          {t("plans-dashboard.list.edit")}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className={DASHBOARD_PALETTE.btnDanger}
                        >
                          {t("plans-dashboard.list.delete")}
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

export default PlansDashboard;

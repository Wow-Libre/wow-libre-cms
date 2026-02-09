"use client";

import React, { useState, useEffect } from "react";
import {
  getNotificationAdminList,
  createNotificationAdmin,
  updateNotificationAdmin,
  deleteNotificationAdmin,
  type NotificationAdminItem,
  type NotificationRequestDto,
} from "@/api/notifications";
import Swal from "sweetalert2";
import { DashboardSection } from "../layout";
import { DASHBOARD_PALETTE } from "../styles/dashboardPalette";

interface NotificationsDashboardProps {
  token: string;
  t: (key: string, options?: Record<string, string | number>) => string;
}

const defaultForm: NotificationRequestDto = {
  title: "",
  message: "",
};

const NotificationsDashboard: React.FC<NotificationsDashboardProps> = ({
  token,
  t,
}) => {
  const [list, setList] = useState<NotificationAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<NotificationRequestDto>(defaultForm);

  const fetchList = async () => {
    try {
      const data = await getNotificationAdminList(token);
      setList(data ?? []);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : t("notifications-dashboard.alerts.fetch-error");
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(defaultForm);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    try {
      if (editingId !== null) {
        await updateNotificationAdmin(token, { ...form, id: editingId });
      } else {
        await createNotificationAdmin(token, form);
      }
      resetForm();
      await fetchList();
      Swal.fire({
        icon: "success",
        title: t("notifications-dashboard.alerts.save-success"),
        color: "white",
        background: "#0B1218",
        timer: 2500,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : t("notifications-dashboard.alerts.save-error");
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

  const handleEdit = (item: NotificationAdminItem) => {
    setForm({
      title: item.title,
      message: item.message ?? "",
    });
    setEditingId(item.id);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: t("notifications-dashboard.alerts.delete-confirm-title"),
      text: t("notifications-dashboard.alerts.delete-confirm-message"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("notifications-dashboard.alerts.delete-confirm-yes"),
      cancelButtonText: t("notifications-dashboard.alerts.delete-confirm-no"),
      color: "white",
      background: "#0B1218",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteNotificationAdmin(token, id);
      if (editingId === id) resetForm();
      await fetchList();
      Swal.fire({
        icon: "success",
        title: t("notifications-dashboard.alerts.delete-success"),
        color: "white",
        background: "#0B1218",
        timer: 2500,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : t("notifications-dashboard.alerts.delete-error");
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

  const formatDate = (iso: string) => {
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

  return (
    <div className="flex flex-col gap-6 sm:gap-8 lg:flex-row">
      <div className="w-full shrink-0 lg:max-w-[32rem]">
        <DashboardSection
          title={
            editingId !== null
              ? t("notifications-dashboard.title-edit")
              : t("notifications-dashboard.title-create")
          }
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                className={`mb-1.5 block text-sm font-medium ${DASHBOARD_PALETTE.label}`}
              >
                {t("notifications-dashboard.form.title-label")}
              </label>
              <input
                type="text"
                name="title"
                placeholder={t("notifications-dashboard.form.title-placeholder")}
                value={form.title}
                onChange={handleChange}
                className={DASHBOARD_PALETTE.input}
                required
              />
            </div>
            <div>
              <label
                className={`mb-1.5 block text-sm font-medium ${DASHBOARD_PALETTE.label}`}
              >
                {t("notifications-dashboard.form.message-label")}
              </label>
              <textarea
                name="message"
                rows={3}
                placeholder={t("notifications-dashboard.form.message-placeholder")}
                value={form.message ?? ""}
                onChange={handleChange}
                className={DASHBOARD_PALETTE.input}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className={`flex-1 ${DASHBOARD_PALETTE.btnPrimary}`}
              >
                {editingId !== null
                  ? t("notifications-dashboard.form.submit-edit")
                  : t("notifications-dashboard.form.submit-create")}
              </button>
              {editingId !== null && (
                <button
                  type="button"
                  onClick={resetForm}
                  className={`rounded-xl border ${DASHBOARD_PALETTE.border} px-4 py-3 font-semibold ${DASHBOARD_PALETTE.textMuted} hover:bg-slate-700/50`}
                >
                  {t("notifications-dashboard.form.cancel")}
                </button>
              )}
            </div>
          </form>
        </DashboardSection>
      </div>

      <div className="min-w-0 flex-1">
        <DashboardSection title={t("notifications-dashboard.list.title")}>
          {loading ? (
            <p className={`py-8 text-center ${DASHBOARD_PALETTE.textMuted}`}>
              {t("notifications-dashboard.list.loading")}
            </p>
          ) : list.length === 0 ? (
            <p className={`py-8 text-center ${DASHBOARD_PALETTE.textMuted}`}>
              {t("notifications-dashboard.list.empty")}
            </p>
          ) : (
            <div className="overflow-x-auto -mx-5 sm:mx-0">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className={`border-b ${DASHBOARD_PALETTE.border}`}>
                    <th
                      className={`py-3 pr-2 font-semibold ${DASHBOARD_PALETTE.text}`}
                    >
                      {t("notifications-dashboard.list.title")}
                    </th>
                    <th
                      className={`py-3 pr-2 font-semibold ${DASHBOARD_PALETTE.text}`}
                    >
                      {t("notifications-dashboard.list.created-at")}
                    </th>
                    <th
                      className={`py-3 font-semibold ${DASHBOARD_PALETTE.text}`}
                    >
                      {t("notifications-dashboard.list.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((item) => (
                    <tr
                      key={item.id}
                      className={`border-b ${DASHBOARD_PALETTE.border} hover:bg-slate-700/30`}
                    >
                      <td className={`py-3 pr-2 font-medium ${DASHBOARD_PALETTE.text} max-w-[280px] truncate`}>
                        {item.title}
                      </td>
                      <td className={`py-3 pr-2 ${DASHBOARD_PALETTE.textMuted}`}>
                        {formatDate(item.created_at)}
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${DASHBOARD_PALETTE.accentBorder} ${DASHBOARD_PALETTE.accent} hover:bg-cyan-500/10`}
                          >
                            {t("notifications-dashboard.list.edit")}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className={DASHBOARD_PALETTE.btnDanger}
                          >
                            {t("notifications-dashboard.list.delete")}
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

export default NotificationsDashboard;

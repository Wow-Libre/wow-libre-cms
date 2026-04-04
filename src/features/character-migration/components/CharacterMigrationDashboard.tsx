"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  DashboardLoading,
  DashboardSection,
} from "@/components/dashboard/layout";
import { DASHBOARD_PALETTE } from "@/components/dashboard/styles/dashboardPalette";
import Swal from "sweetalert2";
import { FaEye, FaSave, FaTimes } from "react-icons/fa";
import type { TFunction } from "i18next";
import {
  getCharacterMigrationDetail,
  listCharacterMigrationStaging,
  updateCharacterMigrationStatus,
  type CharacterMigrationDetail,
  type CharacterMigrationListItem,
  type CharacterMigrationStatus,
} from "../api/characterMigrationApi";

const btnPrimaryClass = `${DASHBOARD_PALETTE.btnPrimary} inline-flex items-center justify-center gap-2`;

const STATUS_OPTIONS: CharacterMigrationStatus[] = [
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
];

export interface CharacterMigrationDashboardProps {
  token: string;
  realmId: number;
  t: TFunction;
}

const CharacterMigrationDashboard: React.FC<
  CharacterMigrationDashboardProps
> = ({ token, realmId, t }) => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<CharacterMigrationListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<CharacterMigrationDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [statusDraft, setStatusDraft] = useState<CharacterMigrationStatus>("PENDING");
  const [savingStatus, setSavingStatus] = useState(false);

  const loadList = useCallback(async () => {
    setError(null);
    try {
      const list = await listCharacterMigrationStaging(realmId, token);
      setItems(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [realmId, token]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const openDetail = async (id: number) => {
    setError(null);
    try {
      const d = await getCharacterMigrationDetail(realmId, id, token);
      setDetail(d);
      setStatusDraft(d.status);
      setDetailOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const handleSaveStatus = async () => {
    if (!detail) return;
    setSavingStatus(true);
    setError(null);
    try {
      const updated = await updateCharacterMigrationStatus(
        realmId,
        detail.id,
        statusDraft,
        token
      );
      setDetail(updated);
      await loadList();
      void Swal.fire({
        icon: "success",
        title: t("character-migration-dashboard.status-saved"),
        color: "white",
        background: "#0B1218",
        timer: 2200,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      void Swal.fire({
        icon: "error",
        title: t("character-migration-dashboard.status-save-fail"),
        text: msg,
        color: "white",
        background: "#0B1218",
      });
    } finally {
      setSavingStatus(false);
    }
  };

  if (loading) {
    return (
      <DashboardLoading
        message={t("character-migration-dashboard.loading")}
      />
    );
  }

  return (
    <div className="space-y-8">
      <p className="text-sm text-slate-400">
        {t("character-migration-dashboard.admin-intro")}
      </p>

      {error && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      <DashboardSection
        title={t("character-migration-dashboard.list-title")}
        description={t("character-migration-dashboard.list-hint-admin")}
      >
        {items.length === 0 ? (
          <p className="text-slate-400">
            {t("character-migration-dashboard.empty")}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-700/80">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-slate-700 bg-slate-800/50 text-slate-300">
                <tr>
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">
                    {t("character-migration-dashboard.col-character")}
                  </th>
                  <th className="px-4 py-3 font-medium">GUID</th>
                  <th className="px-4 py-3 font-medium">
                    {t("character-migration-dashboard.col-status")}
                  </th>
                  <th className="px-4 py-3 font-medium">
                    {t("character-migration-dashboard.col-created")}
                  </th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-slate-800/80 hover:bg-slate-800/30"
                  >
                    <td className="px-4 py-3 text-slate-300">{row.id}</td>
                    <td className="px-4 py-3 text-white">
                      {row.characterName ?? "—"}
                    </td>
                    <td className="max-w-[180px] truncate px-4 py-3 font-mono text-xs text-slate-400">
                      {row.characterGuid ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-slate-700/80 px-2 py-0.5 text-xs text-slate-200">
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(row.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => void openDetail(row.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-700 hover:text-white"
                      >
                        <FaEye className="h-3.5 w-3.5" />
                        {t("character-migration-dashboard.view-json")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardSection>

      {detailOpen && detail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-700 px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {t("character-migration-dashboard.detail-title")} #{detail.id}
                </h3>
                <p className="text-sm text-slate-400">
                  {detail.characterName ?? "—"} · {detail.characterGuid ?? "—"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDetailOpen(false);
                  setDetail(null);
                }}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                aria-label="Cerrar"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 space-y-4 overflow-auto p-5">
              <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-700/80 bg-slate-800/40 p-4">
                <div className="min-w-[200px] flex-1">
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    {t("character-migration-dashboard.status-label")}
                  </label>
                  <select
                    value={statusDraft}
                    onChange={(e) =>
                      setStatusDraft(e.target.value as CharacterMigrationStatus)
                    }
                    className={`w-full ${DASHBOARD_PALETTE.input}`}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  disabled={savingStatus || statusDraft === detail.status}
                  onClick={() => void handleSaveStatus()}
                  className={`${btnPrimaryClass} disabled:opacity-50`}
                >
                  <FaSave className="h-4 w-4" />
                  {savingStatus
                    ? t("character-migration-dashboard.status-saving")
                    : t("character-migration-dashboard.status-save")}
                </button>
              </div>
              {detail.validationErrors && (
                <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
                  {detail.validationErrors}
                </p>
              )}
              <p className="text-xs uppercase tracking-wide text-slate-500">
                rawData (JSON)
              </p>
              <pre className="max-h-[50vh] overflow-auto rounded-xl bg-slate-950/80 p-4 text-xs leading-relaxed text-emerald-100/90">
                {JSON.stringify(detail.rawData ?? {}, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterMigrationDashboard;

"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  DashboardLoading,
  DashboardSection,
} from "@/components/dashboard/layout";
import { FaEye } from "react-icons/fa";
import type { TFunction } from "i18next";
import {
  getCharacterMigrationDetail,
  listCharacterMigrationStaging,
  type CharacterMigrationDetail,
  type CharacterMigrationListItem,
  type CharacterMigrationStatus,
} from "../api/characterMigrationApi";
import CharacterMigrationDetailModal from "./CharacterMigrationDetailModal";

export interface CharacterMigrationDashboardProps {
  token: string;
  realmId: number;
  t: TFunction;
}

const STATUS_BADGE: Record<CharacterMigrationStatus, string> = {
  PENDING: "border-amber-400/70 bg-amber-400/25 text-amber-50",
  PROCESSING: "border-sky-400/70 bg-sky-400/25 text-sky-50",
  COMPLETED: "border-emerald-400/70 bg-emerald-400/25 text-emerald-50",
  FAILED: "border-rose-400/70 bg-rose-400/25 text-rose-50",
};

const CharacterMigrationDashboard: React.FC<
  CharacterMigrationDashboardProps
> = ({ token, realmId, t }) => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<CharacterMigrationListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<CharacterMigrationDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

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
      setDetailOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const handleDetailSaved = (updated: CharacterMigrationDetail) => {
    setDetail(updated);
    void loadList();
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
      <p className="text-base leading-relaxed text-slate-300">
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
          <div className="overflow-x-auto rounded-xl border border-slate-600/50 bg-slate-800/30 shadow-inner">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-slate-600/50 bg-slate-700/40 text-slate-200">
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
                    className="border-b border-slate-700/40 hover:bg-slate-700/25"
                  >
                    <td className="px-4 py-3 font-medium text-slate-200">{row.id}</td>
                    <td className="px-4 py-3 text-base font-medium text-white">
                      {row.characterName ?? "—"}
                    </td>
                    <td className="max-w-[180px] truncate px-4 py-3 font-mono text-xs text-slate-400">
                      {row.characterGuid ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-md border px-2.5 py-1 text-xs font-bold uppercase ${STATUS_BADGE[row.status]}`}
                      >
                        {t(`character-migration-dashboard.status-${row.status}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {row.createdAt
                        ? new Date(row.createdAt).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => void openDetail(row.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-500/60 bg-slate-600/40 px-3 py-2 text-sm font-semibold text-slate-100 transition-colors hover:bg-slate-600/60 hover:text-white"
                      >
                        <FaEye className="h-3.5 w-3.5" />
                        {t("character-migration-dashboard.review-request")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardSection>

      <CharacterMigrationDetailModal
        open={detailOpen}
        detail={detail}
        realmId={realmId}
        token={token}
        onClose={() => {
          setDetailOpen(false);
          setDetail(null);
        }}
        onSaved={handleDetailSaved}
        onError={setError}
      />
    </div>
  );
};

export default CharacterMigrationDashboard;

"use client";

import React from "react";
import { Teleport } from "@/model/teleport";
import { DASHBOARD_PALETTE } from "@/components/dashboard/styles/dashboardPalette";

interface TeleportCardProps {
  teleport: Teleport;
  onDelete: (id: number) => void;
  deleting: boolean;
  t: (key: string) => string;
}

const TeleportCard: React.FC<TeleportCardProps> = ({
  teleport,
  onDelete,
  deleting,
  t,
}) => {
  return (
    <div className={`space-y-4 rounded-xl p-5 shadow-sm transition-colors sm:p-6 ${DASHBOARD_PALETTE.card} hover:border-cyan-500/30`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className={`block text-xs font-semibold uppercase tracking-wide ${DASHBOARD_PALETTE.label}`}>
              {t("teleport-dashboard.teleports-list.columns.name")}
            </span>
            <p className={`mt-1 text-lg font-semibold ${DASHBOARD_PALETTE.text}`}>{teleport.name}</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
              teleport.faction === "HORDE"
                ? "border border-red-700/50 bg-red-900/30 text-red-300"
                : teleport.faction === "ALLIANCE"
                ? "border border-blue-700/50 bg-blue-900/30 text-blue-300"
                : `border ${DASHBOARD_PALETTE.border} bg-slate-700/50 text-slate-300`
            }`}
          >
            {teleport.faction}
          </span>
        </div>

        <div className={`grid grid-cols-2 gap-4 border-t pt-3 sm:gap-5 ${DASHBOARD_PALETTE.border}`}>
          <div>
            <span className={`mb-1 block text-xs font-semibold uppercase tracking-wide ${DASHBOARD_PALETTE.label}`}>
              {t("teleport-dashboard.teleports-list.columns.location")}
            </span>
            <p className={`text-sm font-mono ${DASHBOARD_PALETTE.textMuted}`}>
              X: {teleport.position_x.toFixed(2)} · Y: {teleport.position_y.toFixed(2)} · Z: {teleport.position_z.toFixed(2)}
            </p>
          </div>
          <div>
            <span className={`mb-1 block text-xs font-semibold uppercase tracking-wide ${DASHBOARD_PALETTE.label}`}>
              {t("teleport-dashboard.teleports-list.columns.map")}
            </span>
            <p className={`text-sm ${DASHBOARD_PALETTE.textMuted}`}>{teleport.map}</p>
          </div>
          <div>
            <span className={`mb-1 block text-xs font-semibold uppercase tracking-wide ${DASHBOARD_PALETTE.label}`}>
              {t("teleport-dashboard.teleports-list.columns.zone")}
            </span>
            <p className={`text-sm ${DASHBOARD_PALETTE.textMuted}`}>{teleport.zone}</p>
          </div>
          <div>
            <span className={`mb-1 block text-xs font-semibold uppercase tracking-wide ${DASHBOARD_PALETTE.label}`}>
              {t("teleport-dashboard.teleports-list.columns.area")}
            </span>
            <p className={`text-sm ${DASHBOARD_PALETTE.textMuted}`}>{teleport.area}</p>
          </div>
          <div className="col-span-2">
            <span className={`mb-1 block text-xs font-semibold uppercase tracking-wide ${DASHBOARD_PALETTE.label}`}>
              {t("teleport-dashboard.teleports-list.columns.orientation")}
            </span>
            <p className={`text-sm font-mono ${DASHBOARD_PALETTE.textMuted}`}>{teleport.orientation.toFixed(4)}</p>
          </div>
        </div>
      </div>

      {teleport.img_url && (
        <div className={`border-t pt-3 ${DASHBOARD_PALETTE.border}`}>
          <img
            src={teleport.img_url}
            alt={teleport.name}
            className={`w-full max-h-48 rounded-lg border object-cover transition-colors ${DASHBOARD_PALETTE.border} hover:border-cyan-500/30`}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}

      <button
        type="button"
        onClick={() => onDelete(teleport.id)}
        disabled={deleting}
        className={`w-full ${DASHBOARD_PALETTE.btnDanger} flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {deleting ? (
          <>
            <svg
              className="h-5 w-5 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>{t("teleport-dashboard.buttons.deleting") || "Deleting..."}</span>
          </>
        ) : (
          t("teleport-dashboard.buttons.delete-teleport")
        )}
      </button>
    </div>
  );
};

export default TeleportCard;

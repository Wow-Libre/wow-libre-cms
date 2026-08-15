"use client";

import React, { useState } from "react";
import { Teleport } from "@/model/teleport";
import { DASHBOARD_PALETTE } from "@/components/dashboard/styles/dashboardPalette";

interface TeleportCardProps {
  teleport: Teleport;
  onDelete: (id: number) => void;
  deleting: boolean;
  t: (key: string) => string;
}

const FACTION_STYLES: Record<string, {
  pillBorder: string;
  pillBg: string;
  pillText: string;
  barClass: string;
}> = {
  HORDE: {
    pillBorder: "border-red-500/40",
    pillBg: "bg-red-500/15",
    pillText: "text-red-200",
    barClass: "from-red-500 to-red-700",
  },
  ALLIANCE: {
    pillBorder: "border-blue-500/40",
    pillBg: "bg-blue-500/15",
    pillText: "text-blue-200",
    barClass: "from-blue-500 to-blue-700",
  },
  ALL: {
    pillBorder: "border-slate-500/40",
    pillBg: "bg-slate-500/15",
    pillText: "text-slate-200",
    barClass: "from-slate-500 to-slate-700",
  },
};

function factionLabelKey(faction: string, t: (k: string) => string): string {
  if (faction === "HORDE") return t("teleport-dashboard.form-teleport.faction.select-horde");
  if (faction === "ALLIANCE") return t("teleport-dashboard.form-teleport.faction.select-alliance");
  return t("teleport-dashboard.form-teleport.faction.select-neutral");
}

const TeleportCard: React.FC<TeleportCardProps> = ({
  teleport,
  onDelete,
  deleting,
  t,
}) => {
  const [expanded, setExpanded] = useState(false);
  const styles = FACTION_STYLES[teleport.faction] ?? FACTION_STYLES.ALL;

  return (
    <li className="group relative overflow-hidden rounded-2xl border border-slate-600/45 bg-gradient-to-br from-slate-800/90 to-slate-900/95 shadow-md ring-1 ring-white/[0.04] transition hover:shadow-lg hover:border-cyan-500/35">
      <div
        className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b opacity-90 ${styles.barClass}`}
        aria-hidden
      />
      <div className="relative flex flex-col gap-4 pl-5 pr-4 pt-4 pb-4 sm:flex-row sm:items-start sm:pl-6">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className={`text-xl font-semibold tracking-tight ${DASHBOARD_PALETTE.text}`}>
              {teleport.name}
            </h3>
            <span className="rounded-lg border border-slate-600/60 bg-slate-900/80 px-2.5 py-1 text-sm font-semibold uppercase tracking-wide text-slate-300">
              #{teleport.id}
            </span>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm font-semibold uppercase tracking-wider ${styles.pillBorder} ${styles.pillBg} ${styles.pillText}`}>
              <FactionIcon value={teleport.faction} className="h-3.5 w-3.5" />
              {factionLabelKey(teleport.faction, t)}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-3 lg:grid-cols-3">
            <Field
              label={t("teleport-dashboard.teleports-list.columns.location")}
              icon={
                <svg className="h-4 w-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
            >
              <span className={`break-all font-mono text-base tabular-nums ${DASHBOARD_PALETTE.text}`}>
                {teleport.position_x.toFixed(2)} · {teleport.position_y.toFixed(2)} · {teleport.position_z.toFixed(2)}
              </span>
            </Field>

            <Field
              label={t("teleport-dashboard.teleports-list.columns.orientation")}
              icon={
                <svg className="h-4 w-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              }
            >
              <span className={`break-all font-mono text-base tabular-nums ${DASHBOARD_PALETTE.text}`}>
                {teleport.orientation.toFixed(4)}
              </span>
            </Field>

            <Field
              label={t("teleport-dashboard.teleports-list.columns.map")}
              icon={
                <svg className="h-4 w-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              }
            >
              <span className={`text-base tabular-nums ${DASHBOARD_PALETTE.text}`}>{teleport.map}</span>
            </Field>

            <Field
              label={t("teleport-dashboard.teleports-list.columns.zone")}
              icon={
                <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            >
              <span className={`text-base tabular-nums ${DASHBOARD_PALETTE.text}`}>{teleport.zone}</span>
            </Field>

            <Field
              label={t("teleport-dashboard.teleports-list.columns.area")}
              icon={
                <svg className="h-4 w-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              }
            >
              <span className={`text-base tabular-nums ${DASHBOARD_PALETTE.text}`}>{teleport.area}</span>
            </Field>
          </div>

          {teleport.img_url && (
            <div className="mt-3 rounded-xl border border-slate-700/40 bg-slate-950/40 p-2">
              <img
                src={teleport.img_url}
                alt={teleport.name}
                className={`mx-auto w-full max-w-md rounded-lg object-contain transition-all ${
                  expanded ? "max-h-[28rem]" : "max-h-32"
                }`}
                loading="lazy"
                onClick={() => setExpanded((v) => !v)}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="mt-1.5 block w-full text-center text-sm text-cyan-300 hover:text-cyan-200"
              >
                {expanded
                  ? t("teleport-dashboard.teleports-list.collapse-image")
                  : t("teleport-dashboard.teleports-list.expand-image")}
              </button>
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-stretch">
          <button
            type="button"
            onClick={() => onDelete(teleport.id)}
            disabled={deleting}
            className={`inline-flex items-center justify-center gap-1.5 ${DASHBOARD_PALETTE.btnDanger} disabled:opacity-60`}
            aria-label={t("teleport-dashboard.buttons.delete-teleport")}
          >
            {deleting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />
                <span>{t("teleport-dashboard.buttons.deleting") || "Eliminando..."}</span>
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                <span>{t("teleport-dashboard.buttons.delete-teleport")}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </li>
  );
};

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className={`mb-0.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider ${DASHBOARD_PALETTE.textMuted} sm:text-sm`}>
        {icon}
        <span>{label}</span>
      </p>
      {children}
    </div>
  );
}

function FactionIcon({ value, className }: { value: string; className?: string }) {
  if (value === "HORDE") {
    return (
      <svg className={className ?? "h-4 w-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    );
  }
  if (value === "ALLIANCE") {
    return (
      <svg className={className ?? "h-4 w-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    );
  }
  return (
    <svg className={className ?? "h-4 w-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

export default TeleportCard;

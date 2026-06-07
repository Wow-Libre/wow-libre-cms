"use client";

import { getServers } from "@/api/account/realms";
import { getArmoryLeaderboards } from "@/features/armory/api/armoryApi";
import {
  armoryGlassPanelClass,
  ArmoryPanelHeading,
  ArmoryPanelShell,
  ArmoryShimmerOverlay,
  armoryCardHover,
} from "@/features/armory/components/ArmoryMotion";
import { CLASS_COLORS } from "@/features/armory/constants/equipmentSlots";
import type {
  ArmoryLeaderboardEntry,
  ArmoryLeaderboardMetric,
  ArmoryLeaderboards,
} from "@/features/armory/types/armory.types";
import {
  formatPlaytimeSeconds,
  formatWoWMoney,
} from "@/features/armory/utils/armoryFormat";
import { ServerModel } from "@/model/model";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const BOARD_CONFIG: Record<
  ArmoryLeaderboardMetric,
  { key: keyof ArmoryLeaderboards; accent: string; border: string; glow: string }
> = {
  kills: {
    key: "kills",
    accent: "text-rose-200",
    border: "border-rose-400/25",
    glow: "shadow-[0_8px_32px_rgba(244,63,94,0.12)]",
  },
  gold: {
    key: "gold",
    accent: "text-amber-200",
    border: "border-amber-400/25",
    glow: "shadow-[0_8px_32px_rgba(245,158,11,0.12)]",
  },
  honor: {
    key: "honor",
    accent: "text-violet-200",
    border: "border-violet-400/25",
    glow: "shadow-[0_8px_32px_rgba(139,92,246,0.12)]",
  },
  playtime: {
    key: "playtime",
    accent: "text-emerald-200",
    border: "border-emerald-400/25",
    glow: "shadow-[0_8px_32px_rgba(16,185,129,0.12)]",
  },
};

const METRICS: ArmoryLeaderboardMetric[] = ["kills", "gold", "honor", "playtime"];

function rankBadgeClass(rank: number): string {
  if (rank === 1) return "bg-gradient-to-br from-amber-300 to-amber-600 text-amber-950";
  if (rank === 2) return "bg-gradient-to-br from-slate-200 to-slate-500 text-slate-900";
  if (rank === 3) return "bg-gradient-to-br from-orange-400 to-orange-700 text-orange-950";
  return "bg-slate-800/80 text-slate-300 ring-1 ring-white/10";
}

function formatMetricValue(metric: ArmoryLeaderboardMetric, value: number): string {
  switch (metric) {
    case "gold":
      return formatWoWMoney(value);
    case "playtime":
      return formatPlaytimeSeconds(value);
    default:
      return value.toLocaleString();
  }
}

interface LeaderboardBoardProps {
  metric: ArmoryLeaderboardMetric;
  entries: ArmoryLeaderboardEntry[];
  characterHref: (name: string) => string;
}

function LeaderboardBoard({ metric, entries, characterHref }: LeaderboardBoardProps) {
  const { t } = useTranslation();
  const config = BOARD_CONFIG[metric];

  return (
    <ArmoryPanelShell className={`h-full ${config.border} ${config.glow}`}>
      <ArmoryPanelHeading>{t(`armory.leaderboards.${metric}`)}</ArmoryPanelHeading>

      {entries.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">
          {t("armory.leaderboards.empty")}
        </p>
      ) : (
        <ol className="space-y-2">
          {entries.map((entry) => {
            const classColor = CLASS_COLORS[entry.class_id] ?? "#FFFFFF";
            return (
              <li key={`${metric}-${entry.id}`}>
                <Link
                  href={characterHref(entry.name)}
                  className={`group flex items-center gap-3 rounded-xl border border-white/[0.05] bg-black/30 px-3 py-2.5 transition ${armoryCardHover} hover:border-cyan-400/20 hover:bg-cyan-500/[0.04]`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${rankBadgeClass(entry.rank)}`}
                  >
                    {entry.rank}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate font-semibold transition group-hover:brightness-110"
                      style={{ color: classColor }}
                    >
                      {entry.name}
                    </p>
                    <p className="truncate text-[11px] text-slate-500">
                      {t("armory.level")} {entry.level} · {entry.race} {entry.class}
                    </p>
                  </div>
                  <span className={`shrink-0 text-right text-sm font-bold tabular-nums ${config.accent}`}>
                    {formatMetricValue(metric, entry.value)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </ArmoryPanelShell>
  );
}

const ArmoryStatsLeaderboards = () => {
  const { t } = useTranslation();
  const [servers, setServers] = useState<ServerModel[]>([]);
  const [selectedServer, setSelectedServer] = useState("");
  const [selectedRealmId, setSelectedRealmId] = useState<number | undefined>();
  const [factionFilter, setFactionFilter] = useState("");
  const [boards, setBoards] = useState<ArmoryLeaderboards | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getServers()
      .then(setServers)
      .catch(() => setServers([]));
  }, []);

  const selectedServerModel = servers.find((s) => s.name === selectedServer);

  const fetchBoards = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getArmoryLeaderboards({
        limit: 10,
        faction: factionFilter || undefined,
        realm: selectedServer || undefined,
        expansion_id: selectedServerModel
          ? Number(selectedServerModel.expansion)
          : undefined,
        realm_id: selectedRealmId,
      });
      setBoards(data);
    } catch (err) {
      setBoards(null);
      setError(err instanceof Error ? err.message : t("armory.leaderboards.error"));
    } finally {
      setIsLoading(false);
    }
  }, [factionFilter, selectedServer, selectedServerModel, selectedRealmId, t]);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const characterHref = (name: string) => {
    const params = new URLSearchParams();
    if (selectedRealmId) params.set("realm_id", String(selectedRealmId));
    else if (selectedServer && selectedServerModel) {
      params.set("realm", selectedServer);
      params.set("expansion_id", selectedServerModel.expansion);
    }
    const query = params.toString();
    return `/armory/${encodeURIComponent(name)}${query ? `?${query}` : ""}`;
  };

  const pillInactive =
    "border-slate-600/50 bg-slate-900/50 text-slate-400 hover:border-slate-500/70 hover:text-slate-200";
  const pillActiveCyan =
    "border-cyan-400/50 bg-cyan-500/20 text-cyan-100 shadow-[0_0_14px_rgba(34,211,238,0.18)] ring-1 ring-cyan-400/25";

  return (
    <div className="space-y-6">
      <div className={`relative ${armoryGlassPanelClass("p-5 md:p-6")}`}>
        <ArmoryShimmerOverlay />
        <div className="relative grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-200/70">
              {t("armory.search.realm")}
            </label>
            <select
              value={selectedServer}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedServer(value);
                const server = servers.find((s) => s.name === value);
                setSelectedRealmId(server?.id);
              }}
              className="w-full rounded-xl border border-cyan-500/20 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
            >
              <option value="">{t("armory.search.allRealms")}</option>
              {servers.map((server) => (
                <option key={server.id} value={server.name}>
                  {server.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-200/70">
              {t("armory.search.faction")}
            </span>
            <div className="flex flex-wrap gap-2">
              {(["", "alliance", "horde"] as const).map((faction) => (
                <button
                  key={faction || "all"}
                  type="button"
                  onClick={() => setFactionFilter(faction)}
                  className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide transition ${
                    factionFilter === faction ? pillActiveCyan : pillInactive
                  }`}
                >
                  {faction === ""
                    ? t("armory.search.all")
                    : t(`armory.faction.${faction}`)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {METRICS.map((metric) => (
            <div
              key={metric}
              className={`h-80 animate-pulse rounded-2xl ${armoryGlassPanelClass()}`}
            />
          ))}
        </div>
      ) : error ? (
        <div className={`p-8 text-center ${armoryGlassPanelClass()}`}>
          <p className="text-rose-300">{error}</p>
          <button
            type="button"
            onClick={fetchBoards}
            className="mt-4 rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
          >
            {t("armory.leaderboards.retry")}
          </button>
        </div>
      ) : boards ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {METRICS.map((metric) => (
            <LeaderboardBoard
              key={metric}
              metric={metric}
              entries={boards[BOARD_CONFIG[metric].key] as ArmoryLeaderboardEntry[]}
              characterHref={characterHref}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default ArmoryStatsLeaderboards;

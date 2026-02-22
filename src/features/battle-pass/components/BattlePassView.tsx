"use client";

import React, { useRef, useEffect } from "react";
import LoadingSpinner from "@/components/utilities/loading-spinner";
import { useBattlePass } from "../hooks/useBattlePass";
import type { BattlePassViewProps, BattlePassRewardWithStatus } from "../types";
import BattlePassRewardCard from "./BattlePassRewardCard";

const MAX_LEVEL = 80;

const BattlePassView: React.FC<BattlePassViewProps> = ({
  token,
  serverId,
  accountId,
  characterId,
  characterLevel,
  t,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const {
    loading,
    error,
    season,
    rewardsWithStatus,
    refresh,
    claimReward: handleClaim,
    claimingId,
  } = useBattlePass({
    token,
    serverId,
    accountId,
    characterId,
    characterLevel,
  });

  const byLevel = new Map(rewardsWithStatus.map((r) => [r.level, r]));
  const allLevels: BattlePassRewardWithStatus[] = [];
  for (let l = 1; l <= MAX_LEVEL; l++) {
    allLevels.push(
      byLevel.get(l) ?? {
        id: 0,
        season_id: season?.id ?? 0,
        level: l,
        name: t("battle-pass.empty-slot"),
        image_url: "",
        core_item_id: 0,
        wowhead_id: null,
        unlocked: characterLevel >= l,
        claimed: false,
      }
    );
  }

  useEffect(() => {
    if (!season || loading || !trackRef.current) return;
    const node = trackRef.current.querySelector(`[data-level="${characterLevel}"]`);
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [season, characterLevel, loading]);

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-xl border border-blue-500/20 bg-gradient-to-b from-slate-900 via-blue-950/30 to-slate-900 shadow-xl">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/40 bg-slate-900/95 p-8 text-center shadow-xl">
        <p className="text-red-300 font-medium">{error}</p>
        <button
          type="button"
          onClick={refresh}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
        >
          {t("battle-pass.retry")}
        </button>
      </div>
    );
  }

  if (!season) {
    return (
      <div className="rounded-xl border border-blue-500/20 bg-gradient-to-b from-slate-900 via-blue-950/20 to-slate-900 p-10 text-center shadow-xl">
        <h2 className="mb-2 text-2xl font-bold text-white">
          {t("battle-pass.no-season.title")}
        </h2>
        <p className="text-blue-200/80">{t("battle-pass.no-season.subtitle")}</p>
      </div>
    );
  }

  const startDate = new Date(season.start_date).toLocaleDateString();
  const endDate = new Date(season.end_date).toLocaleDateString();
  const progressPercent = Math.min(100, (characterLevel / MAX_LEVEL) * 100);

  return (
    <div className="rounded-xl border border-blue-500/25 bg-gradient-to-b from-slate-900 via-blue-950/40 to-slate-900 shadow-2xl overflow-hidden">
      {/* Header estilo Fortnite: temporada grande, nivel en amarillo */}
      <div className="relative border-b border-blue-500/30 bg-gradient-to-r from-blue-950/60 via-slate-900 to-blue-950/60 px-6 py-5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(59,130,246,0.08),transparent)]" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">
              {t("battle-pass.season-label")}
            </p>
            <h2 className="mt-1 text-2xl sm:text-3xl font-black text-white tracking-tight">
              {season.name}
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-300">
              {startDate} – {endDate}
            </p>
          </div>
          <div className="flex items-center gap-5">
            <div className="rounded-xl bg-slate-800 border border-slate-600 px-5 py-3 min-w-[100px] text-center shadow-lg">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {t("battle-pass.your-level")}
              </p>
              <p className="mt-0.5 text-2xl font-black text-amber-400 tabular-nums">
                {characterLevel}
                <span className="text-base font-semibold text-slate-400">/{MAX_LEVEL}</span>
              </p>
            </div>
            <div className="hidden sm:block w-48">
              <div className="mb-1.5 flex justify-between text-xs font-semibold text-slate-300">
                <span>{t("battle-pass.progress")}</span>
                <span className="text-amber-400 font-bold">{Math.round(progressPercent)}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-700/80 border border-blue-500/20">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_10px_rgba(251,191,36,0.5)] transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pista con línea de progreso visible (estilo Fortnite) */}
      <div className="relative px-4 py-6">
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-20 bg-gradient-to-r from-slate-900 via-slate-900/95 to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-20 bg-gradient-to-l from-slate-900 via-slate-900/95 to-transparent" />

        {/* Línea de “camino” detrás de las cards: gris por defecto, relleno hasta nivel actual en azul/amarillo */}
        <div className="absolute left-4 right-4 top-[calc(50%+24px)] h-1 -translate-y-1/2 rounded-full z-0 pointer-events-none" aria-hidden>
          <div className="absolute inset-0 rounded-full bg-slate-700/60" />
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-blue-500 to-amber-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div
          ref={trackRef}
          className="relative z-[1] flex gap-3 overflow-x-auto overflow-y-hidden pb-3 pt-2 scroll-smooth px-1"
          style={{
            scrollSnapType: "x proximity",
            scrollbarWidth: "thin",
          }}
        >
          {allLevels.map((reward, index) => (
            <div
              key={reward.level}
              data-level={reward.level}
              className="flex shrink-0 items-center"
              style={{ scrollSnapAlign: "center" }}
            >
              <BattlePassRewardCard
                reward={reward}
                onClaim={handleClaim}
                claimingId={claimingId}
                t={t}
                isCurrentLevel={reward.level === characterLevel}
              />
              {index < allLevels.length - 1 && (
                <div
                  className="hidden shrink-0 w-2 h-1 rounded-full bg-slate-600/50 sm:block"
                  aria-hidden
                />
              )}
            </div>
          ))}
        </div>

        <p className="mt-4 text-center text-sm font-semibold text-slate-400">
          {t("battle-pass.scroll-hint")}
        </p>
      </div>
    </div>
  );
};

export default BattlePassView;

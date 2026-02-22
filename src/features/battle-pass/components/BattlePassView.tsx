"use client";

import React from "react";
import LoadingSpinner from "@/components/utilities/loading-spinner";
import { useBattlePass } from "../hooks/useBattlePass";
import type { BattlePassViewProps, BattlePassRewardWithStatus } from "../types";
import BattlePassRewardCard from "./BattlePassRewardCard";

const MAX_LEVEL = 80;
const REWARDS_PER_ROW = 8;

const BattlePassView: React.FC<BattlePassViewProps> = ({
  token,
  serverId,
  accountId,
  characterId,
  characterLevel,
  t,
}) => {
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

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-gray-700 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/40 bg-gradient-to-br from-slate-950 via-red-950/40 to-slate-950 p-8 text-center shadow-xl shadow-red-900/30">
        <h2 className="mb-2 text-2xl font-extrabold text-red-400 uppercase tracking-wide">
          {t("battle-pass.error.title")}
        </h2>
        <p className="text-sm text-red-300/90">{error}</p>
        <button
          type="button"
          onClick={refresh}
          className="mt-5 rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-red-900/40 hover:bg-red-500"
        >
          {t("battle-pass.retry")}
        </button>
      </div>
    );
  }

  if (!season) {
    return (
      <div className="rounded-2xl border border-gray-700/80 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-10 text-center shadow-2xl shadow-black/60">
        <h2 className="mb-3 text-3xl font-extrabold uppercase tracking-widest text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.7)]">
          {t("battle-pass.no-season.title")}
        </h2>
        <p className="text-base text-gray-300">
          {t("battle-pass.no-season.subtitle")}
        </p>
      </div>
    );
  }

  const byLevel = new Map(rewardsWithStatus.map((r) => [r.level, r]));
  const rows: BattlePassRewardWithStatus[][] = [];
  for (let level = 1; level <= MAX_LEVEL; level += REWARDS_PER_ROW) {
    const row = [];
    for (let l = level; l < level + REWARDS_PER_ROW && l <= MAX_LEVEL; l++) {
      row.push(
        byLevel.get(l) ?? {
          id: 0,
          season_id: season.id,
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
    rows.push(row);
  }

  const startDate = new Date(season.start_date).toLocaleDateString();
  const endDate = new Date(season.end_date).toLocaleDateString();
  const progressPercent = Math.min(
    100,
    Math.round((characterLevel / MAX_LEVEL) * 100)
  );

  return (
    <div className="space-y-6 rounded-2xl border border-slate-700/80 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-5 shadow-2xl shadow-black/60">
      {/* Header estilo pase de batalla */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
            {t("battle-pass.season-label")}
          </p>
          <h2 className="text-2xl font-extrabold uppercase tracking-wide text-white drop-shadow-[0_0_12px_rgba(56,189,248,0.7)]">
            {season.name}
          </h2>
          <p className="text-xs text-gray-400">
            {t("battle-pass.season-dates")}:{" "}
            <span className="font-medium text-cyan-300">
              {startDate}
            </span>{" "}
            –{" "}
            <span className="font-medium text-cyan-300">
              {endDate}
            </span>
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 rounded-full bg-slate-900/80 px-4 py-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-300">
              {t("battle-pass.your-level")}
            </span>
            <span className="text-lg font-extrabold text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.7)]">
              {characterLevel}
            </span>
            <span className="text-[10px] font-semibold uppercase text-gray-400">
              / {MAX_LEVEL}
            </span>
          </div>
          <div className="w-40">
            <div className="mb-1 flex justify-between text-[10px] font-semibold text-gray-400">
              <span>{t("battle-pass.progress")}</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500 shadow-[0_0_10px_rgba(56,189,248,0.8)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid estilo “páginas” de niveles */}
      <div className="space-y-3">
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={`flex items-stretch rounded-xl border border-slate-800/80 bg-slate-900/70 p-3 shadow-md shadow-black/40 ${
              rowIndex % 2 === 0
                ? "from-slate-900 via-slate-900 to-slate-950"
                : "from-slate-950 via-slate-900 to-slate-950"
            }`}
          >
            {/* Columna con rango de niveles */}
            <div className="flex w-20 flex-col items-center justify-center border-r border-slate-700/70 pr-3 text-center">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                {t("battle-pass.level-range")}
              </span>
              <span className="text-lg font-extrabold text-cyan-300">
                {row[0].level}
                {" - "}
                {row[row.length - 1].level}
              </span>
            </div>

            {/* Recompensas de esa “página” */}
            <div className="ml-3 grid flex-1 grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8">
              {row.map((reward) => (
                <BattlePassRewardCard
                  key={reward.level}
                  reward={reward}
                  onClaim={handleClaim}
                  claimingId={claimingId}
                  t={t}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BattlePassView;

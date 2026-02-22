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
      <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-amber-500/20 bg-gradient-to-br from-slate-950 via-amber-950/10 to-slate-950">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/40 bg-gradient-to-br from-slate-950 via-red-950/30 to-slate-950 p-8 text-center shadow-xl">
        <p className="text-red-400">{error}</p>
        <button
          type="button"
          onClick={refresh}
          className="mt-4 rounded-lg bg-red-600/80 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
        >
          {t("battle-pass.retry")}
        </button>
      </div>
    );
  }

  if (!season) {
    return (
      <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-10 text-center">
        <h2 className="mb-2 text-2xl font-bold text-amber-400">
          {t("battle-pass.no-season.title")}
        </h2>
        <p className="text-gray-400">{t("battle-pass.no-season.subtitle")}</p>
      </div>
    );
  }

  const startDate = new Date(season.start_date).toLocaleDateString();
  const endDate = new Date(season.end_date).toLocaleDateString();
  const progressPercent = Math.min(100, (characterLevel / MAX_LEVEL) * 100);

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 shadow-2xl shadow-amber-900/10 overflow-hidden">
      {/* Header gaming */}
      <div className="relative border-b border-amber-500/20 bg-gradient-to-r from-amber-950/30 via-slate-900 to-amber-950/20 px-5 py-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(251,191,36,0.12),transparent)]" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500/80">
              {t("battle-pass.season-label")}
            </p>
            <h2 className="text-xl font-black uppercase tracking-wider text-white drop-shadow-[0_0_20px_rgba(251,191,36,0.4)]">
              {season.name}
            </h2>
            <p className="mt-0.5 text-xs text-gray-400">
              {startDate} – {endDate}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-lg border border-amber-500/30 bg-slate-900/80 px-4 py-2">
              <p className="text-[10px] font-semibold uppercase text-amber-500/90">
                {t("battle-pass.your-level")}
              </p>
              <p className="text-2xl font-black text-amber-400 tabular-nums">
                {characterLevel}
                <span className="text-sm font-bold text-gray-500">/{MAX_LEVEL}</span>
              </p>
            </div>
            <div className="hidden w-36 sm:block">
              <div className="mb-1 flex justify-between text-[10px] font-semibold text-gray-500">
                <span>{t("battle-pass.progress")}</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)] transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pista horizontal con scroll */}
      <div className="relative px-2 py-5">
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-r from-slate-950 to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-l from-slate-950 to-transparent" />

        <div
          ref={trackRef}
          className="flex gap-2 overflow-x-auto overflow-y-hidden pb-2 pt-1 scroll-smooth px-2"
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
                  className="hidden shrink-0 w-1 h-0.5 bg-gradient-to-r from-amber-500/40 to-amber-500/20 sm:block"
                  aria-hidden
                />
              )}
            </div>
          ))}
        </div>

        <p className="mt-3 text-center text-[10px] font-medium text-gray-500">
          {t("battle-pass.scroll-hint")}
        </p>
      </div>
    </div>
  );
};

export default BattlePassView;

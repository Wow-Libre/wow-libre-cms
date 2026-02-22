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
      <div className="flex min-h-[280px] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-gray-900/80 p-6 text-center">
        <p className="text-red-400">{error}</p>
        <button
          type="button"
          onClick={refresh}
          className="mt-3 rounded-lg bg-gray-700 px-4 py-2 text-white hover:bg-gray-600"
        >
          {t("battle-pass.retry")}
        </button>
      </div>
    );
  }

  if (!season) {
    return (
      <div className="rounded-2xl border border-gray-700 bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8 text-center">
        <h2 className="mb-2 text-2xl font-bold text-yellow-400">
          {t("battle-pass.no-season.title")}
        </h2>
        <p className="text-gray-300">{t("battle-pass.no-season.subtitle")}</p>
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-700 bg-gray-800/50 p-4">
        <div>
          <h2 className="text-2xl font-bold text-white">{season.name}</h2>
          <p className="text-sm text-gray-400">
            {t("battle-pass.season-dates")}: {startDate} – {endDate}
          </p>
        </div>
        <p className="rounded-lg bg-cyan-900/40 px-3 py-1.5 text-cyan-300">
          {t("battle-pass.your-level")}: {characterLevel}
        </p>
      </div>

      <div className="space-y-4">
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8"
          >
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
        ))}
      </div>
    </div>
  );
};

export default BattlePassView;

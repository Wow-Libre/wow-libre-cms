"use client";

import React, { useMemo, useState } from "react";
import LoadingSpinner from "@/components/utilities/loading-spinner";
import { FaCalendarCheck, FaGift } from "react-icons/fa";
import { useBattlePass } from "../hooks/useBattlePass";
import type { BattlePassViewProps } from "../types";
import BattlePassRewardCard from "./BattlePassRewardCard";

const UPCOMING_PAGE = 8;

const BattlePassView: React.FC<BattlePassViewProps> = ({
  token,
  serverId,
  accountId,
  characterId,
  characterLevel,
  t,
}) => {
  const [showClaimed, setShowClaimed] = useState(false);
  const [upcomingLimit, setUpcomingLimit] = useState(UPCOMING_PAGE);
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

  const { claimable, upcoming, claimed } = useMemo(() => {
    const real = [...rewardsWithStatus]
      .filter((r) => r.id > 0)
      .sort((a, b) => a.level - b.level);
    return {
      claimable: real.filter((r) => r.unlocked && !r.claimed),
      upcoming: real.filter((r) => !r.unlocked && !r.claimed),
      claimed: real.filter((r) => r.claimed),
    };
  }, [rewardsWithStatus]);

  const totalPrizes = claimable.length + upcoming.length + claimed.length;
  const progressPercent =
    totalPrizes === 0 ? 0 : Math.min(100, (claimed.length / totalPrizes) * 100);

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
        <p className="text-lg font-medium text-red-300">{error}</p>
        <button
          type="button"
          onClick={refresh}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-base font-semibold text-white hover:bg-red-500"
        >
          {t("battle-pass.retry")}
        </button>
      </div>
    );
  }

  if (!season) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-slate-600/60 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-900 shadow-xl">
        <div className="relative flex min-h-[380px] flex-col items-center justify-center px-6 py-12 text-center sm:px-10 sm:py-16">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 ring-1 ring-amber-500/30 shadow-lg shadow-amber-500/5">
            <FaGift className="h-10 w-10 text-amber-400/90" />
          </div>
          <h2 className="mb-3 text-xl font-bold tracking-tight text-white sm:text-2xl">
            {t("battle-pass.no-season.title")}
          </h2>
          <p className="max-w-sm text-base leading-relaxed text-slate-400">
            {t("battle-pass.no-season.subtitle")}
          </p>
          <div className="mt-6 flex items-center gap-2 rounded-full border border-slate-600/60 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-500">
            <FaCalendarCheck className="h-3.5 w-3.5 text-slate-400" />
            {t("battle-pass.no-season.hint")}
          </div>
        </div>
      </div>
    );
  }

  const startDate = new Date(season.start_date).toLocaleDateString();
  const endDate = new Date(season.end_date).toLocaleDateString();
  const upcomingVisible = upcoming.slice(0, upcomingLimit);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-600/50 bg-gradient-to-b from-slate-900 via-slate-900/98 to-slate-900 shadow-2xl">
      <div className="border-b border-slate-600/50 bg-slate-900/95 px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
              {t("battle-pass.season-label")}
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {season.name}
            </h2>
            <p className="mt-1 text-base text-slate-400">
              {startDate} – {endDate}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-xl border border-slate-600/50 bg-slate-800/60 px-4 py-2.5 text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                {t("battle-pass.your-level")}
              </p>
              <p className="mt-0.5 text-2xl font-bold tabular-nums text-white">
                {characterLevel}
              </p>
            </div>
            <div className="w-36 sm:w-44">
              <p className="mb-1 text-sm font-semibold text-slate-400">
                {t("battle-pass.claimed-count", {
                  claimed: claimed.length,
                  total: totalPrizes,
                })}
              </p>
              <div className="h-2 overflow-hidden rounded-full bg-slate-700">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all duration-500"
                  style={{ width: `${Math.max(progressPercent, totalPrizes ? 2 : 0)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8 px-5 py-6 sm:px-6">
        <RewardSection
          title={t("battle-pass.ready-to-claim")}
          count={claimable.length}
          empty={t("battle-pass.no-ready")}
        >
          {claimable.map((reward) => (
            <BattlePassRewardCard
              key={reward.id}
              reward={reward}
              onClaim={handleClaim}
              claimingId={claimingId}
              t={t}
              isCurrentLevel={reward.level === characterLevel}
            />
          ))}
        </RewardSection>

        {upcoming.length > 0 ? (
          <RewardSection
            title={t("battle-pass.upcoming")}
            count={upcoming.length}
          >
            {upcomingVisible.map((reward) => (
              <BattlePassRewardCard
                key={reward.id}
                reward={reward}
                onClaim={handleClaim}
                claimingId={claimingId}
                t={t}
              />
            ))}
            {upcoming.length > upcomingLimit ? (
              <button
                type="button"
                onClick={() => setUpcomingLimit((n) => n + UPCOMING_PAGE)}
                className="col-span-full mt-1 rounded-xl border border-slate-600/50 bg-slate-800/40 px-4 py-3 text-base font-semibold text-slate-200 transition hover:border-amber-500/40 hover:text-amber-100"
              >
                {t("battle-pass.show-more")}
              </button>
            ) : null}
          </RewardSection>
        ) : null}

        {claimed.length > 0 ? (
          <div>
            <button
              type="button"
              onClick={() => setShowClaimed((v) => !v)}
              className="flex w-full items-center justify-between rounded-xl border border-slate-600/40 bg-slate-800/40 px-4 py-3 text-left text-base font-semibold text-slate-200 transition hover:border-slate-500"
            >
              <span>
                {t("battle-pass.claimed-section")} ({claimed.length})
              </span>
              <span className="text-sm font-medium text-slate-400">
                {showClaimed
                  ? t("battle-pass.hide-claimed")
                  : t("battle-pass.show-claimed")}
              </span>
            </button>
            {showClaimed ? (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {claimed.map((reward) => (
                  <BattlePassRewardCard
                    key={reward.id}
                    reward={reward}
                    onClaim={handleClaim}
                    claimingId={claimingId}
                    t={t}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
};

function RewardSection({
  title,
  count,
  empty,
  children,
}: {
  title: string;
  count: number;
  empty?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <span className="text-base tabular-nums text-slate-400">{count}</span>
      </div>
      {count === 0 && empty ? (
        <p className="rounded-xl border border-dashed border-slate-600/50 bg-slate-800/20 px-4 py-8 text-center text-base text-slate-400">
          {empty}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {children}
        </div>
      )}
    </section>
  );
}

export default BattlePassView;

"use client";

import React from "react";
import type { BattlePassRewardWithStatus } from "../types";

interface BattlePassRewardCardProps {
  reward: BattlePassRewardWithStatus;
  onClaim: (rewardId: number) => void;
  claimingId: number | null;
  t: (key: string) => string;
  isCurrentLevel?: boolean;
}

const DEFAULT_IMAGE =
  "https://wow.zamimg.com/images/wow/icons/large/inv_misc_questionmark.jpg";

const BattlePassRewardCard: React.FC<BattlePassRewardCardProps> = ({
  reward,
  onClaim,
  claimingId,
  t,
  isCurrentLevel = false,
}) => {
  const canClaim = reward.unlocked && !reward.claimed && reward.id > 0;
  const isClaiming = claimingId === reward.id;

  const stateStyle = reward.claimed
    ? "border-emerald-500/50 bg-emerald-950/30"
    : reward.unlocked
      ? "border-amber-500/40 bg-zinc-800/80 hover:border-amber-400/50 hover:bg-zinc-800"
      : "border-zinc-600/50 bg-zinc-800/50 opacity-75";

  return (
    <div
      className={`relative flex w-[132px] shrink-0 flex-col items-center rounded-xl border-2 p-3 transition-all duration-200 sm:w-[152px] sm:p-4 ${stateStyle} ${
        isCurrentLevel
          ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-zinc-900 shadow-[0_0_20px_rgba(251,191,36,0.25)]"
          : ""
      }`}
    >
      {/* Nivel */}
      <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-md bg-zinc-800 border border-zinc-600/60 px-2 py-0.5 text-xs font-bold text-amber-400">
        {reward.level}
      </span>

      {/* Icono */}
      <a
        href={
          reward.wowhead_id
            ? `https://www.wowhead.com/item=${reward.wowhead_id}`
            : "#"
        }
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-zinc-900 rounded-lg mt-1"
        data-wowhead={reward.wowhead_id ?? reward.core_item_id ? `item=${reward.wowhead_id ?? reward.core_item_id}` : undefined}
      >
        <img
          src={reward.image_url || DEFAULT_IMAGE}
          alt={reward.name}
          className="h-16 w-16 rounded-lg border border-zinc-600/60 object-cover sm:h-20 sm:w-20"
        />
        <span className="mt-2 max-w-[120px] truncate text-center text-xs font-medium text-zinc-200 sm:max-w-[136px] sm:text-sm">
          {reward.name}
        </span>
      </a>

      {/* Acción */}
      <div className="mt-3 min-h-[28px] w-full flex justify-center">
        {canClaim && (
          <button
            type="button"
            disabled={isClaiming}
            onClick={() => onClaim(reward.id)}
            className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-500 disabled:opacity-50 sm:text-sm"
          >
            {isClaiming ? "…" : t("battle-pass.claim")}
          </button>
        )}
        {reward.claimed && (
          <span className="text-xs font-semibold text-emerald-400">
            ✓ {t("battle-pass.claimed")}
          </span>
        )}
        {!reward.unlocked && !reward.claimed && reward.id > 0 && (
          <span className="text-xs text-zinc-500">
            Lv {reward.level}
          </span>
        )}
      </div>
    </div>
  );
};

export default BattlePassRewardCard;

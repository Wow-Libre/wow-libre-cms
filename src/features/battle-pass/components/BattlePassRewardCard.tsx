"use client";

import React from "react";
import type { BattlePassRewardWithStatus } from "../types";

interface BattlePassRewardCardProps {
  reward: BattlePassRewardWithStatus;
  onClaim: (rewardId: number) => void;
  claimingId: number | null;
  t: (key: string) => string;
}

const DEFAULT_IMAGE =
  "https://wow.zamimg.com/images/wow/icons/large/inv_misc_questionmark.jpg";

const BattlePassRewardCard: React.FC<BattlePassRewardCardProps> = ({
  reward,
  onClaim,
  claimingId,
  t,
}) => {
  const canClaim =
    reward.unlocked && !reward.claimed && reward.id > 0;
  const isClaiming = claimingId === reward.id;

  return (
    <div
      className={`relative rounded-xl border-2 p-4 transition-all duration-300 ${
        reward.claimed
          ? "border-emerald-500/50 bg-emerald-900/20"
          : reward.unlocked
            ? "border-amber-500/50 bg-amber-900/20"
            : "border-gray-600 bg-gray-800/40 opacity-75"
      }`}
    >
      <div className="flex flex-col items-center gap-2">
        <span className="absolute -top-2 left-3 rounded bg-gray-800 px-2 py-0.5 text-xs font-bold text-amber-400">
          {t("battle-pass.level")} {reward.level}
        </span>
        <a
          href={
            reward.wowhead_id
              ? `https://www.wowhead.com/item=${reward.wowhead_id}`
              : "#"
          }
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center"
          data-wowhead={`item=${reward.wowhead_id ?? reward.core_item_id}`}
        >
          <img
            src={reward.image_url || DEFAULT_IMAGE}
            alt={reward.name}
            className="h-14 w-14 rounded-lg border border-gray-600 object-cover"
          />
          <span className="mt-1 max-w-[120px] truncate text-center text-sm font-medium text-white">
            {reward.name}
          </span>
        </a>
        {canClaim && (
          <button
            type="button"
            disabled={isClaiming}
            onClick={() => onClaim(reward.id)}
            className="mt-1 rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-amber-500 disabled:opacity-50"
          >
            {isClaiming ? t("battle-pass.claiming") : t("battle-pass.claim")}
          </button>
        )}
        {reward.claimed && (
          <span className="text-xs font-medium text-emerald-400">
            {t("battle-pass.claimed")}
          </span>
        )}
        {!reward.unlocked && !reward.claimed && (
          <span className="text-xs text-gray-400">
            {t("battle-pass.unlock-at-level")} {reward.level}
          </span>
        )}
      </div>
    </div>
  );
};

export default BattlePassRewardCard;

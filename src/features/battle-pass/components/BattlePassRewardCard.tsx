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
    ? "border-emerald-500/60 bg-emerald-950/40 shadow-emerald-500/20"
    : reward.unlocked
      ? "border-amber-500/50 bg-amber-950/20 shadow-amber-500/15 hover:border-amber-400/60"
      : "border-slate-600/80 bg-slate-900/60 opacity-80";

  return (
    <div
      className={`relative flex w-[88px] shrink-0 flex-col items-center rounded-xl border-2 p-2 transition-all duration-200 sm:w-[100px] ${stateStyle} ${
        isCurrentLevel ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-950 shadow-[0_0_16px_rgba(251,191,36,0.35)]" : ""
      }`}
    >
      {/* Nivel */}
      <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 rounded-md bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">
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
        className="flex flex-col items-center outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900 rounded-lg"
        data-wowhead={reward.wowhead_id ?? reward.core_item_id ? `item=${reward.wowhead_id ?? reward.core_item_id}` : undefined}
      >
        <img
          src={reward.image_url || DEFAULT_IMAGE}
          alt={reward.name}
          className="h-12 w-12 rounded-lg border border-slate-600/80 object-cover sm:h-14 sm:w-14"
        />
        <span className="mt-1 max-w-[84px] truncate text-center text-[10px] font-medium text-white sm:max-w-[92px] sm:text-xs">
          {reward.name}
        </span>
      </a>

      {/* Acción */}
      <div className="mt-1.5 min-h-[24px] w-full flex justify-center">
        {canClaim && (
          <button
            type="button"
            disabled={isClaiming}
            onClick={() => onClaim(reward.id)}
            className="rounded-md bg-amber-600 px-2 py-1 text-[10px] font-bold text-white shadow-lg shadow-amber-900/50 hover:bg-amber-500 disabled:opacity-50 sm:text-xs"
          >
            {isClaiming ? "…" : t("battle-pass.claim")}
          </button>
        )}
        {reward.claimed && (
          <span className="text-[10px] font-semibold text-emerald-400">
            ✓ {t("battle-pass.claimed")}
          </span>
        )}
        {!reward.unlocked && !reward.claimed && reward.id > 0 && (
          <span className="text-[9px] text-gray-500">
            Lv {reward.level}
          </span>
        )}
      </div>
    </div>
  );
};

export default BattlePassRewardCard;

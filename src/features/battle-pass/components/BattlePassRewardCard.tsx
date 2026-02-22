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

  const stateStyles = reward.claimed
    ? "border-emerald-400/60 bg-gradient-to-b from-emerald-900/50 to-slate-800/90 shadow-[0_0_16px_rgba(52,211,153,0.2)]"
    : reward.unlocked
      ? "border-blue-400/50 bg-gradient-to-b from-slate-800/95 to-slate-900/95 hover:border-amber-400/60 hover:shadow-[0_0_20px_rgba(251,191,36,0.15)]"
      : "border-slate-600/50 bg-gradient-to-b from-slate-800/70 to-slate-900/90 opacity-85";

  return (
    <div
      className={`relative flex w-[140px] shrink-0 flex-col items-center rounded-xl border-2 p-3 transition-all duration-200 sm:w-[160px] sm:p-4 ${stateStyles} ${
        isCurrentLevel
          ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900 scale-[1.02] shadow-[0_0_24px_rgba(251,191,36,0.35)] border-amber-400/80"
          : ""
      }`}
    >
      {/* Badge de nivel (siempre visible, alto contraste) */}
      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-lg bg-slate-900 border-2 border-blue-500/50 px-2.5 py-1 text-sm font-black text-white shadow-lg min-w-[32px] text-center">
        {reward.level}
      </span>

      {/* Contenedor del icono con marco tipo “premium” */}
      <a
        href={
          reward.wowhead_id
            ? `https://www.wowhead.com/item=${reward.wowhead_id}`
            : "#"
        }
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900 rounded-lg mt-2"
        data-wowhead={reward.wowhead_id ?? reward.core_item_id ? `item=${reward.wowhead_id ?? reward.core_item_id}` : undefined}
      >
        <div className="relative rounded-xl border-2 border-slate-600/70 bg-slate-900/80 p-1 shadow-inner">
          <img
            src={reward.image_url || DEFAULT_IMAGE}
            alt={reward.name}
            className="h-16 w-16 rounded-lg object-cover sm:h-20 sm:w-20"
          />
        </div>
        <span className="mt-2 max-w-[120px] sm:max-w-[140px] truncate text-center text-xs font-semibold text-white drop-shadow-sm sm:text-sm">
          {reward.name}
        </span>
      </a>

      {/* Acción: CTA tipo “GET REWARD” en amarillo */}
      <div className="mt-3 min-h-[32px] w-full flex justify-center">
        {canClaim && (
          <button
            type="button"
            disabled={isClaiming}
            onClick={() => onClaim(reward.id)}
            className="rounded-lg bg-gradient-to-b from-amber-500 to-amber-600 px-4 py-2 text-xs font-bold text-slate-900 shadow-[0_0_12px_rgba(251,191,36,0.4)] hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 sm:text-sm"
          >
            {isClaiming ? "…" : t("battle-pass.claim")}
          </button>
        )}
        {reward.claimed && (
          <span className="text-xs font-bold text-emerald-300 drop-shadow-sm">
            ✓ {t("battle-pass.claimed")}
          </span>
        )}
        {!reward.unlocked && !reward.claimed && reward.id > 0 && (
          <span className="text-xs font-medium text-slate-500">
            Lv {reward.level}
          </span>
        )}
      </div>
    </div>
  );
};

export default BattlePassRewardCard;

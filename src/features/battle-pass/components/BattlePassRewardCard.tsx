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

/** Ícono gris para slots vacíos: mejor contraste que rojo sobre oscuro */
const EMPTY_SLOT_ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' fill='none'%3E%3Crect width='64' height='64' rx='8' fill='%23334155'/%3E%3Ctext x='32' y='42' font-size='32' font-weight='bold' fill='%2394a3b8' text-anchor='middle'%3E?%3C/text%3E%3C/svg%3E";

const BattlePassRewardCard: React.FC<BattlePassRewardCardProps> = ({
  reward,
  onClaim,
  claimingId,
  t,
  isCurrentLevel = false,
}) => {
  const canClaim = reward.unlocked && !reward.claimed && reward.id > 0;
  const isClaiming = claimingId === reward.id;
  const isEmpty = !reward.image_url && reward.id === 0;
  const iconSrc = isEmpty ? EMPTY_SLOT_ICON : (reward.image_url || DEFAULT_IMAGE);

  const stateStyles = reward.claimed
    ? "border-emerald-400/70 bg-slate-800 shadow-[0_0_20px_rgba(52,211,153,0.25)]"
    : reward.unlocked
      ? "border-blue-400/60 bg-slate-800 hover:border-amber-400/70 hover:shadow-[0_0_24px_rgba(251,191,36,0.2)]"
      : "border-slate-500/60 bg-slate-800/90 opacity-90";

  return (
    <div
      className={`relative flex w-[176px] shrink-0 flex-col items-center rounded-2xl border-2 p-4 transition-all duration-200 sm:w-[200px] sm:p-5 ${stateStyles} ${
        isCurrentLevel
          ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900 scale-[1.03] shadow-[0_0_28px_rgba(251,191,36,0.4)] border-amber-400"
          : ""
      }`}
    >
      {/* Badge de nivel: fondo sólido, texto blanco */}
      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-lg bg-slate-900 border-2 border-slate-500 px-3 py-1.5 text-base font-black text-white shadow-xl min-w-[40px] text-center">
        {reward.level}
      </span>

      {/* Icono + nombre sobre fondo oscuro para contraste */}
      <a
        href={
          reward.wowhead_id
            ? `https://www.wowhead.com/item=${reward.wowhead_id}`
            : "#"
        }
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900 rounded-xl mt-3 w-full"
        data-wowhead={reward.wowhead_id ?? reward.core_item_id ? `item=${reward.wowhead_id ?? reward.core_item_id}` : undefined}
      >
        <div className="rounded-xl border-2 border-slate-600 bg-slate-900 p-1.5 shadow-inner">
          <img
            src={iconSrc}
            alt={reward.name}
            className="h-20 w-20 rounded-lg object-cover sm:h-24 sm:w-24"
          />
        </div>
        {/* Franja con fondo sólido para que el texto siempre se lea */}
        <div className="mt-3 w-full rounded-lg bg-slate-900/95 px-2 py-2 min-h-[44px] flex items-center justify-center">
          <span
            className="text-sm sm:text-base font-bold text-white text-center line-clamp-2 break-words"
            style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}
          >
            {reward.name}
          </span>
        </div>
      </a>

      {/* Acción: botón o estado siempre legible */}
      <div className="mt-3 min-h-[40px] w-full flex justify-center items-center">
        {canClaim && (
          <button
            type="button"
            disabled={isClaiming}
            onClick={() => onClaim(reward.id)}
            className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-slate-900 shadow-lg hover:bg-amber-400 disabled:opacity-50"
          >
            {isClaiming ? "…" : t("battle-pass.claim")}
          </button>
        )}
        {reward.claimed && (
          <span className="text-sm font-bold text-emerald-200" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>
            ✓ {t("battle-pass.claimed")}
          </span>
        )}
        {!reward.unlocked && !reward.claimed && reward.id > 0 && (
          <span className="text-sm font-semibold text-slate-300">
            Lv {reward.level}
          </span>
        )}
      </div>
    </div>
  );
};

export default BattlePassRewardCard;

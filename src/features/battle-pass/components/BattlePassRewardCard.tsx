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
    ? "border-emerald-400/70 bg-slate-800/95 shadow-[0_4px_24px_rgba(0,0,0,0.4),0_0_24px_rgba(52,211,153,0.2)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_32px_rgba(52,211,153,0.25)]"
    : reward.unlocked
      ? "border-blue-400/60 bg-slate-800/95 shadow-[0_4px_24px_rgba(0,0,0,0.4),0_0_16px_rgba(59,130,246,0.15)] hover:border-amber-400/80 hover:shadow-[0_12px_40px_rgba(0,0,0,0.45),0_0_28px_rgba(251,191,36,0.25)] hover:-translate-y-0.5"
      : "border-slate-500/60 bg-slate-800/90 opacity-90 shadow-[0_4px_20px_rgba(0,0,0,0.35)]";

  return (
    <div
      className={`group relative flex w-[220px] shrink-0 flex-col items-center rounded-2xl border-2 p-5 transition-all duration-300 ease-out sm:w-[260px] sm:p-6 md:w-[280px] md:p-6 ${stateStyles} ${
        isCurrentLevel
          ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900 scale-[1.03] shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_32px_rgba(251,191,36,0.35)] border-amber-400 animate-battle-pass-glow"
          : "hover:scale-[1.02]"
      }`}
    >
      {/* Badge de nivel */}
      <span className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 rounded-xl border-2 border-slate-500 bg-slate-900 px-4 py-2 text-center text-lg font-black text-white shadow-[0_4px_12px_rgba(0,0,0,0.6)] min-w-[48px] transition-transform duration-300 group-hover:scale-105">
        {reward.level}
      </span>

      {/* Icono + nombre */}
      <a
        href={
          reward.wowhead_id
            ? `https://www.wowhead.com/item=${reward.wowhead_id}`
            : "#"
        }
        target="_blank"
        rel="noopener noreferrer"
        className="group/icon flex flex-col items-center outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900 rounded-xl mt-5 w-full transition-transform duration-300 hover:scale-[1.02]"
        data-wowhead={reward.wowhead_id ?? reward.core_item_id ? `item=${reward.wowhead_id ?? reward.core_item_id}` : undefined}
      >
        <div className="rounded-xl border-2 border-slate-600 bg-slate-900 p-2 shadow-[inset_0_2px_8px_rgba(0,0,0,0.4),0_4px_12px_rgba(0,0,0,0.3)] transition-shadow duration-300 group-hover/icon:shadow-[inset_0_2px_8px_rgba(0,0,0,0.4),0_6px_16px_rgba(0,0,0,0.4)]">
          <img
            src={iconSrc}
            alt={reward.name}
            className="h-28 w-28 rounded-lg object-cover sm:h-32 sm:w-32 md:h-36 md:w-36 transition-transform duration-300 group-hover/icon:scale-105"
          />
        </div>
        <div className="mt-4 w-full rounded-lg bg-slate-900/95 px-3 py-3 min-h-[56px] flex items-center justify-center shadow-inner border border-slate-700/50">
          <span
            className="text-base sm:text-lg font-bold text-white text-center line-clamp-2 break-words"
            style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}
          >
            {reward.name}
          </span>
        </div>
      </a>

      {/* Acción: botón o estado */}
      <div className="mt-4 min-h-[52px] w-full flex justify-center items-center">
        {canClaim && (
          <button
            type="button"
            disabled={isClaiming}
            onClick={() => onClaim(reward.id)}
            className="relative overflow-hidden rounded-2xl px-8 py-3.5 text-base font-extrabold tracking-wide text-amber-950 transition-all duration-200 disabled:pointer-events-none disabled:opacity-60
              bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600
              shadow-[0_1px_0_0_rgba(255,255,255,0.3)_inset,0_4px_0_0_rgba(180,83,9,0.5),0_6px_20px_rgba(251,191,36,0.4)]
              hover:from-amber-300 hover:via-amber-400 hover:to-amber-500
              hover:shadow-[0_1px_0_0_rgba(255,255,255,0.4)_inset,0_6px_0_0_rgba(180,83,9,0.5),0_10px_28px_rgba(251,191,36,0.5)]
              hover:-translate-y-0.5
              active:translate-y-0.5 active:shadow-[0_2px_0_0_rgba(180,83,9,0.6),0_2px_12px_rgba(251,191,36,0.3)]
              active:from-amber-500 active:via-amber-600 active:to-amber-600"
          >
            {/* Brillo sutil en la parte superior */}
            <span className="absolute inset-x-0 top-0 h-1/2 rounded-t-2xl bg-gradient-to-b from-white/25 to-transparent pointer-events-none" aria-hidden />
            {isClaiming ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-amber-950 border-t-transparent" aria-hidden />
                {t("battle-pass.claiming")}
              </span>
            ) : (
              <span className="relative flex items-center justify-center gap-2 drop-shadow-sm">
                <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {t("battle-pass.claim")}
              </span>
            )}
          </button>
        )}
        {reward.claimed && (
          <span className="text-base font-bold text-emerald-200" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>
            ✓ {t("battle-pass.claimed")}
          </span>
        )}
        {!reward.unlocked && !reward.claimed && reward.id > 0 && (
          <span className="text-base font-semibold text-slate-300">
            Lv {reward.level}
          </span>
        )}
      </div>
    </div>
  );
};

export default BattlePassRewardCard;

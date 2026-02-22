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

/** Ícono gris para slots vacíos */
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

  const cardBase =
    "group relative flex w-[200px] shrink-0 flex-col rounded-xl overflow-hidden transition-all duration-300 ease-out sm:w-[220px]";
  const cardVariant = reward.claimed
    ? "bg-slate-800/80 border border-emerald-500/30 shadow-lg shadow-emerald-900/10"
    : reward.unlocked
      ? "bg-slate-800/90 border border-slate-600/80 shadow-xl shadow-slate-900/50 hover:border-amber-500/40 hover:shadow-amber-900/20"
      : "bg-slate-800/70 border border-slate-600/50 opacity-85";
  const cardCurrent = isCurrentLevel
    ? "ring-2 ring-amber-400/80 ring-offset-2 ring-offset-slate-900 scale-[1.02] border-amber-500/50"
    : "";

  return (
    <div className={`${cardBase} ${cardVariant} ${cardCurrent}`}>
      {/* Barra superior con nivel */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900/80 border-b border-slate-700/60">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {t("battle-pass.level")}
        </span>
        <span className="text-sm font-bold tabular-nums text-white bg-slate-700/80 px-2.5 py-0.5 rounded-md">
          {reward.level}
        </span>
      </div>

      {/* Contenedor del ítem */}
      <a
        href={
          reward.wowhead_id
            ? `https://www.wowhead.com/item=${reward.wowhead_id}`
            : "#"
        }
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center pt-4 pb-3 px-4 outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded-b-xl"
        data-wowhead={
          reward.wowhead_id ?? reward.core_item_id
            ? `item=${reward.wowhead_id ?? reward.core_item_id}`
            : undefined
        }
      >
        <div
          className={`relative rounded-xl overflow-hidden ring-2 transition-all duration-200 ${
            reward.claimed
              ? "ring-emerald-500/50 bg-slate-900"
              : reward.unlocked
                ? "ring-slate-600 bg-slate-900 group-hover:ring-amber-500/40"
                : "ring-slate-700 bg-slate-900"
          }`}
        >
          <img
            src={iconSrc}
            alt={reward.name}
            className={`object-cover w-28 h-28 sm:w-32 sm:h-32 ${
              !reward.unlocked && reward.id > 0 ? "opacity-50 grayscale" : ""
            }`}
          />
          {reward.claimed && (
            <div className="absolute inset-0 flex items-center justify-center bg-emerald-900/40">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/90 text-white">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
            </div>
          )}
        </div>
        <p className="mt-4 text-center text-sm font-semibold text-white line-clamp-2 min-h-[2.75rem] leading-snug">
          {reward.name}
        </p>
      </a>

      {/* Pie: botón o estado */}
      <div className="mt-auto border-t border-slate-700/60 bg-slate-900/60 px-3 py-3">
        {canClaim && (
          <button
            type="button"
            disabled={isClaiming}
            onClick={() => onClaim(reward.id)}
            className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isClaiming ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" aria-hidden />
                <span>{t("battle-pass.claiming")}</span>
              </>
            ) : (
              <>
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>{t("battle-pass.claim")}</span>
              </>
            )}
          </button>
        )}
        {reward.claimed && (
          <p className="text-center text-sm font-medium text-emerald-400/90">
            {t("battle-pass.claimed")}
          </p>
        )}
        {!reward.unlocked && !reward.claimed && reward.id > 0 && (
          <p className="text-center text-xs font-medium text-slate-500">
            {t("battle-pass.unlock-at-level")} {reward.level}
          </p>
        )}
      </div>
    </div>
  );
};

export default BattlePassRewardCard;

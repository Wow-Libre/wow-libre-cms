"use client";

import React from "react";
import { FaLock } from "react-icons/fa";
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
  const isEmpty = !reward.image_url && reward.id === 0;
  const iconSrc = reward.image_url || DEFAULT_IMAGE;

  const headerBg = reward.claimed ? "bg-emerald-950/40" : reward.unlocked ? "bg-slate-900/90" : "bg-slate-900/70";
  const accentColor = reward.claimed ? "bg-emerald-500" : reward.unlocked ? "bg-amber-500" : "bg-slate-600";
  const cardBase =
    "group relative flex w-[200px] shrink-0 flex-col rounded-2xl overflow-hidden border border-slate-600/70 bg-slate-800/95 shadow-xl shadow-black/30 transition-all duration-200 sm:w-[232px] max-sm:w-full max-sm:min-w-0 max-sm:max-w-[200px] max-sm:mx-auto max-sm:shrink";
  const cardVariant = reward.claimed
    ? "border-emerald-500/40 shadow-emerald-950/25"
    : reward.unlocked
      ? "hover:border-amber-500/50 hover:shadow-amber-950/20"
      : "opacity-90";
  const cardCurrent = isCurrentLevel
    ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900 scale-[1.02] border-amber-500/60"
    : "";

  return (
    <div className={`${cardBase} ${cardVariant} ${cardCurrent}`}>
      {/* Franja superior: punto de acento + nivel */}
      <div className={`flex items-center justify-between gap-2 px-4 py-2.5 border-b border-slate-700/50 ${headerBg}`}>
        <div className={`h-1.5 w-8 rounded-full ${accentColor}`} aria-hidden />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {t("battle-pass.level")}
        </span>
        <span className="text-base font-bold tabular-nums text-white bg-slate-700 px-3 py-1 rounded-lg min-w-[44px] text-center">
          {reward.level}
        </span>
      </div>

      {/* Contenedor del ítem: enlace solo si hay premio; sin premio no es clicable */}
      {isEmpty ? (
        <div
          className="flex flex-col items-center pt-5 pb-4 px-4 rounded-b-2xl cursor-default select-none"
          aria-hidden
        >
          <div className="relative rounded-xl overflow-hidden ring-2 ring-slate-700 bg-slate-900 transition-all duration-200">
            <div className="flex w-28 h-28 sm:w-32 sm:h-32 flex-col items-center justify-center bg-gradient-to-b from-slate-800/95 to-slate-900 ring-2 ring-slate-600/80 rounded-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-700/80 text-slate-500 ring-1 ring-slate-600/60">
                <FaLock className="h-5 w-5" />
              </div>
              <span className="mt-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 sm:text-xs">
                {t("battle-pass.empty-slot")}
              </span>
            </div>
          </div>
          <p className="mt-4 text-center text-sm font-semibold text-slate-500 line-clamp-2 min-h-[2.75rem] leading-snug">
            {reward.name}
          </p>
        </div>
      ) : (
        <a
          href={
            reward.wowhead_id
              ? `https://www.wowhead.com/item=${reward.wowhead_id}`
              : "#"
          }
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center pt-5 pb-4 px-4 outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded-b-2xl"
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
      )}

      {/* Pie: botón outline o estado */}
      <div className="mt-auto border-t border-slate-700/60 bg-slate-900/50 px-4 py-3">
        {canClaim && (
          <button
            type="button"
            disabled={isClaiming}
            onClick={() => onClaim(reward.id)}
            className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 px-4 text-sm font-medium text-white bg-slate-800 border border-slate-600 shadow-sm hover:bg-slate-700 hover:border-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isClaiming ? (
              <>
                <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-slate-500 border-t-amber-400" aria-hidden />
                <span className="text-slate-200">{t("battle-pass.claiming")}</span>
              </>
            ) : (
              <>
                <svg className="h-4 w-4 shrink-0 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
                <span>{t("battle-pass.claim")}</span>
              </>
            )}
          </button>
        )}
        {reward.claimed && (
          <p className="text-center text-sm font-semibold text-emerald-400">
            ✓ {t("battle-pass.claimed")}
          </p>
        )}
        {!reward.unlocked && !reward.claimed && reward.id > 0 && (
          <p className="text-center text-sm font-medium text-slate-500">
            {t("battle-pass.unlock-at-level")} {reward.level}
          </p>
        )}
      </div>
    </div>
  );
};

export default BattlePassRewardCard;

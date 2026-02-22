"use client";

import React, { useRef, useEffect } from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import LoadingSpinner from "@/components/utilities/loading-spinner";
import { useBattlePass } from "../hooks/useBattlePass";
import type { BattlePassViewProps, BattlePassRewardWithStatus } from "../types";
import BattlePassRewardCard from "./BattlePassRewardCard";

const MAX_LEVEL = 80;

const responsive = {
  desktop: { breakpoint: { max: 4000, min: 1024 }, items: 4 },
  tablet: { breakpoint: { max: 1024, min: 640 }, items: 3 },
  mobile: { breakpoint: { max: 640, min: 0 }, items: 2 },
};

const CarouselArrow: React.FC<{
  direction: "left" | "right";
  onClick?: () => void;
  carouselState?: { currentSlide: number; totalItems: number; slidesToShow?: number };
}> = ({ direction, onClick, carouselState }) => {
  const atStart = carouselState?.currentSlide === 0;
  const slidesToShow = carouselState?.slidesToShow ?? 1;
  const atEnd =
    carouselState != null &&
    carouselState.currentSlide >= carouselState.totalItems - slidesToShow;
  const disabled = direction === "left" ? atStart : atEnd;
  return (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={direction === "left" ? "Anterior" : "Siguiente"}
    className="absolute top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-slate-600 bg-slate-800/95 text-slate-200 shadow-lg transition-colors hover:border-amber-500/50 hover:bg-slate-700/95 hover:text-amber-400 disabled:pointer-events-none disabled:opacity-40"
    style={{ [direction]: "0.5rem" }}
  >
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      {direction === "left" ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      )}
    </svg>
  </button>
  );
};

const BattlePassView: React.FC<BattlePassViewProps> = ({
  token,
  serverId,
  accountId,
  characterId,
  characterLevel,
  t,
}) => {
  const carouselRef = useRef<Carousel | null>(null);
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

  const byLevel = new Map(rewardsWithStatus.map((r) => [r.level, r]));
  const allLevels: BattlePassRewardWithStatus[] = [];
  for (let l = 1; l <= MAX_LEVEL; l++) {
    allLevels.push(
      byLevel.get(l) ?? {
        id: 0,
        season_id: season?.id ?? 0,
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

  useEffect(() => {
    if (!season || loading || !carouselRef.current) return;
    carouselRef.current.goToSlide(characterLevel - 1, true);
  }, [season, characterLevel, loading]);

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
        <p className="text-red-300 font-medium">{error}</p>
        <button
          type="button"
          onClick={refresh}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
        >
          {t("battle-pass.retry")}
        </button>
      </div>
    );
  }

  if (!season) {
    return (
      <div className="rounded-xl border border-blue-500/20 bg-gradient-to-b from-slate-900 via-blue-950/20 to-slate-900 p-10 text-center shadow-xl">
        <h2 className="mb-2 text-2xl font-bold text-white">
          {t("battle-pass.no-season.title")}
        </h2>
        <p className="text-blue-200/80">{t("battle-pass.no-season.subtitle")}</p>
      </div>
    );
  }

  const startDate = new Date(season.start_date).toLocaleDateString();
  const endDate = new Date(season.end_date).toLocaleDateString();
  const progressPercent = Math.min(100, (characterLevel / MAX_LEVEL) * 100);

  return (
    <div className="rounded-xl border border-blue-500/25 bg-gradient-to-b from-slate-900 via-blue-950/40 to-slate-900 shadow-2xl overflow-hidden">
      {/* Header estilo Fortnite: temporada grande, nivel en amarillo */}
      <div className="relative border-b border-blue-500/30 bg-gradient-to-r from-blue-950/60 via-slate-900 to-blue-950/60 px-6 py-5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(59,130,246,0.08),transparent)]" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">
              {t("battle-pass.season-label")}
            </p>
            <h2 className="mt-1 text-2xl sm:text-3xl font-black text-white tracking-tight">
              {season.name}
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-300">
              {startDate} – {endDate}
            </p>
          </div>
          <div className="flex items-center gap-5">
            <div className="rounded-xl bg-slate-800 border border-slate-600 px-5 py-3 min-w-[100px] text-center shadow-lg">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {t("battle-pass.your-level")}
              </p>
              <p className="mt-0.5 text-2xl font-black text-amber-400 tabular-nums">
                {characterLevel}
                <span className="text-base font-semibold text-slate-400">/{MAX_LEVEL}</span>
              </p>
            </div>
            <div className="hidden sm:block w-48">
              <div className="mb-1.5 flex justify-between text-xs font-semibold text-slate-300">
                <span>{t("battle-pass.progress")}</span>
                <span className="text-amber-400 font-bold">{Math.round(progressPercent)}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-700/80 border border-blue-500/20">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_10px_rgba(251,191,36,0.5)] transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Carrusel de niveles */}
      <div className="relative px-4 py-6">
        <Carousel
          ref={carouselRef}
          responsive={responsive}
          infinite={false}
          draggable
          swipeable
          keyBoardControl
          transitionDuration={400}
          containerClass="battle-pass-carousel-container scrollbar-hide"
          sliderClass="battle-pass-carousel-slider"
          itemClass="battle-pass-carousel-item flex justify-center px-2"
          showDots={false}
          customLeftArrow={<CarouselArrow direction="left" />}
          customRightArrow={<CarouselArrow direction="right" />}
          arrows
        >
          {allLevels.map((reward) => (
            <div key={reward.level} data-level={reward.level}>
              <BattlePassRewardCard
                reward={reward}
                onClaim={handleClaim}
                claimingId={claimingId}
                t={t}
                isCurrentLevel={reward.level === characterLevel}
              />
            </div>
          ))}
        </Carousel>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => carouselRef.current?.goToSlide(characterLevel - 1, true)}
            className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-400 transition-colors hover:bg-amber-500/20"
          >
            {t("battle-pass.go-to-my-level")}
          </button>
          <span className="text-sm font-medium text-slate-400 tabular-nums">
            {t("battle-pass.level")} <span className="font-bold text-white">{characterLevel}</span> / {MAX_LEVEL}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BattlePassView;

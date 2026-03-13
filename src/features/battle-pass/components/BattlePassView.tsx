"use client";

import React, { useRef, useEffect } from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import LoadingSpinner from "@/components/utilities/loading-spinner";
import { FaCalendarCheck, FaGift } from "react-icons/fa";
import { useBattlePass } from "../hooks/useBattlePass";
import type { BattlePassViewProps, BattlePassRewardWithStatus } from "../types";
import BattlePassRewardCard from "./BattlePassRewardCard";

const MAX_LEVEL = 80;

const responsive = {
  desktop: { breakpoint: { max: 4000, min: 1024 }, items: 4 },
  tablet: { breakpoint: { max: 1024, min: 640 }, items: 3 },
  mobile: { breakpoint: { max: 640, min: 0 }, items: 1 },
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
      <div className="relative overflow-hidden rounded-xl border border-slate-600/60 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-900 shadow-xl">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.04)_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="relative flex min-h-[380px] flex-col items-center justify-center px-6 py-12 text-center sm:px-10 sm:py-16">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 ring-1 ring-amber-500/30 shadow-lg shadow-amber-500/5">
            <FaGift className="h-10 w-10 text-amber-400/90" />
          </div>
          <h2 className="mb-3 text-xl font-bold tracking-tight text-white sm:text-2xl">
            {t("battle-pass.no-season.title")}
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-slate-400 sm:text-base">
            {t("battle-pass.no-season.subtitle")}
          </p>
          <div className="mt-6 flex items-center gap-2 rounded-full border border-slate-600/60 bg-slate-800/50 px-4 py-2 text-xs font-medium text-slate-500">
            <FaCalendarCheck className="h-3.5 w-3.5 text-slate-400" />
            {t("battle-pass.no-season.hint")}
          </div>
        </div>
      </div>
    );
  }

  const startDate = new Date(season.start_date).toLocaleDateString();
  const endDate = new Date(season.end_date).toLocaleDateString();
  const progressPercent = Math.min(100, (characterLevel / MAX_LEVEL) * 100);

  return (
    <div className="rounded-2xl border border-slate-600/50 bg-gradient-to-b from-slate-900 via-slate-900/98 to-slate-900 shadow-2xl overflow-hidden">
      {/* Header: temporada + nivel y progreso */}
      <div className="relative border-b border-slate-600/50 bg-slate-900/95 px-5 py-5 sm:px-6 sm:py-6">
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              {t("battle-pass.season-label")}
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {season.name}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {startDate} – {endDate}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-xl border border-slate-600/50 bg-slate-800/60 px-4 py-2.5 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {t("battle-pass.your-level")}
              </p>
              <p className="mt-0.5 text-xl font-bold tabular-nums text-white">
                {characterLevel}<span className="font-medium text-slate-400">/{MAX_LEVEL}</span>
              </p>
            </div>
            <div className="w-24 sm:w-28">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {t("battle-pass.progress")} {Math.round(progressPercent)}%
              </p>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-700">
                <div
                  className="h-full rounded-full bg-slate-400 transition-all duration-500"
                  style={{ width: `${Math.max(progressPercent, 2)}%` }}
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
          containerClass="battle-pass-carousel-container scrollbar-hide overflow-hidden"
          sliderClass="battle-pass-carousel-slider"
          itemClass="battle-pass-carousel-item flex min-w-0 justify-center px-2"
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

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <div className="inline-flex rounded-xl border border-slate-600/50 bg-slate-800/50 p-1">
            <button
              type="button"
              onClick={() => carouselRef.current?.goToSlide(0, true)}
              className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-700/80 hover:text-white"
            >
              {t("battle-pass.go-to-start")}
            </button>
            <button
              type="button"
              onClick={() => carouselRef.current?.goToSlide(characterLevel - 1, true)}
              className="rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-600/80"
            >
              {t("battle-pass.go-to-my-level")}
            </button>
            <button
              type="button"
              onClick={() => carouselRef.current?.goToSlide(MAX_LEVEL - 1, true)}
              className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-700/80 hover:text-white"
            >
              {t("battle-pass.go-to-end")}
            </button>
          </div>
          <span className="text-sm font-medium tabular-nums text-slate-500">
            {t("battle-pass.level")} <span className="font-semibold text-white">{characterLevel}</span> / {MAX_LEVEL}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BattlePassView;

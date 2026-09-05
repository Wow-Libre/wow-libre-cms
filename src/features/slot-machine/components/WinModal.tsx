"use client";

import React, { useEffect, useState } from "react";
import WowheadTooltip from "@/utils/wowhead";
import { WinModalProps } from "../types";

const FALLBACK_ICON =
  "https://wow.zamimg.com/images/wow/icons/large/inv_misc_questionmark.jpg";

function wowheadHref(name: string): string | null {
  const trimmed = name.trim();
  if (/^\d+$/.test(trimmed)) {
    return `https://www.wowhead.com/item=${trimmed}`;
  }
  return `https://www.wowhead.com/item=${encodeURIComponent(trimmed)}`;
}

export const WinModal: React.FC<WinModalProps> = ({ show, data, onClose }) => {
  const [iconSrc, setIconSrc] = useState(data?.logo || FALLBACK_ICON);

  useEffect(() => {
    setIconSrc(data?.logo || FALLBACK_ICON);
  }, [data?.logo]);

  useEffect(() => {
    if (!show) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [show, onClose]);

  if (!show || !data) return null;

  const itemHref = wowheadHref(data.name);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="roulette-win-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[#020617]/80 backdrop-blur-sm"
        aria-label="Cerrar"
        onClick={onClose}
      />

      <div className="roulette-win-card relative w-full max-w-md overflow-hidden rounded-3xl border border-amber-400/35 bg-gradient-to-b from-[#2a1c12] via-[#16120e] to-[#0b0a09] text-center shadow-[0_28px_80px_-24px_rgba(212,175,55,0.55)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.28),transparent_70%)]" />
        <div className="pointer-events-none absolute -left-10 top-10 h-40 w-16 rotate-12 bg-white/10 roulette-win-shine" />

        <div className="relative px-6 pb-8 pt-8 sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-300/80">
            Ruleta · casilla verde
          </p>
          <h2
            id="roulette-win-title"
            className="mt-2 text-4xl font-semibold tracking-tight text-amber-50"
          >
            ¡Premio!
          </h2>
          <p className="mt-2 text-base text-stone-300">
            La rueda se detuvo en PREMIO. El ítem quedó en tu personaje.
          </p>

          <div className="relative mx-auto mt-7 w-fit">
            <div className="absolute -inset-3 rounded-[1.6rem] bg-[radial-gradient(circle,rgba(250,204,21,0.28),transparent_70%)]" />
            <div className="relative overflow-hidden rounded-2xl border border-amber-300/50 bg-[#0b0a09] p-2 shadow-[0_0_40px_rgba(212,175,55,0.25)]">
              <img
                src={iconSrc}
                alt={data.name}
                className="h-36 w-36 rounded-xl object-cover sm:h-40 sm:w-40"
                onError={() => setIconSrc(FALLBACK_ICON)}
              />
            </div>
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-emerald-400/40 bg-emerald-950/90 px-3 py-1 text-sm font-bold uppercase tracking-[0.12em] text-emerald-200">
              PREMIO
            </span>
          </div>

          <div className="mt-8 space-y-2">
            {itemHref ? (
              <a
                className="inline-block text-xl font-semibold text-amber-200 underline-offset-4 transition hover:text-amber-100 hover:underline"
                href={itemHref}
                target="_blank"
                rel="noopener noreferrer"
                data-game="wow"
                data-type="item"
                data-wh-icon-added="true"
              >
                {data.name}
              </a>
            ) : (
              <p className="text-lg font-semibold text-amber-100">{data.name}</p>
            )}
            {data.type ? (
              <p className="text-base font-semibold uppercase tracking-[0.12em] text-stone-400">
                {data.type}
              </p>
            ) : null}
            {data.message ? (
              <p className="mx-auto max-w-sm text-base leading-relaxed text-stone-200">
                {data.message}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-base font-semibold text-[#1a120c] shadow-[0_10px_30px_-12px_rgba(245,158,11,0.85)] transition hover:brightness-110"
          >
            Recoger premio
          </button>
        </div>
      </div>
      <WowheadTooltip />
    </div>
  );
};

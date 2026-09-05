"use client";

import React, { useEffect } from "react";
import { RouletteWheel } from "./RouletteWheel";
import { SlotMachineLever } from "./SlotMachineLever";
import { SlotMachinePortal } from "./SlotMachinePortal";
import { ROULETTE_SEGMENTS, SPIN_COST } from "../constants";

type RoulettePlayModalProps = {
  show: boolean;
  canClose: boolean;
  balance: number;
  rotation: number;
  isSpinning: boolean;
  result: string | null;
  isToggled: boolean;
  canSpin: boolean;
  onToggle: () => void;
  onClose: () => void;
};

export const RoulettePlayModal: React.FC<RoulettePlayModalProps> = ({
  show,
  canClose,
  balance,
  rotation,
  isSpinning,
  result,
  isToggled,
  canSpin,
  onToggle,
  onClose,
}) => {
  useEffect(() => {
    if (!show) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && canClose) onClose();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [show, canClose, onClose]);

  if (!show) return null;

  return (
    <SlotMachinePortal>
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="roulette-play-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[#020617]/85 backdrop-blur-sm"
        aria-label="Cerrar ruleta"
        disabled={!canClose}
        onClick={() => {
          if (canClose) onClose();
        }}
      />

      <div className="relative max-h-[96vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-amber-400/35 bg-[radial-gradient(ellipse_at_center,#14532d_0%,#052e16_42%,#020617_100%)] shadow-[0_28px_80px_-20px_rgba(0,0,0,0.75)]">
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

        <div className="flex items-start justify-between gap-4 px-6 pt-6 sm:px-10 sm:pt-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-200/80">
              Mesa
            </p>
            <h2
              id="roulette-play-title"
              className="mt-1 text-3xl font-semibold tracking-tight text-amber-50 sm:text-4xl"
            >
              Ruleta de la Fortuna
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={!canClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 text-xl text-stone-200 transition hover:border-amber-400/40 hover:text-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 px-6 sm:px-10">
          <p className="text-base text-stone-300">
            Costo por giro:{" "}
            <span className="font-semibold text-amber-100">{SPIN_COST}</span>
          </p>
          <p className="rounded-full border border-amber-400/25 bg-black/35 px-4 py-1.5 text-base text-amber-100">
            Créditos{" "}
            <span className="font-semibold tabular-nums">{balance}</span>
          </p>
        </div>

        <div className="flex flex-col items-center px-4 py-8 sm:px-10 sm:pb-10">
          <RouletteWheel
            rotation={rotation}
            spinning={isSpinning}
            segments={ROULETTE_SEGMENTS}
            className="max-w-[620px]"
          />

          <div className="mt-8">
            <SlotMachineLever
              isSpinning={isSpinning}
              isToggled={isToggled}
              canSpin={canSpin}
              onToggle={onToggle}
            />
          </div>

          {result ? (
            <p
              className={`mt-6 rounded-full border px-5 py-2 text-base font-medium ${
                result.startsWith("La bola")
                  ? "border-amber-400/40 bg-amber-500/10 text-amber-100"
                  : "border-white/10 bg-black/35 text-stone-200"
              }`}
            >
              {result}
            </p>
          ) : (
            <p className="mt-6 text-center text-base text-emerald-100/80">
              Las casillas verdes dicen PREMIO.
            </p>
          )}
        </div>
      </div>
    </div>
    </SlotMachinePortal>
  );
};

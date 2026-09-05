import React from "react";
import { SlotMachineHeaderProps } from "../types";
import { SPIN_COST } from "../constants";

export const SlotMachineHeader: React.FC<SlotMachineHeaderProps> = ({
  balance,
}) => {
  return (
    <div className="mb-8 overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-r from-[#1a120c] via-[#2a1c12] to-[#12100e] shadow-2xl">
      <div className="flex flex-col gap-6 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-full border border-amber-400/50 bg-[radial-gradient(circle_at_30%_30%,#f4e2a2,#8a6a1a)] text-[#1a120c] shadow-[0_0_24px_rgba(212,175,55,0.35)]">
            <span className="text-2xl" aria-hidden>
              ◆
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-200/80">
              Mesa privada
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-amber-50 sm:text-4xl">
              Ruleta de la Fortuna
            </h1>
            <p className="mt-2 text-base text-stone-300">
              Un crédito por giro. Si cae en PREMIO, ganás.
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-black/30 px-5 py-3 text-right">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-200/70">
            Créditos
          </p>
          <p className="mt-1 text-4xl font-semibold tabular-nums text-amber-100">
            {balance}
          </p>
          <p className="mt-1 text-base text-stone-400">
            Costo por giro: {SPIN_COST}
          </p>
        </div>
      </div>
    </div>
  );
};

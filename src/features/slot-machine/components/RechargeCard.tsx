import React from "react";
import { SPIN_COST } from "../constants";

interface RechargeCardProps {
  onOpenExchange: () => void;
}

export const RechargeCard: React.FC<RechargeCardProps> = ({
  onOpenExchange,
}) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-b from-[#2a1c12] via-[#16120e] to-[#0b0a09] shadow-2xl">
      <div className="h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
      <div className="p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300/80">
          Mesa
        </p>
        <h3 className="mt-1 text-2xl font-semibold tracking-tight text-amber-50">
          Recargar créditos
        </h3>
        <p className="mt-3 text-base leading-relaxed text-stone-300">
          Cada giro cuesta {SPIN_COST} crédito. Canjeá puntos de votación u oro
          de tu personaje para seguir en la ruleta.
        </p>
        <button
          type="button"
          onClick={onOpenExchange}
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 px-4 py-3 text-base font-semibold text-[#1a120c] shadow-[0_10px_30px_-12px_rgba(245,158,11,0.85)] transition hover:brightness-110"
        >
          Intercambiar monedas
        </button>
      </div>
    </div>
  );
};

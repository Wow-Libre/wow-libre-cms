import React from "react";
import { EXCHANGE_RATES, SPIN_COST } from "../constants";

export const ExchangeInfo: React.FC = () => {
  return (
    <div className="overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-b from-[#2a1c12] via-[#16120e] to-[#0b0a09] shadow-2xl">
      <div className="h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
      <div className="p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300/80">
          Tasas
        </p>
        <h3 className="mt-1 text-2xl font-semibold tracking-tight text-amber-50">
          Tipo de cambio
        </h3>
        <p className="mt-2 text-base text-stone-300">
          Lo que recibís al canjear, en créditos de ruleta.
        </p>

        <div className="mt-5 space-y-3">
          <RateRow
            kicker="Votación"
            from="10 pts"
            to="10 créditos"
            hint={`Cambio 1:${EXCHANGE_RATES.voting} · ${SPIN_COST} crédito = 1 giro`}
          />
          <RateRow
            kicker="Oro del personaje"
            from={`${EXCHANGE_RATES.gold} oro`}
            to="1 crédito"
            hint="Se descuenta el oro de la cuenta en juego"
          />
        </div>
      </div>
    </div>
  );
};

function RateRow({
  kicker,
  from,
  to,
  hint,
}: {
  kicker: string;
  from: string;
  to: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-amber-500/15 bg-black/30 p-4">
      <p className="text-sm font-semibold text-amber-200/80">{kicker}</p>
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="text-lg font-medium text-stone-100">{from}</span>
        <span className="text-lg text-amber-400/90">→</span>
        <span className="text-lg font-semibold text-amber-100">{to}</span>
      </div>
      <p className="mt-2 text-sm text-stone-400">{hint}</p>
    </div>
  );
}

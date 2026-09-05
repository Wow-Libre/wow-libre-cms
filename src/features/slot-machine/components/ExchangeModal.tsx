"use client";

import React, { useEffect } from "react";
import { ExchangeModalProps, ExchangeType } from "../types";
import { EXCHANGE_RATES } from "../constants";
import { SlotMachinePortal } from "./SlotMachinePortal";

export const ExchangeModal: React.FC<ExchangeModalProps> = ({
  show,
  exchangeType,
  exchangeAmount,
  exchangeError,
  onClose,
  onExchangeTypeChange,
  onExchangeAmountChange,
  onExchange,
}) => {
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

  if (!show) return null;

  const calculateExchangeResult = (
    amount: number,
    type: ExchangeType,
  ): number => {
    switch (type) {
      case "voting":
        return amount * EXCHANGE_RATES.voting;
      case "gold":
        return amount / EXCHANGE_RATES.gold;
      default:
        return 0;
    }
  };

  const exchangeTypeConfig = {
    voting: {
      label: "Votación",
      rate: `1 pt = ${EXCHANGE_RATES.voting} crédito`,
      placeholder: "Puntos de votación",
      step: "1",
    },
    gold: {
      label: "Oro",
      rate: `${EXCHANGE_RATES.gold} oro = 1 crédito`,
      placeholder: "Cantidad de oro",
      step: String(EXCHANGE_RATES.gold),
    },
  };

  const parsed = parseFloat(exchangeAmount);
  const credits =
    !Number.isNaN(parsed) && parsed > 0
      ? calculateExchangeResult(parsed, exchangeType)
      : 0;

  return (
    <SlotMachinePortal>
    <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-[#020617]/80 backdrop-blur-sm"
        aria-label="Cerrar"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="exchange-title"
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-amber-400/35 bg-gradient-to-b from-[#2a1c12] via-[#16120e] to-[#0b0a09] shadow-[0_28px_80px_-24px_rgba(212,175,55,0.45)]"
      >
        <div className="h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-300/80">
                Caja
              </p>
              <h2
                id="exchange-title"
                className="mt-1 text-3xl font-semibold tracking-tight text-amber-50"
              >
                Intercambiar monedas
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-lg text-stone-400 transition hover:border-amber-400/40 hover:text-amber-100"
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>

          <p className="mt-4 text-base font-semibold text-stone-300">
            Origen
          </p>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {(Object.keys(exchangeTypeConfig) as ExchangeType[]).map((type) => {
              const config = exchangeTypeConfig[type];
              const active = exchangeType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => onExchangeTypeChange(type)}
                  className={`rounded-xl border p-4 text-left transition ${
                    active
                      ? "border-amber-400/50 bg-amber-500/10"
                      : "border-white/10 bg-black/25 hover:border-amber-500/25"
                  }`}
                >
                  <div className="text-lg font-semibold text-amber-50">
                    {config.label}
                  </div>
                  <div className="mt-1 text-sm text-stone-300">{config.rate}</div>
                </button>
              );
            })}
          </div>

          <label className="mt-6 block text-base font-semibold text-stone-300">
            Cantidad
          </label>
          <input
            type="number"
            value={exchangeAmount}
            onChange={(e) => onExchangeAmountChange(e.target.value)}
            placeholder={exchangeTypeConfig[exchangeType].placeholder}
            className="mt-2 w-full rounded-xl border border-amber-500/20 bg-black/40 p-4 text-lg text-amber-50 outline-none placeholder:text-stone-600 focus:border-amber-400/60"
            min="0"
            step={exchangeTypeConfig[exchangeType].step}
          />
          {exchangeError ? (
            <p className="mt-2 text-base text-red-400">{exchangeError}</p>
          ) : null}

          {credits > 0 ? (
            <div className="mt-5 flex items-center justify-between rounded-xl border border-amber-400/25 bg-amber-500/10 px-4 py-3">
              <span className="text-base text-stone-200">Recibirás</span>
              <span className="text-2xl font-semibold tabular-nums text-amber-100">
                {credits.toFixed(2)} créditos
              </span>
            </div>
          ) : null}

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-12 flex-1 rounded-xl border border-white/10 bg-transparent text-base font-medium text-stone-200 transition hover:border-white/20 hover:text-amber-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onExchange}
              className="h-12 flex-1 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-base font-semibold text-[#1a120c] transition hover:brightness-110"
            >
              Intercambiar
            </button>
          </div>
        </div>
      </div>
    </div>
    </SlotMachinePortal>
  );
};

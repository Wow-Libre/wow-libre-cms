"use client";
import React, { useState } from "react";
import { SlotMachineProps } from "../types";
import { useSlotMachine } from "../hooks/useSlotMachine";
import { SlotMachineHeader } from "./SlotMachineHeader";
import { RoulettePlayModal } from "./RoulettePlayModal";
import { WinModal } from "./WinModal";
import { ExchangeModal } from "./ExchangeModal";
import { RechargeCard } from "./RechargeCard";
import { ExchangeInfo } from "./ExchangeInfo";

export const SlotMachine: React.FC<SlotMachineProps> = ({
  serverId,
  characterId,
  accountId,
  token,
  language,
}) => {
  const [playOpen, setPlayOpen] = useState(false);
  const {
    isSpinning,
    result,
    balance,
    showModal,
    modalData,
    isToggled,
    showExchangeModal,
    exchangeType,
    exchangeAmount,
    exchangeError,
    rotation,
    handleToggleChange,
    closeModal,
    closeExchangeModal,
    handleExchange,
    handleExchangeTypeChange,
    handleExchangeAmountChange,
    setShowExchangeModal,
    canSpin,
  } = useSlotMachine({
    serverId,
    characterId,
    accountId,
    token,
    language,
  });

  const canClosePlay = !isSpinning && !showModal;

  return (
    <div className="h-full w-full p-4 text-white sm:p-6">
      <div className="mx-auto max-w-7xl">
        <SlotMachineHeader balance={balance} />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-[radial-gradient(ellipse_at_center,#14532d_0%,#052e16_48%,#020617_100%)] p-8 shadow-2xl lg:col-span-2 sm:p-10">
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
            <div className="mx-auto flex max-w-lg flex-col items-center text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-200/90">
                Ruleta
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-amber-50 sm:text-4xl">
                Probá tu suerte
              </h2>
              <p className="mt-4 text-base leading-relaxed text-emerald-100/85">
                Entrá a la mesa, girá la rueda y si cae en PREMIO el ítem va a
                tu personaje. Un crédito por giro.
              </p>
              <button
                type="button"
                onClick={() => setPlayOpen(true)}
                className="mt-8 inline-flex min-h-14 items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 px-10 py-4 text-xl font-semibold text-[#1a120c] shadow-[0_14px_36px_-12px_rgba(245,158,11,0.9)] transition hover:brightness-110"
              >
                Jugar
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <RechargeCard onOpenExchange={() => setShowExchangeModal(true)} />
            <ExchangeInfo />
          </div>
        </div>
      </div>

      <RoulettePlayModal
        show={playOpen}
        canClose={canClosePlay}
        balance={balance}
        rotation={rotation}
        isSpinning={isSpinning}
        result={result}
        isToggled={isToggled}
        canSpin={canSpin}
        onToggle={handleToggleChange}
        onClose={() => {
          if (canClosePlay) setPlayOpen(false);
        }}
      />

      <WinModal show={showModal} data={modalData} onClose={closeModal} />

      <ExchangeModal
        show={showExchangeModal}
        exchangeType={exchangeType}
        exchangeAmount={exchangeAmount}
        exchangeError={exchangeError}
        onClose={closeExchangeModal}
        onExchangeTypeChange={handleExchangeTypeChange}
        onExchangeAmountChange={handleExchangeAmountChange}
        onExchange={handleExchange}
      />
    </div>
  );
};

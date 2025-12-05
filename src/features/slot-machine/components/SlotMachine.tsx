"use client";
import React from "react";
import { SlotMachineProps } from "../types";
import { useSlotMachine } from "../hooks/useSlotMachine";
import { SlotMachineHeader } from "./SlotMachineHeader";
import { SlotMachineSlots } from "./SlotMachineSlots";
import { SlotMachineLever } from "./SlotMachineLever";
import { WinModal } from "./WinModal";
import { ExchangeModal } from "./ExchangeModal";
import { RechargeCard } from "./RechargeCard";
import { ExchangeInfo } from "./ExchangeInfo";

export const SlotMachine: React.FC<SlotMachineProps> = ({
  serverId,
  characterId,
  accountId,
  token,
  t,
  language,
}) => {
  const {
    slots,
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
    handleToggleChange,
    closeModal,
    closeExchangeModal,
    handleExchange,
    handleExchangeTypeChange,
    handleExchangeAmountChange,
    setShowExchangeModal,
    calculateExchangeResult,
    canSpin,
  } = useSlotMachine({
    serverId,
    characterId,
    accountId,
    token,
    language,
  });

  return (
    <div className="w-full h-full p-6 text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header con saldo */}
        <SlotMachineHeader balance={balance} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Máquina tragamonedas */}
          <div className="lg:col-span-2 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Máquina de la Fortuna
            </h2>

            <div className="flex flex-col items-center">
              <SlotMachineSlots slots={slots} />

              <div className="flex flex-col items-center space-y-6 mb-6">
                <SlotMachineLever
                  isSpinning={isSpinning}
                  isToggled={isToggled}
                  canSpin={canSpin}
                  onToggle={handleToggleChange}
                />
              </div>

              {result && (
                <div className="text-center">
                  <p className="text-xl font-semibold text-white bg-gray-700 px-6 py-3 rounded-lg">
                    {result}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Panel lateral */}
          <div className="space-y-6">
            {/* Información de compra */}
            <RechargeCard onOpenExchange={() => setShowExchangeModal(true)} />

            {/* Probabilidades */}
            <ExchangeInfo />
          </div>
        </div>
      </div>

      {/* Modal de ganancia */}
      <WinModal show={showModal} data={modalData} onClose={closeModal} />

      {/* Modal de intercambio de monedas */}
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

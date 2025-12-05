import React from "react";
import { ExchangeModalProps, ExchangeType } from "../types";

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
  if (!show) return null;

  const calculateExchangeResult = (
    amount: number,
    type: ExchangeType
  ): number => {
    switch (type) {
      case "voting":
        return amount; // $10 de puntos de votación = 10 créditos (1:1)
      case "gold":
        return amount / 1000; // 1000 oro = 1 crédito
      default:
        return 0;
    }
  };

  const exchangeTypeConfig = {
    voting: {
      emoji: "🗳️",
      label: "Votación",
      rate: "$10 = 10 créditos",
      placeholder: "Cantidad en puntos de votación",
      step: "0.01",
    },
    gold: {
      emoji: "🪙",
      label: "Oro",
      rate: "1000 oro = 1 crédito",
      placeholder: "Cantidad en oro",
      step: "1000",
    },
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl relative w-full max-w-2xl border border-gray-700">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white">
              Intercambiar Monedas
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors duration-200 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Selector de tipo de intercambio */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              Tipo de intercambio
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(exchangeTypeConfig) as ExchangeType[]).map(
                (type) => {
                  const config = exchangeTypeConfig[type];
                  return (
                    <button
                      key={type}
                      onClick={() => onExchangeTypeChange(type)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        exchangeType === type
                          ? "border-blue-500 bg-blue-500/20"
                          : "border-gray-600 bg-gray-700/50 hover:border-gray-500"
                      }`}
                    >
                      <div className="text-2xl mb-2">{config.emoji}</div>
                      <div className="text-sm font-semibold text-white">
                        {config.label}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {config.rate}
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Campo de cantidad */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Cantidad a intercambiar
            </label>
            <input
              type="number"
              value={exchangeAmount}
              onChange={(e) => onExchangeAmountChange(e.target.value)}
              placeholder={exchangeTypeConfig[exchangeType].placeholder}
              className="w-full p-4 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-white text-lg"
              min="0"
              step={exchangeTypeConfig[exchangeType].step}
            />
            {exchangeError && (
              <p className="text-red-400 text-sm mt-2">{exchangeError}</p>
            )}
          </div>

          {/* Resultado calculado */}
          {exchangeAmount && parseFloat(exchangeAmount) > 0 && (
            <div className="mb-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Recibirás:</span>
                <span className="text-2xl font-bold text-blue-400">
                  {calculateExchangeResult(
                    parseFloat(exchangeAmount),
                    exchangeType
                  ).toFixed(2)}{" "}
                  créditos
                </span>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              onClick={onExchange}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Intercambiar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

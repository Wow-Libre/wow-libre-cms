import React from "react";
import { SlotMachineLeverProps } from "../types";

export const SlotMachineLever: React.FC<SlotMachineLeverProps> = ({
  isSpinning,
  isToggled,
  canSpin,
  onToggle,
}) => {
  return (
    <div className="flex flex-col items-center space-y-4">
      <span className="text-lg font-semibold text-gray-300">
        Jalar la Palanca
      </span>

      {/* Palanca de casino */}
      <div className="relative flex flex-col items-center">
        {/* Base de la palanca */}
        <div className="relative w-20 h-32 bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900 rounded-t-full border-4 border-gray-600 shadow-2xl">
          {/* Mecanismo interno */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gray-900 rounded-full border-2 border-gray-600 shadow-inner"></div>

          {/* Palanca */}
          <button
            onClick={onToggle}
            disabled={!canSpin}
            className={`absolute top-8 left-1/2 transform -translate-x-1/2 w-6 h-20 bg-gradient-to-b from-yellow-400 via-yellow-500 to-yellow-600 rounded-full border-2 border-yellow-700 shadow-lg transition-all duration-300 cursor-pointer hover:from-yellow-300 hover:via-yellow-400 hover:to-yellow-500 active:scale-95 ${
              isToggled
                ? "rotate-12 translate-y-2"
                : "rotate-[-12deg] translate-y-0"
            } ${
              !canSpin
                ? "opacity-50 cursor-not-allowed"
                : "hover:shadow-yellow-500/50"
            }`}
            style={{
              transformOrigin: "top center",
            }}
          >
            {/* Detalles de la palanca */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-yellow-300 rounded-full shadow-inner"></div>
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-yellow-700 rounded-full"></div>
          </button>

          {/* Efecto de luz cuando está activa */}
          {isToggled && (
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-yellow-400/30 rounded-full blur-md animate-pulse"></div>
          )}
        </div>

        {/* Placa de identificación */}
        <div className="mt-2 px-4 py-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg">
          <p className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
            Pull
          </p>
        </div>
      </div>

      {/* Indicador de estado */}
      {(!canSpin || isSpinning) && (
        <p className="text-sm text-gray-400 italic">
          {isSpinning ? "Girando..." : "Saldo insuficiente"}
        </p>
      )}
    </div>
  );
};

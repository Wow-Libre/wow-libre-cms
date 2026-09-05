import React from "react";
import { SlotMachineLeverProps } from "../types";

export const SlotMachineLever: React.FC<SlotMachineLeverProps> = ({
  isSpinning,
  canSpin,
  onToggle,
}) => {
  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Botón principal de giro */}
      <div className="relative inline-block">
        {/* Efecto de borde brillante cuando está habilitado */}
        {canSpin && !isSpinning && (
          <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 rounded-2xl blur-sm opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
        )}

        <button
          onClick={onToggle}
          disabled={!canSpin || isSpinning}
          className={`
            group relative px-12 py-6 text-xl font-bold text-white uppercase tracking-wider
            rounded-2xl shadow-2xl transform transition-all duration-300 overflow-hidden
            ${
              canSpin && !isSpinning
                ? "bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-500 hover:shadow-yellow-500/60 hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] cursor-pointer"
                : "bg-gradient-to-r from-gray-600 via-gray-700 to-gray-600 opacity-50 cursor-not-allowed"
            }
            ${isSpinning ? "animate-pulse" : ""}
          `}
        >
          {/* Efecto de brillo animado cuando está habilitado */}
          {canSpin && !isSpinning && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
          )}

          {/* Contenido del botón */}
          <span className="relative z-10 flex items-center justify-center space-x-3">
            {isSpinning ? (
              <>
                <svg
                  className="animate-spin h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Girando la rueda…</span>
              </>
            ) : (
              <>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="9" strokeWidth={2} />
                  <path
                    strokeLinecap="round"
                    strokeWidth={2}
                    d="M12 3v2M12 19v2M3 12h2M19 12h2"
                  />
                </svg>
                <span>Girar ruleta</span>
              </>
            )}
          </span>
        </button>
      </div>

      {/* Indicador de estado */}
      {!canSpin && !isSpinning && (
        <p className="text-sm font-medium text-red-400">
          Saldo insuficiente
        </p>
      )}
    </div>
  );
};

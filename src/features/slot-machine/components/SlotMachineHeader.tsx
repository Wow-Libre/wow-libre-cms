import React from "react";
import { SlotMachineHeaderProps } from "../types";

export const SlotMachineHeader: React.FC<SlotMachineHeaderProps> = ({
  balance,
}) => {
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 mb-8 border border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-2xl">🎰</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">
              Máquina Tragamonedas
            </h1>
            <p className="text-lg text-gray-300">
              Prueba tu suerte y gana premios increíbles
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">Saldo: ${balance}</p>
          <p className="text-sm text-gray-400">Costo por giro: $1</p>
        </div>
      </div>
    </div>
  );
};

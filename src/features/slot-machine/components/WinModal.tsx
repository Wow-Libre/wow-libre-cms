import React from "react";
import WowheadTooltip from "@/utils/wowhead";
import { WinModalProps } from "../types";

export const WinModal: React.FC<WinModalProps> = ({ show, data, onClose }) => {
  if (!show || !data) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl text-center relative w-full max-w-lg border border-gray-700">
        <div className="p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mr-4">
              <span className="text-2xl">🎉</span>
            </div>
            <h2 className="text-3xl font-bold text-white">¡Felicidades!</h2>
          </div>

          <div className="flex flex-col items-center mb-6">
            <img
              src={data.logo}
              alt={`Logo de ${data.name}`}
              className="w-32 h-32 rounded-xl border-2 border-gray-600 mb-4 shadow-lg"
            />
            <a
              className="text-xl font-semibold text-blue-400 hover:text-blue-300 mb-2 transition-colors duration-200"
              href={`https://www.wowhead.com/item=${data.name}`}
              data-game="wow"
              data-type="item"
              data-wh-icon-added="true"
            >
              {data.name}
            </a>
            <p className="text-lg text-gray-300 mb-2">{data.type}</p>
            <p className="text-base text-gray-400 italic mb-4">
              {data.message}
            </p>
          </div>

          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200"
          >
            Cerrar
          </button>
        </div>
      </div>
      <WowheadTooltip />
    </div>
  );
};

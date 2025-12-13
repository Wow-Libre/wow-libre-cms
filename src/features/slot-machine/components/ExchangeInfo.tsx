import React from "react";

export const ExchangeInfo: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-6">Tipo de cambio</h3>
      <div className="space-y-4">
        <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">🗳️</span>
            <div className="flex-1">
              <p className="text-sm text-gray-400 mb-1">
                Puntos de votación a créditos
              </p>
              <p className="text-white font-semibold">$10 = 10 créditos</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">🪙</span>
            <div className="flex-1">
              <p className="text-sm text-gray-400 mb-1">Oro a créditos</p>
              <p className="text-white font-semibold">1000 oro = 1 crédito</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

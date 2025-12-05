import React from "react";

interface RechargeCardProps {
  onOpenExchange: () => void;
}

export const RechargeCard: React.FC<RechargeCardProps> = ({
  onOpenExchange,
}) => {
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-4">Recargar Créditos</h3>
      <p className="text-gray-300 mb-6 text-sm">
        ¿Te estás quedando sin créditos? Intercambia tus monedas ahora y
        continúa jugando.
      </p>
      <button
        onClick={onOpenExchange}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
      >
        Intercambiar Monedas
      </button>
    </div>
  );
};

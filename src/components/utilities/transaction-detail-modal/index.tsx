"use client";
import React from "react";
import { Transaction } from "@/model/model";

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  loading: boolean;
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  isOpen,
  onClose,
  transaction,
  loading,
}) => {
  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-900 text-green-300 border-green-700";
      case "pending":
      case "processing":
        return "bg-yellow-900 text-yellow-300 border-yellow-700";
      case "failed":
      case "cancelled":
        return "bg-red-900 text-red-300 border-red-700";
      default:
        return "bg-blue-900 text-blue-300 border-blue-700";
    }
  };

  const getProgressFromStatus = (status: string): number => {
    const statusLower = status.toLowerCase();
    if (statusLower === "paid" || statusLower === "completed") {
      return 100;
    }
    if (statusLower === "pending" || statusLower === "processing") {
      return 50;
    }
    if (statusLower === "failed" || statusLower === "cancelled") {
      return 0;
    }
    return 0;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-green-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 w-full max-w-4xl mx-4 max-h-[90vh] shadow-2xl border border-slate-700 transform transition-all duration-300 ease-out animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Detalles de la Transacción
              </h2>
              <p className="text-gray-400 text-sm">
                Información completa de tu compra
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors duration-200 p-2 rounded-full hover:bg-slate-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Cargando detalles...</p>
              </div>
            </div>
          ) : transaction ? (
            <div className="space-y-6">
              {/* Product Information */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-start space-x-4 mb-4">
                  <img
                    src={transaction.logo}
                    alt={transaction.product_name}
                    className="w-16 h-16 rounded-xl object-cover shadow-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-white break-words mb-2">
                      {transaction.product_name}
                    </h3>
                    <p className="text-base text-gray-400 break-all">
                      Referencia: {transaction.reference_number}
                    </p>
                  </div>
                </div>

                {/* Descripción del producto si existe */}
                {transaction.product_id?.description && (
                  <p className="text-gray-300 text-base mb-4">
                    {transaction.product_id.description}
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <span className="text-gray-400 text-base flex-shrink-0">
                        Precio:
                      </span>
                      <span className="text-lg font-semibold text-white break-words text-right">
                        {transaction.price.toFixed(2)} {transaction.currency}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <span className="text-gray-400 text-base flex-shrink-0">
                        Estado:
                      </span>
                      <span
                        className={`px-3 py-1.5 text-sm font-semibold rounded-full border flex-shrink-0 ${getStatusColor(
                          transaction.status
                        )}`}
                      >
                        {transaction.status}
                      </span>
                    </div>
                    {transaction.payment_method && (
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <span className="text-gray-400 text-base flex-shrink-0">
                          Método de pago:
                        </span>
                        <span className="text-lg font-medium text-white text-right">
                          {transaction.payment_method}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {(() => {
                      const progress =
                        transaction.progress ??
                        getProgressFromStatus(transaction.status);
                      return (
                        <>
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                            <span className="text-gray-400 text-base flex-shrink-0">
                              Progreso:
                            </span>
                            <span className="text-lg font-semibold text-white">
                              {progress}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-700/50 rounded-full h-3 shadow-inner">
                            <div
                              className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(
                                progress
                              )}`}
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </>
                      );
                    })()}
                    {transaction.product_id?.realm_name && (
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <span className="text-gray-400 text-base flex-shrink-0">
                          Reino:
                        </span>
                        <span className="text-lg font-medium text-white text-right">
                          {transaction.product_id.realm_name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Información de la Transacción
                </h4>

                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 py-2 border-b border-slate-700/30">
                    <span className="text-gray-400 text-base flex-shrink-0">
                      Fecha de compra:
                    </span>
                    <span className="text-lg text-white break-words text-right">
                      {transaction.creation_date}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 py-2 border-b border-slate-700/30">
                    <span className="text-gray-400 text-base flex-shrink-0">
                      Número de referencia:
                    </span>
                    <span className="text-lg text-white font-mono break-all text-right overflow-x-auto max-w-full">
                      {transaction.reference_number}
                    </span>
                  </div>
                  {transaction.product_id?.product_category_id && (
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 py-2 border-b border-slate-700/30">
                      <span className="text-gray-400 text-base flex-shrink-0">
                        Categoría:
                      </span>
                      <span className="text-lg text-white text-right">
                        {transaction.product_id.product_category_id.name}
                      </span>
                    </div>
                  )}
                  {transaction.account_id && (
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 py-2 border-b border-slate-700/30">
                      <span className="text-gray-400 text-base flex-shrink-0">
                        ID de cuenta:
                      </span>
                      <span className="text-lg text-white font-mono text-right">
                        {transaction.account_id}
                      </span>
                    </div>
                  )}
                  {transaction.credit_points !== undefined && (
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 py-2 border-b border-slate-700/30">
                      <span className="text-gray-400 text-base flex-shrink-0">
                        Usa créditos:
                      </span>
                      <span className="text-lg text-white text-right">
                        {transaction.credit_points ? "Sí" : "No"}
                      </span>
                    </div>
                  )}
                  {transaction.reference_payment && (
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 py-2 border-b border-slate-700/30">
                      <span className="text-gray-400 text-base flex-shrink-0">
                        Referencia de pago:
                      </span>
                      <span className="text-lg text-white font-mono break-all text-right">
                        {transaction.reference_payment}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 py-2">
                    <span className="text-gray-400 text-base flex-shrink-0">
                      ID de transacción:
                    </span>
                    <span className="text-lg text-white font-mono break-all text-right">
                      {transaction.id}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-700/50 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                No se encontraron detalles
              </h3>
              <p className="text-gray-400">
                No se pudieron cargar los detalles de esta transacción.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-8">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-blue-500/25"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailModal;

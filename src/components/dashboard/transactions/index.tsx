"use client";
import { getTransactions, markTransactionAsPaidOffline } from "@/api/transactions";
import LoadingSpinner from "@/components/utilities/loading-spinner";
import { Transaction } from "@/model/model";
import Cookies from "js-cookie";
import { useEffect, useMemo, useState, type FC } from "react";

const ITEMS_PER_PAGE = 10;

const pendingStatuses = [
  "pending",
  "processing",
  "in_cart",
  "cart",
  "created",
  "awaiting_payment",
];

const completedStatuses = ["completed", "paid", "paid_offline"];

interface TransactionsDashboardProps {
  token?: string;
  realmId?: number;
}

const TransactionsDashboard: FC<TransactionsDashboardProps> = ({
  token: tokenProp,
  realmId,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "pending" | "cart" | "completed" | "all"
  >("pending");
  const [selectedTransaction, setSelectedTransaction] = useState<
    Transaction | null
  >(null);
  const [offlineMethod, setOfflineMethod] = useState("transferencia");
  const [offlineReference, setOfflineReference] = useState("");
  const [offlineNotes, setOfflineNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<
    { type: "success" | "error"; message: string } | null
  >(null);

  const token = tokenProp ?? Cookies.get("token") ?? "";

  const fetchTransactions = async () => {
    if (!token) {
      setError("No se encontró token de autenticación.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getTransactions(token, currentPage, ITEMS_PER_PAGE);
      setTransactions(data.transactions || []);
      setTotalTransactions(data.size || 0);
    } catch (err: any) {
      setError(
        err?.message ||
          "No se pudieron cargar las transacciones. Intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, tokenProp]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const status = transaction.status?.toLowerCase?.() || "";
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "pending"
          ? pendingStatuses.includes(status)
          : statusFilter === "cart"
          ? status.includes("cart") || status === "in_cart"
          : completedStatuses.includes(status);

      const matchesRealm = realmId ? transaction.realm_id === realmId : true;
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !term ||
        transaction.product_name.toLowerCase().includes(term) ||
        transaction.reference_number.toLowerCase().includes(term) ||
        (transaction.payment_method || "").toLowerCase().includes(term);

      return matchesStatus && matchesRealm && matchesSearch;
    });
  }, [transactions, statusFilter, realmId, searchTerm]);

  const canMarkOffline = (status: string) => {
    const lower = status.toLowerCase();
    if (completedStatuses.includes(lower)) return false;
    if (["failed", "cancelled", "refunded"].includes(lower)) return false;
    return true;
  };

  const openOfflineModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setOfflineMethod(transaction.payment_method || "transferencia");
    setOfflineReference(
      transaction.reference_payment || transaction.reference_number || ""
    );
    setOfflineNotes("");
    setFeedback(null);
  };

  const handleMarkOffline = async () => {
    if (!selectedTransaction || !token) return;

    setSaving(true);
    setFeedback(null);

    try {
      const updated = await markTransactionAsPaidOffline(
        token,
        selectedTransaction.id,
        {
          method: offlineMethod,
          reference: offlineReference || selectedTransaction.reference_number,
          notes: offlineNotes,
          amount: selectedTransaction.price,
          currency: selectedTransaction.currency,
        }
      );

      setTransactions((prev) =>
        prev.map((tx) =>
          tx.id === selectedTransaction.id
            ? {
                ...tx,
                ...updated,
                status: updated?.status || "completed",
                progress: updated?.progress ?? 100,
                payment_method:
                  updated?.payment_method || `Offline - ${offlineMethod}`,
                reference_payment:
                  updated?.reference_payment || offlineReference || tx.reference_number,
                offline: true,
                offline_method: offlineMethod,
                offline_notes: offlineNotes,
                offline_reference:
                  offlineReference || tx.reference_number || updated?.reference_number,
              }
            : tx
        )
      );

      setFeedback({ type: "success", message: "Pago offline marcado como completado." });
      setSelectedTransaction(null);
    } catch (err: any) {
      setFeedback({
        type: "error",
        message:
          err?.message || "No se pudo marcar como pagado. Intenta nuevamente.",
      });
    } finally {
      setSaving(false);
    }
  };

  const totalPages = Math.ceil((totalTransactions || 0) / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Transacciones</h2>
          <p className="text-gray-400 text-sm">
            Marca pagos offline y completa órdenes en carrito.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { key: "pending", label: "Pendientes" },
            { key: "cart", label: "En carrito" },
            { key: "completed", label: "Completadas" },
            { key: "all", label: "Todas" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setStatusFilter(item.key as any)}
              className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-all duration-200 ${
                statusFilter === item.key
                  ? "bg-yellow-500/20 border-yellow-400 text-yellow-200"
                  : "bg-slate-800 border-slate-700 text-gray-200 hover:bg-slate-700"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <label className="text-sm text-gray-300 block mb-2">Buscar</label>
          <div className="relative">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Producto, referencia o método"
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
            <svg
              className="w-4 h-4 text-gray-400 absolute right-3 top-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <div className="text-sm text-gray-400">
          Total: <span className="text-white font-semibold">{totalTransactions}</span>
        </div>
      </div>

      <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-10 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="p-6 text-red-300 text-sm">{error}</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-6 text-gray-300 text-sm">
            No se encontraron transacciones con estos filtros.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800">
              <thead className="bg-slate-800/80">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">
                    Producto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">
                    Usuario
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">
                    Monto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">
                    Referencia
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredTransactions.map((transaction) => {
                  const statusLower = transaction.status?.toLowerCase?.() || "";
                  const isPending = canMarkOffline(statusLower);
                  return (
                    <tr key={transaction.id} className="hover:bg-slate-800/60">
                      <td className="px-4 py-3">
                        <div className="text-white font-semibold">
                          {transaction.product_name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {transaction.logo ? (
                            <span>Ref: {transaction.reference_number}</span>
                          ) : (
                            transaction.reference_number
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {transaction.account_id || transaction.user_id || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-200 font-semibold">
                        {transaction.price?.toFixed(2)} {transaction.currency}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs rounded-full border ${
                            statusLower.startsWith("fail")
                              ? "bg-red-900/50 text-red-200 border-red-700"
                              : statusLower.includes("pending") ||
                                statusLower.includes("process")
                              ? "bg-amber-900/40 text-amber-200 border-amber-700"
                              : "bg-green-900/40 text-green-200 border-green-700"
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {transaction.reference_number}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {new Date(transaction.creation_date).toLocaleString("es-ES")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 items-center">
                          <button
                            onClick={() => openOfflineModal(transaction)}
                            disabled={!isPending}
                            className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                              isPending
                                ? "bg-blue-600/20 text-blue-100 border-blue-500 hover:bg-blue-600/30"
                                : "bg-slate-800 text-gray-500 border-slate-700 cursor-not-allowed"
                            }`}
                          >
                            Marcar offline
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>
            Página {currentPage + 1} de {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="px-3 py-1 rounded-lg border border-slate-700 bg-slate-800 text-white disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage + 1 >= totalPages}
              className="px-3 py-1 rounded-lg border border-slate-700 bg-slate-800 text-white disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSelectedTransaction(null)}
          />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">
                  Marcar como pagado offline
                </h3>
                <p className="text-sm text-gray-400">
                  {selectedTransaction.product_name}
                </p>
              </div>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-300 block mb-1">Método</label>
                <input
                  value={offlineMethod}
                  onChange={(e) => setOfflineMethod(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm text-gray-300 block mb-1">Referencia</label>
                <input
                  value={offlineReference}
                  onChange={(e) => setOfflineReference(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm text-gray-300 block mb-1">Notas</label>
                <textarea
                  value={offlineNotes}
                  onChange={(e) => setOfflineNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2"
                  rows={3}
                />
              </div>
            </div>

            {feedback && (
              <div
                className={`mt-4 text-sm px-3 py-2 rounded-lg border ${
                  feedback.type === "success"
                    ? "bg-green-900/30 text-green-200 border-green-700"
                    : "bg-red-900/30 text-red-200 border-red-700"
                }`}
              >
                {feedback.message}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setSelectedTransaction(null)}
                className="px-4 py-2 rounded-lg border border-slate-700 text-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleMarkOffline}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsDashboard;

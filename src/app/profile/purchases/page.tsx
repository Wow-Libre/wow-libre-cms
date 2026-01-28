"use client";
import {
  getTransactionReferenceNumber,
  getTransactions,
} from "@/api/transactions";
import NavbarAuthenticated from "@/components/navbar-authenticated";
import LoadingSpinner from "@/components/utilities/loading-spinner";
import TransactionDetailModal from "@/components/utilities/transaction-detail-modal";
import { Transaction } from "@/model/model";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";

const ITEMS_PER_PAGE = 8;

const Purchases = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const token = Cookies.get("token");

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getTransactions(
          token || "",
          currentPage,
          ITEMS_PER_PAGE,
        );
        setTransactions(data.transactions);
        setTotalTransactions(data.size);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setError(
          "Error al cargar las transacciones. Por favor, intenta de nuevo.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [currentPage, token]);

  const handlePageClick = (data: { selected: number }) => {
    setCurrentPage(data.selected);
  };

  const handleTransactionDetail = async (referenceNumber: string) => {
    try {
      setIsModalOpen(true);
      setModalLoading(true);
      setSelectedTransaction(null);

      const transactionDetail = await getTransactionReferenceNumber(
        token || "",
        referenceNumber,
      );

      setSelectedTransaction(transactionDetail);
    } catch (error: any) {
      console.error("Error fetching transaction details:", error);
      // El modal mostrará el estado de error automáticamente
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
    setModalLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
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

  const getProgressColor = (progress: number | undefined) => {
    const progressValue = progress ?? 0;
    if (progressValue >= 100) return "bg-green-500";
    if (progressValue >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = transaction.product_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      transaction.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case "name":
        aValue = a.product_name;
        bValue = b.product_name;
        break;
      case "price":
        aValue = a.price;
        bValue = b.price;
        break;
      case "date":
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
        break;
      default:
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return (
    <div className="min-h-screen  ">
      <div className="mb-20 contenedor">
        <NavbarAuthenticated />
      </div>

      <div className="contenedor max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Mis Compras
              </h1>
              <p className="text-gray-300 text-lg">
                Gestiona y revisa todas tus transacciones
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl px-4 py-2">
                <div className="text-sm text-gray-400">
                  Total de transacciones
                </div>
                <div className="text-xl font-bold text-white">
                  {totalTransactions}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 mb-8 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Filtros y Búsqueda
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"
                />
              </svg>
              <span>Filtrar resultados</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Buscar producto
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400 group-focus-within:text-yellow-400 transition-colors"
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
                <input
                  type="text"
                  placeholder="Buscar por nombre de producto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 bg-slate-700/60 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 placeholder-gray-400 text-sm transition-all duration-200 hover:bg-slate-700/70"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Estado
              </label>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full px-4 py-3 bg-slate-700/60 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 text-sm transition-all duration-200 hover:bg-slate-700/70 appearance-none cursor-pointer"
                >
                  <option value="all">Todos los estados</option>
                  <option value="completed">Completado</option>
                  <option value="pending">Pendiente</option>
                  <option value="processing">Procesando</option>
                  <option value="failed">Fallido</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ordenar por
              </label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 px-4 py-3 bg-slate-700/60 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 text-sm transition-all duration-200 hover:bg-slate-700/70 appearance-none cursor-pointer"
                >
                  <option value="date">Fecha</option>
                  <option value="name">Nombre</option>
                  <option value="price">Precio</option>
                </select>
                <button
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  className="px-4 py-3 border border-slate-600/50 bg-slate-700/60 text-white rounded-xl hover:bg-slate-600/70 focus:ring-2 focus:ring-yellow-400/50 transition-all duration-200 flex items-center justify-center"
                  title={`Ordenar ${
                    sortOrder === "asc" ? "descendente" : "ascendente"
                  }`}
                >
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      sortOrder === "desc" ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        {loading ? (
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-xl">
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="text-center">
                <LoadingSpinner />
                <p className="text-gray-400 mt-4">Cargando transacciones...</p>
              </div>
            </div>
          </div>
        ) : sortedTransactions.length === 0 || error ? (
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-xl">
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-slate-700/50 to-slate-600/50 rounded-2xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                No se encontraron transacciones
              </h3>
              <p className="text-gray-400 text-base max-w-md mx-auto">
                {error
                  ? "No se pudieron cargar las transacciones en este momento"
                  : searchTerm || statusFilter !== "all"
                    ? "Intenta ajustar los filtros de búsqueda para encontrar lo que buscas"
                    : "Aún no tienes transacciones registradas. ¡Explora nuestra tienda!"}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-700/60 to-slate-600/60 border-b border-slate-600/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-200 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-200 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-200 uppercase tracking-wider">
                      Progreso
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-200 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-200 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-200 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slate-800/20 divide-y divide-slate-700/30">
                  {sortedTransactions.map((transaction, index) => (
                    <tr
                      key={transaction.id}
                      className="hover:bg-slate-700/40 transition-all duration-200 group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-5">
                          <div className="relative">
                            <img
                              src={transaction.logo}
                              alt={transaction.product_name}
                              className="w-16 h-16 rounded-xl object-cover shadow-lg group-hover:scale-105 transition-transform duration-200"
                            />
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full border-2 border-slate-800"></div>
                          </div>
                          <div>
                            <div className="text-base font-semibold text-white group-hover:text-yellow-300 transition-colors">
                              {transaction.product_name}
                            </div>
                            <div className="text-sm text-gray-400 mt-1">
                              Ref: {transaction.reference_number}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-lg font-bold text-white">
                          {Math.floor(transaction.price)} {transaction.currency}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="flex items-center justify-center space-x-4">
                          <div className="w-24 bg-slate-700/50 rounded-full h-3 shadow-inner">
                            <div
                              className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(
                                transaction.progress,
                              )}`}
                              style={{ width: `${transaction.progress ?? 0}%` }}
                            ></div>
                          </div>
                          <span className="text-base font-medium text-white min-w-[3rem]">
                            {transaction.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span
                          className={`inline-flex px-4 py-2 text-sm font-bold rounded-full border shadow-sm ${getStatusColor(
                            transaction.status,
                          )}`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-base text-gray-300">
                        <div className="flex items-center space-x-3">
                          <svg
                            className="w-5 h-5 text-gray-400"
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
                          <span>
                            {new Date(transaction.date).toLocaleDateString(
                              "es-ES",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <button
                          onClick={() =>
                            handleTransactionDetail(
                              transaction.reference_number,
                            )
                          }
                          className="text-gray-400 hover:text-yellow-400 p-3 rounded-xl hover:bg-slate-700/50 transition-all duration-200 group/btn"
                        >
                          <svg
                            className="w-5 h-5 group-hover/btn:translate-x-0.5 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8.25 4.5l7.5 7.5-7.5 7.5"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden p-4 space-y-4">
              {sortedTransactions.map((transaction, index) => (
                <div
                  key={transaction.id}
                  className="bg-slate-700/30 backdrop-blur-sm border border-slate-600/50 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-slate-700/40 group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="relative flex-shrink-0">
                      <img
                        src={transaction.logo}
                        alt={transaction.product_name}
                        className="w-16 h-16 rounded-xl object-cover shadow-lg group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full border-2 border-slate-800 flex items-center justify-center">
                        <svg
                          className="w-2.5 h-2.5 text-slate-800"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-white truncate group-hover:text-yellow-300 transition-colors">
                            {transaction.product_name}
                          </h3>
                          <p className="text-sm text-gray-400 mt-1">
                            Ref: {transaction.reference_number}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            handleTransactionDetail(
                              transaction.reference_number,
                            )
                          }
                          className="text-gray-400 hover:text-yellow-400 p-2 rounded-xl hover:bg-slate-600/50 transition-all duration-200 ml-2"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8.25 4.5l7.5 7.5-7.5 7.5"
                            />
                          </svg>
                        </button>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-lg font-bold text-white">
                          {Math.floor(transaction.price)} {transaction.currency}
                        </div>
                        <span
                          className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-full border shadow-sm ${getStatusColor(
                            transaction.status,
                          )}`}
                        >
                          {transaction.status}
                        </span>
                      </div>

                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
                          <span className="flex items-center space-x-2">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                              />
                            </svg>
                            <span>Progreso</span>
                          </span>
                          <span className="font-semibold">
                            {transaction.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-600/50 rounded-full h-2.5 shadow-inner">
                          <div
                            className={`h-2.5 rounded-full transition-all duration-500 ${getProgressColor(
                              transaction.progress,
                            )}`}
                            style={{ width: `${transaction.progress ?? 0}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center space-x-2 text-sm text-gray-400">
                        <svg
                          className="w-4 h-4"
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
                        <span>
                          {new Date(transaction.date).toLocaleDateString(
                            "es-ES",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalTransactions > ITEMS_PER_PAGE && (
          <div className="mt-12">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Info */}
              <div className="text-sm text-gray-400">
                Mostrando {currentPage * ITEMS_PER_PAGE + 1} -{" "}
                {Math.min(
                  (currentPage + 1) * ITEMS_PER_PAGE,
                  totalTransactions,
                )}{" "}
                de {totalTransactions} transacciones
              </div>

              {/* Pagination */}
              <div className="flex items-center space-x-2">
                <ReactPaginate
                  previousLabel={
                    <div className="flex items-center space-x-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      <span className="hidden sm:inline">Anterior</span>
                    </div>
                  }
                  nextLabel={
                    <div className="flex items-center space-x-1">
                      <span className="hidden sm:inline">Siguiente</span>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  }
                  pageCount={Math.ceil(totalTransactions / ITEMS_PER_PAGE)}
                  marginPagesDisplayed={1}
                  pageRangeDisplayed={2}
                  onPageChange={handlePageClick}
                  containerClassName="flex items-center space-x-1"
                  pageLinkClassName="relative inline-flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-300 bg-slate-800/60 border border-slate-600/50 rounded-lg hover:bg-slate-700/70 hover:border-slate-500/50 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50"
                  previousLinkClassName="relative inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-300 bg-slate-800/60 border border-slate-600/50 rounded-lg hover:bg-slate-700/70 hover:border-slate-500/50 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50"
                  nextLinkClassName="relative inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-300 bg-slate-800/60 border border-slate-600/50 rounded-lg hover:bg-slate-700/70 hover:border-slate-500/50 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50"
                  activeLinkClassName="relative inline-flex items-center justify-center w-10 h-10 text-sm font-bold text-white bg-gradient-to-r from-yellow-500 to-yellow-600 border border-yellow-500 rounded-lg shadow-lg hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50"
                  disabledLinkClassName="relative inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-500 bg-slate-800/30 border border-slate-700/30 rounded-lg cursor-not-allowed opacity-50"
                  forcePage={currentPage}
                  breakLabel={
                    <span className="relative inline-flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-400">
                      ...
                    </span>
                  }
                  breakClassName="flex items-center"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        transaction={selectedTransaction}
        loading={modalLoading}
      />
    </div>
  );
};

export default Purchases;

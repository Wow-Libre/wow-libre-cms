"use client";

import {
  getTransactionReferenceNumber,
  getTransactions,
} from "@/api/transactions";
import {
  PURCHASES_ITEMS_PER_PAGE,
  PURCHASES_PAGE_SIZE_OPTIONS,
} from "@/features/purchases/constants";
import { mergeTransactionPreview } from "@/lib/transaction/normalizeTransaction";
import { matchesTransactionStatusFilter } from "@/lib/transaction/transactionStatus";
import { Transaction } from "@/model/model";
import Cookies from "js-cookie";
import { useCallback, useEffect, useMemo, useState } from "react";

export function usePurchases() {
  const token = Cookies.get("token");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState<number>(
    PURCHASES_ITEMS_PER_PAGE
  );
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"date" | "name" | "price">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [detailReference, setDetailReference] = useState<string | null>(null);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, statusFilter, itemsPerPage, sortBy, sortOrder]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await getTransactions(
          token,
          currentPage,
          itemsPerPage
        );
        setTransactions(data.transactions);
        setTotalTransactions(data.size);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError(
          "No se pudieron cargar las transacciones. Intenta de nuevo en unos momentos."
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchTransactions();
  }, [currentPage, token, itemsPerPage]);

  const filteredTransactions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return transactions.filter((transaction) => {
      const matchesSearch =
        !term ||
        transaction.product_name.toLowerCase().includes(term) ||
        transaction.reference_number.toLowerCase().includes(term);
      const matchesStatus = matchesTransactionStatusFilter(
        transaction.status,
        statusFilter
      );
      return matchesSearch && matchesStatus;
    });
  }, [transactions, searchTerm, statusFilter]);

  const sortedTransactions = useMemo(() => {
    const list = [...filteredTransactions];
    list.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

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
        default:
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [filteredTransactions, sortBy, sortOrder]);

  const hasActiveFilters =
    searchTerm.trim().length > 0 || statusFilter !== "all";

  const pageCount = Math.max(
    1,
    Math.ceil(totalTransactions / itemsPerPage) || 1
  );

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleItemsPerPageChange = useCallback((size: number) => {
    if (
      (PURCHASES_PAGE_SIZE_OPTIONS as readonly number[]).includes(size)
    ) {
      setItemsPerPage(size);
    }
  }, []);

  const loadTransactionDetail = useCallback(
    async (referenceNumber: string, preview?: Transaction) => {
      if (!token) return;

      setModalLoading(true);
      setModalError(null);
      if (preview) {
        setSelectedTransaction(preview);
      }

      try {
        const transactionDetail = await getTransactionReferenceNumber(
          token,
          referenceNumber
        );
        setSelectedTransaction(
          mergeTransactionPreview(transactionDetail, preview)
        );
      } catch (err) {
        console.error("Error fetching transaction details:", err);
        setModalError(
          "No se pudieron cargar los detalles. Comprueba tu conexión e inténtalo de nuevo."
        );
        if (!preview) {
          setSelectedTransaction(null);
        }
      } finally {
        setModalLoading(false);
      }
    },
    [token]
  );

  const handleTransactionDetail = useCallback(
    (referenceNumber: string, preview?: Transaction) => {
      setDetailReference(referenceNumber);
      setIsModalOpen(true);
      void loadTransactionDetail(referenceNumber, preview);
    },
    [loadTransactionDetail]
  );

  const handleRetryDetail = useCallback(() => {
    if (detailReference) {
      void loadTransactionDetail(
        detailReference,
        selectedTransaction ?? undefined
      );
    }
  }, [detailReference, loadTransactionDetail, selectedTransaction]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
    setModalLoading(false);
    setModalError(null);
    setDetailReference(null);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("all");
  }, []);

  const toggleSortOrder = useCallback(() => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  }, []);

  return {
    token,
    loading,
    error,
    transactions,
    sortedTransactions,
    totalTransactions,
    filteredCount: sortedTransactions.length,
    currentPage,
    pageCount,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    sortOrder,
    toggleSortOrder,
    hasActiveFilters,
    clearFilters,
    isModalOpen,
    selectedTransaction,
    modalLoading,
    modalError,
    handleTransactionDetail,
    handleRetryDetail,
    handleCloseModal,
  };
}

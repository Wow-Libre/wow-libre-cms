import { useState, useEffect, useMemo, useCallback } from "react";
import { PremiumFilters, PremiumPagination, PremiumPackage, BenefitsPremiumDto } from "../types";
import { getBenefitsPremiumAll, deleteBenefitPremium } from "../api/premiumApi";
import Swal from "sweetalert2";

interface UsePremiumProps {
  token: string;
  realmId: number;
  language: string;
}

export const usePremium = ({
  token,
  realmId,
  language,
}: UsePremiumProps) => {
  const [premiumPackages, setPremiumPackages] = useState<PremiumPackage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PremiumFilters>({
    searchTerm: "",
    currentPage: 1,
    itemsPerPage: 10,
  });
  const [totalElements, setTotalElements] = useState<number>(0);

  const fetchPremiumPackages = useCallback(async () => {
    if (!token || !realmId) return;

    setLoading(true);
    setError(null);

    try {
      const allPackages: BenefitsPremiumDto[] = await getBenefitsPremiumAll(language, realmId, token);
      
      if (!allPackages || !Array.isArray(allPackages)) {
        console.warn("Benefits premium API response is not a valid array");
        setPremiumPackages([]);
        setTotalElements(0);
        return;
      }
      
      console.log("Benefits premium fetched:", {
        total: allPackages.length,
        firstPackage: allPackages[0],
      });

      // Filtrar por término de búsqueda
      const filteredData = allPackages.filter((pkg) =>
        pkg.name.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );

      // Paginar datos
      const paginatedData = filteredData.slice(
        (filters.currentPage - 1) * filters.itemsPerPage,
        filters.currentPage * filters.itemsPerPage
      );

      // Mapear BenefitsPremiumDto a PremiumPackage para la tabla
      const mappedPackages: PremiumPackage[] = paginatedData.map((pkg) => ({
        id: pkg.id,
        name: pkg.name || "Sin nombre",
        description: pkg.description || "Sin descripción",
        img: pkg.img || "",
        type: pkg.type,
        command: pkg.command,
        sendItem: pkg.sendItem,
        reactivable: pkg.reactivable,
        btnText: pkg.btn_text,
        realmId: pkg.realm_id,
        language: pkg.language,
      }));

      setPremiumPackages(mappedPackages);
      setTotalElements(filteredData.length);
    } catch (error: any) {
      setError(error.message);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to load premium packages",
        color: "white",
        background: "#0B1218",
      });
    } finally {
      setLoading(false);
    }
  }, [
    token,
    realmId,
    language,
    filters.searchTerm,
    filters.currentPage,
    filters.itemsPerPage,
  ]);

  useEffect(() => {
    fetchPremiumPackages();
  }, [fetchPremiumPackages]);

  const handleDeletePremiumPackage = async (packageId: number) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "No podrás revertir esta acción",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      background: "#0B1218",
      color: "white",
    });

    if (result.isConfirmed) {
      try {
        await deleteBenefitPremium(packageId, token);
        await Swal.fire({
          title: "Eliminado!",
          text: "El beneficio premium ha sido eliminado",
          icon: "success",
          background: "#0B1218",
          color: "white",
        });
        fetchPremiumPackages();
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Failed to delete benefit premium",
          background: "#0B1218",
          color: "white",
        });
      }
    }
  };

  const pagination: PremiumPagination = useMemo(() => {
    const totalPages =
      totalElements && filters.itemsPerPage
        ? Math.ceil(totalElements / filters.itemsPerPage)
        : 0;

    return {
      currentPage: filters.currentPage,
      totalPages,
      itemsPerPage: filters.itemsPerPage,
      totalElements,
    };
  }, [totalElements, filters.itemsPerPage, filters.currentPage]);

  useEffect(() => {
    if (
      pagination.totalPages > 0 &&
      filters.currentPage > pagination.totalPages
    ) {
      setFilters((prev) => ({ ...prev, currentPage: pagination.totalPages }));
    }
  }, [pagination.totalPages, filters.currentPage]);

  const setSearchTerm = (term: string) => {
    setFilters((prev) => ({ ...prev, searchTerm: term, currentPage: 1 }));
  };

  const setCurrentPage = (page: number) => {
    setFilters((prev) => ({ ...prev, currentPage: page }));
  };

  const setItemsPerPage = (items: number) => {
    setFilters((prev) => ({ ...prev, itemsPerPage: items, currentPage: 1 }));
  };

  const goToNextPage = () => {
    if (
      filters.currentPage < pagination.totalPages &&
      pagination.totalPages > 0
    ) {
      setCurrentPage(filters.currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (filters.currentPage > 1) {
      setCurrentPage(filters.currentPage - 1);
    }
  };

  return {
    premiumPackages,
    pagination,
    filters,
    loading,
    error,
    setSearchTerm,
    setCurrentPage,
    setItemsPerPage,
    goToNextPage,
    goToPreviousPage,
    handleDeletePremiumPackage,
    refetch: fetchPremiumPackages,
  };
};


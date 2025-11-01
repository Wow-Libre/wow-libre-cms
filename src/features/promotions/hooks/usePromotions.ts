import { useState, useEffect, useMemo, useCallback } from "react";
import { PromotionsFilters, PromotionsPagination, Promotion, PromotionModel } from "../types";
import { getPromotionsAll, deletePromotion } from "../api/promosApi";
import Swal from "sweetalert2";

interface UsePromotionsProps {
  token: string;
  realmId: number;
  language: string;
}

export const usePromotions = ({
  token,
  realmId,
  language,
}: UsePromotionsProps) => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PromotionsFilters>({
    searchTerm: "",
    currentPage: 1,
    itemsPerPage: 10,
  });
  const [totalElements, setTotalElements] = useState<number>(0);

  const fetchPromotions = useCallback(async () => {
    if (!token || !realmId) return;

    setLoading(true);
    setError(null);

    try {
      // La API ahora retorna directamente PromotionModel[]
      const allPromotions: PromotionModel[] = await getPromotionsAll(language, realmId, token);
      
      // Validar que la respuesta tenga el formato esperado
      if (!allPromotions || !Array.isArray(allPromotions)) {
        console.warn("Promotions API response is not a valid array");
        setPromotions([]);
        setTotalElements(0);
        return;
      }
      
      // Log para debug (remover en producción si es necesario)
      console.log("Promotions fetched:", {
        total: allPromotions.length,
        firstPromo: allPromotions[0],
      });

      // Filtrar por término de búsqueda
      const filteredData = allPromotions.filter((promo) =>
        promo.name.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );

      // Paginar datos
      const paginatedData = filteredData.slice(
        (filters.currentPage - 1) * filters.itemsPerPage,
        filters.currentPage * filters.itemsPerPage
      );

      // Mapear directamente PromotionModel a Promotion para la tabla
      const mappedPromotions: Promotion[] = paginatedData.map((promo) => ({
        id: promo.id,
        name: promo.name || "Sin nombre",
        description: promo.description || "Sin descripción",
        discount: `${promo.amount || 0}`, // Monto de dinero, no descuento
        img: promo.img || "",
        status: promo.status, // Usar el status del PromotionModel
        type: promo.type,
        amount: promo.amount,
        btn_txt: promo.btn_txt,
        min_lvl: promo.min_lvl,
        max_lvl: promo.max_lvl,
        level: promo.level,
      }));

      setPromotions(mappedPromotions);
      setTotalElements(filteredData.length);
    } catch (error: any) {
      setError(error.message);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to load promotions",
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
    fetchPromotions();
  }, [fetchPromotions]);

  const handleDeletePromotion = async (promotionId: number) => {
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
        await deletePromotion(promotionId, token);
        await Swal.fire({
          title: "Eliminado!",
          text: "La promoción ha sido eliminada",
          icon: "success",
          background: "#0B1218",
          color: "white",
        });
        // Recargar promociones después de eliminar
        fetchPromotions();
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Failed to delete promotion",
          background: "#0B1218",
          color: "white",
        });
      }
    }
  };

  const pagination: PromotionsPagination = useMemo(() => {
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
    promotions,
    pagination,
    filters,
    loading,
    error,
    setSearchTerm,
    setCurrentPage,
    setItemsPerPage,
    goToNextPage,
    goToPreviousPage,
    handleDeletePromotion,
    refetch: fetchPromotions,
  };
};

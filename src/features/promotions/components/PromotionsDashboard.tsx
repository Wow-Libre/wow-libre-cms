"use client";

import React, { useMemo, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { usePromotions } from "../hooks/usePromotions";
import { CarouselItem } from "../types";
import LoadingSpinner from "@/components/utilities/loading-spinner";
import CreatePromotionModal from "./CreatePromotionModal";

interface PromotionsDashboardProps {
  token: string;
  realmId: number;
  language?: string;
}

const carouselSettings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 3,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3000,
  responsive: [
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
      },
    },
  ],
};

const PromotionsDashboard: React.FC<PromotionsDashboardProps> = ({
  token,
  realmId,
  language = "ES",
}) => {
  const {
    promotions,
    pagination,
    filters,
    loading,
    error,
    setSearchTerm,
    setItemsPerPage,
    goToNextPage,
    goToPreviousPage,
    handleDeletePromotion,
    refetch,
  } = usePromotions({ token, realmId, language });

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Convertir promociones activas al formato del carousel
  const carouselItems: CarouselItem[] = useMemo(() => {
    // Mostrar todas las promociones activas (status !== false) o todas si no hay status definido
    const activePromotions = promotions
      .filter((promo) => promo.status === undefined || promo.status !== false)
      .slice(0, 4);

    if (activePromotions.length === 0) {
      // Si no hay promociones activas, retornar vacío
      return [];
    }

    return activePromotions.map((promo) => ({
      image: promo.img || "https://via.placeholder.com/400x200",
      title: promo.name || "Sin título",
      description: promo.description || "Sin descripción",
      buttonText: promo.btn_txt || "Ver más",
    }));
  }, [promotions]);

  if (loading) {
    return (
      <div className="rounded-2xl p-6 sm:p-8 bg-gaming-base-main/60 backdrop-blur-xl border border-gaming-base-light/30 shadow-2xl">
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl p-6 sm:p-8 bg-gaming-base-main/60 backdrop-blur-xl border border-gaming-base-light/30 shadow-2xl">
        <div className="text-center py-20">
          <p className="text-red-400 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6 sm:p-8 bg-gaming-base-main/60 backdrop-blur-xl border border-gaming-base-light/30 shadow-2xl">
      {/* Encabezado */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Promotions
        </h1>
        <p className="mt-2 text-gray-300">Boost your campaigns with style</p>
      </div>

      {/* Carousel */}
      <div className="mb-10 max-w-6xl mx-auto">
        {carouselItems.length > 0 ? (
          <Slider {...carouselSettings}>
            {carouselItems.map((item, index) => (
              <div key={index} className="flex justify-center items-center px-3">
                <div className="group w-80 rounded-2xl overflow-hidden bg-gaming-base-main/70 border border-gaming-base-light/30 shadow-[0_0_35px_-12px_rgba(168,85,247,0.5)] hover:shadow-[0_0_45px_-10px_rgba(168,85,247,0.8)] transition-all duration-300">
                  <div className="relative h-48">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80" />
                  </div>
                  <div className="p-5 text-center">
                    <h2 className="text-lg font-bold text-gaming-primary-light">
                      {item.title}
                    </h2>
                    <p className="text-sm text-gray-300 mt-1">
                      {item.description}
                    </p>
                    <button className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-gaming-primary-main to-gaming-primary-dark text-white hover:brightness-110 hover:shadow-lg border border-gaming-primary-main/30 transition-all duration-300 text-sm">
                      {item.buttonText}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        ) : (
          <div className="text-center py-12 bg-gaming-base-main/40 rounded-2xl border border-gaming-base-light/30">
            <p className="text-gray-400 text-lg">
              No hay promociones activas para mostrar
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Crea una nueva promoción para que aparezca en el carousel
            </p>
          </div>
        )}
      </div>

      {/* Acciones y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between mb-6">
        <div className="relative flex-1 min-w-0">
          <input
            type="text"
            placeholder="Search promotions..."
            value={filters.searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-xl bg-slate-900/60 text-white border border-gaming-base-light/30 focus:ring-2 focus:ring-gaming-primary-main/50 focus:outline-none placeholder:text-gray-400"
          />
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
              />
            </svg>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-gaming-primary-main to-gaming-primary-dark text-white hover:shadow-lg border border-gaming-primary-main/30 transition-all duration-300"
          >
            Crear Promoción
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-2xl border border-gaming-base-light/30 overflow-hidden bg-slate-900/40">
        <div
          className="overflow-x-auto"
          style={{ height: "400px", overflowY: "auto" }}
        >
          {promotions.length > 0 ? (
            <table className="w-full table-auto">
              <thead className="bg-slate-900/80 text-gray-300 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">ID</th>
                  <th className="px-4 py-3 text-left font-semibold">Name</th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">Discount</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {promotions.map((promo, index) => (
                  <tr
                    key={promo.id}
                    className={`transition-colors ${
                      index % 2 === 0 ? "bg-slate-900/30" : "bg-slate-900/50"
                    } hover:bg-slate-800/60`}
                  >
                    <td className="px-4 py-3 border-t border-slate-800/60">
                      {promo.id}
                    </td>
                    <td className="px-4 py-3 border-t border-slate-800/60">
                      {promo.name}
                    </td>
                    <td className="px-4 py-3 border-t border-slate-800/60">
                      {promo.description}
                    </td>
                    <td className="px-4 py-3 border-t border-slate-800/60">
                      {promo.discount}
                    </td>
                    <td className="px-4 py-3 border-t border-slate-800/60">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          promo.status !== false
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {promo.status !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-t border-slate-800/60">
                      <button
                        onClick={() => handleDeletePromotion(promo.id)}
                        className="px-3 py-1 rounded-lg bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30 transition-all duration-300 text-sm"
                        title="Eliminar promoción"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex items-center justify-center h-full py-20">
              <div className="text-center">
                <p className="text-gray-400 text-lg mb-2">
                  No hay promociones disponibles
                </p>
                <p className="text-gray-500 text-sm">
                  {filters.searchTerm
                    ? "Intenta con otro término de búsqueda"
                    : "Crea tu primera promoción para comenzar"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Paginación */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
        <div className="flex items-center gap-2">
          <label htmlFor="itemsPerPage" className="text-gray-300">
            Show:
          </label>
          <select
            id="itemsPerPage"
            value={filters.itemsPerPage}
            onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
            className="px-3 py-2 rounded-lg bg-slate-900/70 text-gray-200 border border-gaming-base-light/30 focus:ring-2 focus:ring-gaming-primary-main/40"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousPage}
            disabled={
              pagination.currentPage === 1 || pagination.totalPages === 0
            }
            className="px-4 py-2 rounded-lg bg-slate-900/70 text-gray-200 border border-slate-700 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-gray-300">
            Page {pagination.totalPages > 0 ? pagination.currentPage : 0} of{" "}
            {pagination.totalPages > 0 ? pagination.totalPages : 0}
          </span>
          <button
            onClick={goToNextPage}
            disabled={
              pagination.currentPage === pagination.totalPages ||
              pagination.totalPages === 0
            }
            className="px-4 py-2 rounded-lg bg-slate-900/70 text-gray-200 border border-slate-700 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal de Crear Promoción */}
      <CreatePromotionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          refetch();
          setIsModalOpen(false);
        }}
        token={token}
        realmId={realmId}
        language={language}
      />
    </div>
  );
};

export default PromotionsDashboard;

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
      <div className="rounded-xl p-6 sm:p-8 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 shadow-xl">
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl p-6 sm:p-8 bg-slate-900/95 backdrop-blur-xl border border-red-500/30 shadow-xl">
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-red-400 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-slate-950/95 via-slate-900/95 to-slate-950/95 backdrop-blur-xl border border-slate-700/50 shadow-2xl relative overflow-hidden">
      {/* Efecto de fondo decorativo sutil */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10">
        {/* Encabezado */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="h-1 w-20 bg-gradient-to-r from-indigo-500 to-violet-500 mx-auto mb-4 rounded-full"></div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
              Promotions
            </h1>
            <div className="h-1 w-20 bg-gradient-to-r from-violet-500 to-indigo-500 mx-auto mt-4 rounded-full"></div>
          </div>
          <p className="mt-4 text-gray-400 text-base font-medium tracking-wide uppercase">Manage and Monitor Your Campaigns</p>
        </div>

        {/* Carousel */}
        <div className="mb-12 max-w-7xl mx-auto">
          {carouselItems.length > 0 ? (
            <Slider {...carouselSettings}>
              {carouselItems.map((item, index) => (
                <div key={index} className="flex justify-center items-center px-3">
                  <div className="group w-full max-w-sm rounded-xl overflow-hidden bg-slate-800/40 border border-slate-700/50 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 transform hover:scale-[1.02] hover:-translate-y-1">
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    </div>
                    <div className="p-6 bg-slate-800/60 backdrop-blur-sm">
                      <h2 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors duration-300">
                        {item.title}
                      </h2>
                      <p className="text-sm text-gray-400 mb-4 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                      <button className="w-full px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 text-sm">
                        {item.buttonText}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          ) : (
            <div className="text-center py-16 bg-slate-800/30 rounded-xl border border-slate-700/50">
              <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-slate-700/50 flex items-center justify-center border border-slate-600/50">
                <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-slate-300 text-lg font-semibold mb-2">
                No hay promociones activas
              </p>
              <p className="text-slate-400 text-sm">
                Crea una nueva promoción para comenzar
              </p>
            </div>
          )}
        </div>

        {/* Acciones y búsqueda */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between mb-8">
          <div className="relative flex-1 min-w-0">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
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
            <input
              type="text"
              placeholder="Search promotions..."
              value={filters.searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg bg-slate-800/50 text-white border border-slate-700/50 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:outline-none placeholder:text-slate-500 transition-all duration-200 hover:border-slate-600/50"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg hover:shadow-xl hover:shadow-indigo-500/20 transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Crear Promoción
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div className="rounded-xl border border-slate-700/50 overflow-hidden bg-slate-800/30 shadow-lg">
          <div
            className="overflow-x-auto"
            style={{ height: "400px", overflowY: "auto" }}
          >
            {promotions.length > 0 ? (
              <table className="w-full table-auto">
                <thead className="bg-slate-800/80 text-slate-300 sticky top-0 z-10 backdrop-blur-sm border-b border-slate-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Discount</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {promotions.map((promo, index) => (
                    <tr
                      key={promo.id}
                      className={`transition-colors duration-150 ${
                        index % 2 === 0 
                          ? "bg-slate-800/20 hover:bg-slate-700/30" 
                          : "bg-slate-900/20 hover:bg-slate-700/30"
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-300">
                        {promo.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">
                        {promo.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400 max-w-xs truncate">
                        {promo.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-indigo-400">
                          {promo.discount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                            promo.status !== false
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}
                        >
                          {promo.status !== false ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleDeletePromotion(promo.id)}
                          className="px-3 py-1.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 text-xs font-medium"
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
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-700/50 flex items-center justify-center border border-slate-600/50">
                    <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-slate-300 text-base font-medium mb-1">
                    No hay promociones disponibles
                  </p>
                  <p className="text-slate-500 text-sm">
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
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-6 border-t border-slate-700/50">
          <div className="flex items-center gap-3">
            <label htmlFor="itemsPerPage" className="text-sm text-slate-400 font-medium">
              Mostrar:
            </label>
            <select
              id="itemsPerPage"
              value={filters.itemsPerPage}
              onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
              className="px-3 py-2 rounded-lg bg-slate-800/50 text-slate-200 border border-slate-700/50 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 hover:border-slate-600/50 transition-all duration-200 cursor-pointer text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={goToPreviousPage}
              disabled={
                pagination.currentPage === 1 || pagination.totalPages === 0
              }
              className="px-4 py-2 rounded-lg bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:bg-slate-700/50 hover:text-white hover:border-slate-600/50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-800/50 transition-all duration-200 text-sm font-medium"
            >
              Anterior
            </button>
            <span className="text-sm text-slate-400 font-medium px-4">
              Página {pagination.totalPages > 0 ? pagination.currentPage : 0} de{" "}
              {pagination.totalPages > 0 ? pagination.totalPages : 0}
            </span>
            <button
              onClick={goToNextPage}
              disabled={
                pagination.currentPage === pagination.totalPages ||
                pagination.totalPages === 0
              }
              className="px-4 py-2 rounded-lg bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:bg-slate-700/50 hover:text-white hover:border-slate-600/50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-800/50 transition-all duration-200 text-sm font-medium"
            >
              Siguiente
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
    </div>
  );
};

export default PromotionsDashboard;

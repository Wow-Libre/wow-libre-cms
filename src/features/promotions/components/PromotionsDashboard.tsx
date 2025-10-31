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
    <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 backdrop-blur-xl border border-purple-500/20 shadow-2xl relative overflow-hidden">
      {/* Efecto de fondo decorativo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10">
        {/* Encabezado */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Promotions
          </h1>
          <p className="mt-2 text-gray-300 text-lg">Boost your campaigns with style</p>
        </div>

        {/* Carousel */}
        <div className="mb-10 max-w-6xl mx-auto">
          {carouselItems.length > 0 ? (
            <Slider {...carouselSettings}>
              {carouselItems.map((item, index) => (
                <div key={index} className="flex justify-center items-center px-3">
                  <div className="group w-80 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-purple-500/30 shadow-[0_0_35px_-12px_rgba(168,85,247,0.5)] hover:shadow-[0_0_50px_-5px_rgba(168,85,247,1)] transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                      {/* Efecto de brillo en hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    </div>
                    <div className="p-5 text-center bg-gradient-to-b from-slate-800/50 to-slate-900/50">
                      <h2 className="text-lg font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent group-hover:from-purple-200 group-hover:to-pink-200 transition-all duration-300">
                        {item.title}
                      </h2>
                      <p className="text-sm text-gray-300 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                      <button className="mt-4 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 border border-purple-400/30 transition-all duration-300 text-sm transform hover:scale-105">
                        {item.buttonText}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          ) : (
            <div className="text-center py-12 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-purple-500/20 shadow-lg">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-gray-300 text-lg font-semibold">
                No hay promociones activas para mostrar
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Crea una nueva promoción para que aparezca en el carousel
              </p>
            </div>
          )}
        </div>

        {/* Acciones y búsqueda */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between mb-6">
          <div className="relative flex-1 min-w-0 group">
            <input
              type="text"
              placeholder="Search promotions..."
              value={filters.searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 rounded-xl bg-gradient-to-r from-slate-800/80 to-slate-900/80 text-white border border-purple-500/30 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 focus:outline-none placeholder:text-gray-500 transition-all duration-300 group-hover:border-purple-400/50"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 group-focus-within:text-purple-300 transition-colors duration-300">
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
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-75 group-hover:opacity-100 blur-sm transition-opacity duration-300"></div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="relative px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 border border-purple-400/30 transition-all duration-300 transform hover:scale-105"
              >
                Crear Promoción
              </button>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="rounded-2xl border border-purple-500/20 overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60 shadow-xl">
          <div
            className="overflow-x-auto"
            style={{ height: "400px", overflowY: "auto" }}
          >
            {promotions.length > 0 ? (
              <table className="w-full table-auto">
                <thead className="bg-gradient-to-r from-purple-900/80 via-pink-900/80 to-purple-900/80 text-gray-200 sticky top-0 z-10 backdrop-blur-sm">
                  <tr>
                    <th className="px-4 py-4 text-left font-bold text-purple-200">ID</th>
                    <th className="px-4 py-4 text-left font-bold text-purple-200">Name</th>
                    <th className="px-4 py-4 text-left font-bold text-purple-200">
                      Description
                    </th>
                    <th className="px-4 py-4 text-left font-bold text-purple-200">Discount</th>
                    <th className="px-4 py-4 text-left font-bold text-purple-200">Status</th>
                    <th className="px-4 py-4 text-left font-bold text-purple-200">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {promotions.map((promo, index) => (
                    <tr
                      key={promo.id}
                      className={`transition-all duration-300 ${
                        index % 2 === 0 
                          ? "bg-slate-800/30 hover:bg-slate-700/40" 
                          : "bg-slate-900/30 hover:bg-slate-700/40"
                      } border-b border-slate-700/30`}
                    >
                      <td className="px-4 py-3 text-white font-medium">
                        {promo.id}
                      </td>
                      <td className="px-4 py-3 text-gray-200 font-semibold">
                        {promo.name}
                      </td>
                      <td className="px-4 py-3 text-gray-300 max-w-xs truncate">
                        {promo.description}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-purple-300 font-semibold">
                          {promo.discount}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            promo.status !== false
                              ? "bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-green-300 border border-green-500/50"
                              : "bg-gradient-to-r from-red-500/30 to-rose-500/30 text-red-300 border border-red-500/50"
                          }`}
                        >
                          {promo.status !== false ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDeletePromotion(promo.id)}
                          className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-600/20 to-rose-600/20 text-red-300 border border-red-500/30 hover:from-red-600/30 hover:to-rose-600/30 hover:text-red-200 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 text-sm font-semibold transform hover:scale-105"
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
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <svg className="w-10 h-10 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-300 text-lg font-semibold mb-2">
                    No hay promociones disponibles
                  </p>
                  <p className="text-gray-400 text-sm">
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
          <div className="flex items-center gap-3">
            <label htmlFor="itemsPerPage" className="text-gray-300 font-medium">
              Show:
            </label>
            <select
              id="itemsPerPage"
              value={filters.itemsPerPage}
              onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-slate-800/80 to-slate-900/80 text-gray-200 border border-purple-500/30 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 hover:border-purple-400/50 transition-all duration-300 cursor-pointer"
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
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-slate-800/80 to-slate-900/80 text-gray-200 border border-purple-500/30 hover:from-purple-600/20 hover:to-pink-600/20 hover:border-purple-400/50 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold"
            >
              Previous
            </button>
            <span className="text-gray-200 font-semibold px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30">
              Page {pagination.totalPages > 0 ? pagination.currentPage : 0} of{" "}
              {pagination.totalPages > 0 ? pagination.totalPages : 0}
            </span>
            <button
              onClick={goToNextPage}
              disabled={
                pagination.currentPage === pagination.totalPages ||
                pagination.totalPages === 0
              }
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-slate-800/80 to-slate-900/80 text-gray-200 border border-purple-500/30 hover:from-purple-600/20 hover:to-pink-600/20 hover:border-purple-400/50 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold"
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
    </div>
  );
};

export default PromotionsDashboard;

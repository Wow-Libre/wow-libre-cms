"use client";

import React, { useMemo, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { usePremium } from "../hooks/usePremium";
import { CarouselItem } from "../types";
import LoadingSpinner from "@/components/utilities/loading-spinner";
import CreatePremiumModal from "./CreatePremiumModal";

interface PremiumDashboardProps {
  token: string;
  realmId: number;
  language?: string;
}

// Configuración del carousel será dinámica basada en la cantidad de elementos
const getCarouselSettings = (itemsCount: number) => ({
  dots: true,
  infinite: itemsCount > 3,
  speed: 500,
  slidesToShow: Math.min(3, itemsCount),
  slidesToScroll: 1,
  autoplay: itemsCount > 3,
  autoplaySpeed: 3000,
  arrows: itemsCount > 3,
  centerMode: false,
  variableWidth: false,
  responsive: [
    {
      breakpoint: 768,
      settings: {
        slidesToShow: Math.min(1, itemsCount),
        slidesToScroll: 1,
        infinite: itemsCount > 1,
        arrows: itemsCount > 1,
      },
    },
  ],
});

const PremiumDashboard: React.FC<PremiumDashboardProps> = ({
  token,
  realmId,
  language = "ES",
}) => {
  const {
    premiumPackages,
    pagination,
    filters,
    loading,
    error,
    setSearchTerm,
    setItemsPerPage,
    goToNextPage,
    goToPreviousPage,
    handleDeletePremiumPackage,
    refetch,
  } = usePremium({ token, realmId, language });

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Convertir paquetes activos al formato del carousel
  const carouselItems: CarouselItem[] = useMemo(() => {
    // Mostrar todos los paquetes (no hay campo status en el DTO)
    const activePackages = premiumPackages.slice(0, 4);

    if (activePackages.length === 0) {
      return [];
    }

    return activePackages.map((pkg) => ({
      image: pkg.img || "https://via.placeholder.com/400x200",
      title: pkg.name || "Sin título",
      description: pkg.description || "Sin descripción",
      buttonText: pkg.btnText || "Ver más",
    }));
  }, [premiumPackages]);

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
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10">
        {/* Encabezado */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="h-1 w-20 bg-gradient-to-r from-amber-500 to-yellow-500 mx-auto mb-4 rounded-full"></div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
              Premium Packages
            </h1>
            <div className="h-1 w-20 bg-gradient-to-r from-yellow-500 to-amber-500 mx-auto mt-4 rounded-full"></div>
          </div>
          <p className="mt-4 text-gray-400 text-base font-medium tracking-wide uppercase">Manage and Monitor Your Premium Packages</p>
        </div>

        {/* Carousel */}
        <div className="mb-12 max-w-7xl mx-auto">
          {carouselItems.length > 0 ? (
            <Slider {...getCarouselSettings(carouselItems.length)}>
              {carouselItems.map((item, index) => (
                <div key={index} className="flex justify-center items-center px-3">
                  <div className="group w-full max-w-sm rounded-xl overflow-hidden bg-slate-800/40 border border-slate-700/50 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500 transform hover:scale-[1.02] hover:-translate-y-1">
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    </div>
                    <div className="p-6 bg-slate-800/60 backdrop-blur-sm">
                      <h2 className="text-xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors duration-300">
                        {item.title}
                      </h2>
                      <p className="text-base text-gray-400 mb-4 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                      <button className="w-full px-5 py-2.5 text-base rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-300">
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
                No hay paquetes premium activos
              </p>
              <p className="text-slate-400 text-base">
                Crea un nuevo paquete premium para comenzar
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
              placeholder="Search premium packages..."
              value={filters.searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-base rounded-lg bg-slate-800/50 text-white border border-slate-700/50 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 focus:outline-none placeholder:text-slate-500 transition-all duration-200 hover:border-slate-600/50"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 text-base rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold shadow-lg hover:shadow-amber-500/50 transition-all duration-300 flex items-center gap-2 transform hover:scale-105 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Crear Paquete Premium
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div className="rounded-xl border border-slate-700/50 overflow-hidden bg-slate-800/30 shadow-lg">
          <div
            className="overflow-x-auto"
            style={{ maxHeight: "600px", overflowY: "auto" }}
          >
            {premiumPackages.length > 0 ? (
              <table className="w-full table-auto min-w-[1200px]">
                <thead className="bg-slate-800/80 text-slate-300 sticky top-0 z-10 backdrop-blur-sm border-b border-slate-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300 uppercase tracking-wider">Imagen</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300 uppercase tracking-wider">Nombre</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300 uppercase tracking-wider">Descripción</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300 uppercase tracking-wider">Tipo</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300 uppercase tracking-wider">Comando</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300 uppercase tracking-wider">Enviar Item</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300 uppercase tracking-wider">Reactivable</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {premiumPackages.map((pkg, index) => {
                    const getTypeLabel = (type?: string) => {
                      switch (type) {
                        case "CHANGE_FACTION":
                          return { label: "Cambiar Facción", color: "bg-red-500/10 text-red-400 border-red-500/20" };
                        case "CHANGE_RACE":
                          return { label: "Cambiar Raza", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" };
                        case "CUSTOMIZE":
                          return { label: "Personalizar", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" };
                        case "ITEM":
                          return { label: "Item", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" };
                        default:
                          return { label: type || "N/A", color: "bg-slate-500/10 text-slate-400 border-slate-500/20" };
                      }
                    };
                    const typeInfo = getTypeLabel(pkg.type);

                    return (
                      <tr
                        key={pkg.id}
                        className={`transition-colors duration-150 ${
                          index % 2 === 0 
                            ? "bg-slate-800/20 hover:bg-slate-700/30" 
                            : "bg-slate-900/20 hover:bg-slate-700/30"
                        }`}
                      >
                        <td className="px-4 py-3">
                          {pkg.img ? (
                            <img
                              src={pkg.img}
                              alt={pkg.name}
                              className="w-12 h-12 object-cover rounded-lg border border-slate-600/50"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "https://via.placeholder.com/48?text=No+Img";
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-slate-700/50 border border-slate-600/50 flex items-center justify-center">
                              <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-base font-semibold text-white">{pkg.name}</div>
                          <div className="text-sm text-slate-500 mt-0.5">ID: {pkg.id}</div>
                        </td>
                        <td className="px-4 py-3 max-w-xs">
                          <div className="text-base text-slate-300 line-clamp-2">{pkg.description || "Sin descripción"}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium border ${typeInfo.color}`}>
                            {typeInfo.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-base font-mono text-slate-300 bg-slate-700/50 px-2.5 py-1 rounded-md border border-slate-600/50">
                            {pkg.command || "-"}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium border ${
                              pkg.sendItem
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                            }`}
                          >
                            {pkg.sendItem ? "Sí" : "No"}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium border ${
                              pkg.reactivable
                                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                            }`}
                          >
                            {pkg.reactivable ? "Sí" : "No"}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            onClick={() => handleDeletePremiumPackage(pkg.id)}
                            className="px-3 py-1.5 text-sm rounded-md bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 font-medium"
                            title="Eliminar paquete premium"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
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
                    No hay paquetes premium disponibles
                  </p>
                  <p className="text-slate-500 text-base">
                    {filters.searchTerm
                      ? "Intenta con otro término de búsqueda"
                      : "Crea tu primer paquete premium para comenzar"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Paginación */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-6 border-t border-slate-700/50">
          <div className="flex items-center gap-3">
            <label htmlFor="itemsPerPage" className="text-base text-slate-400 font-medium">
              Mostrar:
            </label>
            <select
              id="itemsPerPage"
              value={filters.itemsPerPage}
              onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
              className="px-3 py-2 text-base rounded-lg bg-slate-800/50 text-slate-200 border border-slate-700/50 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 hover:border-slate-600/50 transition-all duration-200 cursor-pointer"
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
              className="px-4 py-2 text-base rounded-lg bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:bg-slate-700/50 hover:text-white hover:border-slate-600/50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-800/50 transition-all duration-200 font-medium"
            >
              Anterior
            </button>
            <span className="text-base text-slate-400 font-medium px-4">
              Página {pagination.totalPages > 0 ? pagination.currentPage : 0} de{" "}
              {pagination.totalPages > 0 ? pagination.totalPages : 0}
            </span>
            <button
              onClick={goToNextPage}
              disabled={
                pagination.currentPage === pagination.totalPages ||
                pagination.totalPages === 0
              }
              className="px-4 py-2 text-base rounded-lg bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:bg-slate-700/50 hover:text-white hover:border-slate-600/50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-800/50 transition-all duration-200 font-medium"
            >
              Siguiente
            </button>
          </div>
        </div>

        {/* Modal de Crear Paquete Premium */}
        <CreatePremiumModal
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

export default PremiumDashboard;


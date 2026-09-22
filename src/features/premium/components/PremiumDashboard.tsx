"use client";

import React, { useMemo, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { usePremium } from "../hooks/usePremium";
import { CarouselItem } from "../types";
import { DashboardLoading, DashboardSection } from "@/components/dashboard/layout";
import { DASHBOARD_PALETTE } from "@/components/dashboard/styles/dashboardPalette";
import CreatePremiumModal from "./CreatePremiumModal";

interface PremiumDashboardProps {
  token: string;
  realmId: number;
  language?: string;
}

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

function typeBadge(type?: string) {
  switch (type) {
    case "CHANGE_FACTION":
      return {
        label: "Cambiar Facción",
        className: "border-[#ff3b30]/25 bg-[#ff3b30]/8 text-[#ff3b30]",
      };
    case "CHANGE_RACE":
      return {
        label: "Cambiar Raza",
        className: "border-[#0071e3]/20 bg-[#0071e3]/10 text-[#0071e3]",
      };
    case "CUSTOMIZE":
      return {
        label: "Personalizar",
        className: "border-[#af52de]/20 bg-[#af52de]/10 text-[#7d3caf]",
      };
    case "ITEM":
      return {
        label: "Item",
        className: "border-[#ff9f0a]/25 bg-[#ff9f0a]/10 text-[#c77b00]",
      };
    case "LEVEL":
      return {
        label: "Nivel",
        className: "border-[#34c759]/25 bg-[#34c759]/10 text-[#1f8a38]",
      };
    default:
      return {
        label: type || "N/A",
        className: "border-black/10 bg-[#f5f5f7] text-[#6e6e73]",
      };
  }
}

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

  const carouselItems: CarouselItem[] = useMemo(() => {
    const activePackages = premiumPackages.slice(0, 4);
    if (activePackages.length === 0) return [];
    return activePackages.map((pkg) => ({
      image: pkg.img || "https://via.placeholder.com/400x200",
      title: pkg.name || "Sin título",
      description: pkg.description || "Sin descripción",
      buttonText: pkg.btnText || "Ver más",
    }));
  }, [premiumPackages]);

  if (loading) {
    return <DashboardLoading />;
  }

  if (error) {
    return (
      <div className={`rounded-2xl p-8 text-center ${DASHBOARD_PALETTE.card}`}>
        <p className="text-lg font-semibold text-[#ff3b30]">{error}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${DASHBOARD_PALETTE.text}`}>
      <div className="text-center">
        <h1 className={`text-3xl font-semibold tracking-tight sm:text-4xl ${DASHBOARD_PALETTE.text}`}>
          Paquetes premium
        </h1>
        <p className={`mt-2 text-lg ${DASHBOARD_PALETTE.textMuted}`}>
          Gestioná y publicá los beneficios premium del reino
        </p>
      </div>

      <div className="mx-auto max-w-7xl">
        {carouselItems.length > 0 ? (
          <Slider {...getCarouselSettings(carouselItems.length)}>
            {carouselItems.map((item, index) => (
              <div key={index} className="flex items-center justify-center px-3">
                <div className={`group w-full max-w-sm overflow-hidden rounded-2xl ${DASHBOARD_PALETTE.card}`}>
                  <div className="relative h-56 overflow-hidden bg-[#f5f5f7]">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <h2 className="absolute bottom-4 left-4 right-4 text-2xl font-bold leading-tight text-white">
                      {item.title}
                    </h2>
                  </div>
                  <div className="p-6">
                    <p className={`mb-5 line-clamp-2 text-lg leading-relaxed ${DASHBOARD_PALETTE.textMuted}`}>
                      {item.description}
                    </p>
                    <button type="button" className={`w-full ${DASHBOARD_PALETTE.btnPrimary}`}>
                      {item.buttonText}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        ) : (
          <div className={`rounded-2xl px-6 py-16 text-center ${DASHBOARD_PALETTE.card}`}>
            <p className={`text-xl font-semibold ${DASHBOARD_PALETTE.text}`}>
              No hay paquetes premium activos
            </p>
            <p className={`mt-2 text-lg ${DASHBOARD_PALETTE.textMuted}`}>
              Creá un paquete premium para comenzar
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <div className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${DASHBOARD_PALETTE.textMuted}`}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            placeholder="Buscar paquetes premium..."
            value={filters.searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${DASHBOARD_PALETTE.input} pl-12 text-lg`}
          />
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={`inline-flex items-center justify-center gap-2 ${DASHBOARD_PALETTE.btnPrimary} text-lg`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Crear paquete premium
        </button>
      </div>

      <DashboardSection
        noPadding
        title="Paquetes registrados"
        description="Listado de beneficios premium del reino"
      >
        <div className="overflow-x-auto" style={{ maxHeight: "600px", overflowY: "auto" }}>
          {premiumPackages.length > 0 ? (
            <table className="w-full min-w-[1100px] border-collapse">
              <thead className="sticky top-0 z-10 bg-[#f5f5f7]">
                <tr>
                  {[
                    "Imagen",
                    "Nombre",
                    "Descripción",
                    "Tipo",
                    "Comando",
                    "Enviar item",
                    "Reactivable",
                    "Acciones",
                  ].map((label) => (
                    <th
                      key={label}
                      className={`border-b border-black/[0.08] px-4 py-3.5 text-left text-base font-semibold ${DASHBOARD_PALETTE.textMuted} ${
                        label === "Acciones" ? "text-right" : ""
                      }`}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {premiumPackages.map((pkg) => {
                  const typeInfo = typeBadge(pkg.type);
                  return (
                    <tr key={pkg.id} className="bg-white hover:bg-[#fbfbfd]">
                      <td className="border-b border-black/[0.08] px-4 py-4">
                        {pkg.img ? (
                          <img
                            src={pkg.img}
                            alt={pkg.name}
                            className="h-14 w-14 rounded-xl border border-black/10 object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://via.placeholder.com/56/f5f5f7/86868b?text=·";
                            }}
                          />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-black/10 bg-[#f5f5f7] text-[#86868b]">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                      </td>
                      <td className="border-b border-black/[0.08] px-4 py-4 whitespace-nowrap">
                        <div className={`text-lg font-semibold ${DASHBOARD_PALETTE.text}`}>{pkg.name}</div>
                        <div className={`mt-1 font-mono text-base ${DASHBOARD_PALETTE.textMuted}`}>
                          ID · {pkg.id}
                        </div>
                      </td>
                      <td className="border-b border-black/[0.08] px-4 py-4 max-w-xs">
                        <div className={`line-clamp-2 text-lg ${DASHBOARD_PALETTE.textMuted}`}>
                          {pkg.description || "Sin descripción"}
                        </div>
                      </td>
                      <td className="border-b border-black/[0.08] px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-base font-semibold ${typeInfo.className}`}
                        >
                          {typeInfo.label}
                        </span>
                      </td>
                      <td className="border-b border-black/[0.08] px-4 py-4 whitespace-nowrap">
                        <div
                          className={`rounded-full border border-black/10 bg-[#f5f5f7] px-3 py-1 font-mono text-base ${DASHBOARD_PALETTE.text}`}
                        >
                          {pkg.command || "—"}
                        </div>
                      </td>
                      <td className="border-b border-black/[0.08] px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-base font-semibold ${
                            pkg.sendItem
                              ? "border-[#34c759]/25 bg-[#34c759]/10 text-[#1f8a38]"
                              : "border-black/10 bg-[#f5f5f7] text-[#6e6e73]"
                          }`}
                        >
                          {pkg.sendItem ? "Sí" : "No"}
                        </span>
                      </td>
                      <td className="border-b border-black/[0.08] px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-base font-semibold ${
                            pkg.reactivable
                              ? "border-[#0071e3]/20 bg-[#0071e3]/10 text-[#0071e3]"
                              : "border-black/10 bg-[#f5f5f7] text-[#6e6e73]"
                          }`}
                        >
                          {pkg.reactivable ? "Sí" : "No"}
                        </span>
                      </td>
                      <td className="border-b border-black/[0.08] px-4 py-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleDeletePremiumPackage(pkg.id)}
                          className={DASHBOARD_PALETTE.btnDanger}
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
            <div className="px-6 py-16 text-center">
              <p className={`text-xl font-semibold ${DASHBOARD_PALETTE.text}`}>
                No hay paquetes premium disponibles
              </p>
              <p className={`mt-2 text-lg ${DASHBOARD_PALETTE.textMuted}`}>
                {filters.searchTerm
                  ? "Probá con otro término de búsqueda"
                  : "Creá tu primer paquete premium para comenzar"}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-black/[0.08] bg-white px-5 py-4 sm:flex-row sm:px-8">
          <div className="flex items-center gap-3">
            <label htmlFor="itemsPerPage" className={`text-lg ${DASHBOARD_PALETTE.textMuted}`}>
              Mostrar
            </label>
            <select
              id="itemsPerPage"
              value={filters.itemsPerPage}
              onChange={(e) => setItemsPerPage(parseInt(e.target.value, 10))}
              className="rounded-full border border-black/10 bg-[#fbfbfd] px-4 py-2 text-lg text-[#1d1d1f] outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/15"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goToPreviousPage}
              disabled={pagination.currentPage === 1 || pagination.totalPages === 0}
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-lg font-medium text-[#1d1d1f] transition hover:bg-[#f5f5f7] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Anterior
            </button>
            <span className={`px-3 text-lg ${DASHBOARD_PALETTE.textMuted}`}>
              Página{" "}
              <span className={`font-semibold tabular-nums ${DASHBOARD_PALETTE.text}`}>
                {pagination.totalPages > 0 ? pagination.currentPage : 0}
              </span>{" "}
              de{" "}
              <span className={`font-semibold tabular-nums ${DASHBOARD_PALETTE.text}`}>
                {pagination.totalPages > 0 ? pagination.totalPages : 0}
              </span>
            </span>
            <button
              type="button"
              onClick={goToNextPage}
              disabled={
                pagination.currentPage === pagination.totalPages || pagination.totalPages === 0
              }
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-lg font-medium text-[#1d1d1f] transition hover:bg-[#f5f5f7] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      </DashboardSection>

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
  );
};

export default PremiumDashboard;

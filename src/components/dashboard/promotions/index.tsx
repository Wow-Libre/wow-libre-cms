"use client";

import React, { useEffect, useState } from "react";
import Slider from "react-slick"; // Import react-slick
import "slick-carousel/slick/slick.css"; // Import carousel styles
import "slick-carousel/slick/slick-theme.css";

interface Promotion {
  id: number;
  name: string;
  description: string;
  discount: string;
}

const PromotionsDashboard: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalElements, setTotalElements] = useState<number>(0);

  // Mock promotions data
  const fetchPromotions = async () => {
    const mockData: Promotion[] = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      name: `Promotion ${i + 1}`,
      description: `Description for Promotion ${i + 1}`,
      discount: `${10 + (i % 10) * 5}%`,
    }));

    const filteredData = mockData.filter((promo) =>
      promo.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const paginatedData = filteredData.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

    setPromotions(paginatedData);
    setTotalElements(filteredData.length);
  };

  useEffect(() => {
    fetchPromotions();
  }, [searchTerm, currentPage, itemsPerPage]);

  const totalPages =
    totalElements && itemsPerPage ? Math.ceil(totalElements / itemsPerPage) : 0;

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages]);

  const carouselItems = [
    {
      image: "https://via.placeholder.com/400x200?text=Promotion+1",
      title: "Promotion 1",
      description: "This is the first promotion",
      buttonText: "Learn More",
    },
    {
      image: "https://via.placeholder.com/400x200?text=Promotion+2",
      title: "Promotion 2",
      description: "This is the second promotion",
      buttonText: "Shop Now",
    },
    {
      image: "https://via.placeholder.com/400x200?text=Promotion+3",
      title: "Promotion 3",
      description: "This is the third promotion",
      buttonText: "Get Started",
    },
    {
      image: "https://via.placeholder.com/400x200?text=Promotion+4",
      title: "Promotion 4",
      description: "This is the fourth promotion",
      buttonText: "Explore",
    },
  ];

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
      </div>

      {/* Acciones y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between mb-6">
        <div className="relative flex-1 min-w-0">
          <input
            type="text"
            placeholder="Search promotions..."
            value={searchTerm}
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
            onClick={() => alert("Crear nueva promoción")}
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
          <table className="w-full table-auto">
            <thead className="bg-slate-900/80 text-gray-300 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">ID</th>
                <th className="px-4 py-3 text-left font-semibold">Name</th>
                <th className="px-4 py-3 text-left font-semibold">
                  Description
                </th>
                <th className="px-4 py-3 text-left font-semibold">Discount</th>
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
                </tr>
              ))}
            </tbody>
          </table>
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
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
            className="px-3 py-2 rounded-lg bg-slate-900/70 text-gray-200 border border-gaming-base-light/30 focus:ring-2 focus:ring-gaming-primary-main/40"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || totalPages === 0}
            className="px-4 py-2 rounded-lg bg-slate-900/70 text-gray-200 border border-slate-700 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-gray-300">
            Page {totalPages > 0 ? currentPage : 0} of{" "}
            {totalPages > 0 ? totalPages : 0}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-4 py-2 rounded-lg bg-slate-900/70 text-gray-200 border border-slate-700 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromotionsDashboard;

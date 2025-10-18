"use client";
import { getNews } from "@/api/news";
import LoadingSpinnerCentral from "@/components/utilities/loading-spinner-v2";
import { NewsModel } from "@/model/News";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

// Componente memoizado para cada tarjeta de noticia
const NewsCard = ({
  item,
  slideSize,
  useCenterMode,
}: {
  item: NewsModel;
  slideSize: { width: string; height: string };
  useCenterMode: boolean;
}) => (
  <Link href={`/news/${item.id}`} key={item.id} passHref>
    <div
      className="group block rounded-xl shadow-2xl relative flex-shrink-0 mx-2 transform transition-all duration-500 ease-out hover:scale-105 hover:shadow-3xl cursor-pointer overflow-hidden"
      style={{
        backgroundImage: `url(${item.img_url})`,
        height: slideSize.height,
        width: useCenterMode ? slideSize.width : "100%",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay con gradiente mejorado */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent rounded-xl transition-all duration-500 group-hover:from-black/95 group-hover:via-black/40" />

      {/* Efecto de brillo en hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />

      {/* Contenido de la tarjeta */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="transform transition-transform duration-500 group-hover:translate-y-[-4px]">
          <h3 className="text-yellow-400 font-bold text-lg md:text-xl mb-2 line-clamp-2 group-hover:text-yellow-300 transition-colors duration-300">
            {item.title}
          </h3>
          <div className="flex items-center justify-between">
            <p className="text-gray-300 text-sm group-hover:text-gray-200 transition-colors duration-300">
              {new Date(item.created_at).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <svg
                className="w-5 h-5 text-yellow-400"
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
          </div>
        </div>
      </div>
    </div>
  </Link>
);

const LatestNewsCarousel = () => {
  const [centerSlidePercentage, setCenterSlidePercentage] = useState(33);
  const [slideSize, setSlideSize] = useState({
    width: "250px",
    height: "200px",
  });
  const [newsItems, setNewsItems] = useState<NewsModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<boolean>(false);

  // Memoizar la función de actualización de tamaños
  const updateSizes = useCallback(() => {
    if (window.innerWidth < 640) {
      setCenterSlidePercentage(80);
      setSlideSize({ width: "90vw", height: "220px" });
    } else if (window.innerWidth < 1024) {
      setCenterSlidePercentage(45);
      setSlideSize({ width: "45vw", height: "240px" });
    } else {
      setCenterSlidePercentage(33);
      setSlideSize({ width: "280px", height: "260px" });
    }
  }, []);

  useEffect(() => {
    updateSizes();
    window.addEventListener("resize", updateSizes);
    return () => window.removeEventListener("resize", updateSizes);
  }, [updateSizes]);

  // Memoizar la función de fetch
  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getNews(10, 0);
      setNewsItems(data);
      setError(data.length === 0);
    } catch (err: any) {
      console.warn("Error fetching news:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Memoizar valores computados
  const hasMultiple = useMemo(() => newsItems.length > 1, [newsItems.length]);
  const useCenterMode = useMemo(() => newsItems.length > 5, [newsItems.length]);

  if (loading) return <LoadingSpinnerCentral />;
  if (error) return null;

  return (
    <div className="bg-gradient-to-br from-midnight via-midnight/95 to-gray-800/90 contenedor mt-10 text-white px-4 py-8 sm:px-8 relative overflow-hidden">
      {/* Efecto de fondo decorativo sutil */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-600/8 via-transparent to-gray-500/8 pointer-events-none" />

      {/* Patrón de textura sutil */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white title-server relative">
            <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Noticias y Actualizaciones
            </span>
            <div className="absolute -bottom-2 left-0 w-20 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full" />
          </h2>
          <div className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-3 py-1 rounded-full border border-green-500/30">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
            <span className="text-sm font-medium text-green-300">En Vivo</span>
          </div>
        </div>

        <Carousel
          showArrows={hasMultiple}
          infiniteLoop={hasMultiple}
          autoPlay={hasMultiple}
          interval={4000}
          showThumbs={false}
          showStatus={false}
          showIndicators={hasMultiple}
          centerMode={useCenterMode}
          centerSlidePercentage={useCenterMode ? centerSlidePercentage : 100}
          swipeable={hasMultiple}
          emulateTouch={hasMultiple}
          className="[&_.carousel-root]:outline-none [&_.carousel_.control-arrow]:!top-1/2 [&_.carousel_.control-arrow]:!-translate-y-1/2 [&_.carousel_.control-arrow]:bg-white/20 [&_.carousel_.control-arrow]:backdrop-blur-sm [&_.carousel_.control-arrow]:rounded-2xl [&_.carousel_.control-arrow]:border [&_.carousel_.control-arrow]:border-white/30 [&_.carousel_.control-arrow]:w-12 [&_.carousel_.control-arrow]:h-12 [&_.carousel_.control-arrow]:transition-all [&_.carousel_.control-arrow]:duration-300 [&_.carousel_.control-arrow]:hover:bg-white/30 [&_.carousel_.control-arrow]:hover:border-white/50 [&_.carousel_.control-arrow]:hover:scale-110 [&_.carousel_.control-arrow]:hover:shadow-lg [&_.carousel_.control-arrow]:hover:shadow-white/20 [&_.carousel_.control-arrow:before]:border-t-2 [&_.carousel_.control-arrow:before]:border-r-2 [&_.carousel_.control-arrow:before]:border-white [&_.carousel_.control-arrow:before]:w-2 [&_.carousel_.control-arrow:before]:h-2 [&_.carousel_.control-prev.control-arrow]:left-4 [&_.carousel_.control-next.control-arrow]:right-4 [&_.carousel_.control-dots]:bottom-[-2rem] [&_.carousel_.control-dots_.dot]:bg-white/40 [&_.carousel_.control-dots_.dot]:rounded-full [&_.carousel_.control-dots_.dot]:w-2 [&_.carousel_.control-dots_.dot]:h-2 [&_.carousel_.control-dots_.dot]:mx-1 [&_.carousel_.control-dots_.dot]:transition-all [&_.carousel_.control-dots_.dot]:duration-300 [&_.carousel_.control-dots_.dot.selected]:bg-yellow-400 [&_.carousel_.control-dots_.dot.selected]:scale-125 [&_.carousel_.control-dots_.dot:hover]:bg-white/60 [&_.carousel_.control-dots_.dot:hover]:scale-110 [&_.carousel_.slider-wrapper]:overflow-visible"
        >
          {newsItems.map((item) => (
            <NewsCard
              key={item.id}
              item={item}
              slideSize={slideSize}
              useCenterMode={useCenterMode}
            />
          ))}
        </Carousel>
      </div>
    </div>
  );
};

export default LatestNewsCarousel;

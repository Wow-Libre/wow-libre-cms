"use client";
import { getBanners } from "@/api/advertising";
import { fallbackBanners } from "@/constants/fallbackBanners";
import { useUserContext } from "@/context/UserContext";
import { Banners } from "@/model/banners";
import { useCallback, useEffect, useMemo, useState, memo } from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

// Componente memoizado para imágenes individuales
const BannerImage = memo(
  ({ banner, index }: { banner: Banners; index: number }) => (
    <div key={index} className="relative">
      <img
        src={banner.media_url}
        alt={banner.alt}
        loading="lazy"
        style={{
          width: "100%",
          height: "auto",
          maxHeight: "60rem",
        }}
        className="rounded-lg"
      />
    </div>
  )
);

BannerImage.displayName = "BannerImage";

// Componente memoizado para videos
const VideoBanner = memo(({ banner }: { banner: Banners }) => (
  <div className="relative w-full h-[600px] overflow-hidden mt-5 border-none rounded-lg z-0">
    <video
      key={banner.id}
      src={banner.media_url}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      className="absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000"
    />
    <div className="relative z-0 flex items-center justify-center h-full text-white text-7xl font-bold bg-black/40 title-server">
      {banner.label}
    </div>
  </div>
));

VideoBanner.displayName = "VideoBanner";

const Advertising = () => {
  const [banners, setBanners] = useState<Banners[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { user } = useUserContext();

  // Memoizar el filtro de videos para evitar recálculos innecesarios
  const videoBanners = useMemo(
    () => banners.filter((b) => b.type === "VIDEO"),
    [banners]
  );

  // Memoizar la función de fetch para evitar recreaciones innecesarias
  const fetchBanners = useCallback(async () => {
    try {
      const fetchedBanners = await getBanners(user.language);
      if (fetchedBanners.length > 0) {
        setBanners(fetchedBanners);
      } else {
        setBanners(fallbackBanners);
      }
    } catch (error) {
      console.warn("Error fetching banners, using fallback:", error);
      setBanners(fallbackBanners);
    } finally {
      setLoading(false);
    }
  }, [user.language]);

  // Memoizar el estado de loading para evitar re-renders
  const loadingState = useMemo(
    () => (
      <div className="mt-10 flex justify-center items-center z-0">
        <Carousel
          showArrows
          infiniteLoop
          autoPlay
          interval={9000}
          showThumbs={false}
          dynamicHeight={false}
          showIndicators={false}
          showStatus={false}
          width={"100%"}
        >
          {fallbackBanners.map((banner, index) => (
            <BannerImage key={index} banner={banner} index={index} />
          ))}
        </Carousel>
      </div>
    ),
    []
  );

  // Memoizar el banner de video actual
  const currentVideoBanner = useMemo(() => {
    if (videoBanners.length > 0) {
      return videoBanners[currentIndex];
    }
    return null;
  }, [videoBanners, currentIndex]);

  const imageCarousel = useMemo(
    () => (
      <div className="mt-10 flex justify-center items-center">
        <Carousel
          showArrows
          infiniteLoop
          autoPlay
          interval={9000}
          showThumbs={false}
          dynamicHeight={false}
          showIndicators={false}
          showStatus={false}
          width={"100%"}
        >
          {banners.map((banner, index) => (
            <BannerImage
              key={banner.id || index}
              banner={banner}
              index={index}
            />
          ))}
        </Carousel>
      </div>
    ),
    [banners]
  );

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  // Optimizar el intervalo de videos con cleanup mejorado
  useEffect(() => {
    if (videoBanners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % videoBanners.length);
    }, 16000);

    return () => {
      clearInterval(interval);
    };
  }, [videoBanners.length]);

  if (loading) {
    return loadingState;
  }

  if (currentVideoBanner) {
    return <VideoBanner banner={currentVideoBanner} />;
  }

  return imageCarousel;
};

export default Advertising;

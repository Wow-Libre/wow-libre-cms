"use client";
import { getInterstitial } from "@/api/home";
import { Interstitial as InterstitialType } from "@/model/model";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";

const Interstitial = () => {
  const [interstitialData, setInterstitialData] =
    useState<InterstitialType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const fetchInterstitial = async () => {
      const token = Cookies.get("token");
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await getInterstitial(token);
        // Solo mostrar si existe y está activo
        if (data && data.active && data.url_img) {
          setInterstitialData(data);
          setIsVisible(true);
        }
      } catch (error) {
        // No mostrar errores, simplemente no mostrar nada
      } finally {
        setLoading(false);
      }
    };

    fetchInterstitial();
  }, []);

  // Bloquear scroll cuando el banner está visible
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isVisible]);

  // Cerrar con tecla Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isVisible) {
        handleClose();
      }
    };

    if (isVisible) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isVisible]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleSubscribe = () => {
    if (interstitialData?.redirect_url) {
      window.open(interstitialData.redirect_url, "_blank", "noopener,noreferrer");
    }
    handleClose();
  };

  // No mostrar nada si está cargando o no hay datos
  if (loading || !interstitialData || !isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[99999999] flex items-center justify-center p-4">
      {/* Backdrop oscuro con animación */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/85 to-black/90 backdrop-blur-md transition-opacity duration-500"
        onClick={handleClose}
      />
      
      {/* Contenedor del modal con diseño mejorado */}
      <div 
        className="relative z-10 max-w-5xl w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-purple-500/20"
        style={{
          animation: "fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1), scaleIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(139, 92, 246, 0.1), 0 0 60px rgba(139, 92, 246, 0.1)",
        }}
      >
        {/* Efecto de brillo sutil en el borde superior */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
        
        {/* Botón de cerrar mejorado */}
        <button
          onClick={handleClose}
          className="absolute -top-12 right-0 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white transition-all duration-300 hover:scale-110 hover:rotate-90 z-20 border border-white/20"
          aria-label="Cerrar banner"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Imagen del banner con mejor presentación */}
        <div className="relative w-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-[400px] max-h-[75vh]">
          {/* Efecto de overlay sutil */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none z-10" />
          
          <img
            src={interstitialData.url_img}
            alt="Oferta especial"
            className={`max-w-full max-h-[75vh] w-auto h-auto transition-all duration-1000 ease-out ${
              imageLoaded 
                ? "opacity-100 scale-100" 
                : "opacity-0 scale-95 blur-sm"
            }`}
            loading="eager"
            onLoad={() => {
              setImageLoaded(true);
            }}
            onError={(e) => {
              handleClose();
            }}
            style={{
              objectFit: "contain",
              display: "block",
            }}
          />
        </div>

        {/* Botones del modal con diseño mejorado */}
        <div className="p-8 bg-gradient-to-b from-slate-900/98 via-slate-800/95 to-slate-900/98 backdrop-blur-sm">
          <div className="flex flex-col gap-4 justify-center max-w-md mx-auto">
            {/* Botón: Subscribirme - Diseño premium */}
            <button
              onClick={handleSubscribe}
              className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 hover:from-purple-500 hover:via-purple-400 hover:to-blue-500 text-white font-semibold text-lg rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-900 shadow-lg hover:shadow-2xl hover:shadow-purple-500/40 hover:-translate-y-0.5 overflow-hidden"
            >
              {/* Efecto de brillo animado */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              
              <span className="relative flex items-center justify-center gap-3">
                <svg
                  className="w-6 h-6 transition-transform duration-300 group-hover:scale-110"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="tracking-wide">Subscribirme</span>
              </span>
            </button>

            {/* Botón: No quiero estos beneficios - Diseño elegante */}
            <button
              onClick={handleClose}
              className="px-8 py-4 bg-slate-800/80 hover:bg-slate-700/80 text-gray-200 font-medium text-base rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:ring-offset-2 focus:ring-offset-slate-900 shadow-md hover:shadow-lg border border-slate-700/50 hover:border-slate-600/50 hover:-translate-y-0.5"
            >
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span>No quiero estos beneficios</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Interstitial;


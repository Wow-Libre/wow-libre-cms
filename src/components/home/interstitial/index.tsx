"use client";
import { getInterstitial } from "@/api/home";
import { Interstitial as InterstitialType } from "@/model/model";
import Cookies from "js-cookie";
import Link from "next/link";
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
      
      // Solo llamar la API si hay token (usuario logueado)
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop oscuro */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Contenedor del modal */}
      <div 
        className="relative z-10 max-w-6xl w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-700/50"
        style={{
          animation: "fadeIn 0.5s ease-out, scaleIn 0.5s ease-out",
        }}
      >
        {/* Imagen del banner */}
        <div className="relative w-full overflow-hidden">
          <img
            src={interstitialData.url_img}
            alt="Interstitial banner"
            className={`w-full h-auto transition-all duration-700 ease-out ${
              imageLoaded 
                ? "opacity-100 scale-100" 
                : "opacity-0 scale-95"
            }`}
            loading="eager"
            onLoad={() => {
              setImageLoaded(true);
            }}
            onError={(e) => {
              // Si la imagen falla al cargar, cerrar el modal
              handleClose();
            }}
            style={{
              maxHeight: "70vh",
              objectFit: "contain",
            }}
          />
        </div>

        {/* Botones del modal */}
        <div className="p-6 bg-gradient-to-b from-slate-900/95 to-slate-800/95">
          <div className="flex flex-col gap-4 justify-center">
            {/* Botón: Subscribirme */}
            <button
              onClick={handleSubscribe}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-lg rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-900 shadow-lg hover:shadow-xl hover:shadow-purple-500/25"
            >
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Subscribirme
              </span>
            </button>

            {/* Botón: No quiero estos beneficios */}
            <button
              onClick={handleClose}
              className="px-8 py-4 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-bold text-lg rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-slate-900 shadow-lg hover:shadow-xl hover:shadow-gray-500/25 border border-gray-600"
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
                No quiero estos beneficios
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Interstitial;


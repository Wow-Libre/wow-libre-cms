"use client";
import { webProps } from "@/constants/configs";
import React from "react";

import { useTranslation } from "react-i18next";

const ServerFeatures = () => {
  const { t } = useTranslation();

  return (
    <section
      className="relative overflow-hidden"
      role="region"
      aria-label="Server features section"
    >
      {/* Fondo con gradiente gaming - más sutil */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/20 via-slate-900/10 to-midnight/30"></div>
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-midnight/40 to-transparent"></div>
      </div>

      <div className="relative z-10 contenedor py-8 px-4 sm:py-10 sm:px-6">
        <div className="gap-16 items-center py-12 px-6 mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 lg:py-20 lg:px-8">
          <div className="font-light sm:text-lg text-gray-500 space-y-7">
            {/* Badge decorativo */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 mb-4">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse mr-2"></div>
              <p className="text-sm font-semibold text-purple-400">
                Server Features
              </p>
            </div>

            <h2 className="mb-5 text-5xl font-extrabold text-white tracking-tight leading-tight title-server">
              <span className="bg-gradient-to-r from-purple-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
                {t("features-server.title")}
              </span>
            </h2>
            <p className="mb-6 text-xl md:text-2xl leading-relaxed text-gray-200">
              {t("features-server.short-description")}
            </p>
            <p className="mb-6 text-xl md:text-2xl leading-relaxed text-gray-200">
              {t("features-server.detailed-description")}
            </p>
            <p className="text-xl md:text-2xl leading-relaxed text-gray-200">
              {t("features-server.summary")}
            </p>
            <div className="mt-10">
              <div className="relative overflow-hidden rounded-xl">
                <a
                  href="/news"
                  className="group relative inline-flex items-center justify-center px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 shadow-lg hover:shadow-xl hover:shadow-purple-500/25"
                >
                  {/* Efecto de partículas flotantes */}
                  <div className="absolute inset-0 overflow-hidden rounded-xl">
                    <div className="absolute top-2 left-1/4 w-1 h-1 bg-white/60 rounded-full animate-ping"></div>
                    <div className="absolute top-4 right-1/3 w-0.5 h-0.5 bg-white/40 rounded-full animate-ping delay-200"></div>
                    <div className="absolute bottom-2 left-1/2 w-1 h-1 bg-white/50 rounded-full animate-ping delay-500"></div>
                    <div className="absolute bottom-4 right-1/4 w-0.5 h-0.5 bg-white/35 rounded-full animate-ping delay-800"></div>
                  </div>

                  <span className="relative z-10 flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {t("features-server.btn.text")}
                  </span>

                  {/* Efecto de brillo que se desliza */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-xl"></div>
                </a>
              </div>
            </div>
          </div>
          <div className="relative group md:mt-0 mt-20">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <img
                src={webProps.homeFeaturesImg}
                alt="features"
                className="w-full h-72 sm:h-80 lg:h-[400px] object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Overlay con gradiente */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Efecto de brillo en los bordes */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-transparent to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
            </div>

            {/* Efectos decorativos alrededor de la imagen */}
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-purple-500/30 rounded-full blur-sm animate-pulse"></div>
            <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-blue-500/30 rounded-full blur-sm animate-pulse delay-300"></div>
            <div className="absolute top-1/2 -right-2 w-4 h-4 bg-cyan-400/40 rounded-full blur-sm animate-pulse delay-600"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServerFeatures;

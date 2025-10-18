"use client";
import { useTranslation } from "react-i18next";

const DownloadGame = () => {
  const { t } = useTranslation();

  return (
    <section
      className="contenedor mt-10 relative overflow-hidden"
      role="region"
      aria-label="Download game section"
    >
      {/* Fondo con gradiente gaming */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-midnight"></div>

      {/* Efectos de fondo gaming */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-400/10 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 sm:p-10 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Contenido de texto */}
          <div className="space-y-7">
            <div className="space-y-5">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 mb-4">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse mr-2"></div>
                <p className="text-sm font-semibold text-purple-400">
                  {t("home-who-we-are.title")}
                </p>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                <span className="bg-gradient-to-r from-purple-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
                  {t("home-who-we-are.title")}
                </span>
              </h2>

              <p className="text-lg sm:text-xl text-gray-300 leading-relaxed">
                {t("home-who-we-are.description")}
              </p>
            </div>

            {/* Botón mejorado */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative overflow-hidden rounded-xl">
                <a
                  href="/contributions"
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
                    {t("home-who-we-are.btn-text")}
                  </span>

                  {/* Efecto de brillo que se desliza */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-xl"></div>
                </a>
              </div>
            </div>
          </div>

          {/* Imagen mejorada */}
          <div className="relative group">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <img
                alt="DownloadGame"
                src="https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3dmRrc2V2aHYzbGNuNWw4cTQ3ZjNiemJkdzRvdTF6NTNmcm9ieDB6YiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/X51WFX75zvvmSNgCg0/giphy.gif"
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

export default DownloadGame;

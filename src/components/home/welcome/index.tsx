"use client";
import DiscordWidget from "@/components/discord";
import LoadingSpinner from "@/components/utilities/loading-spinner";
import { useTranslation } from "react-i18next";

const WelcomeHome = () => {
  const { t, ready } = useTranslation();
  if (!ready) {
    return (
      <div className="contenedor bg-midnight relative isolate overflow-hidden px-6 py-24 sm:py-32 lg:overflow-visible lg:px-0">
        <LoadingSpinner />
      </div>
    );
  }
  return (
    <section className="relative" role="banner" aria-label="Welcome section">
      {/* Optimized SVG Wave */}
      <svg
        className="absolute top-0 left-0 w-full h-full z-0"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ willChange: "transform" }}
      >
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(15 23 42)" stopOpacity="0.25" />
            <stop offset="50%" stopColor="rgb(15 23 42)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="rgb(15 23 42)" stopOpacity="1" />
          </linearGradient>
        </defs>
        <path
          d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
          fill="url(#waveGradient)"
        />
        <path
          d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
          fill="url(#waveGradient)"
        />
        <path
          d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
          fill="url(#waveGradient)"
        />
      </svg>

      <div className="bg-gradient-to-b from-midnight to-slate-900 relative isolate overflow-hidden px-4 py-16 sm:px-6 sm:py-24 lg:py-32 lg:overflow-visible lg:px-0 transition-all duration-500">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-6 gap-y-12 sm:gap-x-8 sm:gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-start lg:gap-y-10">
          <div className="lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:mx-auto lg:grid lg:w-full lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
            <div className="lg:pr-4">
              <div className="lg:max-w-lg mx-auto lg:mx-0 text-center lg:text-left">
                {/* Badge mejorado con efecto glassmorphism */}
                <div className="inline-flex items-center px-5 py-2.5 rounded-full bg-gradient-to-r from-yellow-500/15 via-orange-500/15 to-yellow-500/15 backdrop-blur-sm border border-yellow-500/30 mb-6 hover:from-yellow-500/25 hover:via-orange-500/25 hover:to-yellow-500/25 hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/20 transition-all duration-300 cursor-default group">
                  <div className="relative w-2.5 h-2.5 mr-3">
                    <div className="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-75" />
                    <div className="relative w-2.5 h-2.5 bg-yellow-400 rounded-full" />
                  </div>
                  <p className="text-sm font-bold text-yellow-400 tracking-wide">
                    {t("home-information.title")}
                  </p>
                </div>
                
                {/* Título con mejor gradiente y efecto */}
                <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent animate-fade-in-up drop-shadow-2xl">
                  <span className="relative inline-block">
                    {t("home-information.sub-title")}
                    <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 opacity-30 blur-sm" />
                  </span>
                </h1>
                
                {/* Descripción mejorada */}
                <p className="mt-8 text-xl sm:text-2xl leading-relaxed text-gray-200 animate-fade-in-up animation-delay-200 font-light">
                  {t("home-information.description")}
                </p>
                
                {/* Badges de estado mejorados */}
                <div className="mt-10 flex flex-wrap gap-4 justify-center lg:justify-start animate-fade-in-up animation-delay-400">
                  <div className="group flex items-center px-4 py-2.5 rounded-lg bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20 hover:from-yellow-500/20 hover:to-yellow-500/10 hover:border-yellow-500/40 hover:shadow-lg hover:shadow-yellow-500/10 transition-all duration-300 cursor-default">
                    <div className="relative">
                      <div className="absolute inset-0 bg-yellow-400 rounded-full blur-sm opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                      <svg
                        className="relative w-5 h-5 mr-3 text-yellow-400 transition-transform duration-300 group-hover:scale-110"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-yellow-400">Servidor Activo</span>
                  </div>
                  
                  <div className="group flex items-center px-4 py-2.5 rounded-lg bg-gradient-to-r from-green-500/10 to-green-500/5 border border-green-500/20 hover:from-green-500/20 hover:to-green-500/10 hover:border-green-500/40 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 cursor-default">
                    <div className="relative">
                      <div className="absolute inset-0 bg-green-400 rounded-full blur-sm opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                      <svg
                        className="relative w-5 h-5 mr-3 text-green-400 transition-transform duration-300 group-hover:scale-110"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-green-400">24/7 Online</span>
                  </div>
                  
                  <div className="group flex items-center px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-500/10 to-blue-500/5 border border-blue-500/20 hover:from-blue-500/20 hover:to-blue-500/10 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 cursor-default">
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-400 rounded-full blur-sm opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                      <svg
                        className="relative w-5 h-5 mr-3 text-blue-400 transition-transform duration-300 group-hover:scale-110"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-blue-400">Comunidad Activa</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-2 sm:p-4 lg:sticky lg:top-4 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:overflow-hidden flex flex-col items-center justify-center">
            <DiscordWidget />
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mt-8 w-full sm:w-auto items-center sm:items-stretch">
              {/* Botón principal mejorado */}
              <button
                onClick={() => window.open("/register", "_blank")}
                className="group relative text-lg sm:text-xl w-full sm:w-auto inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 px-8 py-4 sm:px-10 sm:py-5 lg:px-24 lg:py-6 font-bold text-white shadow-2xl hover:shadow-yellow-500/40 transition-all duration-500 hover:scale-105 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-yellow-400/50 focus:ring-offset-2 focus:ring-offset-slate-900 overflow-hidden"
                aria-label="Join our server"
              >
                {/* Efecto de brillo animado */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                
                {/* Sombra interna */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <span className="relative z-10 flex items-center gap-2">
                  {t("home-information.btn.primary")}
                  <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>

              {/* Botón secundario mejorado */}
              <button
                onClick={() => window.open("/contributions#download", "_blank")}
                className="group relative text-lg sm:text-xl w-full sm:w-auto inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-slate-700/90 via-slate-800/90 to-slate-700/90 backdrop-blur-sm px-8 py-4 sm:px-10 sm:py-5 lg:px-24 lg:py-6 font-bold text-white shadow-2xl hover:shadow-slate-500/30 transition-all duration-500 hover:scale-105 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-slate-600/50 focus:ring-offset-2 focus:ring-offset-slate-900 border border-slate-600/50 hover:border-slate-500/70 overflow-hidden"
                aria-label="Download game"
              >
                {/* Efecto de brillo sutil */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                
                <span className="relative z-10 flex items-center gap-2">
                  {t("home-information.btn.secondary")}
                  <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 lg:col-start-1 lg:row-start-2 lg:mx-auto lg:grid lg:w-full lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
            <div className="lg:pr-4">
              <div className="max-w-xl text-base/7 text-gray-300 lg:max-w-lg mx-auto lg:mx-0 text-center lg:text-left">
                <ul
                  role="list"
                  className="mt-10 space-y-6 text-gray-300 animate-fade-in-up animation-delay-600"
                >
                  <li className="group flex gap-x-4 p-4 rounded-xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border border-indigo-500/10 hover:from-indigo-500/10 hover:to-purple-500/10 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300">
                    <div className="flex-shrink-0 mt-1">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
                        <svg
                          className="w-6 h-6 text-indigo-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.5 17a4.5 4.5 0 0 1-1.44-8.765 4.5 4.5 0 0 1 8.302-3.046 3.5 3.5 0 0 1 4.504 4.272A4 4 0 0 1 15 17H5.5Zm3.75-2.75a.75.75 0 0 0 1.5 0V9.66l1.95 2.1a.75.75 0 1 0 1.1-1.02l-3.25-3.5a.75.75 0 0 0-1.1 0l-3.25 3.5a.75.75 0 1 0 1.1 1.02l1.95-2.1v4.59Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                    <span className="flex-1">
                      <strong className="block font-bold text-white mb-1 text-lg">
                        {t("home-information.push-deploy.title")}
                      </strong>
                      <span className="text-gray-300 leading-relaxed">
                        {t("home-information.push-deploy.description")}
                      </span>
                    </span>
                  </li>
                  
                  <li className="group flex gap-x-4 p-4 rounded-xl bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border border-emerald-500/10 hover:from-emerald-500/10 hover:to-teal-500/10 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
                    <div className="flex-shrink-0 mt-1">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
                        <svg
                          className="w-6 h-6 text-emerald-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                    <span className="flex-1">
                      <strong className="block font-bold text-white mb-1 text-lg">
                        {t("home-information.certificates.title")}
                      </strong>
                      <span className="text-gray-300 leading-relaxed">
                        {t("home-information.certificates.description")}
                      </span>
                    </span>
                  </li>
                  
                  <li className="group flex gap-x-4 p-4 rounded-xl bg-gradient-to-r from-blue-500/5 to-cyan-500/5 border border-blue-500/10 hover:from-blue-500/10 hover:to-cyan-500/10 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
                    <div className="flex-shrink-0 mt-1">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                        <svg
                          className="w-6 h-6 text-blue-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M4.632 3.533A2 2 0 0 1 6.577 2h6.846a2 2 0 0 1 1.945 1.533l1.976 8.234A3.489 3.489 0 0 0 16 11.5H4c-.476 0-.93.095-1.344.267l1.976-8.234Z" />
                          <path
                            fillRule="evenodd"
                            d="M4 13a2 2 0 1 0 0 4h12a2 2 0 1 0 0-4H4Zm11.24 2a.75.75 0 0 1 .75-.75H16a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75h-.01a.75.75 0 0 1-.75-.75V15Zm-2.25-.75a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75H13a.75.75 0 0 0 .75-.75V15a.75.75 0 0 0-.75-.75h-.01Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                    <span className="flex-1">
                      <strong className="block font-bold text-white mb-1 text-lg">
                        {t("home-information.database.title")}
                      </strong>
                      <span className="text-gray-300 leading-relaxed">
                        {t("home-information.database.description")}
                      </span>
                    </span>
                  </li>
                </ul>
                <p className="mt-8">{t("home-information.congrats")}</p>
                <h2 className="mt-16 text-2xl font-bold tracking-tight text-white">
                  {t("home-information.notice.title")}
                </h2>
                <p className="mt-6">
                  {t("home-information.notice.description")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WelcomeHome;

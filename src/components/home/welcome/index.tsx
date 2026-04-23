"use client";
import DiscordWidget from "@/components/discord";
import { getNews } from "@/api/news";
import LoadingSpinner from "@/components/utilities/loading-spinner";
import { NewsModel } from "@/model/News";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const HeroSection = () => {
  const { t, ready } = useTranslation();
  const [latestNews, setLatestNews] = useState<NewsModel[]>([]);
  const sectionSeparator =
    "https://static.wixstatic.com/media/5dd8a0_588f1847e213452daf75386f5c70ac4f~mv2.png";

  useEffect(() => {
    let isMounted = true;

    const loadNews = async () => {
      try {
        const news = await getNews(3, 0);
        if (isMounted) {
          setLatestNews(news);
        }
      } catch (error) {
        console.warn("Error loading hero news:", error);
      }
    };

    loadNews();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!ready) {
    return (
      <div className="contenedor bg-midnight relative isolate overflow-hidden px-6 py-24 sm:py-32 lg:overflow-visible lg:px-0">
        <LoadingSpinner />
      </div>
    );
  }
  return (
    <section
      className="relative isolate overflow-hidden rounded-2xl border border-white/15 shadow-[0_24px_60px_rgba(0,0,0,0.35)]"
      role="banner"
      aria-label="Welcome section"
    >
      <img
        src={sectionSeparator}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 z-30 h-[12px] w-full -translate-x-1/2 opacity-80"
      />
      <img
        src={sectionSeparator}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 z-30 h-[12px] w-full -translate-x-1/2 rotate-180 opacity-70"
      />

      <video
        className="pointer-events-none absolute inset-0 h-full w-full scale-[1.03] object-cover saturate-110"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      >
        <source
          src="https://video.wixstatic.com/video/5dd8a0_0380976012e74c5ea909070492c5d413/720p/mp4/file.mp4"
          type="video/mp4"
        />
      </video>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(100deg, rgba(2,6,23,0.76) 0%, rgba(2,6,23,0.48) 36%, rgba(2,6,23,0.28) 60%, rgba(2,6,23,0.55) 100%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 85% 25%, rgba(251,191,36,0.14), transparent 35%), radial-gradient(circle at 10% 80%, rgba(59,130,246,0.12), transparent 42%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10"
        aria-hidden="true"
      />

      <div className="relative z-20 isolate overflow-hidden px-4 py-16 transition-all duration-500 sm:px-6 sm:py-24 lg:overflow-visible lg:px-0 lg:py-32">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-6 gap-y-12 sm:gap-x-8 sm:gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-start lg:gap-y-10">
          <div className="lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:mx-auto lg:grid lg:w-full lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
            <div className="lg:pr-4">
              <div className="mx-auto rounded-2xl border border-white/10 bg-slate-950/25 p-6 text-center shadow-[0_10px_35px_rgba(0,0,0,0.35)] backdrop-blur-[2px] lg:mx-0 lg:max-w-lg lg:p-8 lg:text-left">
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
                    <span className="text-sm font-semibold text-yellow-400">
                      Servidor Activo
                    </span>
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
                    <span className="text-sm font-semibold text-green-400">
                      24/7 Online
                    </span>
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
                    <span className="text-sm font-semibold text-blue-400">
                      Comunidad Activa
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-2 sm:p-4 lg:sticky lg:top-4 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:overflow-hidden flex flex-col items-center justify-center">
            <DiscordWidget />
            <div className="mt-8 flex w-full flex-col items-center space-y-4 sm:w-auto sm:flex-row sm:items-stretch sm:space-x-4 sm:space-y-0">
              {/* Botón principal mejorado */}
              <button
                onClick={() => window.open("/register", "_blank")}
                className="group relative inline-flex w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 px-8 py-4 text-lg font-bold text-white shadow-2xl transition-all duration-500 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-yellow-500/40 focus:outline-none focus:ring-4 focus:ring-yellow-400/50 focus:ring-offset-2 focus:ring-offset-slate-900 sm:w-auto sm:px-10 sm:py-5 sm:text-xl lg:px-14 lg:py-5"
                aria-label="Join our server"
              >
                {/* Efecto de brillo animado */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                {/* Sombra interna */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <span className="relative z-10 flex items-center gap-2">
                  {t("home-information.btn.primary")}
                  <svg
                    className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>
              </button>

              {/* Botón secundario mejorado */}
              <button
                onClick={() => window.open("/contributions#download", "_blank")}
                className="group relative inline-flex w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-500/50 bg-gradient-to-r from-slate-700/85 via-slate-800/85 to-slate-700/85 px-8 py-4 text-lg font-bold text-white shadow-2xl transition-all duration-500 hover:-translate-y-1 hover:scale-[1.02] hover:border-slate-400/70 hover:shadow-slate-500/30 focus:outline-none focus:ring-4 focus:ring-slate-600/50 focus:ring-offset-2 focus:ring-offset-slate-900 sm:w-auto sm:px-10 sm:py-5 sm:text-xl lg:px-14 lg:py-5"
                aria-label="Download game"
              >
                {/* Efecto de brillo sutil */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                <span className="relative z-10 flex items-center gap-2">
                  {t("home-information.btn.secondary")}
                  <svg
                    className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 lg:col-start-1 lg:row-start-2 lg:mx-auto lg:grid lg:w-full lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
            <div className="lg:pr-4">
              <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-slate-950/20 p-6 text-center text-base/7 text-gray-300 shadow-[0_10px_30px_rgba(0,0,0,0.3)] backdrop-blur-[2px] lg:mx-0 lg:max-w-lg lg:p-8 lg:text-left">
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  {t("home-information.news.title", "Ultimas noticias")}
                </h2>
                <p className="mt-2 text-sm text-gray-300/90">
                  {t(
                    "home-information.news.description",
                    "Mantente al dia con los anuncios, eventos y novedades del servidor.",
                  )}
                </p>

                <ul
                  role="list"
                  className="mt-10 space-y-6 text-gray-300 animate-fade-in-up animation-delay-600"
                >
                  {latestNews.length > 0 ? (
                    latestNews.slice(0, 3).map((news) => (
                      <li key={news.id}>
                        <Link
                          href={`/news/${news.id}`}
                          className="group flex gap-x-4 rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-orange-500/5 p-4 transition-all duration-300 hover:border-amber-400/35 hover:from-amber-500/10 hover:to-orange-500/10 hover:shadow-lg hover:shadow-amber-500/10"
                        >
                          <div className="mt-1 h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-amber-500/30 bg-slate-900/60">
                            <img
                              src={news.img_url}
                              alt={news.title}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              loading="lazy"
                            />
                          </div>
                          <span className="flex-1">
                            <strong className="mb-1 block line-clamp-2 text-lg font-bold text-white">
                              {news.title}
                            </strong>
                            <span className="block text-sm text-gray-300/90">
                              {new Date(news.created_at).toLocaleDateString(
                                "es-ES",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              )}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className="rounded-xl border border-white/10 bg-slate-900/35 p-4 text-sm text-gray-300">
                      {t(
                        "home-information.news.empty",
                        "No hay noticias disponibles por ahora.",
                      )}
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

"use client";

import { getRealmsAdvertisement } from "@/api/realmAdvertisement";
import LoadingSpinner from "@/components/utilities/loading-spinner";
import { useUserContext } from "@/context/UserContext";
import { RealmAdvertisement } from "@/model/RealmAdvertising";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "./style.css";

const RealmsHome = () => {
  const { t } = useTranslation();
  const { user } = useUserContext();
  const [experiences, setExperiences] = useState<RealmAdvertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (realmlist: string, index: number) => {
    navigator.clipboard.writeText(realmlist).then(() => {
      setCopiedIndex(index);

      setTimeout(() => {
        setCopiedIndex(null);
      }, 2000);
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getRealmsAdvertisement(user.language);
        setExperiences(response);
        setError(response.length === 0);
      } catch (error: any) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="contenedor flex items-center justify-center mt-20">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return null;
  }

  return (
    <section
      className="p-16 bg-gradient-to-b from-slate-900 to-midnight rounded-xl mb-12 relative overflow-hidden"
      role="region"
      aria-label="Realms section"
    >
      <div className="container mx-auto px-4 space-y-16 relative z-10">
        {/* Título Centrado */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
            {t("home-us.realm")} -{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
              {t("home-us.experience")}
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 mt-4 animate-fade-in-up animation-delay-200">
            {t("home-us.sub-title")}
          </p>
        </div>

        {/* Contenedor Desplazable */}
        <div className="flex flex-col space-y-16 max-h-[80vh] overflow-y-auto scrollbar-hide">
          {experiences.map((realm, index) => (
            <article
              key={index}
              className="relative group flex flex-wrap items-center mb-8 rounded-xl bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 p-6 hover:bg-slate-800/50 hover:border-slate-600/50 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              {/* Efecto de resplandor de fondo estilo Apple */}
              <div className="absolute -inset-1 bg-gradient-to-r from-white/10 via-white/20 to-white/10 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-700"></div>

              {/* Efecto de brillo constante estilo Apple */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/8 via-white/3 to-transparent rounded-xl"></div>

              {/* Efecto de partículas flotantes dispersas */}
              <div className="absolute inset-0 overflow-hidden rounded-xl">
                {/* Partículas superiores */}
                <div className="absolute top-2 left-1/6 w-1 h-1 bg-white/60 rounded-full animate-ping"></div>
                <div className="absolute top-4 right-1/4 w-0.5 h-0.5 bg-white/40 rounded-full animate-ping delay-200"></div>
                <div className="absolute top-3 left-2/3 w-1 h-1 bg-white/50 rounded-full animate-ping delay-500"></div>

                {/* Partículas centrales */}
                <div className="absolute top-1/2 left-1/5 w-0.5 h-0.5 bg-white/30 rounded-full animate-ping delay-100"></div>
                <div className="absolute top-1/2 right-1/5 w-1 h-1 bg-white/45 rounded-full animate-ping delay-400"></div>
                <div className="absolute top-1/2 left-3/4 w-0.5 h-0.5 bg-white/35 rounded-full animate-ping delay-800"></div>

                {/* Partículas inferiores */}
                <div className="absolute bottom-2 left-1/3 w-1 h-1 bg-white/55 rounded-full animate-ping delay-300"></div>
                <div className="absolute bottom-3 right-1/3 w-0.5 h-0.5 bg-white/40 rounded-full animate-ping delay-600"></div>
                <div className="absolute bottom-4 left-1/2 w-1 h-1 bg-white/50 rounded-full animate-ping delay-900"></div>

                {/* Partículas laterales */}
                <div className="absolute top-1/4 left-2 w-0.5 h-0.5 bg-white/35 rounded-full animate-ping delay-150"></div>
                <div className="absolute top-3/4 right-2 w-1 h-1 bg-white/45 rounded-full animate-ping delay-450"></div>
                <div className="absolute bottom-1/4 left-1 w-0.5 h-0.5 bg-white/30 rounded-full animate-ping delay-750"></div>
              </div>

              {/* Efecto de brillo que se desliza estilo Apple */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1200 ease-out rounded-xl"></div>

              {/* Efecto de resplandor interno estilo Apple */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-xl"></div>
              {/* Contenido principal */}
              <div className="relative z-10 w-full flex flex-wrap items-center">
                {/* Imagen */}
                <div className="w-full md:w-1/2 relative mb-8 md:mb-0">
                  <div
                    className="bg-no-repeat bg-cover bg-center h-80 rounded-xl shadow-2xl overflow-hidden group relative"
                    style={{
                      backgroundImage: `url(${realm.img_url})`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                      <p className="text-white text-xl sm:text-2xl font-semibold px-6 text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        {t(realm.footer_disclaimer)}
                      </p>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-100 group-hover:opacity-0 transition-opacity duration-300" />
                  </div>
                </div>

                {/* Texto */}
                <div className="w-full md:w-1/2 text-white text-center md:text-left px-4 md:px-8 mb-1">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 group-hover:text-indigo-300 transition-colors duration-300">
                    {t(realm.title)}{" "}
                    <span className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                      {t(realm.tag)}
                    </span>
                    <br />
                  </h2>
                  <p className="text-gray-300 leading-relaxed text-xl sm:text-2xl mb-6 font-medium">
                    {t(realm.sub_title)}
                  </p>
                  <p className="text-gray-300 leading-relaxed text-base sm:text-lg mb-8">
                    {t(realm.description)}
                  </p>

                  {/* Botones */}
                  <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4">
                    <a
                      href={realm.redirect}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group"
                    >
                      <button className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl hover:shadow-indigo-500/25 hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 transition-all duration-300 ease-in-out hover:scale-105">
                        {t(realm.cta_primary)}
                      </button>
                    </a>

                    {/* Botón para copiar el realmlist */}
                    <button
                      className="w-full sm:w-auto bg-gradient-to-r from-slate-700 to-slate-800 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl hover:shadow-slate-500/25 hover:from-slate-600 hover:to-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-all duration-300 ease-in-out hover:scale-105 border border-slate-600"
                      onClick={() => handleCopy(realm.realmlist, index)}
                      aria-label={
                        copiedIndex === index
                          ? "Realmlist copied"
                          : "Copy realmlist"
                      }
                    >
                      <span className="flex items-center justify-center gap-2">
                        {copiedIndex === index ? (
                          <>
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Copied!
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                            </svg>
                            Realmlist
                          </>
                        )}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RealmsHome;

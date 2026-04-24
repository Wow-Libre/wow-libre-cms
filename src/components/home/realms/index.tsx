"use client";

import { getRealmsAdvertisement } from "@/api/realmAdvertisement";
import LoadingSpinner from "@/components/utilities/loading-spinner";
import { useUserContext } from "@/context/UserContext";
import { RealmAdvertisement } from "@/model/RealmAdvertising";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const realmCardClass =
  "relative overflow-hidden rounded-2xl border border-white/10 bg-gray-900/50 shadow-xl shadow-black/25 backdrop-blur-md transition-all duration-300 hover:border-cyan-500/25 hover:bg-gray-900/65 sm:rounded-3xl";

const RealmsHome = () => {
  const { t } = useTranslation();
  const { user } = useUserContext();
  const [experiences, setExperiences] = useState<RealmAdvertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (realmlist: string, index: number) => {
    void navigator.clipboard.writeText(realmlist).then(() => {
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
      } catch (err) {
        console.error("[RealmsHome] getRealmsAdvertisement", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="contenedor relative flex items-center justify-center py-24">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return null;
  }

  return (
    <section
      className="relative border-t border-cyan-500/20 py-12 sm:py-16 lg:py-20"
      role="region"
      aria-labelledby="home-realms-heading"
    >
      <div className="contenedor relative z-10 space-y-10 px-4 sm:space-y-12 sm:px-6 lg:px-10">
        <header className="text-center sm:text-left">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 sm:mx-0 sm:max-w-none sm:flex-row sm:items-end sm:gap-4">
            <span className="hidden h-px w-12 shrink-0 bg-gradient-to-r from-transparent to-cyan-400/50 sm:block sm:mb-3" />
            <div>
              <h1
                id="home-realms-heading"
                className="font-gaming text-3xl font-semibold tracking-wide text-white sm:text-4xl lg:text-[2.75rem]"
              >
                {t("home-us.realm")}{" "}
                <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-cyan-200 bg-clip-text text-transparent">
                  — {t("home-us.experience")}
                </span>
              </h1>
              <p className="mx-auto mt-3 max-w-3xl text-base leading-relaxed text-slate-400 sm:mx-0 sm:text-lg">
                {t("home-us.sub-title")}
              </p>
            </div>
          </div>
        </header>

        <div className="flex max-h-[min(80vh,56rem)] flex-col gap-8 overflow-y-auto pr-1 scrollbar-hide sm:gap-10">
          {experiences.map((realm, index) => (
            <article
              key={realm.id}
              className={`group relative flex flex-wrap items-center p-6 sm:p-8 ${realmCardClass} animate-fade-in-up`}
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-r from-cyan-500/0 via-cyan-400/15 to-sky-500/0 opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-100 sm:rounded-3xl" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] via-transparent to-transparent sm:rounded-3xl" />
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl sm:rounded-3xl">
                <div className="absolute left-1/4 top-3 h-1 w-1 animate-ping rounded-full bg-cyan-300/50 delay-100" />
                <div className="absolute right-1/3 top-5 h-0.5 w-0.5 animate-ping rounded-full bg-sky-400/40 delay-500" />
                <div className="absolute bottom-4 left-1/2 h-1 w-1 animate-ping rounded-full bg-cyan-200/45 delay-300" />
              </div>
              <div className="pointer-events-none absolute inset-0 translate-x-[-100%] rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full sm:rounded-3xl" />

              <div className="relative z-10 flex w-full flex-wrap items-center">
                <div className="relative mb-8 w-full md:mb-0 md:w-1/2">
                  <div
                    className="group/image relative h-80 overflow-hidden rounded-xl bg-cover bg-center bg-no-repeat shadow-2xl ring-1 ring-white/10"
                    style={{
                      backgroundImage: `url(${realm.img_url})`,
                    }}
                  >
                    <div className="absolute inset-0 flex translate-y-4 items-center justify-center bg-gradient-to-t from-black/90 via-black/25 to-transparent p-6 opacity-0 transition-all duration-500 group-hover/image:translate-y-0 group-hover/image:opacity-100">
                      <p className="text-center text-xl font-semibold text-white sm:text-2xl">
                        {t(realm.footer_disclaimer)}
                      </p>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent transition-opacity duration-300 group-hover/image:opacity-0" />
                  </div>
                </div>

                <div className="mb-1 w-full px-4 text-center text-white md:w-1/2 md:px-8 md:text-left">
                  <h2 className="mb-6 text-3xl font-bold transition-colors duration-300 group-hover:text-cyan-100 sm:text-4xl lg:text-5xl">
                    {t(realm.title)}{" "}
                    <span className="bg-gradient-to-r from-cyan-300 to-sky-400 bg-clip-text text-transparent">
                      {t(realm.tag)}
                    </span>
                  </h2>
                  <p className="mb-6 text-xl font-medium leading-relaxed text-slate-300 sm:text-2xl">
                    {t(realm.sub_title)}
                  </p>
                  <p className="mb-8 text-base leading-relaxed text-slate-400 sm:text-lg">
                    {t(realm.description)}
                  </p>

                  <div className="flex flex-col justify-center gap-4 sm:flex-row md:justify-start">
                    <a
                      href={realm.redirect}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex"
                    >
                      <span className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 px-8 py-3 text-center text-base font-semibold text-white shadow-lg shadow-cyan-900/30 transition hover:scale-[1.02] hover:from-cyan-500 hover:to-sky-500 hover:shadow-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-cyan-400/60 focus:ring-offset-2 focus:ring-offset-midnight sm:w-auto sm:py-3.5">
                        {t(realm.cta_primary)}
                      </span>
                    </a>

                    <button
                      type="button"
                      className="w-full rounded-xl border border-slate-600/80 bg-slate-800/80 px-8 py-3 text-base font-semibold text-white shadow-lg transition hover:scale-[1.02] hover:border-slate-500 hover:from-slate-600 hover:to-slate-700 hover:shadow-slate-900/30 focus:outline-none focus:ring-2 focus:ring-slate-400/50 focus:ring-offset-2 focus:ring-offset-midnight sm:w-auto sm:py-3.5"
                      onClick={() => handleCopy(realm.realmlist, index)}
                      aria-label={
                        copiedIndex === index
                          ? t("vdp-server.header.btn.copy")
                          : t("vdp-server.header.btn.realmlist")
                      }
                    >
                      <span className="flex items-center justify-center gap-2">
                        {copiedIndex === index ? (
                          <>
                            <svg
                              className="h-4 w-4 shrink-0"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              aria-hidden
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {t("vdp-server.header.btn.copy")}
                          </>
                        ) : (
                          <>
                            <svg
                              className="h-4 w-4 shrink-0"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              aria-hidden
                            >
                              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                            </svg>
                            {t("vdp-server.header.btn.realmlist")}
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

"use client";

import "./style.css";

import NavbarAuthenticated from "@/components/navbar-authenticated";
import PageCounter from "@/components/utilities/counter";
import TitleWow from "@/components/utilities/serverTitle";
import useAuth from "@/hook/useAuth";
import React, { ChangeEvent, useEffect, useMemo, useState } from "react";

import { getServersForGameRegistration } from "@/api/account/realms";
import { useUserContext } from "@/context/UserContext";
import { ServerModel } from "@/model/model";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import LoadingSpinnerCentral from "@/components/utilities/loading-spinner-v2";
import GamingModal from "@/components/utilities/gaming-modal";
import Swal from "sweetalert2";

const EXPANSION_THEMES: Record<
  string,
  { badge: string; dot: string; ring: string; chip: string }
> = {
  "0": {
    badge: "from-amber-700/40 to-amber-900/20 border-amber-600/50 text-amber-200",
    dot: "bg-amber-400",
    ring: "ring-amber-500",
    chip: "bg-amber-500/10 text-amber-200 border-amber-500/30",
  },
  "1": {
    badge: "from-purple-700/40 to-purple-900/20 border-purple-600/50 text-purple-200",
    dot: "bg-purple-400",
    ring: "ring-purple-500",
    chip: "bg-purple-500/10 text-purple-200 border-purple-500/30",
  },
  "2": {
    badge: "from-sky-700/40 to-sky-900/20 border-sky-600/50 text-sky-200",
    dot: "bg-sky-400",
    ring: "ring-sky-500",
    chip: "bg-sky-500/10 text-sky-200 border-sky-500/30",
  },
  "3": {
    badge: "from-orange-700/40 to-orange-900/20 border-orange-600/50 text-orange-200",
    dot: "bg-orange-400",
    ring: "ring-orange-500",
    chip: "bg-orange-500/10 text-orange-200 border-orange-500/30",
  },
  "4": {
    badge: "from-emerald-700/40 to-emerald-900/20 border-emerald-600/50 text-emerald-200",
    dot: "bg-emerald-400",
    ring: "ring-emerald-500",
    chip: "bg-emerald-500/10 text-emerald-200 border-emerald-500/30",
  },
  "5": {
    badge: "from-red-900/40 to-stone-900/20 border-red-700/50 text-red-200",
    dot: "bg-red-400",
    ring: "ring-red-500",
    chip: "bg-red-500/10 text-red-200 border-red-500/30",
  },
  "6": {
    badge: "from-green-700/40 to-green-900/20 border-green-600/50 text-green-200",
    dot: "bg-green-400",
    ring: "ring-green-500",
    chip: "bg-green-500/10 text-green-200 border-green-500/30",
  },
  "7": {
    badge: "from-rose-800/40 to-rose-950/20 border-rose-700/50 text-rose-200",
    dot: "bg-rose-400",
    ring: "ring-rose-500",
    chip: "bg-rose-500/10 text-rose-200 border-rose-500/30",
  },
  "8": {
    badge: "from-cyan-700/40 to-cyan-900/20 border-cyan-600/50 text-cyan-200",
    dot: "bg-cyan-400",
    ring: "ring-cyan-500",
    chip: "bg-cyan-500/10 text-cyan-200 border-cyan-500/30",
  },
  "9": {
    badge: "from-yellow-700/40 to-yellow-900/20 border-yellow-600/50 text-yellow-200",
    dot: "bg-yellow-400",
    ring: "ring-yellow-500",
    chip: "bg-yellow-500/10 text-yellow-200 border-yellow-500/30",
  },
};

const DEFAULT_THEME = {
  badge:
    "from-slate-700/40 to-slate-900/20 border-slate-600/50 text-slate-200",
  dot: "bg-slate-400",
  ring: "ring-slate-500",
  chip: "bg-slate-500/10 text-slate-200 border-slate-500/30",
};

const REGISTER_DECORATIVE_TREANT =
  "https://static.wixstatic.com/media/5dd8a0_a1d175976a834a9aa2db34adb6d87d02~mv2.png";

const Username = () => {
  const { user, setUser } = useUserContext();
  const [userName, setUsername] = useState("");
  const [servers, setServers] = useState<ServerModel[]>([]);
  const [gameMail, setGameMail] = useState("");
  const [selectedServer, setSelectedServer] = useState<{
    name: string;
    expansion: string;
  }>();
  const router = useRouter();
  const { t, ready } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [serversLoading, setServersLoading] = useState(true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8);
  const [selectedExpansion, setSelectedExpansion] = useState<string | null>(null);

  useAuth(t("errors.message.expiration-session"));

  const searchParams = useSearchParams();
  const disclaimerParam = searchParams.get("showWelcome");
  const disclaimer = disclaimerParam === "true";

  useEffect(() => {
    if (ready) {
      setLoading(false);
    }
    if (disclaimer) {
      setShowWelcomeModal(true);
    }
  }, [disclaimer, ready]);

  useEffect(() => {
    const fetchServers = async () => {
      try {
        setServersLoading(true);
        const serversData = await getServersForGameRegistration();
        setServers(serversData);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: t("register.error.servers-fetch-empty"),
          color: "white",
          background: "#0B1218",
          timer: 4500,
        });
      } finally {
        setServersLoading(false);
      }
    };

    fetchServers();
  }, []);

  const groupedServers = useMemo(() => {
    const map = new Map<string, { theme: typeof DEFAULT_THEME; items: ServerModel[] }>();
    servers.forEach((s) => {
      const key = s.exp_name || "Otros";
      const theme = EXPANSION_THEMES[s.expansion] ?? DEFAULT_THEME;
      if (!map.has(key)) map.set(key, { theme, items: [] });
      map.get(key)!.items.push(s);
    });
    return Array.from(map.entries());
  }, [servers]);

  // Aplana los reinos y aplica el límite del scroll infinito
  const visibleRealms = useMemo(() => {
    const flat: { server: ServerModel; theme: typeof DEFAULT_THEME; expName: string }[] = [];
    for (const [expName, group] of groupedServers) {
      for (const server of group.items) {
        flat.push({ server, theme: group.theme, expName });
      }
    }
    return flat;
  }, [groupedServers]);

  const hasMoreRealms = visibleCount < visibleRealms.length;

  // Cuenta cuántos reinos ya se mostraron antes de una expansión dada,
  // para hacer slice correctamente por grupo
  const countShownSoFar = (
    groups: [string, { items: ServerModel[] }][],
    upToExpName: string,
  ): number => {
    let total = 0;
    for (const [expName, g] of groups) {
      if (expName === upToExpName) break;
      total += g.items.length;
    }
    return total;
  };

  const handleSelectServer = (server: ServerModel) => {
    setSelectedServer({ name: server.name, expansion: server.expansion });
  };

  const handleSelectExpansion = (expName: string) => {
    setSelectedExpansion(expName);
    setVisibleCount(8);
  };

  const handleBackToExpansions = () => {
    setSelectedExpansion(null);
    setVisibleCount(8);
  };

  const handleLoadMore = () => {
    setVisibleCount((c) => Math.min(c + 6, visibleRealms.length));
  };

  const selectedItem = selectedServer
    ? servers.find((s) => s.name === selectedServer.name)
    : undefined;
  const selectedGroup = selectedServer
    ? groupedServers.find(([, g]) =>
        g.items.some((it) => it.name === selectedServer?.name),
      )
    : undefined;

  const handleUserNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handleGameMailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setGameMail(event.target.value);
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const regex = /^[a-zA-Z0-9\s]*$/;

    if (!selectedServer) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: t("register.error.server-is-empty"),
        color: "white",
        background: "#0B1218",
        timer: 4500,
      });
      return;
    }

    if (!userName.trim()) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: t("register.error.username-empty"),
        color: "white",
        background: "#0B1218",
        timer: 4500,
      });
      return;
    }

    if (!regex.test(userName)) {
      Swal.fire({
        icon: "warning",
        title: "Oops...",
        text: t("register.error.special-characters"),
        color: "white",
        background: "#0B1218",
        timer: 4500,
      });
      return;
    }

    if (userName.trim().length < 5 || userName.trim().length > 20) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: t("register.error.username-invalid-length"),
        color: "white",
        background: "#0B1218",
        timer: 4500,
      });
      return;
    }

    if (user && selectedServer) {
      setUser({
        ...user,
        username: userName,
        server: selectedServer.name,
        expansion: selectedServer.expansion,
        email: gameMail,
      });
    }
    router.push("/register/plan");
  };

  const handleVolverClick = () => {
    router.push("/accounts");
  };

  if (loading) {
    return (
      <div className="relative overflow-visible bg-midnight pb-8">
        <div className="pointer-events-none absolute inset-0 fire-embers-blue opacity-50" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(56,189,248,0.10),transparent_38%),radial-gradient(circle_at_82%_84%,rgba(14,165,233,0.08),transparent_40%)]" />
        <div className="contenedor relative z-30">
          <NavbarAuthenticated />
        </div>
        <div className="relative z-10 flex items-center justify-center py-16">
          <LoadingSpinnerCentral />
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-visible bg-midnight pb-8">
      <div className="pointer-events-none absolute inset-0 fire-embers-blue opacity-50" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(56,189,248,0.10),transparent_38%),radial-gradient(circle_at_82%_84%,rgba(14,165,233,0.08),transparent_40%)]" />
      <img
        src={REGISTER_DECORATIVE_TREANT}
        alt="Treant decorativo"
        className="accounts-decoration-animated pointer-events-none absolute bottom-0 right-4 z-[1] hidden w-[20rem] opacity-80 drop-shadow-[0_0_28px_rgba(56,189,248,0.35)] md:block lg:right-10 lg:w-[24rem] xl:right-16 xl:w-[28rem]"
      />
      <div className="contenedor relative z-30">
        <NavbarAuthenticated />
      </div>
      <div className="contenedor register relative z-10">
        <div className="registration registration-container container">
        <TitleWow
          title={t("register.title-server-sub-title")}
          description={t(
            "register.section-page.account-game.title-server-message"
          )}
        />
        <form
          className="registration-container-form pt-1"
          onSubmit={handleFormSubmit}
        >
          <div
            className="w-full grid gap-6 sm:gap-8 items-start"
            style={{ gridTemplateColumns: "1fr 1fr" }}
          >
          <div className="form-group">
            {/* Selector visual de reinos: carrousel por expansión */}
            <label className="mb-2 registration-container-form-label text-gaming-primary-light font-semibold">
              {t("register.section-page.account-game.realm-txt")}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <p className="text-sm text-gray-400 mb-3">
              Elige el mundo donde vivirás tu aventura
            </p>

            {serversLoading ? (
              <div className="flex flex-col gap-2 w-full">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-16 rounded-lg border border-gray-700/60 bg-gray-800/40 animate-pulse"
                  />
                ))}
              </div>
            ) : groupedServers.length === 0 ? (
              <div className="w-full rounded-xl border border-gray-700/60 bg-gray-800/40 px-6 py-10 text-center">
                <svg
                  className="w-10 h-10 mx-auto text-gray-500 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 7l9-4 9 4M3 7l9 4m-9-4v10l9 4m0-14l9 4m-9-4v14m9-14v10l-9 4"
                  />
                </svg>
                <p className="text-gray-400 text-sm">
                  No hay reinos disponibles por el momento
                </p>
              </div>
            ) : (
              /* === Lista vertical scrollable con drill-down === */
              <div className="flex flex-col w-full">
                <div
                  className="flex flex-col gap-1.5 overflow-y-auto pr-3"
                  style={{ maxHeight: "440px" }}
                >
                  {selectedExpansion === null ? (
                    /* === Vista 1: lista de expansiones === */
                    groupedServers.map(([expName, group]) => {
                      const onlineCount = group.items.filter((s) => s.status).length;
                      return (
                        <button
                          key={expName}
                          type="button"
                          onClick={() => handleSelectExpansion(expName)}
                          className={`group flex items-center gap-3 text-left rounded-lg border bg-gradient-to-r ${group.theme.badge} backdrop-blur-sm px-4 py-4 transition-all duration-200 hover:scale-[1.01] focus:outline-none border-white/10`}
                        >
                          <span
                            className={`w-3 h-3 rounded-full ${group.theme.dot} ring-2 ring-black/30 flex-shrink-0`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-white truncate">
                              {expName}
                            </p>
                            <p className="text-xs text-white/60 mt-0.5">
                              {group.items.length}{" "}
                              {group.items.length === 1 ? "reino" : "reinos"}{" "}
                              · {onlineCount} online
                            </p>
                          </div>
                          <svg
                            className="w-5 h-5 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      );
                    })
                  ) : (
                    /* === Vista 2: reinos de la expansión seleccionada === */
                    (() => {
                      const active = groupedServers.find(
                        ([n]) => n === selectedExpansion,
                      );
                      if (!active) return null;
                      const [expName, group] = active;
                      const visibleInGroup = group.items.slice(
                        0,
                        visibleCount,
                      );
                      return (
                        <section>
                          <button
                            type="button"
                            onClick={handleBackToExpansions}
                            className="group flex items-center gap-2 px-4 py-2.5 mb-3 w-full rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30 text-sm font-semibold text-white/90 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-gaming-primary-main/50"
                          >
                            <svg
                              className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M15 19l-7-7 7-7"
                              />
                            </svg>
                            Volver a expansiones
                          </button>
                          <header
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border bg-gradient-to-r ${group.theme.badge} border-white/10 mb-2`}
                          >
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${group.theme.dot}`}
                            />
                            <h3 className="font-bold tracking-wide text-sm uppercase text-white">
                              {expName}
                            </h3>
                            <span className="text-xs text-white/60 ml-auto">
                              {visibleInGroup.length} de {group.items.length}
                            </span>
                          </header>
                          <div className="flex flex-col gap-1.5">
                            {visibleInGroup.map((server) => {
                              const isSelected =
                                selectedServer?.name === server.name;
                              return (
                                <button
                                  key={server.id}
                                  type="button"
                                  onClick={() => handleSelectServer(server)}
                                  className={`group flex items-center gap-4 text-left rounded-lg border bg-gray-900/70 backdrop-blur-sm px-4 py-4 transition-all duration-200 hover:border-gaming-primary-main/60 hover:bg-gray-800/80 focus:outline-none min-h-[80px] ${
                                    isSelected
                                      ? `ring-2 ${group.theme.ring} border-transparent`
                                      : "border-gray-700/60"
                                  }`}
                                >
                                  <img
                                    src={server.avatar}
                                    alt={server.name}
                                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-gray-700/60"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-white truncate text-base">
                                      {server.name}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-1">
                                      <span
                                        className={`w-2 h-2 rounded-full ${
                                          server.status
                                            ? "bg-emerald-400"
                                            : "bg-gray-500"
                                        }`}
                                      />
                                      <span
                                        className={`text-xs font-medium ${
                                          server.status
                                            ? "text-emerald-300"
                                            : "text-gray-400"
                                        }`}
                                      >
                                        {server.status ? "Online" : "Offline"}
                                      </span>
                                      {server.emulator && (
                                        <>
                                          <span className="text-white/20">
                                            ·
                                          </span>
                                          <span className="text-xs text-white/60">
                                            {server.emulator}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <span className="w-6 h-6 rounded-full bg-gaming-primary-main text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                                      ✓
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </section>
                      );
                    })()
                  )}
                </div>

                {selectedExpansion !== null && hasMoreRealms && (
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    className="mt-3 w-full py-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white/80 hover:text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                    Cargar más reinos
                    <span className="text-white/40 text-xs">
                      ({visibleRealms.length - visibleCount} restantes)
                    </span>
                  </button>
                )}
                {selectedExpansion !== null &&
                  !hasMoreRealms &&
                  visibleRealms.length > 0 && (
                    <p className="mt-3 text-center text-xs text-white/40">
                      Mostrando los {visibleRealms.length} reinos disponibles
                    </p>
                  )}
              </div>
            )}
          </div>

          {/* Columna derecha: username + email + acciones */}
          <div className="space-y-4">
          {/* Campo de nombre de usuario */}
          <div className="form-group">
            <label
              htmlFor="usernameForm"
              className="mb-2 registration-container-form-label text-gaming-primary-light font-semibold"
            >
              {t("register.section-page.account-game.username-txt")}
              <span className="text-red-500 ml-1">*</span>
            </label>

            <input
              id="usernameForm"
              className="mb-3 px-4 py-3 bg-gaming-base-main/80 backdrop-blur-sm border border-gaming-primary-main/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gaming-primary-main/50 focus:border-gaming-primary-main transition-all duration-300 registration-input"
              type="text"
              maxLength={20}
              placeholder={t(
                "register.section-page.account-game.username-placeholder"
              )}
              value={userName}
              onChange={handleUserNameChange}
            />
          </div>
          {Number(selectedServer?.expansion) > 2 && (
            <div className="form-group">
              <label
                htmlFor="emailGameForm"
                className="mb-2 registration-container-form-label text-gaming-primary-light font-semibold"
              >
                {t("register.section-page.account-game.email-game-txt")}
                <span className="text-gray-400 text-sm font-normal ml-1">
                  (Optional)
                </span>
              </label>

              <input
                id="emailGameForm"
                className="mb-3 px-4 py-3 bg-gaming-base-main/80 backdrop-blur-sm border border-gaming-primary-main/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gaming-primary-main/50 focus:border-gaming-primary-main transition-all duration-300 registration-input"
                type="text"
                maxLength={60}
                placeholder={t(
                  "register.section-page.account-game.email-game-placeholder"
                )}
                value={gameMail}
                onChange={handleGameMailChange}
              />
              <p className="text-sm text-gray-400 mt-1">
                {t("register.section-page.account-game.email-game-disclaimer")}
              </p>
            </div>
          )}

          <PageCounter currentSection={1} totalSections={3} />

          {/* Botón Principal */}
          <button
            className="text-white px-5 py-5 rounded-lg mt-8 button-registration relative group transition-all duration-500 hover:text-white hover:bg-gradient-to-r hover:from-gaming-primary-main hover:to-gaming-secondary-main hover:shadow-2xl hover:shadow-gaming-primary-main/40 hover:scale-[1.02] hover:-translate-y-1 overflow-hidden"
            type="submit"
          >
            {/* Efecto de partículas flotantes */}
            <div className="absolute inset-0 overflow-hidden rounded-lg">
              <div className="absolute top-2 left-1/4 w-1 h-1 bg-white/60 rounded-full opacity-75"></div>
              <div className="absolute top-4 right-1/3 w-0.5 h-0.5 bg-white/40 rounded-full opacity-50"></div>
              <div className="absolute bottom-2 left-1/2 w-1 h-1 bg-white/50 rounded-full opacity-60"></div>
              <div className="absolute bottom-4 right-1/4 w-0.5 h-0.5 bg-white/35 rounded-full opacity-40"></div>
            </div>

            {/* Efecto de brillo profesional */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>

            {/* Efecto de borde luminoso */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-gaming-primary-main/20 via-gaming-secondary-main/20 to-gaming-primary-main/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <span className="relative z-10 font-semibold tracking-wide">
              {t("register.section-page.account-game.button.btn-primary")}
            </span>

            {/* Línea inferior elegante */}
            <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-gaming-primary-main to-gaming-secondary-main group-hover:w-full transition-all duration-700 ease-out"></div>
          </button>

          {/* Botón Secundario */}
          <button
            className="text-white px-5 py-5 rounded-lg mt-4 button-registration relative group transition-all duration-500 hover:text-white hover:bg-gradient-to-r hover:from-gray-600 hover:to-gray-700 hover:shadow-2xl hover:shadow-gray-500/40 hover:scale-[1.02] hover:-translate-y-1 overflow-hidden"
            type="button"
            onClick={handleVolverClick}
          >
            {/* Efecto de partículas flotantes */}
            <div className="absolute inset-0 overflow-hidden rounded-lg">
              <div className="absolute top-2 left-1/4 w-1 h-1 bg-white/60 rounded-full opacity-75"></div>
              <div className="absolute top-4 right-1/3 w-0.5 h-0.5 bg-white/40 rounded-full opacity-50"></div>
              <div className="absolute bottom-2 left-1/2 w-1 h-1 bg-white/50 rounded-full opacity-60"></div>
              <div className="absolute bottom-4 right-1/4 w-0.5 h-0.5 bg-white/35 rounded-full opacity-40"></div>
            </div>

            {/* Efecto de brillo profesional */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>

            {/* Efecto de borde luminoso */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-gray-500/20 via-gray-600/20 to-gray-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <span className="relative z-10 font-semibold tracking-wide">
              {t("register.section-page.account-game.button.btn-secondary")}
            </span>

            {/* Línea inferior elegante */}
            <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-gray-500 to-gray-600 group-hover:w-full transition-all duration-700 ease-out"></div>
          </button>
          </div>
          </div>
        </form>
        </div>

        {/* Gaming Modal */}
        <GamingModal
          isOpen={showWelcomeModal}
          onClose={() => setShowWelcomeModal(false)}
          title={t("register.section-page.account-game.show-welcome.title")}
          description={t(
            "register.section-page.account-game.show-welcome.description",
          )}
          kicker={t("register.section-page.account-game.show-welcome.kicker")}
          highlight={t(
            "register.section-page.account-game.show-welcome.highlight",
          )}
          steps={[
            t("register.section-page.account-game.show-welcome.step-1"),
            t("register.section-page.account-game.show-welcome.step-2"),
            t("register.section-page.account-game.show-welcome.step-3"),
          ]}
          buttonText={t("register.section-page.account-game.show-welcome.cta")}
          onConfirm={() => {
            setShowWelcomeModal(false);
          }}
          showCloseButton={false}
        />
      </div>
    </div>
  );
};

export default Username;

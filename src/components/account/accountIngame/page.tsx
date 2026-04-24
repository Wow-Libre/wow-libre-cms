"use client";

import "./style.css";

import NavbarAuthenticated from "@/components/navbar-authenticated";
import PageCounter from "@/components/utilities/counter";
import TitleWow from "@/components/utilities/serverTitle";
import useAuth from "@/hook/useAuth";
import React, { ChangeEvent, useEffect, useState } from "react";

import { getServersForGameRegistration } from "@/api/account/realms";
import { useUserContext } from "@/context/UserContext";
import { ServerModel } from "@/model/model";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import LoadingSpinnerCentral from "@/components/utilities/loading-spinner-v2";
import GamingModal from "@/components/utilities/gaming-modal";
import Swal from "sweetalert2";

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

  const handleServerChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedServerName = event.target.value;
    const server = servers.find((server) => server.name === selectedServerName);
    if (server) {
      setSelectedServer({ name: server.name, expansion: server.expansion });
    }
  };

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
          <div className="form-group">
            {/* Select para elegir expansión */}
            <label
              htmlFor="expansionSelect"
              className="mb-2 registration-container-form-label text-gaming-primary-light font-semibold"
            >
              {t("register.section-page.account-game.realm-txt")}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              id="expansionSelect"
              className="mb-3 px-4 py-3 bg-gaming-base-main/80 backdrop-blur-sm border border-gaming-primary-main/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gaming-primary-main/50 focus:border-gaming-primary-main transition-all duration-300 registration-input"
              value={selectedServer?.name || ""}
              onChange={handleServerChange}
              disabled={serversLoading}
            >
              <option value="" disabled className="bg-gray-800 text-white">
                {serversLoading
                  ? t("register.section-page.account-game.loading-servers")
                  : t("register.section-page.account-game.select-server")}
              </option>
              {servers.map((server) => (
                <option
                  key={server.id}
                  value={server.name}
                  className="bg-gray-800 text-white"
                >
                  {server.name} - {server.exp_name}
                </option>
              ))}
            </select>
          </div>

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
        </form>
        </div>

        {/* Gaming Modal */}
        <GamingModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        title={t("register.section-page.account-game.show-welcome.title")}
        description={t(
          "register.section-page.account-game.show-welcome.description"
        )}
        buttonText="¡Comenzar Aventura!"
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

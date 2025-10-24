"use client";
import { createServer } from "@/api/account/realms";
import Footer from "@/components/footer";
import NavbarMinimalist from "@/components/navbar-minimalist";
import TitleWow from "@/components/utilities/serverTitle";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";

const MAX_SERVER_NAME_LENGTH = 30;
const MIN_SERVER_NAME_LENGTH = 5;

const MAX_WEB_LENGTH = 50;
const MIN_WEB_LENGTH = 5;

const MAX_HOST_LENGTH = 50;
const MIN_HOST_LENGTH = 5;

const MAX_REALMLIST_LENGTH = 40;
const MIN_REALMLIST_LENGTH = 5;

const MAX_PASSWORD_SERVER_LENGTH = 30;
const MIN_PASSWORD_SERVER_LENGTH = 5;

const MAX_CONFIRM_PASSWORD_SERVER_LENGTH = 30;
const MIN_CONFIRM_PASSWORD_SERVER_LENGTH = 5;

const MAX_USERNAME_EXT_SERVER_LENGTH = 20;
const MIN_USERNAME_EXT_SERVER_LENGTH = 5;

const MAX_PASSWORD_EXT_SERVER_LENGTH = 20;
const MIN_PASSWORD_EXT_SERVER_LENGTH = 5;

const Server = () => {
  const [serverName, setServerName] = useState("");
  const [web, setWeb] = useState("");
  const [expansion, setExpansion] = useState("");
  const [host, setHost] = useState("");
  const [realmlist, setRealmlist] = useState("");
  const [typeServer, setTypeServer] = useState("");
  const [passwordServer, setPasswordServer] = useState("");
  const [passwordConfirmServer, setConfirmPasswordServer] = useState("");

  const [usernameExternal, setUsernameExternal] = useState("");
  const [passwordExternal, setPasswordExternal] = useState("");
  const [emulator, setEmulator] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const token = Cookies.get("token");

  const router = useRouter();
  const { t } = useTranslation();

  const handleServerName = (event: ChangeEvent<HTMLInputElement>) => {
    setServerName(event.target.value);
  };

  const handleWebSite = (event: ChangeEvent<HTMLInputElement>) => {
    setWeb(event.target.value);
  };

  const handleSetExpansion = (event: ChangeEvent<HTMLSelectElement>) => {
    setExpansion(event.target.value);
  };

  const handleSetHost = (event: ChangeEvent<HTMLInputElement>) => {
    setHost(event.target.value);
  };

  const handleSetRealmlist = (event: ChangeEvent<HTMLInputElement>) => {
    setRealmlist(event.target.value);
  };

  const handleSetTypeServer = (event: ChangeEvent<HTMLSelectElement>) => {
    setTypeServer(event.target.value);
  };

  const handleSetPasswordServer = (event: ChangeEvent<HTMLInputElement>) => {
    setPasswordServer(event.target.value);
  };

  const handleSetConfirmPasswordServer = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPasswordServer(event.target.value);
  };

  const handleSetUsernameExternal = (event: ChangeEvent<HTMLInputElement>) => {
    setUsernameExternal(event.target.value);
  };

  const handleSetPasswordExternal = (event: ChangeEvent<HTMLInputElement>) => {
    setPasswordExternal(event.target.value);
  };

  const handleSetEmulator = (event: ChangeEvent<HTMLSelectElement>) => {
    setEmulator(event.target.value);
  };

  const handleVolverClick = () => {
    router.back();
  };

  useEffect(() => {
    const valid =
      serverName.trim().length >= MIN_SERVER_NAME_LENGTH &&
      serverName.trim().length <= MAX_SERVER_NAME_LENGTH &&
      web.trim().length >= MIN_WEB_LENGTH &&
      web.trim().length <= MAX_WEB_LENGTH &&
      host.trim() &&
      host.trim().length >= MIN_HOST_LENGTH &&
      host.trim().length <= MAX_HOST_LENGTH &&
      realmlist.trim() &&
      realmlist.trim().length >= MIN_REALMLIST_LENGTH &&
      realmlist.trim().length <= MAX_REALMLIST_LENGTH &&
      passwordServer.trim() &&
      passwordServer.trim().length >= MIN_PASSWORD_SERVER_LENGTH &&
      passwordServer.trim().length <= MAX_PASSWORD_SERVER_LENGTH &&
      passwordConfirmServer.trim() &&
      passwordConfirmServer.trim().length >=
        MIN_CONFIRM_PASSWORD_SERVER_LENGTH &&
      passwordConfirmServer.trim().length <=
        MAX_CONFIRM_PASSWORD_SERVER_LENGTH &&
      usernameExternal.trim() &&
      usernameExternal.trim().length >= MIN_USERNAME_EXT_SERVER_LENGTH &&
      usernameExternal.trim().length <= MAX_USERNAME_EXT_SERVER_LENGTH &&
      passwordExternal.trim().length >= MIN_PASSWORD_EXT_SERVER_LENGTH &&
      passwordExternal.trim().length <= MAX_PASSWORD_EXT_SERVER_LENGTH &&
      expansion !== "" &&
      typeServer !== "" &&
      emulator !== "";

    setIsFormValid(valid || false);
  }, [
    serverName,
    expansion,
    web,
    host,
    realmlist,
    typeServer,
    passwordServer,
    passwordConfirmServer,
    usernameExternal,
    passwordExternal,
    emulator,
  ]);

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isFormValid || !token) return;

    const passworldInvalid =
      !passwordServer.trim() ||
      !passwordConfirmServer.trim() ||
      passwordConfirmServer != passwordServer;

    if (passworldInvalid) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: t("register.error.last-name-invalid"),
        color: "white",
        background: "#0B1218",
        timer: 43500,
      });

      return;
    }

    setIsSubmitting(true);

    try {
      await createServer(
        token,
        serverName,
        emulator,
        web,
        host,
        passwordServer,
        realmlist,
        usernameExternal,
        passwordExternal,
        Number(expansion),
        typeServer
      );

      // Mostrar mensaje de éxito
      await Swal.fire({
        icon: "success",
        title: "¡Servidor creado exitosamente!",
        text: "Tu servidor ha sido registrado correctamente.",
        color: "white",
        background: "#0B1218",
        timer: 3000,
      });

      router.push("/realms");
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || t("register.error.generic"),
        color: "white",
        background: "#0B1218",
        timer: 43500,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const [activeTab, setActiveTab] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animaciones para las transiciones
  const tabVariants = {
    hidden: { opacity: 0, x: 20, scale: 0.95 },
    visible: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: -20, scale: 0.95 },
  };

  const progressPercentage = ((activeTab - 1) / 3) * 100;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-midnight via-slate-900 to-midnight text-white">
      <NavbarMinimalist />

      <div className="flex items-center justify-center flex-grow px-4 mt-10 ">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm shadow-2xl rounded-2xl p-6 w-full max-w-6xl border border-slate-700/50"
        >
          {/* Title  */}
          <TitleWow
            title={t("register.title-server-sub-title")}
            description={t("server-register.title")}
          />

          {/* Barra de progreso */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-300">
                Paso {activeTab} de 4
              </span>
              <span className="text-sm font-medium text-slate-300">
                {Math.round(progressPercentage)}% completado
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </div>
          </div>

          {/* Selector de pestañas para móvil */}
          <div className="mb-6 sm:hidden">
            <label htmlFor="tabs" className="block text-white font-medium mb-3">
              {t("server-register.selection-mobile.title")}
            </label>
            <select
              id="tabs"
              className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-800 text-white transition-all duration-200"
              value={activeTab}
              onChange={(e) => setActiveTab(Number(e.target.value))}
            >
              <option value={1}>
                {t("server-register.selection-mobile.information")}
              </option>
              <option value={2}>
                {t("server-register.selection-mobile.details")}
              </option>
              <option value={3}>
                {t("server-register.selection-mobile.security")}
              </option>
              <option value={4}>
                {t("server-register.selection-mobile.integration")}
              </option>
            </select>
          </div>

          {/* Botones de pestañas para escritorio */}
          <div className="hidden sm:flex mb-8 justify-center space-x-2 bg-slate-800/50 p-2 rounded-xl">
            {[
              {
                id: 1,
                label: t("server-register.selection-desktop.information"),
                icon: "📋",
              },
              {
                id: 2,
                label: t("server-register.selection-desktop.details"),
                icon: "⚙️",
              },
              {
                id: 3,
                label: t("server-register.selection-desktop.security"),
                icon: "🔒",
              },
              {
                id: 4,
                label: t("server-register.selection-desktop.integration"),
                icon: "🔗",
              },
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25"
                    : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white"
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="hidden lg:inline">{tab.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Formulario */}
          <form className="space-y-6" onSubmit={handleFormSubmit}>
            <AnimatePresence mode="wait">
              {activeTab === 1 && (
                <motion.div
                  key="tab1"
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Descripción general */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 bg-gradient-to-r from-blue-900/20 to-blue-800/20 rounded-xl shadow-lg border border-blue-500/20 mb-8 min-h-[180px] flex flex-col justify-center"
                  >
                    <div className="flex items-start space-x-4">
                      {/* Ícono informativo */}
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full p-3 shadow-lg">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-6 h-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13 16h-1v-4h-1m1-4h.01M12 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z"
                          />
                        </svg>
                      </div>
                      {/* Texto descriptivo */}
                      <div className="flex-1">
                        <h3 className="text-2xl text-white font-bold mb-3 flex items-center">
                          <span className="mr-2">🛠️</span>
                          ¡Recuerda configurar estos datos correctamente para un
                          servidor exitoso!
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <span className="font-semibold text-blue-300">
                                Nombre del Servidor:
                              </span>
                              <span className="text-slate-300 ml-2">
                                El nombre con el que los jugadores identificarán
                                tu comunidad.
                              </span>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <span className="font-semibold text-blue-300">
                                Expansión:
                              </span>
                              <span className="text-slate-300 ml-2">
                                Selecciona la versión del juego que deseas
                                ofrecer.
                              </span>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <span className="font-semibold text-blue-300">
                                Sitio Web:
                              </span>
                              <span className="text-slate-300 ml-2">
                                Ingresa el enlace oficial donde los jugadores
                                podrán obtener información y registrarse.
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  {/* Atributos*/}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Campo 1 */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="col-span-1"
                    >
                      <label
                        htmlFor="serverName"
                        className="block text-white font-semibold mb-3 text-lg"
                      >
                        {t("server-register.form.name-server")}
                      </label>
                      <div className="relative">
                        <input
                          id="serverName"
                          type="text"
                          maxLength={MAX_SERVER_NAME_LENGTH}
                          minLength={MIN_SERVER_NAME_LENGTH}
                          value={serverName}
                          onChange={handleServerName}
                          placeholder={t(
                            "server-register.form.name-server-placeholder"
                          )}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-200 text-lg bg-slate-800/50 backdrop-blur-sm ${
                            serverName.length < 5
                              ? "border-red-500 focus:ring-red-500/50 focus:border-red-400"
                              : serverName.length >= 5
                              ? "border-green-500 focus:ring-green-500/50 focus:border-green-400"
                              : "border-slate-600 focus:ring-blue-500/50 focus:border-blue-400"
                          }`}
                        />
                        {serverName.length >= 5 && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <svg
                              className="w-5 h-5 text-green-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-sm text-slate-400">
                          {serverName.length < 5
                            ? "Mínimo 5 caracteres"
                            : "✓ Válido"}
                        </p>
                        <p className="text-sm text-slate-400">
                          {30 - serverName.length} restantes
                        </p>
                      </div>
                    </motion.div>

                    {/* Campo 2 */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="col-span-1"
                    >
                      <label
                        htmlFor="web"
                        className="block text-white font-semibold mb-3 text-lg"
                      >
                        {t("server-register.form.web")}
                      </label>
                      <div className="relative">
                        <input
                          id="web"
                          type="text"
                          maxLength={50}
                          minLength={5}
                          value={web}
                          onChange={handleWebSite}
                          placeholder={t(
                            "server-register.form.web-placeholder"
                          )}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-200 text-lg bg-slate-800/50 backdrop-blur-sm ${
                            web.length < 5
                              ? "border-red-500 focus:ring-red-500/50 focus:border-red-400"
                              : web.length >= 5
                              ? "border-green-500 focus:ring-green-500/50 focus:border-green-400"
                              : "border-slate-600 focus:ring-blue-500/50 focus:border-blue-400"
                          }`}
                        />
                        {web.length >= 5 && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <svg
                              className="w-5 h-5 text-green-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-sm text-slate-400">
                          {web.length < 5 ? "Mínimo 5 caracteres" : "✓ Válido"}
                        </p>
                        <p className="text-sm text-slate-400">
                          {50 - web.length} restantes
                        </p>
                      </div>
                    </motion.div>

                    {/* Campo 3 */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="col-span-1"
                    >
                      <label
                        htmlFor="expansion"
                        className="block text-white font-semibold mb-3 text-lg"
                      >
                        {t("server-register.form.expansion")}
                      </label>
                      <div className="relative">
                        <select
                          id="expansion"
                          value={expansion}
                          onChange={handleSetExpansion}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-200 text-lg bg-slate-800/50 backdrop-blur-sm appearance-none text-white ${
                            expansion === ""
                              ? "border-red-500 focus:ring-red-500/50 focus:border-red-400"
                              : "border-green-500 focus:ring-green-500/50 focus:border-green-400"
                          }`}
                        >
                          <option
                            value=""
                            disabled
                            className="bg-slate-800 text-white"
                          >
                            {t("server-register.default-txt-select")}
                          </option>
                          <option value="2" className="bg-slate-800 text-white">
                            Lich King
                          </option>
                          <option
                            value="10"
                            className="bg-slate-800 text-white"
                          >
                            War Within
                          </option>
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg
                            className="w-5 h-5 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-sm text-slate-400">
                          {expansion === ""
                            ? "Selecciona una expansión"
                            : "✓ Válido"}
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {activeTab === 2 && (
                <motion.div
                  key="tab2"
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Descripción general */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 bg-gradient-to-r from-green-900/20 to-green-800/20 rounded-xl shadow-lg border border-green-500/20 mb-8 min-h-[180px] flex flex-col justify-center"
                  >
                    <div className="flex items-start space-x-4">
                      {/* Ícono informativo */}
                      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full p-3 shadow-lg">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-6 h-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13 16h-1v-4h-1m1-4h.01M12 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z"
                          />
                        </svg>
                      </div>
                      {/* Texto descriptivo */}
                      <div className="flex-1">
                        <h3 className="text-2xl text-white font-bold mb-3 flex items-center">
                          <span className="mr-2">⚙️</span>
                          ¡Configura Correctamente tu Servidor y Prepara un Buen
                          Inicio!
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <span className="font-semibold text-green-300">
                                Host:
                              </span>
                              <span className="text-slate-300 ml-2">
                                Ingresa tu IP pública (o dominio si tienes uno
                                configurado) seguido del puerto{" "}
                                <strong>8090</strong>, por ejemplo:{" "}
                                <code className="bg-slate-700 px-2 py-1 rounded">
                                  123.456.789.10:8090
                                </code>
                              </span>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <span className="font-semibold text-green-300">
                                Realmlist:
                              </span>
                              <span className="text-slate-300 ml-2">
                                Configura el realmlist que usarán los jugadores.
                              </span>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <span className="font-semibold text-green-300">
                                Tipo de servidor:
                              </span>
                              <span className="text-slate-300 ml-2">
                                Elige el estilo de juego de tu servidor
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  {/* Atributos*/}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Campo 4 */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="col-span-1"
                    >
                      <label
                        htmlFor="hostServer"
                        className="block text-white font-semibold mb-3 text-lg"
                      >
                        {t("server-register.form.host")}
                      </label>
                      <div className="relative">
                        <input
                          id="hostServer"
                          type="text"
                          value={host}
                          onChange={handleSetHost}
                          placeholder={"https://tuserver:8090"}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-200 text-lg bg-slate-800/50 backdrop-blur-sm ${
                            host.length < 5
                              ? "border-red-500 focus:ring-red-500/50 focus:border-red-400"
                              : host.length >= 5
                              ? "border-green-500 focus:ring-green-500/50 focus:border-green-400"
                              : "border-slate-600 focus:ring-blue-500/50 focus:border-blue-400"
                          }`}
                        />
                        {host.length >= 5 && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <svg
                              className="w-5 h-5 text-green-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-sm text-slate-400">
                          {host.length < 5 ? "Mínimo 5 caracteres" : "✓ Válido"}
                        </p>
                        <p className="text-sm text-slate-400">
                          {50 - host.length} restantes
                        </p>
                      </div>
                    </motion.div>

                    {/* Campo 5 */}
                    <div className="col-span-1">
                      <label
                        htmlFor="realmlist"
                        className="block text-white font-medium mb-2"
                      >
                        {t("server-register.form.realmlist")}
                      </label>
                      <input
                        id="realmlist"
                        type="text"
                        value={realmlist}
                        onChange={(e) => {
                          if (e.target.value.length <= 40) {
                            handleSetRealmlist(e);
                          }
                        }}
                        placeholder={t(
                          "server-register.form.realmlist-placeholder"
                        )}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-200 text-lg bg-slate-800/50 backdrop-blur-sm text-white ${
                          realmlist.length < 5
                            ? "border-red-500 focus:ring-red-500/50 focus:border-red-400"
                            : realmlist.length >= 5
                            ? "border-green-500 focus:ring-green-500/50 focus:border-green-400"
                            : "border-slate-600 focus:ring-blue-500/50 focus:border-blue-400"
                        }`}
                      />
                      <p className="text-sm text-gray-300 mt-1">
                        {`${t("server-register.character-text")}  
    ${40 - realmlist.length}.`}
                      </p>
                    </div>

                    {/* Campo 6 */}
                    <div className="col-span-1">
                      <label
                        htmlFor="serverType"
                        className="block text-white font-medium mb-2"
                      >
                        {t("server-register.form.type-server")}
                      </label>
                      <select
                        id="serverType"
                        value={typeServer}
                        onChange={handleSetTypeServer}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-200 text-lg bg-slate-800/50 backdrop-blur-sm appearance-none text-white ${
                          typeServer === ""
                            ? "border-red-500 focus:ring-red-500/50 focus:border-red-400"
                            : "border-green-500 focus:ring-green-500/50 focus:border-green-400"
                        }`}
                      >
                        <option
                          value=""
                          disabled
                          className="bg-slate-800 text-white"
                        >
                          {t("server-register.default-txt-select")}
                        </option>
                        <option
                          value="Instant"
                          className="bg-slate-800 text-white"
                        >
                          Instant
                        </option>
                        <option
                          value="Blizzlike"
                          className="bg-slate-800 text-white"
                        >
                          Blizzlike
                        </option>
                        <option
                          value="Custom"
                          className="bg-slate-800 text-white"
                        >
                          Custom
                        </option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 3 && (
                <motion.div
                  key="tab3"
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Descripción general */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 bg-gradient-to-r from-red-900/20 to-red-800/20 rounded-xl shadow-lg border border-red-500/20 mb-8 min-h-[180px] flex flex-col justify-center"
                  >
                    <div className="flex items-start space-x-4">
                      {/* Ícono informativo */}
                      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full p-3 shadow-lg">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-6 h-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13 16h-1v-4h-1m1-4h.01M12 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z"
                          />
                        </svg>
                      </div>
                      {/* Texto descriptivo */}
                      <div className="flex-1">
                        <h3 className="text-2xl text-white font-bold mb-3 flex items-center">
                          <span className="mr-2">🔑</span>
                          ¡Asegura tu servidor con contraseñas seguras!
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <span className="font-semibold text-red-300">
                                Contraseña:
                              </span>
                              <span className="text-slate-300 ml-2">
                                Establece una contraseña segura para proteger el
                                acceso al servidor. Asegúrate de que sea lo
                                suficientemente fuerte para evitar accesos no
                                autorizados.
                              </span>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <span className="font-semibold text-red-300">
                                Importante:
                              </span>
                              <span className="text-slate-300 ml-2">
                                Recuerda que esta contraseña será la clave para
                                administrar las configuraciones del servidor.
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Atributos*/}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Campo 7 */}
                    <div className="col-span-1">
                      <label
                        htmlFor="password"
                        className="block text-white font-medium mb-2"
                      >
                        {t("server-register.form.password")}
                      </label>
                      <input
                        id="password"
                        type="password"
                        value={passwordServer}
                        onChange={(e) => {
                          if (e.target.value.length <= 30) {
                            handleSetPasswordServer(e);
                          }
                        }}
                        placeholder={t(
                          "server-register.form.password-placeholder"
                        )}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-200 text-lg bg-slate-800/50 backdrop-blur-sm text-white ${
                          passwordServer.length < 5
                            ? "border-red-500 focus:ring-red-500/50 focus:border-red-400"
                            : "border-green-500 focus:ring-green-500/50 focus:border-green-400"
                        }`}
                      />
                      <p className="text-sm text-gray-300 mt-1">
                        {`${t("server-register.character-text")}  
                    ${30 - passwordServer.length}.`}
                      </p>
                    </div>
                    {/* Campo 8 */}
                    <div className="col-span-1">
                      <label
                        htmlFor="confirmPassword"
                        className="block text-white font-medium mb-2"
                      >
                        {t("server-register.form.password-confirm")}
                      </label>
                      <input
                        id="confirmPassword"
                        type="password"
                        value={passwordConfirmServer}
                        onChange={(e) => {
                          if (e.target.value.length <= 30) {
                            handleSetConfirmPasswordServer(e);
                          }
                        }}
                        placeholder={t(
                          "server-register.form.password-confirm-placeholder"
                        )}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-200 text-lg bg-slate-800/50 backdrop-blur-sm text-white ${
                          passwordConfirmServer !== passwordServer ||
                          passwordConfirmServer.length < 5
                            ? "border-red-500 focus:ring-red-500/50 focus:border-red-400"
                            : "border-green-500 focus:ring-green-500/50 focus:border-green-400"
                        }`}
                      />
                      <p className="text-sm text-gray-300 mt-1">
                        {`${t("server-register.character-text")}  
                      ${30 - passwordConfirmServer.length}.`}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 4 && (
                <motion.div
                  key="tab4"
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Descripción general */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 bg-gradient-to-r from-purple-900/20 to-purple-800/20 rounded-xl shadow-lg border border-purple-500/20 mb-8 min-h-[180px] flex flex-col justify-center"
                  >
                    <div className="flex items-start space-x-4">
                      {/* Ícono informativo */}
                      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full p-3 shadow-lg">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-6 h-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13 16h-1v-4h-1m1-4h.01M12 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z"
                          />
                        </svg>
                      </div>
                      {/* Texto descriptivo */}
                      <div className="flex-1">
                        <h3 className="text-2xl text-white font-bold mb-3 flex items-center">
                          <span className="mr-2">🔐</span>
                          ¡Configura las credenciales de acceso de una cuenta
                          GM!
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <span className="font-semibold text-purple-300">
                                Usuario GM:
                              </span>
                              <span className="text-slate-300 ml-2">
                                Ingresa el nombre de usuario del Game Master(GM)
                                que administrará el reino.
                              </span>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <span className="font-semibold text-purple-300">
                                Contraseña GM:
                              </span>
                              <span className="text-slate-300 ml-2">
                                Establece una contraseña fuerte y segura para la
                                autenticación.
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Atributos*/}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Campo 9 */}
                    <div className="col-span-1">
                      <label
                        htmlFor="username"
                        className="block text-white font-medium mb-2"
                      >
                        {t("server-register.form.username-external")}
                      </label>
                      <input
                        id="username"
                        type="text"
                        value={usernameExternal}
                        onChange={(e) => {
                          if (e.target.value.length <= 20) {
                            handleSetUsernameExternal(e);
                          }
                        }}
                        minLength={5}
                        maxLength={20}
                        placeholder={t(
                          "server-register.form.username-external-placeholder"
                        )}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-200 text-lg bg-slate-800/50 backdrop-blur-sm text-white ${
                          usernameExternal.length < 5 ||
                          usernameExternal.length > 20
                            ? "border-red-500 focus:ring-red-500/50 focus:border-red-400"
                            : "border-green-500 focus:ring-green-500/50 focus:border-green-400"
                        }`}
                      />
                      <p className="text-sm text-gray-300 mt-1">
                        {`${t("server-register.character-text")}  
    ${20 - usernameExternal.length}.`}
                      </p>
                    </div>

                    {/* Campo 10 */}
                    <div className="col-span-1">
                      <label
                        htmlFor="integrationPassword"
                        className="block text-white font-medium mb-2"
                      >
                        {t("server-register.form.password-external")}
                      </label>
                      <input
                        id="integrationPassword"
                        type="password"
                        value={passwordExternal}
                        onChange={(e) => {
                          if (e.target.value.length <= 20) {
                            handleSetPasswordExternal(e);
                          }
                        }}
                        minLength={5}
                        maxLength={20}
                        placeholder={t("Ingrese la contraseña de integración")}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-200 text-lg bg-slate-800/50 backdrop-blur-sm text-white ${
                          passwordExternal.length < 5 ||
                          passwordExternal.length > 20
                            ? "border-red-500 focus:ring-red-500/50 focus:border-red-400"
                            : "border-green-500 focus:ring-green-500/50 focus:border-green-400"
                        }`}
                      />
                      <p className="text-sm text-gray-300 mt-1">
                        {`${t("server-register.character-text")}  
    ${20 - passwordExternal.length}.`}
                      </p>
                    </div>
                    {/* Campo 11 */}
                    <div className="col-span-1">
                      <label
                        htmlFor="serverType"
                        className="block text-white font-medium mb-2"
                      >
                        {t("server-register.form.emulator")}
                      </label>
                      <select
                        id="serverType"
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-200 text-lg bg-slate-800/50 backdrop-blur-sm appearance-none text-white ${
                          emulator === ""
                            ? "border-red-500 focus:ring-red-500/50 focus:border-red-400"
                            : "border-green-500 focus:ring-green-500/50 focus:border-green-400"
                        }`}
                        value={emulator}
                        onChange={handleSetEmulator}
                      >
                        <option
                          value=""
                          disabled
                          className="bg-slate-800 text-white"
                        >
                          {t("server-register.default-txt-select")}
                        </option>
                        <option
                          value="AzerothCore"
                          className="bg-slate-800 text-white"
                        >
                          AzerothCore
                        </option>
                        <option
                          value="Trinity"
                          className="bg-slate-800 text-white"
                        >
                          Trinity
                        </option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Botones */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col items-center gap-6 pt-10"
              >
                <motion.button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  whileHover={isFormValid ? { scale: 1.02 } : {}}
                  whileTap={isFormValid ? { scale: 0.98 } : {}}
                  className={`w-full sm:w-1/2 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                    isFormValid && !isSubmitting
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                      : "bg-slate-600 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Procesando...</span>
                    </div>
                  ) : (
                    t("server-register.btn.link-txt")
                  )}
                </motion.button>

                <motion.button
                  type="button"
                  onClick={handleVolverClick}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-1/2 border-2 border-blue-500 text-blue-400 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-500 hover:text-white transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
                >
                  {t("server-register.btn.return-txt")}
                </motion.button>
              </motion.div>
            </AnimatePresence>
          </form>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default Server;

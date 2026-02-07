"use client";
import { createServer, pingRealmlist, type RealmPingItem } from "@/api/account/realms";
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

const Server = () => {
  const [serverName, setServerName] = useState("");
  const [web, setWeb] = useState("");
  const [expansion, setExpansion] = useState("");
  const [host, setHost] = useState("");
  const [realmlist, setRealmlist] = useState("");
  const [typeServer, setTypeServer] = useState("");
  const [passwordServer, setPasswordServer] = useState("");
  const [passwordConfirmServer, setConfirmPasswordServer] = useState("");
  const [emulator, setEmulator] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const token = Cookies.get("token");

  const [realms, setRealms] = useState<RealmPingItem[]>([]);
  const [selectedRealmId, setSelectedRealmId] = useState<string>("");
  const [loadingRealms, setLoadingRealms] = useState(false);
  const [realmsError, setRealmsError] = useState<string | null>(null);

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
        "",
        "",
        Number(expansion),
        typeServer,
        selectedRealmId ? Number(selectedRealmId) : null
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

  const TOTAL_STEPS = 5;
  const progressPercentage = (activeTab / TOTAL_STEPS) * 100;

  const stepConfig = [
    { id: 1, titleKey: "server-register.steps.step-1-title", summaryKey: "server-register.steps.step-1-summary" },
    { id: 2, titleKey: "server-register.steps.step-2-title", summaryKey: "server-register.steps.step-2-summary" },
    { id: 3, titleKey: "server-register.steps.step-3-title", summaryKey: "server-register.steps.step-3-summary" },
    { id: 4, titleKey: "server-register.steps.step-4-title", summaryKey: "server-register.steps.step-4-summary" },
    { id: 5, titleKey: "server-register.steps.step-5-title", summaryKey: "server-register.steps.step-5-summary" },
  ];

  const handleFetchRealms = async () => {
    const hostTrimmed = host.trim();
    if (!hostTrimmed || hostTrimmed.length < MIN_HOST_LENGTH) return;
    setRealmsError(null);
    setLoadingRealms(true);
    try {
      const list = await pingRealmlist(hostTrimmed, token ?? null);
      setRealms(list);
      setSelectedRealmId("");
      setRealmlist("");
    } catch (err) {
      const message = err instanceof Error ? err.message : t("server-register.realms-step.error");
      setRealmsError(message);
      setRealms([]);
      setSelectedRealmId("");
      setRealmlist("");
    } finally {
      setLoadingRealms(false);
    }
  };

  const handleSelectRealm = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedRealmId(value);
    const realm = realms.find((r) => String(r.id) === value);
    if (realm) setRealmlist(realm.name);
    else setRealmlist("");
  };

  const isStepComplete = (step: number): boolean => {
    switch (step) {
      case 1:
        return (
          serverName.trim().length >= MIN_SERVER_NAME_LENGTH &&
          serverName.trim().length <= MAX_SERVER_NAME_LENGTH &&
          web.trim().length >= MIN_WEB_LENGTH &&
          web.trim().length <= MAX_WEB_LENGTH &&
          expansion !== ""
        );
      case 2:
        return (
          host.trim().length >= MIN_HOST_LENGTH &&
          host.trim().length <= MAX_HOST_LENGTH &&
          typeServer !== ""
        );
      case 3:
        return (
          passwordServer.trim().length >= MIN_PASSWORD_SERVER_LENGTH &&
          passwordServer.trim().length <= MAX_PASSWORD_SERVER_LENGTH &&
          passwordConfirmServer.trim().length >= MIN_CONFIRM_PASSWORD_SERVER_LENGTH &&
          passwordConfirmServer.trim().length <= MAX_CONFIRM_PASSWORD_SERVER_LENGTH &&
          passwordConfirmServer === passwordServer
        );
      case 4:
        return selectedRealmId !== "" && realmlist.trim().length >= MIN_REALMLIST_LENGTH;
      case 5:
        return emulator !== "";
      default:
        return false;
    }
  };

  const goNext = () => {
    if (activeTab < TOTAL_STEPS && isStepComplete(activeTab)) {
      setActiveTab((prev) => prev + 1);
    }
  };
  const goPrevious = () => {
    if (activeTab > 1) setActiveTab((prev) => prev - 1);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-midnight text-white">
      <NavbarMinimalist />

      <div className="flex items-center justify-center flex-grow px-4 sm:px-6 py-10 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-5xl lg:max-w-6xl rounded-2xl overflow-hidden border border-slate-600/80 bg-gradient-to-br from-slate-800 via-indigo-950/50 to-slate-900 backdrop-blur-sm ring-1 ring-white/5 shadow-2xl shadow-indigo-950/30"
        >
          {/* Header */}
          <div className="px-8 pt-10 pb-8 sm:px-12 sm:pt-12 sm:pb-10 border-b border-slate-600/60 bg-slate-800/30">
            <TitleWow
              title={t("register.title-server-sub-title")}
              description={t("server-register.title")}
            />

            {/* Stepper horizontal con líneas */}
            <nav
              className="mt-10 sm:mt-12"
              role="navigation"
              aria-label={t("server-register.steps.step-of", { current: activeTab, total: TOTAL_STEPS })}
            >
              <div className="hidden sm:block">
                <div className="flex items-start">
                  {stepConfig.map((step, index) => {
                    const isCompleted = activeTab > step.id;
                    const isCurrent = activeTab === step.id;
                    const isPending = activeTab < step.id;
                    const isLast = index === stepConfig.length - 1;
                    return (
                      <div key={step.id} className="flex flex-1 items-start min-w-0">
                        <div className="flex flex-col items-center flex-1 pt-0.5">
                          <button
                            type="button"
                            onClick={() => isPending ? undefined : setActiveTab(step.id)}
                            disabled={isPending}
                            className={`
                              flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold
                              transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800
                              ${isCompleted ? "bg-emerald-600 text-white cursor-pointer" : ""}
                              ${isCurrent ? "bg-blue-600 text-white ring-4 ring-blue-500/30 cursor-pointer" : ""}
                              ${isPending ? "bg-slate-600/80 text-slate-400 cursor-not-allowed opacity-70" : ""}
                            `}
                            aria-current={isCurrent ? "step" : undefined}
                            aria-label={`${t(step.titleKey)}${isCompleted ? ", completado" : ""}${isPending ? ", no disponible hasta completar pasos anteriores" : ""}`}
                          >
                            {isCompleted ? (
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              step.id
                            )}
                          </button>
                          <span
                            className={`
                              mt-3 text-base font-medium text-center max-w-[5.5rem] leading-tight
                              ${isCurrent ? "text-white" : ""}
                              ${isCompleted ? "text-slate-400" : ""}
                              ${isPending ? "text-slate-500" : ""}
                            `}
                          >
                            {t(step.titleKey)}
                          </span>
                        </div>
                        {!isLast && (
                          <div className="flex-1 flex items-center px-2 pt-6 min-w-[2rem]">
                            <div className="w-full h-1 rounded-full bg-slate-600/80 overflow-hidden">
                              <motion.div
                                className="h-full bg-emerald-600 rounded-full"
                                initial={false}
                                animate={{ width: isCompleted ? "100%" : "0%" }}
                                transition={{ duration: 0.35, ease: "easeOut" }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="mt-4 text-right text-base text-slate-400">
                  {Math.round(progressPercentage)}% completado
                </p>
              </div>

              {/* Móvil: selector compacto */}
              <div className="sm:hidden">
                <label htmlFor="tabs-mobile" className="block text-sm font-medium text-slate-400 mb-2">
                  {t("server-register.steps.step-of", { current: activeTab, total: TOTAL_STEPS })}
                </label>
                <select
                  id="tabs-mobile"
                  className="w-full px-4 py-3 rounded-lg bg-slate-700/80 border border-slate-600 text-white text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={activeTab}
                  onChange={(e) => setActiveTab(Number(e.target.value))}
                  aria-label={t("server-register.selection-mobile.title")}
                >
                  <option value={1}>{t("server-register.selection-mobile.information")}</option>
                  <option value={2} disabled={activeTab < 2}>{t("server-register.selection-mobile.details")}</option>
                  <option value={3} disabled={activeTab < 3}>{t("server-register.selection-mobile.security")}</option>
                  <option value={4} disabled={activeTab < 4}>{t("server-register.selection-mobile.realms")}</option>
                  <option value={5} disabled={activeTab < 5}>{t("server-register.selection-mobile.integration")}</option>
                </select>
              </div>
            </nav>
          </div>

          {/* Formulario */}
          <form className="px-8 pb-10 sm:px-12 sm:pb-12" onSubmit={handleFormSubmit}>
            <AnimatePresence mode="wait">
              {activeTab === 1 && (
                <motion.div
                  key="tab1"
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                  className="pt-10 sm:pt-12 space-y-6"
                >
                  <header className="mb-10">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
                      {t("server-register.steps.step-of", { current: 1, total: TOTAL_STEPS })}
                    </p>
                    <h2 className="text-2xl font-semibold text-white mb-2">
                      {t(stepConfig[0].titleKey)}
                    </h2>
                    <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
                      {t(stepConfig[0].summaryKey)}
                    </p>
                  </header>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="col-span-1"
                    >
                      <label htmlFor="serverName" className="block text-base font-medium text-slate-300 mb-2">
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
                          placeholder={t("server-register.form.name-server-placeholder")}
                          className={`w-full px-4 py-3 rounded-lg bg-slate-700/70 border text-white placeholder-slate-500 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors ${
                            serverName.length > 0 && serverName.length < MIN_SERVER_NAME_LENGTH
                              ? "border-red-500/60"
                              : serverName.length >= MIN_SERVER_NAME_LENGTH
                              ? "border-emerald-600/50"
                              : "border-slate-600"
                          }`}
                        />
                        {serverName.length >= MIN_SERVER_NAME_LENGTH && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400" aria-hidden>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-slate-400 text-right">
                        {serverName.length < MIN_SERVER_NAME_LENGTH
                          ? "Mín. 5 caracteres"
                          : `${MAX_SERVER_NAME_LENGTH - serverName.length} restantes`}
                      </p>
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
                        className="block text-base font-medium text-slate-300 mb-2"
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
                          className={`w-full px-4 py-3 rounded-lg bg-slate-700/70 border text-white placeholder-slate-500 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors ${
                            web.length > 0 && web.length < 5
                              ? "border-red-500/60"
                              : web.length >= 5
                              ? "border-emerald-600/50"
                              : "border-slate-600"
                          }`}
                        />
                        {web.length >= 5 && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400" aria-hidden>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-slate-400 text-right">
                        {web.length < MIN_WEB_LENGTH ? "Mín. 5 caracteres" : `${MAX_WEB_LENGTH - web.length} restantes`}
                      </p>
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
                        className="block text-base font-medium text-slate-300 mb-2"
                      >
                        {t("server-register.form.expansion")}
                      </label>
                      <div className="relative">
                        <select
                          id="expansion"
                          value={expansion}
                          onChange={handleSetExpansion}
                          className={`w-full px-4 py-3 rounded-lg bg-slate-700/70 border text-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors appearance-none ${
                            expansion === ""
                              ? "border-red-500/60"
                              : "border-emerald-600/50"
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
                      <p className="mt-2 text-sm text-slate-400 text-right">
                        {expansion === "" ? "Requerido" : "✓"}
                      </p>
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
                  transition={{ duration: 0.25 }}
                  className="pt-10 sm:pt-12 space-y-6"
                >
                  <header className="mb-10">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
                      {t("server-register.steps.step-of", { current: 2, total: TOTAL_STEPS })}
                    </p>
                    <h2 className="text-2xl font-semibold text-white mb-2">
                      {t(stepConfig[1].titleKey)}
                    </h2>
                    <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
                      {t(stepConfig[1].summaryKey)}
                    </p>
                  </header>
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
                        className="block text-base font-medium text-slate-300 mb-2"
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
                          className={`w-full px-4 py-3 rounded-lg bg-slate-700/70 border text-white placeholder-slate-500 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors ${
                            host.length > 0 && host.length < 5
                              ? "border-red-500/60"
                              : host.length >= 5
                              ? "border-emerald-600/50"
                              : "border-slate-600"
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
                      <p className="mt-2 text-sm text-slate-400 text-right">
                        {host.length > 0 && host.length < MIN_HOST_LENGTH ? "Mín. 5 caracteres" : `${MAX_HOST_LENGTH - host.length} restantes`}
                      </p>
                    </motion.div>

                    {/* Campo 5 */}
                    <div className="col-span-1">
                      <label
                        htmlFor="realmlist"
                        className="block text-base font-medium text-slate-300 mb-2"
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
                        className={`w-full px-4 py-3 rounded-lg bg-slate-700/70 border text-white placeholder-slate-500 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors ${
                          realmlist.length > 0 && realmlist.length < 5
                            ? "border-red-500/60"
                            : realmlist.length >= 5
                            ? "border-emerald-600/50"
                            : "border-slate-600"
                        }`}
                      />
                      <p className="mt-2 text-sm text-slate-400 text-right">
                        {t("server-register.character-text")} {40 - realmlist.length}
                      </p>
                    </div>

                    {/* Campo 6 */}
                    <div className="col-span-1">
                      <label
                        htmlFor="serverType"
                        className="block text-base font-medium text-slate-300 mb-2"
                      >
                        {t("server-register.form.type-server")}
                      </label>
                      <select
                        id="serverType"
                        value={typeServer}
                        onChange={handleSetTypeServer}
                        className={`w-full px-4 py-3 rounded-lg bg-slate-700/70 border text-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors appearance-none ${
                          typeServer === ""
                            ? "border-red-500/60"
                            : "border-emerald-600/50"
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
                  transition={{ duration: 0.25 }}
                  className="pt-10 sm:pt-12 space-y-6"
                >
                  <header className="mb-10">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
                      {t("server-register.steps.step-of", { current: 3, total: TOTAL_STEPS })}
                    </p>
                    <h2 className="text-2xl font-semibold text-white mb-2">
                      {t(stepConfig[2].titleKey)}
                    </h2>
                    <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
                      {t(stepConfig[2].summaryKey)}
                    </p>
                  </header>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Campo 7 */}
                    <div className="col-span-1">
                      <label
                        htmlFor="password"
                        className="block text-base font-medium text-slate-300 mb-2"
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
                        className={`w-full px-4 py-3 rounded-lg bg-slate-700/70 border text-white placeholder-slate-500 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors ${
                          passwordServer.length > 0 && passwordServer.length < 5
                            ? "border-red-500/60"
                            : passwordServer.length >= 5
                            ? "border-emerald-600/50"
                            : "border-slate-600"
                        }`}
                      />
                      <p className="mt-2 text-sm text-slate-400 text-right">
                        {t("server-register.character-text")} {30 - passwordServer.length}
                      </p>
                    </div>
                    {/* Campo 8 */}
                    <div className="col-span-1">
                      <label
                        htmlFor="confirmPassword"
                        className="block text-base font-medium text-slate-300 mb-2"
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
                        className={`w-full px-4 py-3 rounded-lg bg-slate-700/70 border text-white placeholder-slate-500 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors ${
                          (passwordConfirmServer.length > 0 && passwordConfirmServer.length < 5) ||
                          (passwordConfirmServer.length >= 5 && passwordConfirmServer !== passwordServer)
                            ? "border-red-500/60"
                            : passwordConfirmServer === passwordServer && passwordConfirmServer.length >= 5
                            ? "border-emerald-600/50"
                            : "border-slate-600"
                        }`}
                      />
                      <p className="mt-2 text-sm text-slate-400 text-right">
                        {t("server-register.character-text")} {30 - passwordConfirmServer.length}
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
                  transition={{ duration: 0.25 }}
                  className="pt-10 sm:pt-12 space-y-6"
                >
                  <header className="mb-10">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
                      {t("server-register.steps.step-of", { current: 4, total: TOTAL_STEPS })}
                    </p>
                    <h2 className="text-2xl font-semibold text-white mb-2">
                      {t(stepConfig[3].titleKey)}
                    </h2>
                    <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
                      {t(stepConfig[3].summaryKey)}
                    </p>
                  </header>

                  <div className="space-y-6 max-w-xl">
                    <p className="text-slate-300 text-base">
                      Host del paso anterior: <strong className="text-white">{host || "—"}</strong>
                    </p>
                    <div>
                      <button
                        type="button"
                        onClick={handleFetchRealms}
                        disabled={loadingRealms || host.trim().length < MIN_HOST_LENGTH}
                        className="px-6 py-3 rounded-lg text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors"
                      >
                        {loadingRealms ? t("server-register.realms-step.fetching") : t("server-register.realms-step.fetch-button")}
                      </button>
                    </div>
                    {realmsError && (
                      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-base" role="alert">
                        {realmsError}
                      </div>
                    )}
                    {realms.length === 0 && !loadingRealms && !realmsError && (
                      <p className="text-slate-500 text-base">{t("server-register.realms-step.empty")}</p>
                    )}
                    {realms.length > 0 && (
                      <div>
                        <label htmlFor="realm-select" className="block text-base font-medium text-slate-300 mb-2">
                          {t("server-register.realms-step.select-placeholder")}
                        </label>
                        <select
                          id="realm-select"
                          value={selectedRealmId}
                          onChange={handleSelectRealm}
                          className={`w-full px-4 py-3 rounded-lg bg-slate-700/70 border text-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors appearance-none ${
                            selectedRealmId ? "border-emerald-600/50" : "border-slate-600"
                          }`}
                        >
                          <option value="" className="bg-slate-800 text-white">
                            {t("server-register.realms-step.select-placeholder")}
                          </option>
                          {realms.map((realm) => (
                            <option key={realm.id} value={String(realm.id)} className="bg-slate-800 text-white">
                              {realm.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 5 && (
                <motion.div
                  key="tab5"
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                  className="pt-10 sm:pt-12 space-y-6"
                >
                  <header className="mb-10">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
                      {t("server-register.steps.step-of", { current: 5, total: TOTAL_STEPS })}
                    </p>
                    <h2 className="text-2xl font-semibold text-white mb-2">
                      {t(stepConfig[4].titleKey)}
                    </h2>
                    <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
                      {t(stepConfig[4].summaryKey)}
                    </p>
                  </header>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="col-span-1">
                      <label
                        htmlFor="emulator"
                        className="block text-base font-medium text-slate-300 mb-2"
                      >
                        {t("server-register.form.emulator")}
                      </label>
                      <select
                        id="emulator"
                        className={`w-full px-4 py-3 rounded-lg bg-slate-700/70 border text-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors appearance-none ${
                          emulator === ""
                            ? "border-red-500/60"
                            : "border-emerald-600/50"
                        }`}
                        value={emulator}
                        onChange={handleSetEmulator}
                      >
                        <option value="" disabled className="bg-slate-800 text-white">
                          {t("server-register.default-txt-select")}
                        </option>
                        <option value="AzerothCore" className="bg-slate-800 text-white">
                          AzerothCore
                        </option>
                        <option value="Trinity" className="bg-slate-800 text-white">
                          Trinity
                        </option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Navegación */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="mt-12 pt-10 border-t border-slate-600/60 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-6"
              >
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {activeTab > 1 && (
                    <button
                      type="button"
                      onClick={goPrevious}
                      className="px-6 py-3 rounded-lg text-base font-medium text-slate-300 bg-slate-700/70 border border-slate-600 hover:bg-slate-700 hover:text-white hover:border-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                    >
                      {t("server-register.btn.previous")}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleVolverClick}
                    className="text-base text-slate-400 hover:text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40 rounded px-1 py-0.5"
                  >
                    {t("server-register.btn.return-txt")}
                  </button>
                </div>
                {activeTab < TOTAL_STEPS ? (
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!isStepComplete(activeTab)}
                    className={`w-full sm:w-auto px-6 py-3 rounded-lg text-base font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors ${
                      isStepComplete(activeTab)
                        ? "text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 cursor-pointer"
                        : "text-slate-400 bg-slate-700 cursor-not-allowed focus:ring-slate-500"
                    }`}
                  >
                    {t("server-register.btn.next")}
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!isFormValid || isSubmitting}
                    className={`w-full sm:w-auto px-6 py-3 rounded-lg text-base font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors ${
                      isFormValid && !isSubmitting
                        ? "text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                        : "text-slate-400 bg-slate-700 cursor-not-allowed focus:ring-slate-500"
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden />
                        Procesando...
                      </span>
                    ) : (
                      t("server-register.btn.link-txt")
                    )}
                  </button>
                )}
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

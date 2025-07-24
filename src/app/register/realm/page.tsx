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
    }

    router.push("/realms");
  };

  const [activeTab, setActiveTab] = useState(1);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-midnight text-white">
      <NavbarMinimalist />

      <div className="flex items-center justify-center flex-grow">
        <div className="text-black shadow-lg rounded-lg p-2 w-full max-w-6xl">
          {/* Title  */}
          <TitleWow
            title={t("register.title-server-sub-title")}
            description={t("server-register.title")}
          />

          {/* Selector de pestañas para móvil */}
          <div className="mb-2 sm:hidden">
            <label htmlFor="tabs" className="block text-white font-medium mb-2">
              {t("server-register.selection-mobile.title")}
            </label>
            <select
              id="tabs"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div className="hidden sm:flex mb-2 justify-start space-x-4">
            <button
              onClick={() => setActiveTab(1)}
              className={`px-4 py-2 rounded-md ${
                activeTab === 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300"
              } hover:bg-blue-500 transition`}
            >
              {t("server-register.selection-desktop.information")}
            </button>
            <button
              onClick={() => setActiveTab(2)}
              className={`px-4 py-2 rounded-md ${
                activeTab === 2
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300"
              } hover:bg-blue-500 transition`}
            >
              {t("server-register.selection-desktop.details")}
            </button>
            <button
              onClick={() => setActiveTab(3)}
              className={`px-4 py-2 rounded-md ${
                activeTab === 3
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300"
              } hover:bg-blue-500 transition`}
            >
              {t("server-register.selection-desktop.security")}
            </button>
            <button
              onClick={() => setActiveTab(4)}
              className={`px-4 py-2 rounded-md ${
                activeTab === 4
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300"
              } hover:bg-blue-500 transition`}
            >
              {t("server-register.selection-desktop.integration")}
            </button>
          </div>

          {/* Formulario */}
          <form className="pt-6 space-y-6" onSubmit={handleFormSubmit}>
            {activeTab === 1 && (
              <div className="space-y-4">
                {/* Descripción general */}
                <div className="p-4 bg-gray-800 rounded-lg shadow-md mb-6">
                  <div className="flex items-center space-x-4">
                    {/* Ícono informativo */}
                    <div className="bg-blue-500 text-white rounded-full p-2">
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
                    <div>
                      <h3 className="text-2xl text-white font-semibold mb-1">
                        <strong>
                          🛠️{" "}
                          <strong>
                            ¡Recuerda configurar estos datos correctamente para
                            un servidor exitoso!
                          </strong>
                        </strong>
                      </h3>
                      <ul className="text-gray-300 text-xl list-disc pl-5 mt-2">
                        <li>
                          <span className="font-medium">
                            Nombre del Servidor:
                          </span>{" "}
                          El nombre con el que los jugadores identificarán tu
                          comunidad.
                        </li>
                        <li>
                          <span className="font-medium">Expansión:</span>{" "}
                          Selecciona la versión del juego que deseas ofrecer.
                        </li>
                        <li>
                          <span className="font-medium">Sitio Web:</span>{" "}
                          Ingresa el enlace oficial donde los jugadores podrán
                          obtener información y registrarse.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                {/* Atributos*/}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Campo 1 */}
                  <div className="col-span-1">
                    <label
                      htmlFor="serverName"
                      className="block text-white font-medium mb-2"
                    >
                      {t("server-register.form.name-server")}
                    </label>
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
                      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 text-xl ${
                        serverName.length < 5
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                    />
                    <p className="text-sm text-gray-300 mt-1">
                      {`${t("server-register.character-text")} ${
                        30 - serverName.length
                      }.`}
                    </p>
                  </div>

                  {/* Campo 2 */}
                  <div className="col-span-1">
                    <label
                      htmlFor="web"
                      className="block text-white font-medium mb-2"
                    >
                      {t("server-register.form.web")}
                    </label>
                    <input
                      id="web"
                      type="text"
                      maxLength={50}
                      minLength={5}
                      value={web}
                      onChange={handleWebSite}
                      placeholder={t("server-register.form.web-placeholder")}
                      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 text-xl ${
                        web.length < 5
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                    />
                    <p className="text-sm text-gray-300 mt-1">
                      {`${t("server-register.character-text")} ${
                        50 - web.length
                      }.`}
                    </p>
                  </div>

                  {/* Campo 3 */}
                  <div className="col-span-1">
                    <label
                      htmlFor="expansion"
                      className="block text-white font-medium mb-2"
                    >
                      {t("server-register.form.expansion")}
                    </label>
                    <select
                      id="expansion"
                      value={expansion}
                      onChange={handleSetExpansion}
                      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 text-xl ${
                        expansion === ""
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                    >
                      <option value="" disabled>
                        {t("server-register.default-txt-select")}
                      </option>
                      <option value="2">Lich King</option>
                      <option value="10">War Within</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 2 && (
              <div className="space-y-4">
                {/* Descripción general */}
                <div className="p-4 bg-gray-800 rounded-lg shadow-md mb-6">
                  <div className="flex items-center space-x-4">
                    {/* Ícono informativo */}
                    <div className="bg-blue-500 text-white rounded-full p-2">
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
                    <div>
                      <h3 className="text-2xl text-white font-semibold mb-1">
                        <strong>
                          🛠️{" "}
                          <strong>
                            ¡Configura Correctamente tu Servidor y Prepara un
                            Buen Inicio!
                          </strong>
                        </strong>
                      </h3>
                      <ul className="text-gray-300 text-xl list-disc pl-5 mt-2">
                        <li>
                          <span className="font-medium">Host:</span> Ingresa tu
                          IP pública (o dominio si tienes uno configurado)
                          seguido del puerto <strong>8090</strong>, por ejemplo:{" "}
                          <code>123.456.789.10:8090</code>
                        </li>
                        <li>
                          <span className="font-medium">Realmlist:</span>{" "}
                          Configura el realmlist que usarán los jugadores.
                        </li>
                        <li>
                          <span className="font-medium">Tipo de servidor:</span>{" "}
                          Elige el estilo de juego de tu servidor
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                {/* Atributos*/}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Campo 4 */}
                  <div className="col-span-1">
                    <label
                      htmlFor="hostServer"
                      className="block text-white font-medium mb-2"
                    >
                      {t("server-register.form.host")}
                    </label>
                    <input
                      id="hostServer"
                      type="text"
                      value={host}
                      onChange={handleSetHost}
                      placeholder={"https://tuserver:8090"}
                      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 text-xl ${
                        host.length < 5
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                    />
                    <p className="text-sm text-gray-300 mt-1">
                      {`${t("server-register.character-text")} ${
                        50 - host.length
                      }.`}
                    </p>
                  </div>

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
                      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 text-xl ${
                        realmlist.length < 5
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
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
                      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 text-xl ${
                        typeServer === ""
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                    >
                      <option value="" disabled>
                        {t("server-register.default-txt-select")}
                      </option>
                      <option value="Instant">Instant</option>
                      <option value="Blizzlike">Blizzlike</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 3 && (
              <div className="space-y-4">
                {/* Descripción general */}
                <div className="p-4 bg-gray-800 rounded-lg shadow-md mb-6">
                  <div className="flex items-center space-x-4">
                    {/* Ícono informativo */}
                    <div className="bg-blue-500 text-white rounded-full p-2">
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
                    <div>
                      <h3 className="text-2xl text-white font-semibold mb-1">
                        <strong>
                          🔑{" "}
                          <strong>
                            ¡Asegura tu servidor con contraseñas seguras!
                          </strong>
                        </strong>
                      </h3>
                      <ul className="text-gray-300 text-xl list-disc pl-5 mt-2">
                        <li>
                          <span className="font-medium">Contraseña:</span>{" "}
                          Establece una contraseña segura para proteger el
                          acceso al servidor. Asegúrate de que sea lo
                          suficientemente fuerte para evitar accesos no
                          autorizados.
                        </li>
                        <li>
                          <span className="font-medium">Importante:</span>{" "}
                          Recuerda que esta contraseña serán la clave para
                          administrar las configuraciones del servidor.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

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
                      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 text-xl ${
                        passwordServer.length < 5
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
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
                      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 text-xl ${
                        passwordConfirmServer !== passwordServer ||
                        passwordConfirmServer.length < 5
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                    />
                    <p className="text-sm text-gray-300 mt-1">
                      {`${t("server-register.character-text")}  
                      ${30 - passwordConfirmServer.length}.`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 4 && (
              <div className="space-y-4">
                {/* Descripción general */}
                <div className="p-4 bg-gray-800 rounded-lg shadow-md mb-6">
                  <div className="flex items-center space-x-4">
                    {/* Ícono informativo */}
                    <div className="bg-blue-500 text-white rounded-full p-2">
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
                    <div>
                      <h3 className="text-2xl text-white font-semibold mb-1">
                        <strong>
                          🔐
                          <strong>
                            ¡Configura las credenciales de acceso de una cuenta
                            GM!
                          </strong>
                        </strong>
                      </h3>
                      <ul className="text-gray-300 text-xl list-disc pl-5 mt-2">
                        <li>
                          <span className="font-medium">Usuario GM:</span>{" "}
                          Ingresa el nombre de usuario del Game Master(GM) que
                          administrará el reino.
                        </li>
                        <li>
                          <span className="font-medium">Contraseña GM:</span>{" "}
                          Establece una contraseña fuerte y segura para la
                          autenticación.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

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
                      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 text-xl ${
                        usernameExternal.length < 5 ||
                        usernameExternal.length > 20
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
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
                      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 text-xl ${
                        passwordExternal.length < 5 ||
                        passwordExternal.length > 20
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
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
                      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 text-xl ${
                        emulator === ""
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                      value={emulator}
                      onChange={handleSetEmulator}
                    >
                      <option value="" disabled>
                        {t("server-register.default-txt-select")}
                      </option>
                      <option value="AzerothCore">AzerothCore</option>
                      <option value="Trinity">Trinity</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex flex-col items-center gap-4 pt-10">
              <button
                type="submit"
                disabled={!isFormValid}
                className={`w-full sm:w-1/2 px-5 py-3 rounded-md transition ${
                  isFormValid
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-600 text-gray-400 cursor-not-allowed"
                }`}
              >
                {t("server-register.btn.link-txt")}
              </button>
              <button
                type="reset"
                onClick={handleVolverClick}
                className="w-full sm:w-1/2 border border-blue-600 text-blue-600 px-5 py-3 rounded-md hover:bg-blue-600 hover:text-white transition "
              >
                {t("server-register.btn.return-txt")}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Server;

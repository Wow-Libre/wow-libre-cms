"use client";
import { accountInactive, getAccounts, sendMail } from "@/api/account";
import { getSubscriptionActive } from "@/api/subscriptions";
import NavbarAuthenticated from "@/components/navbar-authenticated";
import LoadingSpinner from "@/components/utilities/loading-spinner";
import { useUserContext } from "@/context/UserContext";
import { InternalServerError } from "@/dto/generic";
import useAuth from "@/hook/useAuth";
import { AccountsModel } from "@/model/model";
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactPaginate from "react-paginate";
import Swal from "sweetalert2";
import "./style.css";

const LimitAccountRegister = 10;
const accountsPerPage = 5;

const AccountsGame = () => {
  const router = useRouter();
  const { user, clearUserData } = useUserContext();
  const token = Cookies.get("token");
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(true);
  const [redirect, setRedirect] = useState<boolean>(false);
  const [filteredAccounts, setFilteredAccounts] = useState<AccountsModel[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [hasAccount, setHasAccount] = useState<boolean>(false);
  const [accounts, setAccounts] = useState<AccountsModel[]>([]);
  const [searchUsername, setUsername] = useState<string>("");
  const [searchServer, setSearchServer] = useState<string>("");
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const [isUserShowWelcome, setUserShowWelcome] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [hasActiveSubscription, setHasActiveSubscription] =
    useState<boolean>(false);

  const handleCheckboxChange = (id: number, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id)
    );
  };

  useAuth(t("errors.message.expiration-session"));

  useEffect(() => {
    if (!token) {
      setRedirect(true);
      return;
    }

    const fetchData = async () => {
      try {
        // Consultar si tiene suscripción activa
        const subscriptionPromise = token
          ? getSubscriptionActive(token)
          : Promise.resolve(false);

        // Obtener cuentas
        const accountsPromise = getAccounts(
          token,
          currentPage,
          accountsPerPage,
          searchServer,
          searchUsername
        );

        // Ejecutar ambas consultas en paralelo
        const [isSubscriptionActive, fetchedAccounts] = await Promise.all([
          subscriptionPromise,
          accountsPromise,
        ]);

        setHasActiveSubscription(isSubscriptionActive);
        setAccounts(fetchedAccounts.accounts);
        setTotalPages(fetchedAccounts.size);
        setHasAccount(fetchedAccounts.size > 0);
        setUserShowWelcome(fetchedAccounts.size > 0);
        setLoading(false);
      } catch (error: any) {
        if (error instanceof InternalServerError) {
          if (error.statusCode === 401) {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: t("errors.message.expiration-session"),
              color: "white",
              background: "#0B1218",
              timer: 4000,
              willClose: () => {
                clearUserData();
                setRedirect(true);
              },
            });
            return;
          }
        } else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: `${error.message}`,
            color: "white",
            background: "#0B1218",
            timer: 4500,
          });
        }
      }
    };
    fetchData();
  }, [currentPage, searchUsername, searchServer, selectedIds]);

  if (redirect) {
    router.push("/");
  }

  useEffect(() => {
    const filtered = accounts.filter((account) => {
      const matchesUsername = account.username
        .toLowerCase()
        .includes(searchUsername.toLowerCase());
      const matchesServer = account.realm
        .toLowerCase()
        .includes(searchServer.toLowerCase());
      return matchesUsername && matchesServer;
    });

    setFilteredAccounts(filtered);
  }, [searchUsername, searchServer, accounts, user]);

  const handleConfirmEmail = async () => {
    if (!token) {
      router.push("/");
      return;
    }

    try {
      await sendMail(token);
      Swal.fire({
        title: t("account.validation-mail.title-success"),
        text: t("account.validation-mail.message-success"),
        icon: "success",
        confirmButtonText: "Aceptar",
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: t("account.validation-mail.title-error"),
        text: error.message,
        confirmButtonText: "Aceptar",
      });
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const regex = /^[a-zA-Z0-9\s]*$/;

    if (regex.test(value)) {
      setUsername(value);
    } else {
      Swal.fire({
        icon: "warning",
        title: "Oops...",
        text: t("account.errors.special-characters"),
        color: "white",
        background: "#0B1218",
        timer: 4500,
      });
    }
  };

  const handleServerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const regex = /^[a-zA-Z0-9\s]*$/;

    if (regex.test(value)) {
      setSearchServer(value);
    } else {
      Swal.fire({
        icon: "warning",
        title: "Oops...",
        text: t("account.errors.special-characters"),
        color: "white",
        background: "#0B1218",
        timer: 4500,
      });
    }
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handlePageClick = (data: { selected: number }) => {
    setCurrentPage(data.selected);
  };

  const handleCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
  };

  const handleInactiveAccounts = async () => {
    if (selectedIds.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Oops...",
        text: "Debes seleccionar al menos una cuenta",
      });
      return;
    }
    if (!token) {
      setRedirect(true);
      return;
    }

    try {
      await accountInactive(token, selectedIds);
      Swal.fire({
        icon: "success",
        title: "Cuentas inactivadas",
        text: "Las cuentas seleccionadas fueron inactivadas correctamente.",
      });

      setAccounts((prev) =>
        prev.map((acc) =>
          selectedIds.includes(acc.id) ? { ...acc, status: false } : acc
        )
      );

      setSelectedIds([]);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
    }
  };

  if (loading) {
    return (
      <div className="contenedor mx-auto  h-screen-md">
        <NavbarAuthenticated />
        <div className="flex items-center justify-center mt-10">
          <div className="empty-table-message mb-4 select-none">
            <div className="content mb-30 mt-16">
              <img
                src="https://static.wixstatic.com/media/5dd8a0_1316758a384a4e02818738497253ea7d~mv2.webp"
                alt="Magician Casting A Power"
              />
              <p className="mb-5 font-serif">
                {t("account.service-unavailable.message")}
              </p>
              <LoadingSpinner />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Validar si puede crear más cuentas (solo cuentas activas cuentan para el límite)
  // Si tiene suscripción activa: puede crear hasta LimitAccountRegister cuentas activas
  // Si NO tiene suscripción activa: solo puede tener máximo 1 cuenta activa
  const activeAccountsCount = accounts ? accounts.filter((acc) => acc.status).length : 0;
  const canCreateMoreAccounts = hasActiveSubscription
    ? activeAccountsCount < LimitAccountRegister
    : activeAccountsCount < 1;

  const accountMaximus = hasActiveSubscription
    ? activeAccountsCount >= LimitAccountRegister
    : activeAccountsCount >= 1;

  return (
    <div className="contenedor dark h-screen-md select-none accounts-page-content">
      <NavbarAuthenticated />

      <div className="accounts-hero text-center pt-32 relative">
        <div className="accounts-hero-accent mx-auto mb-6" aria-hidden />
        <h1 className="text-4xl font-bold text-white tracking-tight relative">
          {t("account.service-available.title-txt-message")}
        </h1>
        <p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed relative">
          {t("account.service-available.txt-message")}
        </p>
      </div>
      {hasAccount && !user.pending_validation ? (
        <div className="relative p-10">
          <div className="accounts-toolbar flex items-center justify-between flex-wrap md:flex-nowrap space-y-4 md:space-y-0 pb-4 px-5 py-4 rounded-2xl">
            {/* Botón de acción y suscripción alineados a la izquierda */}
            <div className="flex flex-wrap items-center gap-3 ml-2">
            <div className="relative inline-block text-left">
              <button
                id="dropdownActionButton"
                data-dropdown-toggle="dropdownAction"
                className="group inline-flex items-center gap-2 px-4 py-2.5 text-base font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 shadow-sm hover:shadow-md hover:border-gray-400 dark:hover:border-gray-500"
                type="button"
                onClick={toggleDropdown}
              >
                <svg
                  className="w-5 h-5 text-gray-500 dark:text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
                <span>{t("account.service-available.btn-administration")}</span>
                <svg
                  className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
                    dropdownVisible ? "rotate-180" : ""
                  }`}
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
              </button>
              <div
                id="dropdownAction"
                className={`accounts-dropdown ${
                  dropdownVisible
                    ? "opacity-100 visible translate-y-0"
                    : "opacity-0 invisible -translate-y-2"
                } accounts-dropdown absolute left-0 mt-2 z-20 w-64 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 ease-out`}
              >
                {/* Header del dropdown */}
                <div className="px-5 py-3.5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-750 border-b border-gray-200 dark:border-gray-600">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                    Administración
                  </h3>
                </div>

                <div className="py-2">
                  {/* Opción: Crear cuenta */}
                  {canCreateMoreAccounts ? (
                    <Link
                      href={{
                        pathname: "/register/username",
                        query: isUserShowWelcome
                          ? { showWelcome: "false" }
                          : { showWelcome: "true" },
                      }}
                      className="flex items-center gap-4 px-5 py-4 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-150 group/item"
                    >
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover/item:bg-blue-200 dark:group-hover/item:bg-blue-900/50 transition-colors">
                        <svg
                          className="w-6 h-6 text-blue-600 dark:text-blue-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                          {t("account.with-accounts.txt-create-account")}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Agregar nueva cuenta de juego
                        </p>
                      </div>
                      <svg
                        className="w-6 h-6 text-gray-400 dark:text-gray-500 group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  ) : (
                    <div className="px-5 py-4">
                      <div className="flex items-start gap-4 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-yellow-600 dark:text-yellow-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-semibold text-gray-900 dark:text-white">
                            {t("account.with-accounts.txt-create-account")}
                          </p>
                          <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1.5">
                            Suscripción Premium requerida
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="my-2 border-t border-gray-200 dark:border-gray-700"></div>

                  {/* Opción: Eliminar cuenta */}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleInactiveAccounts();
                    }}
                    className="flex items-center gap-4 px-5 py-4 text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150 group/item"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center group-hover/item:bg-red-200 dark:group-hover/item:bg-red-900/50 transition-colors">
                      <svg
                        className="w-6 h-6 text-red-600 dark:text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {t("account.with-accounts.txt-delete-account")}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Inactivar cuentas seleccionadas
                      </p>
                    </div>
                    <svg
                      className="w-6 h-6 text-gray-400 dark:text-gray-500 group-hover/item:text-red-600 dark:group-hover/item:text-red-400 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

              {hasActiveSubscription ? (
                <span className="account-subscription-btn account-subscription-btn--active inline-flex items-center gap-2 px-4 py-2.5 text-base font-semibold rounded-xl border cursor-default">
                  <svg className="w-5 h-5 flex-shrink-0 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{t("account.service-available.btn-subscription-active")}</span>
                </span>
              ) : (
                <Link
                  href="/subscriptions"
                  className="account-subscription-btn account-subscription-btn--cta inline-flex items-center gap-2 px-5 py-2.5 text-base font-semibold rounded-xl border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                  <span>{t("account.service-available.btn-subscription-cta")}</span>
                </Link>
              )}
            </div>

            {/* Buscador de servidor */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none ">
                  <svg
                    className="w-4 h-4 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  id="table-search-server"
                  className="accounts-search-input block p-2 ps-10 text-lg text-gray-900 border border-gray-300 rounded-xl w-80 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:ring-blue-500/30 dark:focus:border-blue-500"
                  placeholder={t("account.search-server-placeholder")}
                  value={searchServer}
                  onChange={handleServerChange}
                />
              </div>
              {/* Buscador de usuario */}
              <div className="relative">
                <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none ">
                  <svg
                    className="w-4 h-4 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  id="table-search-users"
                  className="accounts-search-input block p-2 ps-10 text-lg text-gray-900 border border-gray-300 rounded-xl w-80 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:ring-blue-500/30 dark:focus:border-blue-500"
                  placeholder={t("account.search-placeholder")}
                  value={searchUsername}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          </div>

          <div className="accounts-table-card max-h-[400px] overflow-y-auto min-h-[400px] flex flex-col justify-between mt-6">
            <table className="accounts-table text-lg text-left rtl:text-right text-gray-500 dark:text-gray-400 w-full">
              <thead className="text-lg text-gray-700 uppercase dark:text-gray-400">
                <tr>
                  <th scope="col" className="p-4 font-medium">
                    <div className="flex items-center"></div>
                  </th>
                  <th scope="col" className="px-6 py-3">
                    {t("account.column-table.position-one")}
                  </th>
                  <th scope="col" className="px-6 py-3">
                    {t("account.column-table.position-two")}
                  </th>
                  <th scope="col" className="px-6 py-3">
                    {t("account.column-table.position-three")}
                  </th>
                  <th scope="col" className="px-6 py-3">
                    {t("account.column-table.position-four")}
                  </th>
                  <th scope="col" className="px-6 py-3">
                    {t("account.column-table.position-five")}
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Realmlist
                  </th>
                  <th scope="col" className="px-6 py-3">
                    {t("account.column-table.position-action")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((row) => (
                  <tr
                    key={row.id}
                    className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <td className="w-4 p-4">
                      <div className="flex items-center">
                        <input
                          id={`checkbox-table-search-${row.id}`}
                          type="checkbox"
                          checked={selectedIds.includes(row.id)}
                          onChange={(e) =>
                            handleCheckboxChange(row.id, e.target.checked)
                          }
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label
                          htmlFor={`checkbox-table-search-${row.id}`}
                          className="sr-only"
                        >
                          checkbox
                        </label>
                      </div>
                    </td>
                    <td className="px-6 py-4">{row.id}</td>
                    <td className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                      <img
                        className="w-10 h-10 rounded-full"
                        src={row.avatar}
                        alt="Icon Version Wow"
                      />
                      <div className="ps-3">
                        <div className="text-base font-semibold">
                          {row.expansion_id > 2 ? row.email : row.username}
                        </div>
                        <div className="font-normal text-gray-500">
                          {row.expansion_id > 2 ? row.username : row.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{row.expansion}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`account-status-badge ${
                          row.status
                            ? "account-status-badge--enabled"
                            : "account-status-badge--disabled"
                        }`}
                      >
                        <span
                          className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${
                            row.status ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        {row.status ? "Enable" : "Disable"}
                      </span>
                    </td>
                    <td className="px-6 py-4 items-center"> {row.realm}</td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => handleCopy(row.realmlist || "")}
                        className="account-copy-btn inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        {t("account.column-table.position-btn-copy")}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      {row.status ? (
                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/accounts/detail?id=${row.account_id}&server_id=${row.server_id}`
                            )
                          }
                          className="account-admin-btn inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {t("account.column-table.position-btn-admin")}
                        </button>
                      ) : (
                        <span className="account-admin-btn account-admin-btn--disabled inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm border cursor-not-allowed">
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {t("account.column-table.position-btn-admin")}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="accounts-pagination-wrapper flex justify-center mt-8 py-5">
              <div className="accounts-pagination-inner flex flex-col items-center gap-3">
                <nav className="accounts-pagination-nav" aria-label="Paginación">
                <ReactPaginate
                  previousLabel={
                    <>
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <span className="sr-only">{t("account.paginate.btn-primary")}</span>
                    </>
                  }
                  nextLabel={
                    <>
                      <span className="sr-only">{t("account.paginate.btn-secondary")}</span>
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  }
                  breakLabel={<span className="accounts-pagination-ellipsis">…</span>}
                  pageCount={Math.ceil(totalPages / accountsPerPage) || 1}
                  marginPagesDisplayed={1}
                  pageRangeDisplayed={2}
                  onPageChange={handlePageClick}
                  forcePage={currentPage}
                  containerClassName="pagination accounts-pagination"
                  pageClassName="page-item"
                  pageLinkClassName="page-link"
                  previousClassName="page-item page-item--prev"
                  previousLinkClassName="page-link"
                  nextClassName="page-item page-item--next"
                  nextLinkClassName="page-link"
                  breakClassName="page-item page-item--break"
                  breakLinkClassName="page-link"
                  activeClassName="active"
                  disabledClassName="disabled"
                />
              </nav>
                <span className="accounts-pagination-info text-base text-gray-500 dark:text-gray-400">
                  {t("account.paginate.info", {
                    current: currentPage + 1,
                    total: Math.ceil(totalPages / accountsPerPage) || 1,
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center px-4 py-16 mt-10">
          <div className="relative w-full max-w-2xl mx-auto">
            {/* Card Container */}
            <div className="accounts-empty-card backdrop-blur-sm rounded-2xl p-8 sm:p-12 text-center">
              {/* Icon Container */}
              <div className="accounts-empty-card-icon mx-auto mb-6 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-500/25 to-indigo-500/25 border border-blue-500/40 flex items-center justify-center">
                <img
                  src="https://static.wixstatic.com/media/5dd8a0_1316758a384a4e02818738497253ea7d~mv2.webp"
                  alt="wow-account-create"
                  className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                />
              </div>

              {/* Content */}
              {user.pending_validation ? (
                <>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                    {t("account.without-accounts.confirm-mail.title")}
                  </h2>
                  <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                    {t("account.without-accounts.confirm-mail.description")}
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                    {t("account.without-accounts.title-message")}
                  </h2>
                  <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                    {t("account.without-accounts.sub-title-message")}
                  </p>
                </>
              )}

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {user.pending_validation && (
                  <button
                    className="w-full sm:w-auto px-10 py-4 text-lg sm:text-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-blue-500/30"
                    onClick={handleConfirmEmail}
                  >
                    {t("account.without-accounts.confirm-mail.btn-txt")}
                  </button>
                )}
                {!user.pending_validation && canCreateMoreAccounts && (
                  <Link
                    className="w-full sm:w-auto px-10 py-4 text-lg sm:text-xl bg-transparent border-2 border-blue-500/60 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400 hover:text-blue-300 font-semibold rounded-lg transition-all duration-300 hover:scale-[1.02]"
                    href={{
                      pathname: "/register/username",
                      query: isUserShowWelcome
                        ? { showWelcome: "false" }
                        : { showWelcome: "true" },
                    }}
                  >
                    {t("account.without-accounts.btn-text")}
                  </Link>
                )}
                {!user.pending_validation &&
                  !canCreateMoreAccounts &&
                  !hasActiveSubscription && (
                    <div className="w-full sm:w-auto">
                      <div className="px-10 py-4 text-lg sm:text-xl bg-gradient-to-r from-gray-800/80 to-gray-900/80 border-2 border-gray-700/50 text-gray-400 font-semibold rounded-lg cursor-not-allowed text-center relative overflow-hidden">
                        {/* Efecto de fondo sutil */}
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-500/5"></div>

                        <div className="relative z-10">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <svg
                              className="w-5 h-5 text-yellow-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span>
                              {t("account.without-accounts.btn-text")}
                            </span>
                          </div>
                          <p className="text-sm text-yellow-500/90 font-normal">
                            Suscripción Premium requerida
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsGame;

"use client";
import { getAssociatedServers } from "@/api/account/realms";
import NavbarAuthenticated from "@/components/navbar-authenticated";
import LoadingSpinner from "@/components/utilities/loading-spinner";
import { useUserContext } from "@/context/UserContext";
import { InternalServerError } from "@/dto/generic";
import useAuth from "@/hook/useAuth";
import { ServerModel } from "@/model/model";
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

const Page = () => {
  const router = useRouter();
  const { user, clearUserData } = useUserContext();
  const token = Cookies.get("token");
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(true);
  const [redirect, setRedirect] = useState<boolean>(false);
  const [filteredAccounts, setFilteredAccounts] = useState<ServerModel[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [hasAccount, setHasAccount] = useState<boolean>(false);
  const [servers, setServers] = useState<ServerModel[]>([]);
  const [searchUsername, setUsername] = useState<string>("");
  const [searchServer, setSearchServer] = useState<string>("");
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);

  useAuth(t("errors.message.expiration-session"));

  useEffect(() => {
    if (!token) {
      setRedirect(true);
      return;
    }

    const fetchData = async () => {
      try {
        const getServersVinculated = await getAssociatedServers(token);
        setServers(getServersVinculated.realms);
        setTotalPages(getServersVinculated.size);
        setHasAccount(getServersVinculated.size > 0);
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
          } else if (error.statusCode === 403) {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: t("errors.role.message"),
              color: "white",
              background: "#0B1218",
              timer: 4000,
              willClose: () => {
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
  }, [currentPage, searchUsername, searchServer]);

  if (redirect) {
    router.push("/");
  }

  useEffect(() => {
    const filtered = servers.filter((account) => {
      const matchesUsername = account.name
        .toLowerCase()
        .includes(searchUsername.toLowerCase());
      const matchesServer = account.name
        .toLowerCase()
        .includes(searchServer.toLowerCase());
      return matchesUsername && matchesServer;
    });

    setFilteredAccounts(filtered);
  }, [searchUsername, searchServer, servers, user]);

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

  if (loading) {
    return (
      <div className="contenedor mx-auto h-screen-md">
        <NavbarAuthenticated />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">
                Cargando reinos...
              </h2>
              <p className="text-gray-300 mb-6">
                Preparando tu experiencia de administración
              </p>
            </div>
            <div className="flex justify-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
              <div
                className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-3 h-3 bg-pink-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const accountMaximus = servers && servers.length > LimitAccountRegister;

  return (
    <div className="contenedor dark h-screen-md select-none ">
      <NavbarAuthenticated />

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r "></div>
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
        <div className="relative text-center pt-32 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="inline-block mb-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {t("realms.title")}
            </h1>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-6">
              {t("realms.subtitle")}
            </p>
            <div className="flex justify-center space-x-4">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
              <div
                className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-3 h-3 bg-pink-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      {hasAccount ? (
        <div className="relative sm:rounded-lg pt-16">
          <div className="flex items-center justify-between flex-wrap gap-4 pb-4 bg-white/5 dark:bg-midnight/50 rounded-t-lg">
            {/* Botón de acción */}
            <div className="relative">
              <button
                id="dropdownActionButton"
                data-dropdown-toggle="dropdownAction"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
                type="button"
                onClick={toggleDropdown}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                {t("realms.btn.create-server")}
                <svg
                  className="w-3 h-3"
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
                className={`${
                  dropdownVisible ? "block" : "hidden"
                } absolute left-0 mt-2 z-50 bg-white/95 backdrop-blur-lg divide-y divide-gray-200 rounded-xl shadow-2xl w-56 dark:bg-gray-800/95 dark:divide-gray-600 border border-white/20`}
              >
                {!accountMaximus && (
                  <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                    <li>
                      <Link
                        href="/register/realm"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors duration-200 rounded-lg mx-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        {t("realms.btn.create-server")}
                      </Link>
                    </li>
                  </ul>
                )}
                <div className="py-2">
                  <a
                    href="#"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 dark:text-red-400 transition-colors duration-200 rounded-lg mx-2"
                  >
                    <svg
                      className="w-4 h-4"
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
                    {t("realms.btn.delete-server")}
                  </a>
                </div>
              </div>
            </div>

            {/* Buscador de servidor */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <svg
                  className="w-5 h-5 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                id="table-search-server"
                className="w-80 pl-12 pr-4 py-3 text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 shadow-lg hover:shadow-xl transition-all duration-300 focus:scale-105"
                placeholder={t("account.search-server-placeholder")}
                value={searchServer}
                onChange={handleServerChange}
              />
            </div>
          </div>

          <div className="max-h-[500px] overflow-y-auto min-h-[300px] flex flex-col justify-between">
            <table className="text-lg text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead className="text-base text-gray-700 uppercase bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 dark:text-gray-300 sticky top-0 z-10">
                <tr>
                  <th scope="col" className="p-3">
                    <div className="flex items-center">
                      <input
                        id="checkbox-all"
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label htmlFor="checkbox-all" className="sr-only">
                        checkbox
                      </label>
                    </div>
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    {t("realms.table.column-id")}
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    {t("realms.table.column-name")}
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    {t("realms.table.column-expansion")}
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    {t("realms.table.column-status")}
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    {t("realms.table.column-date")}
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    {t("realms.table.column-apikey")}
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    {t("realms.table.column-web")}
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    {t("realms.table.position-action")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((row, index) => (
                  <tr
                    key={row.id}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors duration-200"
                  >
                    <td className="p-3">
                      <div className="flex items-center">
                        <input
                          id={`checkbox-table-search-${row.id}`}
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label
                          htmlFor={`checkbox-table-search-${row.id}`}
                          className="sr-only"
                        >
                          checkbox
                        </label>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      #{row.id}
                    </td>
                    <td className="flex items-center px-4 py-3 text-gray-900 whitespace-nowrap dark:text-white">
                      <img
                        className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                        src={row.avatar}
                        alt="Avatar Server"
                      />
                      <div className="ps-3">
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {row.name}
                        </div>
                        <div className="text-base text-gray-500 dark:text-gray-400">
                          {row.emulator}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-base font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        {row.exp_name}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div
                          className={`h-2.5 w-2.5 rounded-full ${
                            row.status ? "bg-green-500" : "bg-red-500"
                          } me-2`}
                        ></div>
                        <span
                          className={`text-base font-medium ${
                            row.status
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {row.status ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-base text-gray-500 dark:text-gray-400">
                      {new Date(row.creation_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        className="inline-flex items-center px-3 py-1.5 text-base font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 transition-colors duration-200"
                        onClick={() => handleCopy(row.api_key || "")}
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        Copiar
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={
                          row.web_site.startsWith("https")
                            ? row.web_site
                            : `https://${row.web_site}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 text-base font-medium text-green-600 bg-green-100 rounded-md hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800 transition-colors duration-200"
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                        Visitar
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        className="inline-flex items-center px-3 py-1.5 text-base font-medium text-purple-600 bg-purple-100 rounded-md hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:hover:bg-purple-800 transition-colors duration-200"
                        onClick={() =>
                          router.push(`/realms/dashboard?id=${row.id}`)
                        }
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        Admin
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between items-center mt-6 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Mostrando {filteredAccounts.length} de {totalPages} reinos
              </div>
              <ReactPaginate
                previousLabel={
                  <div className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Anterior
                  </div>
                }
                nextLabel={
                  <div className="flex items-center gap-1">
                    Siguiente
                    <svg
                      className="w-4 h-4"
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
                  </div>
                }
                breakLabel={""}
                pageCount={Math.ceil(totalPages / accountsPerPage)}
                marginPagesDisplayed={1}
                pageRangeDisplayed={2}
                onPageChange={handlePageClick}
                containerClassName={"pagination flex items-center space-x-2"}
                pageClassName={"page-item"}
                pageLinkClassName={
                  "flex items-center justify-center w-8 h-8 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                }
                previousClassName={"page-item"}
                previousLinkClassName={
                  "flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                }
                nextClassName={"page-item"}
                nextLinkClassName={
                  "flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                }
                breakClassName={"page-item"}
                breakLinkClassName={
                  "flex items-center justify-center w-8 h-8 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                }
                activeClassName={"active"}
                activeLinkClassName={
                  "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700"
                }
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-4 pb-16">
          <div className="text-center">
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-8 border border-white/10">
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  {t("realms.realm-empty.title")}
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed">
                  {t("realms.realm-empty.description")}
                </p>
              </div>

              {servers && servers.length <= 10 && (
                <Link
                  href="/register/realm"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  {t("realms.realm-empty.btn-txt")}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;

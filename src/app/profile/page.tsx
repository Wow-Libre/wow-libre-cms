"use client";
import { getUser, getStats } from "@/api/account";
import { changePasswordUser } from "@/api/account/change-password";
import NavbarAuthenticated from "@/components/navbar-authenticated";
import LoadingSpinner from "@/components/utilities/loading-spinner";
import { useUserContext } from "@/context/UserContext";
import { InternalServerError } from "@/dto/generic";
import { UserDetailDto, AccountGameStatsDto } from "@/model/model";
import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";

const Profile = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const token = Cookies.get("token");
  const [isLoading, setIsLoading] = useState(true);
  const [userDetail, setUserDetail] = useState<UserDetailDto>();
  const [stats, setStats] = useState<AccountGameStatsDto>({
    total_accounts: 0,
    total_realms: 0,
  });
  const [redirect, setRedirect] = useState(false);
  const { t } = useTranslation();
  const { clearUserData } = useUserContext();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (token) {
          const [userModel, statsData] = await Promise.all([
            getUser(token),
            getStats(token),
          ]);
          setUserDetail(userModel);
          setStats(statsData);
        } else {
          setRedirect(true);
        }
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Could not load user data",
          color: "white",
          background: "#0B1218",
          timer: 4500,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Passwords do not match!",
      });
      return;
    }

    if (!token) {
      Swal.fire({
        icon: "error",
        title: "Authentication Error",
        text: "No token found, please log in again.",
      });
      return;
    }

    try {
      await changePasswordUser(oldPassword, newPassword, token);

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      Swal.fire({
        icon: "success",
        title: "Password Updated",
        text: "Your password has been updated successfully!",
      });
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
        } else {
          Swal.fire({
            icon: "error",
            title: "Opss!",
            html: `
                      <p><strong>Message:</strong> ${error.message}</p>
                      <hr style="border-color: #444; margin: 8px 0;">
                      <p><strong>Transaction ID:</strong> ${error.transactionId}</p>
                    `,
            color: "white",
            background: "#0B1218",
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
        });
      }
    }
  };

  const isFormValid =
    oldPassword && newPassword && confirmPassword && oldPassword;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="contenedor bg-midnight min-h-screen">
      <div className="mb-10">
        <NavbarAuthenticated />
      </div>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Header Section - Más compacto */}
        <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl text-white rounded-3xl shadow-2xl overflow-hidden border-2 border-gaming-primary-main/30 mb-12">
          <div
            className="relative w-full h-64 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://static.wixstatic.com/media/5dd8a0_803d48a73d7a40329f6f7b780a50cd25~mv2.jpg')",
            }}
          >
            {/* Overlay con gradiente gaming */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60"></div>
            
            {/* Efectos de partículas */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-8 left-1/4 w-2 h-2 bg-gaming-primary-main/60 rounded-full animate-pulse"></div>
              <div className="absolute top-16 right-1/3 w-1 h-1 bg-gaming-secondary-main/40 rounded-full animate-pulse delay-1000"></div>
              <div className="absolute bottom-16 left-1/3 w-1.5 h-1.5 bg-gaming-primary-main/50 rounded-full animate-pulse delay-500"></div>
              <div className="absolute bottom-8 right-1/4 w-1 h-1 bg-gaming-secondary-main/60 rounded-full animate-pulse delay-1500"></div>
            </div>

            {/* Profile Picture */}
            <div className="absolute bottom-[-40px] left-1/2 transform -translate-x-1/2">
              <div className="relative">
                <img
                  src="https://static.wixstatic.com/media/5dd8a0_1316758a384a4e02818738497253ea7d~mv2.webp"
                  alt="Profile"
                  className="w-28 h-28 rounded-full border-4 border-gaming-primary-main/50 shadow-2xl hover:scale-105 transition-all duration-300 hover:border-gaming-primary-main hover:shadow-gaming-primary-main/40"
                />
                {/* Indicador de estado online */}
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-green-500 to-green-600 rounded-full border-3 border-gray-900 shadow-lg flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* User Info - Integrado en el header */}
          <div className="pt-20 pb-12 px-12 text-center">
            <h1 className="text-3xl font-bold mb-6 text-gaming-primary-light font-cinzel">
              {userDetail?.first_name} {userDetail?.last_name}
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="flex items-center justify-center space-x-3">
                <svg className="w-5 h-5 text-gaming-secondary-main" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                <p className="text-gray-300 text-base">{userDetail?.email}</p>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <svg className="w-5 h-5 text-gaming-secondary-main" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-300 text-base">
                  {userDetail?.date_of_birth
                    ? new Date(userDetail.date_of_birth).toLocaleDateString()
                    : "No disponible"}
                </p>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <svg className="w-5 h-5 text-gaming-secondary-main" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-gray-300 text-base">{userDetail?.country}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Stats Section - Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-gaming-primary-main/30">
              <h3 className="text-xl font-bold text-gaming-primary-light font-cinzel mb-8 text-center">
                Estadísticas
              </h3>
              <div className="space-y-6">
                <div className="text-center bg-gradient-to-br from-gray-800/60 to-gray-700/60 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-600/30 hover:border-gaming-primary-main/50 transition-all duration-300 hover:scale-105 group">
                  <div className="w-10 h-10 mx-auto mb-3 bg-gradient-to-br from-gaming-primary-main to-gaming-secondary-main rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-gaming-primary-main/40 transition-all duration-300">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-gaming-primary-light">{Number(stats?.total_accounts ?? 0)}</p>
                  <p className="text-gray-300 text-sm font-medium">
                    {t("profile.label-accounts")}
                  </p>
                </div>
                <div className="text-center bg-gradient-to-br from-gray-800/60 to-gray-700/60 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-600/30 hover:border-gaming-primary-main/50 transition-all duration-300 hover:scale-105 group">
                  <div className="w-10 h-10 mx-auto mb-3 bg-gradient-to-br from-gaming-primary-main to-gaming-secondary-main rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-gaming-primary-main/40 transition-all duration-300">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-gaming-primary-light">0</p>
                  <p className="text-gray-300 text-sm font-medium">
                    {t("profile.label-character")}
                  </p>
                </div>
                <div className="text-center bg-gradient-to-br from-gray-800/60 to-gray-700/60 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-600/30 hover:border-gaming-primary-main/50 transition-all duration-300 hover:scale-105 group">
                  <div className="w-10 h-10 mx-auto mb-3 bg-gradient-to-br from-gaming-primary-main to-gaming-secondary-main rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-gaming-primary-main/40 transition-all duration-300">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4a.5.5 0 11-1 0 .5.5 0 011 0zm0 0a.5.5 0 11-1 0 .5.5 0 011 0z" />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-gaming-primary-light">{Number(stats?.total_realms ?? 0)}</p>
                  <p className="text-gray-300 text-sm font-medium">
                    {t("profile.label-servers")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password Form - Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-2xl p-10 shadow-xl border border-gaming-primary-main/30">
              <div className="text-center mb-10">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-gaming-primary-main to-gaming-secondary-main rounded-2xl flex items-center justify-center shadow-lg shadow-gaming-primary-main/40">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gaming-primary-light font-cinzel">
                  {t("profile.title")}
                </h2>
                <p className="text-gray-400 mt-3">Actualiza tu contraseña de forma segura</p>
              </div>
              
              <form className="space-y-8" onSubmit={handleUpdatePassword}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label
                      htmlFor="old-password"
                      className="block text-sm font-semibold text-gaming-primary-light mb-3"
                    >
                      {t("profile.input-change-password")}
                    </label>
                    <input
                      type="password"
                      id="old-password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-gaming-base-main/80 backdrop-blur-sm border border-gaming-primary-main/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gaming-primary-main/50 focus:border-gaming-primary-main transition-all duration-300"
                      placeholder="Contraseña actual"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="new-password"
                      className="block text-sm font-semibold text-gaming-primary-light mb-3"
                    >
                      {t("profile.input-new-change-password")}
                    </label>
                    <input
                      type="password"
                      id="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-gaming-base-main/80 backdrop-blur-sm border border-gaming-primary-main/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gaming-primary-main/50 focus:border-gaming-primary-main transition-all duration-300"
                      placeholder="Nueva contraseña"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block text-sm font-semibold text-gaming-primary-light mb-2"
                  >
                    {t("profile.input-new-confirm-change-password")}
                  </label>
                  <input
                    type="password"
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gaming-base-main/80 backdrop-blur-sm border border-gaming-primary-main/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gaming-primary-main/50 focus:border-gaming-primary-main transition-all duration-300"
                    placeholder="Confirmar nueva contraseña"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!isFormValid}
                  className={`w-full py-4 rounded-lg font-semibold text-lg transition-all duration-300 relative overflow-hidden group ${
                    isFormValid
                      ? "bg-gradient-to-r from-gaming-primary-main to-gaming-secondary-main hover:from-gaming-primary-main/90 hover:to-gaming-secondary-main/90 hover:shadow-2xl hover:shadow-gaming-primary-main/40 hover:scale-[1.02] hover:-translate-y-1"
                      : "bg-gray-600 cursor-not-allowed opacity-50"
                  }`}
                >
                  {isFormValid && (
                    <>
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
                    </>
                  )}
                  <span className="relative z-10">{t("profile.btn-update-password")}</span>
                  
                  {isFormValid && (
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-gaming-primary-main to-gaming-secondary-main group-hover:w-full transition-all duration-700 ease-out"></div>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

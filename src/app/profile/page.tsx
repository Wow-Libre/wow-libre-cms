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
        {/* Header Section */}
        <div className="bg-slate-800/95 text-white rounded-2xl shadow-xl overflow-hidden border border-slate-600 mb-10">
          <div
            className="relative w-full h-52 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://static.wixstatic.com/media/5dd8a0_803d48a73d7a40329f6f7b780a50cd25~mv2.jpg')",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/70" />
            <div className="absolute bottom-[-36px] left-1/2 transform -translate-x-1/2">
              <img
                src="https://static.wixstatic.com/media/5dd8a0_1316758a384a4e02818738497253ea7d~mv2.webp"
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-slate-800 shadow-xl object-cover"
              />
            </div>
          </div>
          <div className="pt-14 pb-8 px-6 sm:px-10 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              {userDetail?.first_name} {userDetail?.last_name}
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto text-slate-300 text-sm sm:text-base">
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                <span className="truncate">{userDetail?.email}</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>
                  {userDetail?.date_of_birth
                    ? new Date(userDetail.date_of_birth).toLocaleDateString()
                    : "—"}
                </span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{userDetail?.country || "—"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-slate-800/95 rounded-2xl p-6 shadow-xl border border-slate-600">
              <h3 className="text-lg font-semibold text-white mb-6 text-center">
                Estadísticas
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-700/50 border border-slate-600">
                  <div className="w-10 h-10 rounded-lg bg-slate-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">{Number(stats?.total_accounts ?? 0)}</p>
                    <p className="text-slate-400 text-sm">{t("profile.label-accounts")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-700/50 border border-slate-600">
                  <div className="w-10 h-10 rounded-lg bg-slate-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">0</p>
                    <p className="text-slate-400 text-sm">{t("profile.label-character")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-700/50 border border-slate-600">
                  <div className="w-10 h-10 rounded-lg bg-slate-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4a.5.5 0 11-1 0 .5.5 0 011 0zm0 0a.5.5 0 11-1 0 .5.5 0 011 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">{Number(stats?.total_realms ?? 0)}</p>
                    <p className="text-slate-400 text-sm">{t("profile.label-servers")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main: Password + Subscription */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cambiar contraseña */}
            <div className="bg-slate-800/95 rounded-2xl p-8 shadow-xl border border-slate-600">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-slate-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{t("profile.title")}</h2>
                  <p className="text-slate-400 text-sm mt-0.5">Actualiza tu contraseña de forma segura</p>
                </div>
              </div>

              <form className="space-y-6" onSubmit={handleUpdatePassword}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="old-password" className="block text-sm font-medium text-slate-300 mb-2">
                      {t("profile.input-change-password")}
                    </label>
                    <input
                      type="password"
                      id="old-password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700/80 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all"
                      placeholder="Contraseña actual"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-password" className="block text-sm font-medium text-slate-300 mb-2">
                      {t("profile.input-new-change-password")}
                    </label>
                    <input
                      type="password"
                      id="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700/80 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all"
                      placeholder="Nueva contraseña"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-300 mb-2">
                    {t("profile.input-new-confirm-change-password")}
                  </label>
                  <input
                    type="password"
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700/80 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all"
                    placeholder="Confirmar nueva contraseña"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!isFormValid}
                  className={`w-full py-3.5 rounded-xl font-semibold text-white transition-all ${
                    isFormValid
                      ? "bg-slate-600 hover:bg-slate-500 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                      : "bg-slate-700 cursor-not-allowed opacity-50"
                  }`}
                >
                  {t("profile.btn-update-password")}
                </button>
              </form>
            </div>

            {/* Administrar suscripción (placeholder) */}
            <div className="bg-slate-800/95 rounded-2xl p-8 shadow-xl border border-slate-600">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{t("profile.manage-subscription")}</h2>
                  <p className="text-slate-400 text-sm mt-0.5">{t("profile.manage-subscription-desc")}</p>
                </div>
              </div>
              <button
                type="button"
                disabled
                className="w-full py-3.5 rounded-xl font-semibold text-slate-400 bg-slate-700/80 border border-slate-600 cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span>{t("profile.manage-subscription")}</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-600 text-slate-400">
                  {t("profile.manage-subscription-coming")}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

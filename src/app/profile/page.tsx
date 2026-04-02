"use client";
import { getUser, getStats } from "@/api/account";
import { changePasswordUser } from "@/api/account/change-password";
import {
  getCurrentSubscription,
  type CurrentSubscriptionResponse,
} from "@/api/subscriptions";
import NavbarAuthenticated from "@/components/navbar-authenticated";
import LoadingSpinner from "@/components/utilities/loading-spinner";
import { useUserContext } from "@/context/UserContext";
import { InternalServerError } from "@/dto/generic";
import { UserDetailDto, AccountGameStatsDto } from "@/model/model";
import Cookies from "js-cookie";
import Link from "next/link";
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
  const [subscriptionInfo, setSubscriptionInfo] =
    useState<CurrentSubscriptionResponse | null>(null);
  const [redirect, setRedirect] = useState(false);
  const { t } = useTranslation();
  const { clearUserData } = useUserContext();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (token) {
          const [userModel, statsData, subEnvelope] = await Promise.all([
            getUser(token),
            getStats(token),
            getCurrentSubscription(token),
          ]);
          setUserDetail(userModel);
          setStats(statsData);
          setSubscriptionInfo(subEnvelope);
        } else {
          setRedirect(true);
        }
      } catch (error: unknown) {
        if (error instanceof InternalServerError && error.statusCode === 401) {
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
        } else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text:
              error instanceof Error
                ? error.message
                : "Could not load user data",
            color: "white",
            background: "#0B1218",
            timer: 4500,
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token, t, clearUserData]);

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

  const formatSubscriptionDate = (iso: string | null | undefined) => {
    if (!iso) return "—";
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return iso;
      return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return iso;
    }
  };

  const formatSubscriptionPrice = (
    price: number | null | undefined,
    currency: string | null | undefined,
  ) => {
    if (price == null) return "—";
    try {
      if (currency) {
        return new Intl.NumberFormat(undefined, {
          style: "currency",
          currency: currency.length === 3 ? currency : "USD",
        }).format(price);
      }
      return String(price);
    } catch {
      return `${price} ${currency ?? ""}`.trim();
    }
  };

  const formatFrequencyLabel = (
    type: string | null | undefined,
    value: number | null | undefined,
  ) => {
    if (!type || value == null) return "—";
    const u = type.toUpperCase();
    if (u === "YEARLY") {
      return value === 1
        ? t("profile.subscription-freq-year-one")
        : t("profile.subscription-freq-years", { n: value });
    }
    if (u === "MONTHLY") {
      return value === 1
        ? t("profile.subscription-freq-month-one")
        : t("profile.subscription-freq-months", { n: value });
    }
    return `${type} (${value})`;
  };

  const daysUntilRenewal = (iso: string | null | undefined): number | null => {
    if (!iso) return null;
    try {
      const d = new Date(iso.includes("T") ? iso : `${iso}T12:00:00`);
      if (Number.isNaN(d.getTime())) return null;
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      d.setHours(0, 0, 0, 0);
      return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    } catch {
      return null;
    }
  };

  const subscriptionBenefitKeys = [
    "profile.subscription-benefit-1",
    "profile.subscription-benefit-2",
    "profile.subscription-benefit-3",
    "profile.subscription-benefit-4",
  ] as const;

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

            {/* Suscripción — Premium */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-600/60 bg-slate-900/80 shadow-2xl shadow-black/40">
              <div
                className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-violet-600/10 blur-3xl"
                aria-hidden
              />

              {subscriptionInfo?.active && subscriptionInfo.subscription ? (
                <div className="relative p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-900 shadow-lg shadow-amber-500/25">
                        <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400/90">
                          {t("profile.subscription-active-kicker")}
                        </p>
                        <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                          {subscriptionInfo.subscription.plan_name ?? t("profile.subscription-premium-fallback")}
                        </h2>
                        <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
                          {t("profile.subscription-active-desc")}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-300">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                      </span>
                      {t("profile.subscription-active-badge")}
                    </span>
                  </div>

                  {(() => {
                    const days = daysUntilRenewal(
                      subscriptionInfo.subscription.renews_or_expires_at,
                    );
                    const showUrgent =
                      days !== null && days >= 0 && days <= 14;
                    return (
                      <div
                        className={`mb-6 rounded-xl border px-4 py-3 sm:px-5 sm:py-4 ${
                          showUrgent
                            ? "border-amber-500/50 bg-amber-500/10"
                            : "border-slate-600/80 bg-slate-800/60"
                        }`}
                      >
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                          {t("profile.subscription-renews")}
                        </p>
                        <p className="mt-1 text-lg font-semibold text-white">
                          {formatSubscriptionDate(
                            subscriptionInfo.subscription.renews_or_expires_at,
                          )}
                        </p>
                        {days !== null && days >= 0 && (
                          <p
                            className={`mt-1 text-sm ${
                              showUrgent ? "text-amber-200" : "text-slate-400"
                            }`}
                          >
                            {days === 0
                              ? t("profile.subscription-renewal-today")
                              : days === 1
                                ? t("profile.subscription-days-one")
                                : t("profile.subscription-days-many", {
                                    count: days,
                                  })}
                          </p>
                        )}
                      </div>
                    );
                  })()}

                  <dl className="grid gap-3 sm:grid-cols-2">
                    {[
                      {
                        label: t("profile.subscription-price"),
                        value: formatSubscriptionPrice(
                          subscriptionInfo.subscription.plan_price,
                          subscriptionInfo.subscription.currency,
                        ),
                      },
                      {
                        label: t("profile.subscription-frequency"),
                        value: formatFrequencyLabel(
                          subscriptionInfo.subscription.frequency_type,
                          subscriptionInfo.subscription.frequency_value,
                        ),
                      },
                      {
                        label: t("profile.subscription-started"),
                        value: formatSubscriptionDate(
                          subscriptionInfo.subscription.activated_at,
                        ),
                      },
                      {
                        label: t("profile.subscription-reference"),
                        value: (
                          <span className="font-mono text-xs sm:text-sm break-all">
                            {subscriptionInfo.subscription.reference_number ?? "—"}
                          </span>
                        ),
                      },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className="flex flex-col rounded-xl border border-slate-700/80 bg-slate-800/40 px-4 py-3"
                      >
                        <dt className="text-xs font-medium text-slate-500">{row.label}</dt>
                        <dd className="mt-1 text-sm font-semibold text-slate-100">{row.value}</dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <Link
                      href="/subscriptions"
                      className="inline-flex flex-1 min-w-[200px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3.5 text-center text-sm font-bold text-slate-900 shadow-lg shadow-amber-500/20 transition hover:from-amber-400 hover:to-amber-500 hover:shadow-amber-500/30"
                    >
                      {t("profile.subscription-explore-benefits")}
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                    <Link
                      href="/accounts"
                      className="inline-flex flex-1 min-w-[200px] items-center justify-center gap-2 rounded-xl border border-slate-600 bg-slate-800/80 px-6 py-3.5 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
                    >
                      {t("profile.subscription-link-accounts")}
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="relative px-6 py-10 sm:px-10 sm:py-12">
                  <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:max-w-none lg:text-left">
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400/90">
                      {t("profile.subscription-upsell-kicker")}
                    </p>
                    <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.25rem] lg:leading-tight">
                      {t("profile.subscription-upsell-title")}
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-300 lg:mx-0">
                      {t("profile.subscription-upsell-subtitle")}
                    </p>
                  </div>

                  <ul className="mx-auto mt-10 max-w-lg space-y-4 lg:mx-0 lg:max-w-xl">
                    {subscriptionBenefitKeys.map((key) => (
                      <li key={key} className="flex gap-4 text-left">
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        <span className="text-sm leading-relaxed text-slate-200 sm:text-base">{t(key)}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mx-auto mt-10 flex max-w-lg flex-col gap-3 sm:flex-row sm:items-center lg:mx-0 lg:max-w-none">
                    <Link
                      href="/subscriptions"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 px-8 py-4 text-base font-bold text-slate-900 shadow-xl shadow-amber-500/25 transition hover:from-amber-400 hover:via-amber-400 hover:to-amber-500 hover:shadow-amber-500/35"
                    >
                      {t("profile.subscription-cta-primary")}
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </Link>
                    <Link
                      href="/subscriptions"
                      className="inline-flex flex-1 items-center justify-center rounded-xl border-2 border-slate-500/80 bg-transparent px-8 py-4 text-base font-semibold text-slate-200 transition hover:border-amber-500/60 hover:text-white"
                    >
                      {t("profile.subscription-cta-secondary")}
                    </Link>
                  </div>

                  <p className="mx-auto mt-8 max-w-lg text-center text-xs leading-relaxed text-slate-500 lg:mx-0 lg:text-left">
                    {t("profile.subscription-trust-line")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

"use client";
import { getUser, getStats, updateUserAvatar } from "@/api/account";
import { changePasswordUser } from "@/api/account/change-password";
import {
  requestMediaPresign,
  uploadFileToPresignedUrl,
} from "@/features/social-feed/api/socialFeedApi";
import { SOCIAL_MEDIA_MAX_BYTES } from "@/features/social-feed/constants";
import {
  getCurrentSubscription,
  type CurrentSubscriptionResponse,
} from "@/api/subscriptions";
import NavbarAuthenticated from "@/components/navbar-authenticated";
import LoadingSpinner from "@/components/utilities/loading-spinner";
import { useUserContext } from "@/context/UserContext";
import { InternalServerError } from "@/dto/generic";
import useAuth from "@/hook/useAuth";
import { UserDetailDto, AccountGameStatsDto } from "@/model/model";
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";

const PROFILE_CARD =
  "premium-manage-card rounded-2xl border border-white/10 bg-slate-950/90";

const Profile = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [userDetail, setUserDetail] = useState<UserDetailDto>();
  const [stats, setStats] = useState<AccountGameStatsDto>({
    total_accounts: 0,
    total_realms: 0,
  });
  const [subscriptionInfo, setSubscriptionInfo] =
    useState<CurrentSubscriptionResponse | null>(null);
  const [updatingAvatar, setUpdatingAvatar] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();
  const { clearUserData, setUser } = useUserContext();

  useAuth(t("errors.message.expiration-session"));

  useEffect(() => {
    setToken(Cookies.get("token"));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!token) {
      router.replace("/login");
      return;
    }

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
              router.replace("/login");
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

    void fetchData();
  }, [mounted, token, t, clearUserData, router]);

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
              router.replace("/login");
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

  const handleAvatarFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    if (file.size > SOCIAL_MEDIA_MAX_BYTES) {
      Swal.fire({
        icon: "warning",
        title: "Archivo demasiado grande",
        text: "El avatar no puede superar 10 MB.",
        color: "white",
        background: "#0B1218",
      });
      e.target.value = "";
      return;
    }

    setUpdatingAvatar(true);
    try {
      const presign = await requestMediaPresign(token, {
        filename: file.name,
        content_type: file.type || "application/octet-stream",
        byte_size: file.size,
      });

      await uploadFileToPresignedUrl(
        presign.upload_url,
        file,
        file.type || "application/octet-stream"
      );
      await updateUserAvatar(token, presign.public_url);

      setUserDetail((prev) =>
        prev ? { ...prev, avatar: presign.public_url } : prev
      );
      setUser((prev) => ({ ...prev, avatar: presign.public_url }));

      Swal.fire({
        icon: "success",
        title: "Avatar actualizado",
        text: "Tu foto de perfil se actualizo correctamente.",
        color: "white",
        background: "#0B1218",
        timer: 2500,
      });
    } catch (error: unknown) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text:
          error instanceof Error
            ? error.message
            : "No fue posible actualizar el avatar.",
        color: "white",
        background: "#0B1218",
      });
    } finally {
      setUpdatingAvatar(false);
      e.target.value = "";
    }
  };

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
    "profile.subscription-benefit-short-1",
    "profile.subscription-benefit-short-2",
    "profile.subscription-benefit-short-3",
    "profile.subscription-benefit-short-4",
  ] as const;

  if (!mounted || isLoading) {
    return (
      <div className="relative min-h-screen overflow-visible bg-midnight pb-16">
        <div className="pointer-events-none absolute inset-0 fire-embers-blue opacity-50" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(56,189,248,0.10),transparent_38%),radial-gradient(circle_at_82%_84%,rgba(14,165,233,0.08),transparent_40%)]" />
        <div className="contenedor relative z-30 mb-6">
          <NavbarAuthenticated />
        </div>
        <div className="relative z-10 flex min-h-[50vh] items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-visible bg-midnight pb-20">
      <div className="pointer-events-none absolute inset-0 fire-embers-blue opacity-50" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_8%,rgba(251,191,36,0.12),transparent_32%),radial-gradient(circle_at_88%_92%,rgba(56,189,248,0.12),transparent_38%)]" />
      <div className="contenedor relative z-30 mb-6">
        <NavbarAuthenticated />
      </div>
      <div className="relative z-10">
      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8 md:py-12 lg:px-12">
        <div className={`${PROFILE_CARD} mb-10 overflow-hidden text-white`}>
          <div
            className="relative h-60 w-full bg-cover bg-center sm:h-72"
            style={{
              backgroundImage:
                "url('https://static.wixstatic.com/media/5dd8a0_803d48a73d7a40329f6f7b780a50cd25~mv2.jpg')",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-slate-950" />
            <div className="absolute bottom-[-52px] left-1/2 -translate-x-1/2">
              <label
                htmlFor="profile-avatar-upload"
                className="group relative block cursor-pointer"
                title={t("profile.change-photo")}
              >
              <img
                src={
                  userDetail?.avatar ||
                  "https://static.wixstatic.com/media/5dd8a0_1316758a384a4e02818738497253ea7d~mv2.webp"
                }
                alt="Profile"
                className="h-36 w-36 rounded-full border-4 border-amber-300/50 object-cover shadow-[0_16px_40px_-8px_rgba(0,0,0,0.8),0_0_28px_rgba(251,191,36,0.35)]"
              />
              <span className="pointer-events-none absolute inset-0 flex items-end justify-center rounded-full bg-black/0 pb-4 text-base font-semibold text-white opacity-0 transition group-hover:bg-black/50 group-hover:opacity-100">
                {updatingAvatar
                  ? t("profile.uploading-photo")
                  : t("profile.change-photo")}
              </span>
              </label>
              <input
                id="profile-avatar-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarFileChange}
                disabled={updatingAvatar}
              />
            </div>
          </div>
          <div className="px-6 pb-10 pt-16 text-center sm:px-10">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              {userDetail?.first_name} {userDetail?.last_name}
            </h1>
            <div className="mx-auto mt-6 grid max-w-4xl grid-cols-1 gap-3 text-lg text-slate-200 md:grid-cols-3">
              <div className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/25 px-4 py-3">
                <svg className="h-6 w-6 shrink-0 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                <span className="truncate">{userDetail?.email}</span>
              </div>
              <div className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/25 px-4 py-3">
                <svg className="h-6 w-6 shrink-0 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>
                  {userDetail?.date_of_birth
                    ? new Date(userDetail.date_of_birth).toLocaleDateString()
                    : "—"}
                </span>
              </div>
              <div className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/25 px-4 py-3">
                <svg className="h-6 w-6 shrink-0 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{userDetail?.country || "—"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-1">
            <div className={`${PROFILE_CARD} p-6 sm:p-7`}>
              <h3 className="mb-6 text-center text-2xl font-bold text-white">
                {t("profile.stats-title")}
              </h3>
              <div className="space-y-3">
                {[
                  {
                    value: Number(stats?.total_accounts ?? 0),
                    label: t("profile.label-accounts"),
                    icon: (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    ),
                  },
                  {
                    value: 0,
                    label: t("profile.label-character"),
                    icon: (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    ),
                  },
                  {
                    value: Number(stats?.total_realms ?? 0),
                    label: t("profile.label-servers"),
                    icon: (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4a.5.5 0 11-1 0 .5.5 0 011 0zm0 0a.5.5 0 11-1 0 .5.5 0 011 0z" />
                    ),
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/30 px-4 py-4"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-300">
                      <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {stat.icon}
                      </svg>
                    </div>
                    <div>
                      <p className="text-4xl font-bold tabular-nums tracking-tight text-white">
                        {stat.value}
                      </p>
                      <p className="text-base font-medium text-slate-400">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <div className={`${PROFILE_CARD} p-7 sm:p-8`}>
              <div className="mb-8 flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-300">
                  <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white sm:text-3xl">{t("profile.title")}</h2>
                  <p className="mt-1 text-base text-slate-400">{t("profile.password-subtitle")}</p>
                </div>
              </div>

              <form className="space-y-6" onSubmit={handleUpdatePassword}>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="old-password" className="mb-2 block text-base font-semibold text-slate-200">
                      {t("profile.input-change-password")}
                    </label>
                    <input
                      type="password"
                      id="old-password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-4 text-lg text-white placeholder-slate-500 transition focus:border-amber-300/50 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                      placeholder={t("profile.input-change-password")}
                    />
                  </div>
                  <div>
                    <label htmlFor="new-password" className="mb-2 block text-base font-semibold text-slate-200">
                      {t("profile.input-new-change-password")}
                    </label>
                    <input
                      type="password"
                      id="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-4 text-lg text-white placeholder-slate-500 transition focus:border-amber-300/50 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                      placeholder={t("profile.input-new-change-password")}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="confirm-password" className="mb-2 block text-base font-semibold text-slate-200">
                    {t("profile.input-new-confirm-change-password")}
                  </label>
                  <input
                    type="password"
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-4 text-lg text-white placeholder-slate-500 transition focus:border-amber-300/50 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                    placeholder={t("profile.input-new-confirm-change-password")}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!isFormValid}
                  className={`w-full rounded-xl py-4 text-lg font-bold text-white transition ${
                    isFormValid
                      ? "bg-gradient-to-r from-cyan-500 to-sky-500 hover:-translate-y-0.5 hover:from-cyan-400 hover:to-sky-400"
                      : "cursor-not-allowed bg-slate-700 opacity-50"
                  }`}
                >
                  {t("profile.btn-update-password")}
                </button>
              </form>
            </div>

            <div className={`${PROFILE_CARD} relative overflow-hidden`}>
              <div
                className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-violet-600/10 blur-3xl"
                aria-hidden
              />

              {subscriptionInfo?.active && subscriptionInfo.subscription ? (
                <div className="relative p-7 sm:p-9">
                  <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-900 shadow-lg shadow-amber-500/30">
                        <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300/90">
                          {t("profile.subscription-active-kicker")}
                        </p>
                        <h2 className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                          {subscriptionInfo.subscription.plan_name ?? t("profile.subscription-premium-fallback")}
                        </h2>
                      </div>
                    </div>
                    <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-emerald-300">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
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
                        className={`mb-6 rounded-2xl border px-5 py-5 ${
                          showUrgent
                            ? "border-amber-500/50 bg-amber-500/10"
                            : "border-white/10 bg-black/30"
                        }`}
                      >
                        <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                          {t("profile.subscription-renews")}
                        </p>
                        <p className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                          {formatSubscriptionDate(
                            subscriptionInfo.subscription.renews_or_expires_at,
                          )}
                        </p>
                        {days !== null && days >= 0 && (
                          <p
                            className={`mt-2 text-base ${
                              showUrgent ? "text-amber-200" : "text-slate-400"
                            }`}
                          >
                            {days === 0
                              ? t("profile.subscription-renewal-today")
                              : days === 1
                                ? t("profile.subscription-days-one-short")
                                : t("profile.subscription-days-many-short", {
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
                          <span className="break-all font-mono text-base">
                            {subscriptionInfo.subscription.reference_number ?? "—"}
                          </span>
                        ),
                      },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className="flex flex-col rounded-xl border border-white/10 bg-black/30 px-4 py-4"
                      >
                        <dt className="text-sm font-medium text-slate-400">{row.label}</dt>
                        <dd className="mt-1 text-lg font-semibold text-white">{row.value}</dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <Link
                      href="/profile/subscription"
                      className="premium-renew-cta inline-flex min-w-[200px] flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-4 text-center text-lg font-bold text-slate-950 shadow-lg shadow-amber-500/25 transition hover:from-amber-300 hover:to-amber-400"
                    >
                      {t("profile.subscription-manage-cta")}
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                    <Link
                      href="/subscriptions"
                      className="inline-flex min-w-[200px] flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-slate-900/70 px-6 py-4 text-base font-semibold text-slate-100 transition hover:border-amber-300/40 hover:text-white"
                    >
                      {t("profile.subscription-explore-benefits")}
                    </Link>
                    <Link
                      href="/accounts"
                      className="inline-flex min-w-[200px] flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-slate-900/70 px-6 py-4 text-base font-semibold text-slate-100 transition hover:border-amber-300/40 hover:text-white"
                    >
                      {t("profile.subscription-link-accounts")}
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="relative px-7 py-10 sm:px-10 sm:py-12">
                  <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:max-w-none lg:text-left">
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-300/90">
                      {t("profile.subscription-upsell-kicker")}
                    </p>
                    <h2 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                      {t("profile.subscription-upsell-title")}
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-slate-300 lg:mx-0">
                      {t("profile.subscription-upsell-subtitle-short")}
                    </p>
                  </div>

                  <ul className="mx-auto mt-10 grid max-w-lg gap-3 lg:mx-0 lg:max-w-none lg:grid-cols-2">
                    {subscriptionBenefitKeys.map((key) => (
                      <li key={key} className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-left">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        <span className="text-base font-medium leading-snug text-slate-100">{t(key)}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mx-auto mt-10 flex max-w-lg flex-col gap-3 sm:flex-row sm:items-center lg:mx-0 lg:max-w-none">
                    <Link
                      href="/subscriptions"
                      className="premium-renew-cta inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-8 py-4 text-lg font-bold text-slate-950 shadow-xl shadow-amber-500/25 transition hover:from-amber-300 hover:to-amber-400"
                    >
                      {t("profile.subscription-cta-primary")}
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </Link>
                    <Link
                      href="/subscriptions"
                      className="inline-flex flex-1 items-center justify-center rounded-xl border-2 border-white/20 bg-transparent px-8 py-4 text-lg font-semibold text-slate-100 transition hover:border-amber-400/60 hover:text-white"
                    >
                      {t("profile.subscription-cta-secondary")}
                    </Link>
                  </div>

                  <p className="mx-auto mt-8 max-w-lg text-center text-base leading-relaxed text-slate-400 lg:mx-0 lg:text-left">
                    {t("profile.subscription-trust-line-short")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

const ProfileFallback = () => (
  <div className="relative min-h-screen overflow-visible bg-midnight pb-16">
    <div className="pointer-events-none absolute inset-0 fire-embers-blue opacity-50" />
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(56,189,248,0.10),transparent_38%),radial-gradient(circle_at_82%_84%,rgba(14,165,233,0.08),transparent_40%)]" />
    <div className="contenedor relative z-30 mb-6">
      <NavbarAuthenticated />
    </div>
    <div className="relative z-10 flex min-h-[50vh] items-center justify-center">
      <LoadingSpinner />
    </div>
  </div>
);

const ProfilePage = () => (
  <Suspense fallback={<ProfileFallback />}>
    <Profile />
  </Suspense>
);

export default ProfilePage;

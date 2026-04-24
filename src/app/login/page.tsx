"use client";

import { login } from "@/api/account/login";
import UseAuthRedirect from "@/components/utilities/logged-in";
import AlertComponent from "@/components/utilities/show-alert";
import { webProps } from "@/constants/configs";
import { socialLinks } from "@/constants/socialLinks";
import { useUserContext } from "@/context/UserContext";
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";

const LOGIN_FIRE_VIDEO =
  "https://video.wixstatic.com/video/5dd8a0_55ab45ac60f043378dcd8805dcfc892a/720p/mp4/file.mp4";
const LOGIN_DECORATIVE_SWORD =
  "https://static.wixstatic.com/media/5dd8a0_9222be68baa94d82b57cdd840b2ec278~mv2.png";

const Login = () => {
  const { t } = useTranslation();
  const { user, setUser } = useUserContext();
  const [userName, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();

  /* VALIDA SI YA ESTA LOGUEADO */
  UseAuthRedirect();

  const handleUserNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validación mejorada
    if (!userName.trim() || !password.trim()) {
      Swal.fire({
        icon: "warning",
        title: t("login.error.empty-field-title"),
        text: t("login.error.empty-field-message"),
        confirmButtonColor: "#3085d6",
        confirmButtonText: t("login.error.empty-field-buttom-message"),
        timer: 4500,
      });
      return;
    }

    setIsSubmitting(true);
    setError(null); // Limpiar errores previos

    try {
      const response = await login(userName, password);
      const {
        jwt,
        refresh_token,
        expiration_date,
        avatar_url,
        language,
        isAdmin,
        pending_validation,
      } = response;
      const expirationDateUTC = new Date(expiration_date).toUTCString();

      // Configurar cookies de forma más eficiente
      const cookieOptions = {
        expires: new Date(expirationDateUTC),
        secure: true,
        sameSite: "Strict" as const,
      };

      Cookies.set("token", jwt, cookieOptions);
      Cookies.set("refresh_token", refresh_token, cookieOptions);

      // Actualizar usuario de forma más eficiente
      if (user) {
        setUser({
          ...user,
          logged_in: true,
          avatar: avatar_url,
          language: language,
          pending_validation: false,
          is_admin: isAdmin,
        });
      }

      // Redirección optimizada con timeout
      setTimeout(() => {
        router.push("/accounts");
      }, 100);
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error);
    } finally {
      // Asegurar que el loading se desactive
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {error && (
        <AlertComponent
          error={error}
          btn_primary_txt={t("errors.show-alert.btn-primary")}
          btn_secondary_txt={t("errors.show-alert.btn-secondary")}
        />
      )}
      <div className="hidden md:flex md:flex-1 md:items-center md:justify-center relative overflow-hidden">
        <video
          src={LOGIN_FIRE_VIDEO}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/50 via-transparent to-orange-950/35" />
        <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle,rgba(251,146,60,0.45)_0_1.8px,transparent_2.8px),radial-gradient(circle,rgba(249,115,22,0.35)_0_1.2px,transparent_2.2px),radial-gradient(circle,rgba(253,186,116,0.28)_0_1px,transparent_2px)] [background-size:170px_170px,230px_210px,290px_250px] [animation:embers-drift-blue_9.2s_ease-in-out_infinite]" />
        <img
          src={LOGIN_DECORATIVE_SWORD}
          alt="Espada decorativa"
          className="pointer-events-none absolute -bottom-10 left-8 z-[2] hidden w-[14rem] opacity-80 drop-shadow-[0_0_24px_rgba(56,189,248,0.45)] lg:block xl:w-[16rem]"
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-slate-950/90 to-transparent" />
      </div>
      <div className="w-full md:flex-1 flex flex-col justify-center items-center p-5 bg-slate-950 shadow-xl relative border-l border-orange-500/20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(251,146,60,0.12),transparent_36%),radial-gradient(circle_at_84%_82%,rgba(249,115,22,0.08),transparent_34%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-45 [background-image:radial-gradient(circle,rgba(56,189,248,0.4)_0_1.8px,transparent_2.8px),radial-gradient(circle,rgba(59,130,246,0.3)_0_1.3px,transparent_2.2px),radial-gradient(circle,rgba(147,197,253,0.26)_0_1px,transparent_2px)] [background-size:180px_180px,250px_220px,320px_260px] [animation:embers-drift-blue_10.5s_ease-in-out_infinite]" />
        <img
          src={LOGIN_DECORATIVE_SWORD}
          alt="Espada decorativa"
          className="pointer-events-none absolute right-6 top-1/2 z-10 hidden w-[24rem] -translate-y-1/2 opacity-85 drop-shadow-[0_0_30px_rgba(56,189,248,0.55)] lg:block xl:w-[28rem] accounts-decoration-animated"
        />
        <div className="absolute top-5 right-5 text-xl text-slate-200 md:text-4xl lg:text-5xl xl:text-5xl  md:absolute md:top-5 md:right-5">
          <a href="/" className="hover:text-orange-400 transition-colors">
            X
          </a>
        </div>
        <div className="w-full max-w-sm text-center mb-12 md:mb-16 relative z-10">
          <h2 className="font-semibold text-white text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-6xl">
            {t("login.title")}
          </h2>
        </div>
        <div className="w-full max-w-md mb-24 rounded-3xl border border-slate-700/80 bg-slate-900/80 p-6 sm:p-8 shadow-[0_20px_50px_rgba(2,6,23,0.65)] backdrop-blur-sm relative z-10">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-base sm:text-lg font-medium text-slate-200"
              >
                {t("login.username")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                </div>
                <input
                  className="block w-full pl-10 pr-4 py-4 border border-slate-600/70 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/60 focus:border-orange-300 transition-all duration-200 text-lg sm:text-xl bg-slate-950/90 shadow-sm"
                  type="email"
                  id="email"
                  placeholder="tu@email.com"
                  autoComplete="email"
                  value={userName}
                  onChange={handleUserNameChange}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-base sm:text-lg font-medium text-slate-200"
              >
                {t("login.password")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  className="block w-full pl-10 pr-4 py-4 border border-slate-600/70 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/60 focus:border-orange-300 transition-all duration-200 text-lg sm:text-xl bg-slate-950/90 shadow-sm"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              className="w-full flex justify-center items-center px-6 py-4 border border-transparent rounded-xl shadow-[0_10px_24px_rgba(249,115,22,0.35)] text-lg sm:text-xl font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Loading...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  {t("login.buttom")}
                </>
              )}
            </button>
          </form>
          <div className="mt-8 space-y-4">
            <div className="text-center">
              <p className="text-base sm:text-lg text-slate-300">
                {t("login.create-account-question")}
                <Link
                  className="ml-1 text-orange-400 hover:text-orange-300 font-medium underline decoration-1 underline-offset-2 hover:decoration-orange-300 transition-colors"
                  href="/register"
                >
                  {t("login.create-account-message")}
                </Link>
              </p>
            </div>

            <div className="text-center">
              <Link
                className="text-base sm:text-lg text-slate-400 hover:text-orange-400 font-medium transition-colors"
                href="/recovery"
              >
                {t("login.old-password")}
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full px-5 pb-8">
          <div className="max-w-2xl mx-auto text-center">
            {/* Copyright */}
            <div className="mb-6">
              <p className="text-base sm:text-lg text-slate-300 font-medium">
                © {webProps.serverName} {new Date().getFullYear()}
              </p>
              <p className="text-sm sm:text-base text-slate-400 mt-2">
                All rights reserved. Thank you for being part of our community!
              </p>
            </div>

            {/* Social Links */}
            <div className="flex justify-center space-x-6 mb-6">
              {socialLinks
                .filter((link) =>
                  ["Facebook", "Telegram", "WhatsApp"].includes(link.name),
                )
                .map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-orange-400 transition-colors"
                    aria-label={link.name}
                  >
                    <img
                      src={link.icon}
                      alt={link.alt}
                      className="w-6 h-6 sm:w-7 sm:h-7 object-contain"
                    />
                  </a>
                ))}
            </div>

            {/* Quick Links */}
            <div className="flex justify-center space-x-8 text-base sm:text-lg text-slate-400">
              <a
                href="/privacy"
                className="hover:text-orange-500 transition-colors font-medium"
              >
                Privacy
              </a>
              <a
                href="/terms"
                className="hover:text-orange-500 transition-colors font-medium"
              >
                Terms
              </a>
              <a
                href="/help"
                className="hover:text-orange-500 transition-colors font-medium"
              >
                Help
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

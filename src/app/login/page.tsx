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
    <div className="flex h-screen">
      {error && (
        <AlertComponent
          error={error}
          btn_primary_txt={t("errors.show-alert.btn-primary")}
          btn_secondary_txt={t("errors.show-alert.btn-secondary")}
        />
      )}
      <div className="hidden md:flex md:flex-1 md:items-center md:justify-center">
        <img
          src={webProps.loginBanner}
          alt="LoginImage"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="w-full md:flex-1 flex flex-col justify-center items-center p-5 bg-white shadow-lg relative">
        <div className="absolute top-5 right-5 text-xl md:text-4xl lg:text-5xl xl:text-5xl  md:absolute md:top-5 md:right-5">
          <a href="/">X</a>
        </div>
        <div className="w-full max-w-sm text-center mb-12 md:mb-16">
          <h2 className="font-semibold text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-6xl">
            {t("login.title")}
          </h2>
        </div>
        <div className="w-full max-w-md mb-16">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-base sm:text-lg font-medium text-gray-700"
              >
                {t("login.username")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
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
                  className="block w-full pl-10 pr-4 py-4 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-lg sm:text-xl"
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
                className="block text-base sm:text-lg font-medium text-gray-700"
              >
                {t("login.password")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
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
                  className="block w-full pl-10 pr-4 py-4 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-lg sm:text-xl"
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
              className="w-full flex justify-center items-center px-6 py-4 border border-transparent rounded-xl shadow-sm text-lg sm:text-xl font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
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
              <p className="text-base sm:text-lg text-gray-600">
                {t("login.create-account-question")}
                <Link
                  className="ml-1 text-orange-600 hover:text-orange-700 font-medium underline decoration-1 underline-offset-2 hover:decoration-orange-500 transition-colors"
                  href="/register"
                >
                  {t("login.create-account-message")}
                </Link>
              </p>
            </div>

            <div className="text-center">
              <Link
                className="text-base sm:text-lg text-gray-500 hover:text-orange-600 font-medium transition-colors"
                href="/recovery"
              >
                {t("login.old-password")}
              </Link>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full px-5 pb-8">
            <div className="max-w-2xl mx-auto text-center">
              {/* Copyright */}
              <div className="mb-6">
                <p className="text-base sm:text-lg text-gray-600 font-medium">
                  © {webProps.serverName} {new Date().getFullYear()}
                </p>
                <p className="text-sm sm:text-base text-gray-500 mt-2">
                  All rights reserved. Thank you for being part of our
                  community!
                </p>
              </div>

              {/* Social Links */}
              <div className="flex justify-center space-x-6 mb-6">
                {socialLinks
                  .filter((link) =>
                    ["Facebook", "Telegram", "WhatsApp"].includes(link.name)
                  )
                  .map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-orange-500 transition-colors"
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
              <div className="flex justify-center space-x-8 text-base sm:text-lg text-gray-500">
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
    </div>
  );
};

export default Login;

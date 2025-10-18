"use client";

import { login } from "@/api/account/login";
import LoadingSpinner from "@/components/utilities/loading-spinner";
import UseAuthRedirect from "@/components/utilities/logged-in";
import AlertComponent from "@/components/utilities/show-alert";
import { webProps } from "@/constants/configs";
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
      const { jwt, refresh_token, expiration_date, avatar_url, language } = response;
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
          pending_validation: response.pending_validation,
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
      <div className="flex-1 flex items-center justify-center md:block">
        <img src={webProps.loginBanner} alt="LoginImage" className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 flex flex-col justify-center items-center p-5 bg-white shadow-lg relative">
        <div className="absolute top-5 right-5 text-xl md:text-4xl lg:text-5xl xl:text-5xl fixed md:absolute md:top-5 md:right-5">
          <a href="/">X</a>
        </div>
        <div className="w-full max-w-sm text-center mb-16">
          <h2 className="font-semibold text-3xl md:text-6xl lg:text-6xl xl:text-6xl">
            {t("login.title")}
          </h2>
        </div>
        <div className="w-full max-w-md mb-16">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t("login.username")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  className="block w-full pl-10 pr-4 py-4 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-lg"
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t("login.password")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  className="block w-full pl-10 pr-4 py-4 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-lg"
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
              className="w-full flex justify-center items-center px-6 py-4 border border-transparent rounded-xl shadow-sm text-lg font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t("login.loading") || "Iniciando sesión..."}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  {t("login.buttom")}
                </>
              )}
            </button>
          </form>
          <div className="mt-8 space-y-4">
            <div className="text-center">
              <p className="text-base text-gray-600">
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
                className="text-base text-gray-500 hover:text-orange-600 font-medium transition-colors"
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
                <p className="text-base text-gray-600 font-medium">
                  © {webProps.serverName} {new Date().getFullYear()}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  All rights reserved. Thank you for being part of our community!
                </p>
              </div>
              
              {/* Social Links */}
              <div className="flex justify-center space-x-6 mb-6">
                <a href="#" className="text-gray-500 hover:text-orange-500 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-500 hover:text-orange-500 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-500 hover:text-orange-500 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-500 hover:text-orange-500 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              </div>
              
              {/* Quick Links */}
              <div className="flex justify-center space-x-8 text-sm text-gray-500">
                <a href="/privacy" className="hover:text-orange-500 transition-colors font-medium">Privacy</a>
                <a href="/terms" className="hover:text-orange-500 transition-colors font-medium">Terms</a>
                <a href="/help" className="hover:text-orange-500 transition-colors font-medium">Help</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

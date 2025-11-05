"use client";

import { registerAccountWeb } from "@/api/account/register";
import Footer from "@/components/footer";
import NavbarMinimalist from "@/components/navbar-minimalist";
import PageCounter from "@/components/utilities/counter";
import LoadingSpinner from "@/components/utilities/loading-spinner";
import TitleWow from "@/components/utilities/serverTitle";
import AlertComponent from "@/components/utilities/show-alert";
import { GOOGLE_API_KEY_RE_CAPTCHA } from "@/configs/configs";
import { useUserContext } from "@/context/UserContext";
import { AccountWebRequestDto } from "@/model/model";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import "../style.css";

const AccountWeb = () => {
  const { user, setUser } = useUserContext();
  const language = user.language;
  const country = user.country;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();
  const { t } = useTranslation();

  const siteKey = GOOGLE_API_KEY_RE_CAPTCHA;

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    (window as any).onCaptchaResolved = (token: string) => {
      setCaptchaToken(token);
    };

    return () => {
      document.body.removeChild(script);

      // Limpia la función global para evitar fugas de memoria
      delete (window as any).onCaptchaResolved;
    };
  }, []);

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleConfirmPasswordChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPassword(event.target.value);
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!captchaToken) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Capcha invalid",
        color: "white",
        background: "#0B1218",
        timer: 43500,
      });
      return;
    }
    if (password !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: t("register.error.password-web-no-matches"),
        color: "white",
        background: "#0B1218",
        timer: 43500,
      });
      return;
    }

    if (!password.trim()) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: t("register.error.password-web-empty"),
        color: "white",
        background: "#0B1218",
        timer: 43500,
      });
      return;
    }

    if (password.trim().length < 5 || password.trim().length > 30) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: t("register.error.password-web-empty"),
        color: "white",
        background: "#0B1218",
        timer: 43500,
      });
      return;
    }
    setIsSubmitting(true);

    try {
      const userDateOfBirth = user.date_of_birth;

      const formattedDateOfBirth = userDateOfBirth
        ? !isNaN(new Date(userDateOfBirth).getTime())
          ? new Date(userDateOfBirth).toISOString().split("T")[0]
          : new Date().toISOString()
        : new Date().toISOString();

      const requestBody: AccountWebRequestDto = {
        country: user.country,
        date_of_birth: formattedDateOfBirth,
        first_name: user.first_name,
        last_name: user.last_name,
        cell_phone: user.cell_phone || null,
        email: user.email,
        password: password,
        language: language,
        token: captchaToken,
      };

      const response = await registerAccountWeb(requestBody, language);
      const { jwt, refresh_token, expiration_date, avatar_url } = response;
      const expirationDateUTC = new Date(expiration_date).toUTCString();

      setUser({
        id: null,
        username: "",
        country: country,
        language: language,
        date_of_birth: null,
        first_name: "",
        last_name: "",
        cell_phone: "",
        email: "",
        logged_in: true,
        avatar: avatar_url,
        expansion: null,
        server: null,
        pending_validation: true,
        is_admin: false,
      });

      Cookies.set("token", jwt, {
        expires: new Date(expirationDateUTC),
        secure: true,
        sameSite: "Strict",
      });

      Cookies.set("refresh_token", refresh_token, {
        expires: new Date(expirationDateUTC),
        secure: true,
        sameSite: "Strict",
      });
    } catch (error: any) {
      setError(error);
      return;
    } finally {
      setIsSubmitting(false);
    }

    router.push(`/register/username?showWelcome=true`);
  };

  const handleVolverClick = () => {
    router.back();
  };

  return (
    <div className="contenedor register bg-midnight min-h-screen">
      <NavbarMinimalist />
      {error && (
        <AlertComponent
          error={error}
          btn_primary_txt={t("errors.show-alert.btn-primary")}
          btn_secondary_txt={t("errors.show-alert.btn-secondary")}
        />
      )}
      <div className="register-container">
        <TitleWow
          title={t("register.title-server-sub-title")}
          description={t(
            "register.section-page.account-web.title-server-message"
          )}
        />
        <form
          className="register-container-form pt-1"
          onSubmit={handleFormSubmit}
        >
          <div className="hidden">
            <label
              htmlFor="usernameInput"
              className="mb-2 register-container-form-label"
            >
              Username
            </label>
            <input
              className="mb-3 px-4 py-2 border rounded-md text-black register-input"
              type="text"
              id="usernameInput"
              placeholder="Username"
              value={user.username}
              readOnly
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label
              htmlFor="passInput"
              className="mb-2 register-container-form-label text-gaming-primary-light font-semibold"
            >
              {t("register.section-page.account-web.input.password-web-text")}
              <span className="text-red-500 ml-1">*</span>
            </label>

            <input
              className="mb-3 px-4 py-3 bg-gaming-base-main/80 backdrop-blur-sm border border-gaming-primary-main/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gaming-primary-main/50 focus:border-gaming-primary-main transition-all duration-300 register-input"
              type="password"
              id="passInput"
              placeholder={t(
                "register.section-page.account-web.input.password-web-placeholder"
              )}
              value={password}
              required
              autoComplete="new-password"
              onChange={handlePasswordChange}
            />
          </div>

          <div className="form-group">
            <label
              htmlFor="confirmPassInput"
              className="mb-2 register-container-form-label text-gaming-primary-light font-semibold"
            >
              {t(
                "register.section-page.account-web.input.password-confirm-web-text"
              )}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              className="mb-3 px-4 py-3 bg-gaming-base-main/80 backdrop-blur-sm border border-gaming-primary-main/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gaming-primary-main/50 focus:border-gaming-primary-main transition-all duration-300 register-input"
              type="password"
              id="confirmPassInput"
              autoComplete="new-password"
              placeholder={t(
                "register.section-page.account-web.input.password-confirm-web-text-placeholder"
              )}
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
            />
          </div>
          <div
            className="form-group"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              className="g-recaptcha"
              id="recaptcha"
              data-sitekey={siteKey}
              data-callback="onCaptchaResolved"
            ></div>
            <br />
          </div>
          {isSubmitting && (
            <div className="mb-4 text-center">
              <LoadingSpinner />
            </div>
          )}
          <PageCounter currentSection={5} totalSections={5} />
          
          {/* Botón Principal */}
          <button
            className="text-white px-5 py-5 rounded-lg mt-8 button-register relative group transition-all duration-500 hover:text-white hover:bg-gradient-to-r hover:from-gaming-primary-main hover:to-gaming-secondary-main hover:shadow-2xl hover:shadow-gaming-primary-main/40 hover:scale-[1.02] hover:-translate-y-1 overflow-hidden"
            type="submit"
            disabled={isSubmitting}
          >
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

            <span className="relative z-10 font-semibold tracking-wide">{t("register.section-page.account-web.button.btn-primary")}</span>
            
            {/* Línea inferior elegante */}
            <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-gaming-primary-main to-gaming-secondary-main group-hover:w-full transition-all duration-700 ease-out"></div>
          </button>

          {/* Botón Secundario */}
          <button
            className="text-white px-5 py-5 rounded-lg mt-4 button-register relative group transition-all duration-500 hover:text-white hover:bg-gradient-to-r hover:from-gray-600 hover:to-gray-700 hover:shadow-2xl hover:shadow-gray-500/40 hover:scale-[1.02] hover:-translate-y-1 overflow-hidden"
            type="button"
            onClick={handleVolverClick}
            disabled={isSubmitting}
          >
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
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-gray-500/20 via-gray-600/20 to-gray-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <span className="relative z-10 font-semibold tracking-wide">{t("register.section-page.account-web.button.btn-secondary")}</span>
            
            {/* Línea inferior elegante */}
            <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-gray-500 to-gray-600 group-hover:w-full transition-all duration-700 ease-out"></div>
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default AccountWeb;

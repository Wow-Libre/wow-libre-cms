"use client";

import PageCounter from "@/components/utilities/counter";
import NavbarMinimalist from "@/components/navbar-minimalist";
import TitleWow from "@/components/utilities/serverTitle";
import { useUserContext } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, useEffect, useState } from "react";
import Swal from "sweetalert2";
import "../style.css";
import { existEmail, existPhone } from "@/api/account/exist-email";
import { useTranslation } from "react-i18next";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Footer from "@/components/footer";

const ContactMeans = () => {
  const { user, setUser } = useUserContext();
  const [email, setEmail] = useState("");
  const [cellPhone, setCellPhone] = useState("");
  const router = useRouter();
  const { t } = useTranslation();

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const isValidEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: t("register.error.email-empty"),
        color: "white",
        background: "#0B1218",
        timer: 43500,
      });
      return;
    }

    if (!isValidEmail(email)) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: t("register.error.email-invalid"),
        color: "white",
        background: "#0B1218",
        timer: 43500,
      });
      return;
    }

    try {
      const [emailResponse] = await Promise.all([existEmail(email)]);

      if (emailResponse.exist) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: t("register.error.email-exist"),
          color: "white",
          background: "#0B1218",
          timer: 43500,
        });

        return;
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: `${error.message}`,
        color: "white",
        background: "#0B1218",
        timer: 43500,
      });
      return;
    }

    if (user) {
      setUser({
        ...user,
        email: email,
        cell_phone: cellPhone,
      });
    }
    router.push("/register/terms-and-conditions");
  };

  const handleVolverClick = () => {
    router.back();
  };

  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setCellPhone(user.cell_phone || "");
    }
  }, [setUser]);

  return (
    <div className="contenedor register bg-midnight min-h-screen">
      <NavbarMinimalist />

      <div className="register-container">
        <TitleWow
          title={t("register.title-server-sub-title")}
          description={t(
            "register.section-page.contact-means.title-server-message"
          )}
        />

        <form
          className="register-container-form pt-1"
          onSubmit={handleFormSubmit}
        >
          <div className="form-group">
            <label
              htmlFor="emailInput"
              className="mb-2 register-container-form-label text-gaming-primary-light font-semibold"
            >
              {t("register.section-page.contact-means.input.email-text")}
              <span className="text-red-500 ml-1">*</span>
            </label>

            <input
              className="mb-3 px-4 py-3 bg-gaming-base-main/80 backdrop-blur-sm border border-gaming-primary-main/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gaming-primary-main/50 focus:border-gaming-primary-main transition-all duration-300 register-input"
              type="email"
              id="emailInput"
              placeholder={t(
                "register.section-page.contact-means.input.email-text-place-holder"
              )}
              value={email}
              onChange={handleEmailChange}
              required
            />
          </div>

          <div className="form-group">
            <label
              htmlFor="phoneInput"
              className="mb-2 register-container-form-label text-gaming-primary-light font-semibold"
            >
              {t("register.section-page.contact-means.input.phone-text")}
              <span className="text-gray-400 text-sm font-normal ml-1">(Optional)</span>
            </label>
            <PhoneInput
              country={"us"}
              value={cellPhone}
              onChange={(value) => setCellPhone(value)}
              inputClass="phone-input-gaming"
              containerClass="phone-container-gaming"
              buttonClass="phone-button-gaming"
              inputStyle={{
                width: "100%",
                paddingLeft: "58px",
                padding: "12px 12px 12px 58px",
                fontSize: "16px",
                backgroundColor: "rgba(15, 23, 42, 0.8)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                borderRadius: "8px",
                color: "#fff",
                transition: "all 0.3s ease",
              }}
              inputProps={{ 
                id: "phoneInput",
                style: {
                  outline: "none",
                }
              }}
              dropdownClass="phone-dropdown-gaming"
            />
          </div>

          <PageCounter currentSection={3} totalSections={5} />
          
          {/* Botón Principal */}
          <button
            className="text-white px-5 py-5 rounded-lg mt-8 button-register relative group transition-all duration-500 hover:text-white hover:bg-gradient-to-r hover:from-gaming-primary-main hover:to-gaming-secondary-main hover:shadow-2xl hover:shadow-gaming-primary-main/40 hover:scale-[1.02] hover:-translate-y-1 overflow-hidden"
            type="submit"
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

            <span className="relative z-10 font-semibold tracking-wide">{t("register.section-page.contact-means.button.btn-primary")}</span>
            
            {/* Línea inferior elegante */}
            <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-gaming-primary-main to-gaming-secondary-main group-hover:w-full transition-all duration-700 ease-out"></div>
          </button>

          {/* Botón Secundario */}
          <button
            className="text-white px-5 py-5 rounded-lg mt-4 button-register relative group transition-all duration-500 hover:text-white hover:bg-gradient-to-r hover:from-gray-600 hover:to-gray-700 hover:shadow-2xl hover:shadow-gray-500/40 hover:scale-[1.02] hover:-translate-y-1 overflow-hidden"
            type="button"
            onClick={handleVolverClick}
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

            <span className="relative z-10 font-semibold tracking-wide">{t("register.section-page.contact-means.button.btn-secondary")}</span>
            
            {/* Línea inferior elegante */}
            <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-gray-500 to-gray-600 group-hover:w-full transition-all duration-700 ease-out"></div>
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default ContactMeans;

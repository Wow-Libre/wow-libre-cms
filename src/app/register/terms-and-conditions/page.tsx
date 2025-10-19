"use client";

import PageCounter from "@/components/utilities/counter";
import TitleWow from "@/components/utilities/serverTitle";
import React, { ChangeEvent, useEffect, useState } from "react";
import "../style.css";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import NavbarMinimalist from "@/components/navbar-minimalist";
import { useTranslation } from "react-i18next";
import Footer from "@/components/footer";

const TermsAndConditions = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const [selectedOptions, setSelectedOptions] = useState({
    option1: false,
    option2: false,
  });

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setSelectedOptions({
      ...selectedOptions,
      [name]: checked,
    });
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedOptions.option1 || !selectedOptions.option2) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: t("register.error.terms-and-conditions-empty"),
        color: "white",
        background: "#0B1218",
        timer: 43500,
      });
      return;
    }
    router.push("/register/account-web");
  };

  const handleAcceptClick = () => {
    router.push("/register/terms-and-conditions/readme");
  };

  const handleVolverClick = () => {
    router.back();
  };

  return (
    <div className="contenedor register bg-midnight min-h-screen">
      <NavbarMinimalist />
      <div className="register-container">
        <TitleWow
          title={t("register.title-server-sub-title")}
          description={t(
            "register.section-page.terms-and-conditions.title-server-message"
          )}
        />

        <form className="register-container-form pt-1" onSubmit={handleFormSubmit}>
          <div className="form-group-flex-row">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="option1"
                name="option1"
                checked={selectedOptions.option1}
                onChange={handleCheckboxChange}
                className="checkbox-custom"
              />
              <label
                htmlFor="option1"
                className="pt-9 register-container-form-label text-gaming-primary-light font-semibold text-xl sm:text-2xl md:text-2xl lg:text-2xl xl:text-2xl"
              >
                {t(
                  "register.section-page.terms-and-conditions.input.email-check-text"
                )}
              </label>
            </div>
          </div>

          <div className="form-group-flex-row mb-11">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="option2"
                name="option2"
                checked={selectedOptions.option2}
                onChange={handleCheckboxChange}
                className="checkbox-custom"
              />
              <label
                htmlFor="option2"
                className="pt-10 register-container-form-label text-gaming-primary-light font-semibold text-xl sm:text-2xl md:text-2xl lg:text-2xl xl:text-2xl"
              >
                {t(
                  "register.section-page.terms-and-conditions.input.term-check-text"
                )}
                <a
                  onClick={handleAcceptClick}
                  href="/register/terms-and-conditions/readme"
                  className="underline text-gaming-secondary-main hover:text-gaming-primary-main transition-colors duration-300"
                >
                  {t(
                    "register.section-page.terms-and-conditions.input.term-check-link"
                  )}
                </a>
              </label>
            </div>
          </div>

          <PageCounter currentSection={4} totalSections={5} />
          
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

            <span className="relative z-10 font-semibold tracking-wide">{t("register.section-page.terms-and-conditions.button.btn-primary")}</span>
            
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

            <span className="relative z-10 font-semibold tracking-wide">{t("register.section-page.terms-and-conditions.button.btn-secondary")}</span>
            
            {/* Línea inferior elegante */}
            <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-gray-500 to-gray-600 group-hover:w-full transition-all duration-700 ease-out"></div>
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default TermsAndConditions;

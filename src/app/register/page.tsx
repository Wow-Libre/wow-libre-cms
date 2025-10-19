"use client";

import { getAvailableCountries } from "@/api/country";
import Footer from "@/components/footer";
import NavbarMinimalist from "@/components/navbar-minimalist";
import PageCounter from "@/components/utilities/counter";
import TitleWow from "@/components/utilities/serverTitle";
import { useUserContext } from "@/context/UserContext";
import { CountryModel } from "@/model/model";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import Swal from "sweetalert2";
import "./style.css";

const defaultCountryOptions: CountryModel[] = [
  { value: "Otro", label: "Otro", language: "pt" },
  { value: "Others", label: "Others", language: "en" },
];

const Register = () => {
  const jwt = Cookies.get("token");

  const { t, i18n } = useTranslation();
  const { user, setUser } = useUserContext();
  const router = useRouter();
  const [country, setCountry] = useState<string>("");
  const [language, setLanguage] = useState<string>("");
  const [date, setDate] = useState<string>("");

  if (user.logged_in && jwt != null) {
    router.push("/accounts");
  }

  const [countryOptions, setCountryOptions] = useState<CountryModel[]>(
    defaultCountryOptions
  );

  const handleDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDate(event.target.value);
  };

  const handleCountryChange = (selectedOption: CountryModel | null) => {
    const language = selectedOption ? selectedOption.language : "es";
    const countrySelect = selectedOption ? selectedOption.value : "";
    setCountry(countrySelect);
    setLanguage(language);
    i18n.changeLanguage(language);
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!country.trim()) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: t("register.error.country-empty"),
        color: "white",
        background: "#0B1218",
        timer: 43500,
      });
      return;
    }

    if (!date) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: t("register.error.birth-date-empty"),
        color: "white",
        background: "#0B1218",
        timer: 43500,
      });
      return;
    }

    const enteredDate = new Date(date);

    if (enteredDate > new Date()) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: t("register.error.birth-date-future"),
        color: "white",
        background: "#0B1218",
        timer: 43500,
      });
      return;
    }

    const today = new Date();
    let age = today.getFullYear() - enteredDate.getFullYear();
    const monthDifference = today.getMonth() - enteredDate.getMonth();
    const dayDifference = today.getDate() - enteredDate.getDate();

    if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
      age--;
    }

    if (age < 13) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: t("register.error.age-restriction"),
        color: "white",
        background: "#0B1218",
        timer: 43500,
      });
      return;
    }

    if (user) {
      setUser({
        ...user,
        language: language,
        country: country,
        date_of_birth: new Date(date),
      });
    }
    router.push("/register/know-you");
  };

  useEffect(() => {
    const fetchData = async () => {
      const fetchedCountryOptions = await getAvailableCountries();
      setCountryOptions(fetchedCountryOptions);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (user) {
      i18n.changeLanguage(user.language);
      setCountry(user.country);
      setDate(
        user.date_of_birth
          ? new Date(user.date_of_birth).toISOString().split("T")[0]
          : ""
      );
      setLanguage(user.language);
    }
  }, [user]);

  return (
    <div className="contenedor register bg-midnight min-h-screen">
      <NavbarMinimalist />
      <div className="register-container">
        <TitleWow
          title={t("register.title-server-sub-title")}
          description={t("register.section-page.register.title-server-message")}
        />
        <form className="register-container-form pt-1" onSubmit={handleFormSubmit}>
          <div className="form-group select-container">
            <label
              htmlFor="countrySelect"
              className="mb-2 register-container-form-label text-gaming-primary-light font-semibold"
            >
              {t("register.section-page.register.input.select-country")}
            </label>
            <Select
              instanceId={"wsad123wqwe"}
              className="mb-3 register-input p-1"
              options={countryOptions}
              onChange={handleCountryChange}
              value={countryOptions.find((option) => option.value === country)}
              placeholder={t(
                "register.section-page.register.input.select-country-place-holder"
              )}
              isSearchable
              inputId="countrySelect"
              styles={{
                control: (base) => ({
                  ...base,
                  backgroundColor: 'rgba(27, 33, 48, 0.8)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '8px',
                  color: 'white',
                  '&:hover': {
                    border: '1px solid rgba(139, 92, 246, 0.5)',
                  }
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: 'rgba(27, 33, 48, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '8px',
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(139, 92, 246, 0.2)',
                  }
                }),
                singleValue: (base) => ({
                  ...base,
                  color: 'white',
                }),
                placeholder: (base) => ({
                  ...base,
                  color: 'rgba(255, 255, 255, 0.6)',
                }),
                input: (base) => ({
                  ...base,
                  color: 'white',
                })
              }}
            />
          </div>
          <div className="form-group">
            <label
              htmlFor="fechaInput"
              className="mb-2 register-container-form-label text-gaming-primary-light font-semibold"
            >
              {t("register.section-page.register.input.select-birthday")}
            </label>
            <input
              className="mb-3 px-4 py-3 bg-gaming-base-main/80 backdrop-blur-sm border border-gaming-primary-main/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gaming-primary-main/50 focus:border-gaming-primary-main transition-all duration-300 register-input"
              type="date"
              id="fechaInput"
              name="fechaInput"
              value={date}
              onChange={handleDateChange}
            />
          </div>
          <PageCounter currentSection={1} totalSections={5} />
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

            <span className="relative z-10 font-semibold tracking-wide">{t("register.section-page.register.button.btn-primary")}</span>
            
            {/* Línea inferior elegante */}
            <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-gaming-primary-main to-gaming-secondary-main group-hover:w-full transition-all duration-700 ease-out"></div>
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default Register;

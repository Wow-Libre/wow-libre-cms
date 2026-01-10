"use client";

import { webProps } from "@/constants/configs";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { useNavbar } from "../hooks/useNavbar";
import UserMenu from "./UserMenu";
import SearchBar from "./SearchBar";
import { useUserContext } from "@/context/UserContext";
import "../styles/navbar.css";

// Mapeo de códigos de idioma a nombres completos
const languageNames: Record<string, string> = {
  es: "Español",
  en: "English",
  pt: "Português",
};

const Navbar = () => {
  const { t } = useTranslation();
  const { user } = useUserContext();
  const {
    languageDropdown,
    languages,
    loading,
    loadingSub,
    isMobileMenuOpen,
    pillHome,
    handleSearch,
    toggleLanguageDropdown,
    changeLanguage,
    toggleMobileMenu,
  } = useNavbar();

  const currentLanguage = user?.language || "es";
  const currentLanguageName = languageNames[currentLanguage] || currentLanguage.toUpperCase();

  return (
    <div className="navbar contenedor text-white relative ">
      <header>
        <Link className="logo-home flex items-center select-none" href="/">
          <img
            className="w-20 h-20 md:w-28 md:h-28 select-none"
            src={webProps.logo}
            alt="Logo Server"
          />
          <p className="title-server title-home ml-2 text-xl font-bold md:text-2xl select-none">
            {webProps.serverName}
          </p>
        </Link>
      </header>

      {/* Botón menú mobile */}
      <button
        className="md:hidden absolute top-6 right-6 z-[70]"
        onClick={toggleMobileMenu}
      >
        <svg
          className="w-8 h-8 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          ></path>
        </svg>
      </button>

      <div className="searcher flex-grow text-black text-2xl hidden md:block">
        <SearchBar
          onSearch={handleSearch}
          placeHolder={t("navbar.search.place-holder")}
        />
      </div>

      {loadingSub || !pillHome ? (
        <div className="promotion">
          <a href="/subscriptions">
            <img
              className="image-promotion"
              src="https://static.wixstatic.com/media/5dd8a0_2db1e48e89e340ce97be2820206b9d95~mv2.webp"
              alt="Pill Subscription"
            />
          </a>
        </div>
      ) : (
        <div className="promotion">
          <a href={pillHome?.url}>
            <img
              className="image-promotion"
              src={pillHome?.img}
              alt="Pill Subscription"
            />
          </a>
        </div>
      )}

      {loading ? (
        <div className="nav-ubication relative">
          <svg
            className="animate-spin h-10 w-10 text-purple-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              fill="none"
              strokeWidth="4"
              stroke="currentColor"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4.29 4.29a1 1 0 011.42 0L12 10.59l6.29-6.3a1 1 0 011.42 1.42l-7 7a1 1 0 01-1.42 0l-7-7a1 1 0 010-1.42z"
            ></path>
          </svg>
        </div>
      ) : (
        <div className="nav-ubication relative font-serif">
          <button
            className="language-selector-btn cursor-pointer hover:text-gray-300 flex items-center gap-2.5 text-white text-base no-underline bg-slate-800/50 hover:bg-slate-700/50 px-5 py-3 rounded-lg border border-slate-600/50 hover:border-slate-500/50 transition-all duration-200"
            onClick={toggleLanguageDropdown}
            aria-label="Seleccionar idioma"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
              ></path>
            </svg>
            <span className="font-semibold text-lg">{currentLanguageName}</span>
            <svg
              className={`w-5 h-5 transition-transform duration-200 ${languageDropdown ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </button>

          {languageDropdown && (
            <div className="language-dropdown font-serif">
              <ul>
                {languages.map((lang) => {
                  const isActive = lang === currentLanguage;
                  const langName = languageNames[lang] || lang.toUpperCase();
                  return (
                    <li
                      key={lang}
                      onClick={() => changeLanguage(lang)}
                      className={`language-option ${isActive ? "active" : ""}`}
                    >
                      <span className="language-name">{langName}</span>
                      <span className="language-code">{lang.toUpperCase()}</span>
                      {isActive && (
                        <svg
                          className="w-5 h-5 text-emerald-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Menú de navegación */}
      <div
        className={`nav-category md:flex ${
          isMobileMenuOpen ? "flex" : "hidden"
        } flex-col md:flex-row gap-4 md:gap-10 items-center absolute md:static bg-midnight md:bg-transparent w-full md:w-auto top-12 left-0 p-4 z-[60]`}
      >
        <nav className="category">
          <Link className="category-link font-serif" href="/guild">
            {t("navbar.sections.position-one")}
          </Link>
          <Link className="category-link font-serif" href="/news">
            {t("navbar.sections.position-two")}
          </Link>
          <Link className="category-link font-serif" href="/bank">
            {t("navbar.sections.position-three")}
          </Link>
          <Link className="category-link font-serif" href="/store">
            {t("navbar.sections.position-four")}
          </Link>
          <Link className="category-link font-serif" href="/help">
            {t("navbar.sections.position-five")}
          </Link>
        </nav>
      </div>

      <div className="auth relative">
        <UserMenu />
      </div>
    </div>
  );
};

export default Navbar;

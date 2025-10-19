"use client";

import { webProps } from "@/constants/configs";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { useNavbar } from "../hooks/useNavbar";
import NavbarAuth from "./NavbarAuth";
import SearchBar from "./SearchBar";
import "../styles/navbar.css";

const Navbar = () => {
  const { t } = useTranslation();
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

  return (
    <div className="navbar contenedor text-white relative overflow-x-hidden z-50">
      <header>
        <Link className="logo-home flex items-center select-none" href="/">
          <img
            className="w-20 h-20 md:w-28 md:h-28 select-none"
            src={webProps.logo}
            alt="Logo WowLibre"
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
          <a
            className="cursor-pointer hover:text-gray-400 flex items-center text-white text-xs no-underline"
            onClick={toggleLanguageDropdown}
          >
            {t("navbar.language")}
            <svg
              className="w-4 h-4 ml-1"
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
          </a>

          {languageDropdown && (
            <div className="language-dropdown font-serif">
              <ul>
                {languages.map((lang) => (
                  <li key={lang} onClick={() => changeLanguage(lang)}>
                    {lang.toUpperCase()}
                  </li>
                ))}
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
        <NavbarAuth />
      </div>
    </div>
  );
};

export default Navbar;

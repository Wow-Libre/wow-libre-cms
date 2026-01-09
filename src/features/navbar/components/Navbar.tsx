"use client";

import { webProps } from "@/constants/configs";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useNavbar } from "../hooks/useNavbar";
import NavbarAuth from "./NavbarAuth";
import SearchBar from "./SearchBar";
import "../styles/navbar.css";

type OnlineUsersConfig = {
  enabled: boolean;
  showCount: boolean;
  showList: boolean;
  refreshSeconds: number;
  listLimit: number;
  label: string;
};

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
  const [onlineConfig, setOnlineConfig] = useState<OnlineUsersConfig | null>(
    null
  );
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [onlineOpen, setOnlineOpen] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/api/online-users/config", {
          cache: "no-store",
        });
        if (!response.ok) return;
        const data = (await response.json()) as OnlineUsersConfig;
        setOnlineConfig(data);
      } catch (error) {
        setOnlineConfig(null);
      }
    };

    fetchConfig();
  }, []);

  useEffect(() => {
    if (!onlineConfig?.enabled) return;
    let timer: number | undefined;

    const fetchOnlineUsers = async () => {
      try {
        const response = await fetch("/api/online-users", {
          cache: "no-store",
        });
        if (!response.ok) return;
        const data = await response.json();
        setOnlineCount(Number(data.count || 0));
        setOnlineUsers(Array.isArray(data.users) ? data.users : []);
      } catch (error) {
        setOnlineCount(0);
        setOnlineUsers([]);
      }
    };

    fetchOnlineUsers();

    if (onlineConfig.refreshSeconds > 0) {
      timer = window.setInterval(
        fetchOnlineUsers,
        onlineConfig.refreshSeconds * 1000
      );
    }

    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [onlineConfig?.enabled, onlineConfig?.refreshSeconds]);

  return (
    <div className="navbar contenedor text-white relative ">
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
          {onlineConfig?.enabled && (
            <div className="relative flex items-center">
              <button
                type="button"
                className="category-link font-serif flex items-center gap-2"
                onClick={() => setOnlineOpen((prev) => !prev)}
              >
                <span>{onlineConfig.label || t("navbar.connected-users")}</span>
                {onlineConfig.showCount && (
                  <span className="text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full">
                    {onlineCount}
                  </span>
                )}
                {onlineConfig.showList && (
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      onlineOpen ? "rotate-180" : ""
                    }`}
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
                )}
              </button>
              {onlineConfig.showList && onlineOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-56 bg-slate-900/95 border border-slate-700/60 rounded-lg shadow-xl z-[70]">
                  <div className="p-3 text-xs text-slate-300 uppercase tracking-wide border-b border-slate-700/60">
                    {t("navbar.connected-users")}
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {onlineUsers.length === 0 ? (
                      <div className="px-3 py-3 text-sm text-slate-400">
                        {t("navbar.connected-users-empty")}
                      </div>
                    ) : (
                      onlineUsers.map((name) => (
                        <div
                          key={name}
                          className="px-3 py-2 text-sm text-white border-b border-slate-800 last:border-none"
                        >
                          {name}
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-3 border-t border-slate-700/60">
                    <Link
                      className="block w-full text-center text-sm font-semibold bg-slate-800/70 hover:bg-slate-800 text-white rounded-lg py-2 transition-all"
                      href="/online-users"
                      onClick={() => setOnlineOpen(false)}
                    >
                      {t("navbar.view-all")}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>

      <div className="auth relative">
        <NavbarAuth />
      </div>
    </div>
  );
};

export default Navbar;

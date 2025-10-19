import { webProps } from "@/constants/configs";
import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const NavbarMinimalist = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="relative w-full py-6 px-4">
      {/* Fondo con gradiente sutil */}
      <div className="absolute inset-0 bg-gradient-to-r  backdrop-blur-sm"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo y nombre */}
          <Link
            className="group flex items-center space-x-4 select-none transition-all duration-300 hover:scale-105"
            href="/"
          >
            <div className="relative">
              <img
                className="w-16 h-16 object-contain transition-all duration-300 "
                src={webProps.logo}
                alt="LogoServer"
              />
              {/* Efecto de brillo sutil */}
              <div className="absolute inset-0 bg-gradient-to-r from-gaming-primary-main/20 via-transparent to-gaming-secondary-main/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white group-hover:text-gaming-primary-light transition-colors duration-300">
                {webProps.serverName}
              </h1>
              <div className="h-0.5 bg-gradient-to-r from-gaming-primary-main to-gaming-secondary-main w-0 group-hover:w-full transition-all duration-500"></div>
            </div>
          </Link>

          {/* Botón móvil mejorado */}
          <button
            className="md:hidden relative w-12 h-12 bg-slate-700/50 rounded-xl flex items-center justify-center text-white hover:bg-slate-600/50 transition-all duration-300 hover:scale-110"
            onClick={toggleMenu}
          >
            <div className="w-6 h-6 flex flex-col justify-center space-y-1">
              <span
                className={`block h-0.5 bg-white transition-all duration-300 ${
                  isMenuOpen ? "rotate-45 translate-y-1.5" : ""
                }`}
              ></span>
              <span
                className={`block h-0.5 bg-white transition-all duration-300 ${
                  isMenuOpen ? "opacity-0" : ""
                }`}
              ></span>
              <span
                className={`block h-0.5 bg-white transition-all duration-300 ${
                  isMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
                }`}
              ></span>
            </div>
          </button>

          {/* Navegación desktop */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              className="group relative px-4 py-2 text-white hover:text-gaming-primary-light transition-all duration-300 font-medium rounded-lg hover:bg-gaming-primary-main/10"
              href="/"
            >
              <span className="relative z-10">
                {t("navbar-minimalist.sections.position-one")}
              </span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-gaming-primary-main to-gaming-secondary-main group-hover:w-full transition-all duration-300"></div>
            </Link>
            <Link
              className="group relative px-4 py-2 text-white hover:text-gaming-primary-light transition-all duration-300 font-medium rounded-lg hover:bg-gaming-primary-main/10"
              href="/guild"
            >
              <span className="relative z-10">
                {t("navbar-minimalist.sections.position-two")}
              </span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-gaming-primary-main to-gaming-secondary-main group-hover:w-full transition-all duration-300"></div>
            </Link>
            <Link
              className="group relative px-4 py-2 text-white hover:text-gaming-primary-light transition-all duration-300 font-medium rounded-lg hover:bg-gaming-primary-main/10"
              href="/bank"
            >
              <span className="relative z-10">
                {t("navbar-minimalist.sections.position-three")}
              </span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-gaming-primary-main to-gaming-secondary-main group-hover:w-full transition-all duration-300"></div>
            </Link>
            <Link
              className="group relative px-4 py-2 text-white hover:text-gaming-primary-light transition-all duration-300 font-medium rounded-lg hover:bg-gaming-primary-main/10"
              href="/store"
            >
              <span className="relative z-10">
                {t("navbar-minimalist.sections.position-four")}
              </span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-gaming-primary-main to-gaming-secondary-main group-hover:w-full transition-all duration-300"></div>
            </Link>
            <Link
              className="group relative px-4 py-2 text-white hover:text-gaming-primary-light transition-all duration-300 font-medium rounded-lg hover:bg-gaming-primary-main/10"
              href="/news"
            >
              <span className="relative z-10">
                {t("navbar-minimalist.sections.position-five")}
              </span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-gaming-primary-main to-gaming-secondary-main group-hover:w-full transition-all duration-300"></div>
            </Link>
            <Link
              className="group relative px-4 py-2 text-white hover:text-gaming-primary-light transition-all duration-300 font-medium rounded-lg hover:bg-gaming-primary-main/10"
              href="/help"
            >
              <span className="relative z-10">
                {t("navbar-minimalist.sections.position-six")}
              </span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-gaming-primary-main to-gaming-secondary-main group-hover:w-full transition-all duration-300"></div>
            </Link>
          </nav>
        </div>

        {/* Navegación móvil */}
        <nav
          className={`md:hidden absolute top-full left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gaming-primary-main/30 transition-all duration-300 ${
            isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        >
          <div className="px-4 py-6 space-y-2">
            <Link
              className="group flex items-center px-4 py-3 text-white hover:text-gaming-primary-light hover:bg-gaming-primary-main/10 rounded-lg transition-all duration-300 font-medium"
              href="/"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="relative z-10">
                {t("navbar-minimalist.sections.position-one")}
              </span>
              <div className="absolute left-0 w-0 h-0.5 bg-gradient-to-r from-gaming-primary-main to-gaming-secondary-main group-hover:w-full transition-all duration-300"></div>
            </Link>
            <Link
              className="group flex items-center px-4 py-3 text-white hover:text-gaming-primary-light hover:bg-gaming-primary-main/10 rounded-lg transition-all duration-300 font-medium"
              href="/guild"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="relative z-10">
                {t("navbar-minimalist.sections.position-two")}
              </span>
              <div className="absolute left-0 w-0 h-0.5 bg-gradient-to-r from-gaming-primary-main to-gaming-secondary-main group-hover:w-full transition-all duration-300"></div>
            </Link>
            <Link
              className="group flex items-center px-4 py-3 text-white hover:text-gaming-primary-light hover:bg-gaming-primary-main/10 rounded-lg transition-all duration-300 font-medium"
              href="/bank"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="relative z-10">
                {t("navbar-minimalist.sections.position-three")}
              </span>
              <div className="absolute left-0 w-0 h-0.5 bg-gradient-to-r from-gaming-primary-main to-gaming-secondary-main group-hover:w-full transition-all duration-300"></div>
            </Link>
            <Link
              className="group flex items-center px-4 py-3 text-white hover:text-gaming-primary-light hover:bg-gaming-primary-main/10 rounded-lg transition-all duration-300 font-medium"
              href="/store"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="relative z-10">
                {t("navbar-minimalist.sections.position-four")}
              </span>
              <div className="absolute left-0 w-0 h-0.5 bg-gradient-to-r from-gaming-primary-main to-gaming-secondary-main group-hover:w-full transition-all duration-300"></div>
            </Link>
            <Link
              className="group flex items-center px-4 py-3 text-white hover:text-gaming-primary-light hover:bg-gaming-primary-main/10 rounded-lg transition-all duration-300 font-medium"
              href="/news"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="relative z-10">
                {t("navbar-minimalist.sections.position-five")}
              </span>
              <div className="absolute left-0 w-0 h-0.5 bg-gradient-to-r from-gaming-primary-main to-gaming-secondary-main group-hover:w-full transition-all duration-300"></div>
            </Link>
            <Link
              className="group flex items-center px-4 py-3 text-white hover:text-gaming-primary-light hover:bg-gaming-primary-main/10 rounded-lg transition-all duration-300 font-medium"
              href="/help"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="relative z-10">
                {t("navbar-minimalist.sections.position-six")}
              </span>
              <div className="absolute left-0 w-0 h-0.5 bg-gradient-to-r from-gaming-primary-main to-gaming-secondary-main group-hover:w-full transition-all duration-300"></div>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default NavbarMinimalist;

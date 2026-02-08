import { getAmountWallet, getAmountWalletVoting } from "@/api/wallet";
import { useUserContext } from "@/context/UserContext";
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "../utilities/loading-spinner";
import { webProps } from "@/constants/configs";

const NavbarAuthenticated = () => {
  const [isLoading, setIsLoading] = useState(true);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, clearUserData } = useUserContext();
  const router = useRouter();
  const [avatar, setAvatar] = useState("");
  const [loggin, setLoggin] = useState(false);
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [walletAmount, setWalletAmount] = useState(0);
  const [walletAmountVoting, setWalletAmountVoting] = useState(0);

  const token = Cookies.get("token");

  const toggleNotificationsModal = () => {
    setIsNotificationsOpen((prev) => !prev);
  };

  useEffect(() => {
    setAvatar(user.avatar);
    setIsLoading(false);
    setLoggin(user.logged_in);
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[77px] w-[200px] mx-auto">
        <LoadingSpinner />
      </div>
    );
  }

  const fetchWalletAmount = async () => {
    if (!user.logged_in || !token) return;

    try {
      const [amount, votes] = await Promise.all([
        getAmountWallet(token),
        getAmountWalletVoting(token),
      ]);

      setWalletAmount(amount);
      setWalletAmountVoting(votes);
    } catch (error) {
      setWalletAmount(0);
      setWalletAmountVoting(0);
    }
  };

  const toggleWalletModal = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchWalletAmount();
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleLogout = () => {
    clearUserData();
    router.push("/");
  };
  const formatNumber = (num: number) => {
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(1) + "M";
    }
    if (num >= 1_000) {
      return (num / 1_000).toFixed(1) + "K";
    }
    return num.toString();
  };
  return (
    <nav className="bg-midnight mt-10">
      <div className="mx-auto max-w-9xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 sm:h-24 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <button
              type="button"
              className="relative inline-flex items-center justify-center rounded-xl p-3 text-white hover:bg-purple-400/20 hover:text-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:ring-offset-2 focus:ring-offset-midnight transition-all duration-300"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
              onClick={toggleMobileMenu}
            >
              <span className="absolute  -inset-0.5"></span>
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isMobileMenuOpen ? "hidden" : "block"} h-12 w-12`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
              <svg
                className={`${isMobileMenuOpen ? "block" : "hidden"} h-6 w-6`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          {isMobileMenuOpen && (
            <div
              id="mobile-menu"
              className="absolute top-16 sm:top-24 left-0 w-full bg-gaming-base-main/95 backdrop-blur-xl border border-gaming-base-light/30 rounded-2xl mx-4 shadow-2xl z-50"
            >
              <ul className="space-y-1 py-6 px-6">
                <li>
                  <Link
                    href="/"
                    className="block rounded-xl px-6 py-4 text-lg font-semibold text-white hover:text-amber-500 hover:bg-gradient-to-br hover:from-purple-500/10 hover:to-amber-500/10 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 relative group"
                  >
                    <span className="relative z-10">
                      {t("navbar_authenticated.sections.position-one")}
                    </span>
                    <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-amber-500 transform -translate-x-1/2 group-hover:w-full transition-all duration-300"></div>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/guild"
                    className="block rounded-xl px-6 py-4 text-lg font-semibold text-white hover:text-amber-500 hover:bg-gradient-to-br hover:from-purple-500/10 hover:to-amber-500/10 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 relative group"
                  >
                    <span className="relative z-10">
                      {t("navbar_authenticated.sections.position-two")}
                    </span>
                    <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-amber-500 transform -translate-x-1/2 group-hover:w-full transition-all duration-300"></div>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/news"
                    className="block rounded-xl px-6 py-4 text-lg font-semibold text-white hover:text-amber-500 hover:bg-gradient-to-br hover:from-purple-500/10 hover:to-amber-500/10 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 relative group"
                  >
                    <span className="relative z-10">
                      {t("navbar_authenticated.sections.position-three")}
                    </span>
                    <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-amber-500 transform -translate-x-1/2 group-hover:w-full transition-all duration-300"></div>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/bank"
                    className="block rounded-xl px-6 py-4 text-lg font-semibold text-white hover:text-amber-500 hover:bg-gradient-to-br hover:from-purple-500/10 hover:to-amber-500/10 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 relative group"
                  >
                    <span className="relative z-10">
                      {t("navbar_authenticated.sections.position-four")}
                    </span>
                    <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-amber-500 transform -translate-x-1/2 group-hover:w-full transition-all duration-300"></div>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/store"
                    className="block rounded-xl px-6 py-4 text-lg font-semibold text-white hover:text-amber-500 hover:bg-gradient-to-br hover:from-purple-500/10 hover:to-amber-500/10 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 relative group"
                  >
                    <span className="relative z-10">
                      {t("navbar_authenticated.sections.position-five")}
                    </span>
                    <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-amber-500 transform -translate-x-1/2 group-hover:w-full transition-all duration-300"></div>
                  </Link>
                </li>
              </ul>
            </div>
          )}
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start select-none">
            <a
              className="flex flex-shrink-0 items-center cursor-pointer"
              href="/"
            >
              <div className="relative flex items-center">
                <img
                  className="w-16 h-16 sm:w-24 sm:h-24"
                  src={webProps.logo}
                  alt="LogoServer"
                />
              </div>
              <p className="text-white ml-3 sm:ml-6 title-server text-xl sm:text-3xl font-bold flex items-center">
                {webProps.serverName}
              </p>
            </a>
            <div className="hidden sm:ml-8 sm:block sm:flex sm:items-center">
              <div className="flex space-x-1">
                <Link
                  className="group relative rounded-xl px-6 py-4 text-xl font-bold text-white hover:text-amber-500 transition-all duration-300 hover:bg-gradient-to-br hover:from-purple-500/10 hover:to-amber-500/10 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/30"
                  href="/"
                >
                  <span className="relative z-10">
                    {t("navbar_authenticated.sections.position-one")}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-amber-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-amber-500 transform -translate-x-1/2 group-hover:w-full transition-all duration-300"></div>
                </Link>
                <Link
                  className="group relative rounded-xl px-6 py-4 text-xl font-bold text-white hover:text-amber-500 transition-all duration-300 hover:bg-gradient-to-br hover:from-purple-500/10 hover:to-amber-500/10 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/30"
                  href="/guild"
                >
                  <span className="relative z-10">
                    {t("navbar_authenticated.sections.position-two")}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-amber-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-amber-500 transform -translate-x-1/2 group-hover:w-full transition-all duration-300"></div>
                </Link>
                <Link
                  className="group relative rounded-xl px-6 py-4 text-xl font-bold text-white hover:text-amber-500 transition-all duration-300 hover:bg-gradient-to-br hover:from-purple-500/10 hover:to-amber-500/10 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/30"
                  href="/news"
                >
                  <span className="relative z-10">
                    {t("navbar_authenticated.sections.position-three")}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-amber-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-amber-500 transform -translate-x-1/2 group-hover:w-full transition-all duration-300"></div>
                </Link>
                <Link
                  className="group relative rounded-xl px-6 py-4 text-xl font-bold text-white hover:text-amber-500 transition-all duration-300 hover:bg-gradient-to-br hover:from-purple-500/10 hover:to-amber-500/10 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/30"
                  href="/bank"
                >
                  <span className="relative z-10">
                    {t("navbar_authenticated.sections.position-four")}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-amber-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-amber-500 transform -translate-x-1/2 group-hover:w-full transition-all duration-300"></div>
                </Link>
                <Link
                  className="group relative rounded-xl px-6 py-4 text-xl font-bold text-white hover:text-amber-500 transition-all duration-300 hover:bg-gradient-to-br hover:from-purple-500/10 hover:to-amber-500/10 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/30"
                  href="/store"
                >
                  <span className="relative z-10">
                    {t("navbar_authenticated.sections.position-five")}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-amber-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-amber-500 transform -translate-x-1/2 group-hover:w-full transition-all duration-300"></div>
                </Link>
              </div>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {/* Botón wallet: icono compacto, detalle en modal */}
            <button
              type="button"
              onClick={toggleWalletModal}
              className="relative rounded-2xl bg-slate-700/80 hover:bg-slate-600/90 border border-slate-600 backdrop-blur-sm p-2 sm:p-3 text-slate-200 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-midnight mr-2 sm:mr-3"
              aria-label={t("navbar_authenticated.wallet.title")}
              aria-expanded={isOpen}
            >
              <svg
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3"
                />
              </svg>
            </button>

            {/* Modal de saldo (puntos donación + votación) */}
            {isOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                  aria-hidden="true"
                  onClick={toggleWalletModal}
                />
                <div
                  className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-slate-800 border border-slate-600 shadow-2xl mx-4"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="wallet-modal-title"
                >
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-600">
                    <h2 id="wallet-modal-title" className="text-lg font-semibold text-white">
                      {t("navbar_authenticated.wallet.detail")}
                    </h2>
                    <button
                      type="button"
                      onClick={toggleWalletModal}
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                      aria-label={t("navbar_authenticated.notifications.close")}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-700/50 border border-slate-600">
                      <span className="text-sm font-medium text-slate-300">
                        {t("navbar_authenticated.wallet.available")}
                      </span>
                      <span className="text-xl font-bold text-emerald-400 tabular-nums">
                        {formatNumber(walletAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-700/50 border border-slate-600">
                      <span className="text-sm font-medium text-slate-300">
                        {t("navbar_authenticated.wallet.votes")}
                      </span>
                      <span className="text-xl font-bold text-amber-400 tabular-nums">
                        {formatNumber(walletAmountVoting)}
                      </span>
                    </div>
                    <Link
                      href="/store"
                      onClick={toggleWalletModal}
                      className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-gaming-primary-main to-gaming-primary-dark hover:from-gaming-primary-light hover:to-gaming-primary-main text-white font-semibold border border-gaming-primary-main/30 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      {t("navbar_authenticated.wallet.recharge")}
                    </Link>
                  </div>
                </div>
              </>
            )}

            <button
              type="button"
              onClick={toggleNotificationsModal}
              className="relative rounded-2xl bg-slate-700/80 hover:bg-slate-600/90 border border-slate-600 backdrop-blur-sm p-2 sm:p-3 text-slate-200 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-midnight"
              aria-label={t("navbar_authenticated.notifications.title")}
              aria-expanded={isNotificationsOpen}
            >
              <svg
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                />
              </svg>
            </button>

            {/* Modal de notificaciones */}
            {isNotificationsOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                  aria-hidden="true"
                  onClick={toggleNotificationsModal}
                />
                <div
                  className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-slate-800 border border-slate-600 shadow-2xl mx-4 max-h-[85vh] flex flex-col"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="notifications-title"
                >
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-600">
                    <h2 id="notifications-title" className="text-lg font-semibold text-white">
                      {t("navbar_authenticated.notifications.title")}
                    </h2>
                    <button
                      type="button"
                      onClick={toggleNotificationsModal}
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                      aria-label={t("navbar_authenticated.notifications.close")}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="overflow-y-auto p-4 space-y-3">
                    <div className="flex gap-3 p-4 rounded-xl bg-slate-700/50 border border-slate-600">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center">
                        <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white">{t("navbar_authenticated.notifications.welcomeTitle")}</p>
                        <p className="text-sm text-slate-400 mt-0.5">{t("navbar_authenticated.notifications.welcomeDescription")}</p>
                      </div>
                    </div>
                  </div>
                  {false && (
                    <div className="px-5 py-4 border-t border-slate-600 text-center text-slate-400 text-sm">
                      {t("navbar_authenticated.notifications.empty")}
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="relative ml-2 sm:ml-5 z-50">
              <div>
                <button
                  type="button"
                  className="group relative flex rounded-full bg-transparent overflow-hidden text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:ring-offset-2 focus:ring-offset-midnight transition-all duration-300"
                  id="user-menu-button"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                  onClick={toggleUserMenu}
                >
                  <span className="sr-only">Open user menu</span>
                  {loggin ? (
                    <img
                      className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl object-cover"
                      src={avatar}
                      alt="Icon profile"
                    />
                  ) : (
                    <img
                      className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl object-cover"
                      src={webProps.logo}
                      alt="WowLibre Logo"
                    />
                  )}
                </button>
              </div>
              {isUserMenuOpen && (
                <div
                  className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-2xl 
               bg-gray-800 backdrop-blur-xl
               shadow-2xl focus:outline-none 
               border border-gray-600"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu-button"
                >
                  {loggin ? (
                    <div className="py-2">
                      <Link
                        href="/profile"
                        className="block px-6 py-4 text-lg font-semibold text-white hover:text-amber-500 hover:bg-gradient-to-br hover:from-purple-500/10 hover:to-amber-500/10 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 rounded-xl mx-2 relative group"
                        role="menuitem"
                        id="user-menu-item-0"
                      >
                        <span className="relative z-10">
                          {t(
                            "navbar_authenticated.menu.logged-in.position-one"
                          )}
                        </span>
                        <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-amber-500 transform -translate-x-1/2 group-hover:w-full transition-all duration-300"></div>
                      </Link>
                      <Link
                        href="/accounts"
                        className="block px-6 py-4 text-lg font-semibold text-white hover:text-amber-500 hover:bg-gradient-to-br hover:from-purple-500/10 hover:to-amber-500/10 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 rounded-xl mx-2 relative group"
                        role="menuitem"
                        id="user-menu-item-1"
                      >
                        <span className="relative z-10">
                          {t(
                            "navbar_authenticated.menu.logged-in.position-two"
                          )}
                        </span>
                        <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-amber-500 transform -translate-x-1/2 group-hover:w-full transition-all duration-300"></div>
                      </Link>
                      {user.is_admin && (
                        <Link
                          href="/realms"
                          className="block px-6 py-4 text-lg font-semibold text-white hover:text-amber-500 hover:bg-gradient-to-br hover:from-purple-500/10 hover:to-amber-500/10 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 rounded-xl mx-2 relative group"
                          role="menuitem"
                          id="user-menu-item-2"
                        >
                          <span className="relative z-10">
                            {t(
                              "navbar_authenticated.menu.logged-in.position-four"
                            )}
                          </span>
                          <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-amber-500 transform -translate-x-1/2 group-hover:w-full transition-all duration-300"></div>
                        </Link>
                      )}
                      <a
                        href="#"
                        className="block px-6 py-4 text-lg font-semibold text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-300 rounded-xl mx-2"
                        role="menuitem"
                        id="user-menu-item-3"
                        onClick={handleLogout}
                      >
                        {t(
                          "navbar_authenticated.menu.logged-in.position-three"
                        )}
                      </a>
                    </div>
                  ) : (
                    <div className="py-2">
                      <Link
                        href="/login"
                        className="block px-6 py-4 text-lg font-semibold text-white hover:text-amber-500 hover:bg-gradient-to-br hover:from-purple-500/10 hover:to-amber-500/10 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 rounded-xl mx-2 relative group"
                        role="menuitem"
                        id="user-menu-item-0"
                      >
                        <span className="relative z-10">
                          {t(
                            "navbar_authenticated.menu.logged-out.position-one"
                          )}
                        </span>
                        <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-amber-500 transform -translate-x-1/2 group-hover:w-full transition-all duration-300"></div>
                      </Link>
                      <Link
                        href="/register"
                        className="block px-6 py-4 text-lg font-semibold text-white hover:text-amber-500 hover:bg-gradient-to-br hover:from-purple-500/10 hover:to-amber-500/10 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 rounded-xl mx-2 relative group"
                        role="menuitem"
                        id="user-menu-item-1"
                      >
                        <span className="relative z-10">
                          {t(
                            "navbar_authenticated.menu.logged-out.position-two"
                          )}
                        </span>
                        <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-amber-500 transform -translate-x-1/2 group-hover:w-full transition-all duration-300"></div>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavbarAuthenticated;

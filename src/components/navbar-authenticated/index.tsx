import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type NotificationItem,
} from "@/api/notifications";
import { getAmountWallet, getAmountWalletVoting } from "@/api/wallet";
import { useUserContext } from "@/context/UserContext";
import { WalletBalanceModal } from "@/features/wallet-balance";
import Cookies from "js-cookie";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "../utilities/loading-spinner";
import { webProps } from "@/constants/configs";

const USER_MENU_ITEM =
  "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-lg font-semibold text-slate-100 transition hover:bg-cyan-500/10 hover:text-cyan-200";

const UserMenuIcon = ({ d }: { d: string }) => (
  <svg
    className="h-5 w-5 shrink-0 text-cyan-300"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d={d}
    />
  </svg>
);

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
  const [walletLoading, setWalletLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const token = Cookies.get("token");

  const fetchNotifications = useCallback(
    async (unreadOnly = true) => {
      if (!token) return;
      setNotificationsLoading(true);
      try {
        const list = await getNotifications(token, unreadOnly);
        setNotifications(list);
        if (unreadOnly) setUnreadCount(list.length);
      } catch {
        setNotifications([]);
        setUnreadCount(0);
      } finally {
        setNotificationsLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    if (token && user.logged_in) {
      fetchNotifications(true);
    }
  }, [token, user.logged_in]);

  const toggleNotificationsModal = () => {
    if (!isNotificationsOpen && token) {
      fetchNotifications(true);
    }
    setIsNotificationsOpen((prev) => !prev);
  };

  const handleMarkAsRead = async (id: number) => {
    if (!token) return;
    try {
      await markNotificationAsRead(token, id);
      setNotifications((prev) => prev.filter((n) => Number(n.id) !== id));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error al marcar notificación como leída:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!token) return;
    try {
      await markAllNotificationsAsRead(token);
      setNotifications([]);
      setUnreadCount(0);
    } catch {
      // keep list as is on error
    }
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

    setWalletLoading(true);
    try {
      const [amount, votes] = await Promise.all([
        getAmountWallet(token),
        getAmountWalletVoting(token),
      ]);

      setWalletAmount(amount);
      setWalletAmountVoting(votes);
    } catch (error) {
      console.error("Error al obtener saldo de billetera:", error);
      setWalletAmount(0);
      setWalletAmountVoting(0);
    } finally {
      setWalletLoading(false);
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
    setIsUserMenuOpen((open) => {
      if (!open) setIsNotificationsOpen(false);
      return !open;
    });
  };

  const closeUserMenu = () => setIsUserMenuOpen(false);

  const handleLogout = () => {
    closeUserMenu();
    clearUserData();
    router.push("/");
  };

  const navClassName =
    "pt-10 bg-transparent border-b border-cyan-500/20 bg-slate-950/70 ";

  return (
    <nav className={`relative z-[120] ${navClassName}`}>
      <div className="mx-auto max-w-9xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-[5.6rem] w-full items-center sm:h-24">
          <div className="relative z-20 flex items-center sm:hidden">
            <button
              type="button"
              className="relative inline-flex items-center justify-center rounded-xl p-[0.6rem] text-white hover:bg-purple-400/20 hover:text-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:ring-offset-2 focus:ring-offset-midnight transition-all duration-300"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
              onClick={toggleMobileMenu}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isMobileMenuOpen ? "hidden" : "block"} h-[3.2rem] w-[3.2rem]`}
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
                className={`${isMobileMenuOpen ? "block" : "hidden"} h-[3rem] w-[3rem]`}
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
          <a
            className="hidden cursor-pointer items-center select-none sm:flex"
            href="/"
          >
            <Image
              className="h-14 w-14 sm:h-24 sm:w-24"
              src={webProps.logo}
              alt="LogoServer"
              width={96}
              height={96}
              priority
            />
            <p className="title-server ml-2 hidden truncate text-xl font-bold text-white sm:ml-6 sm:block sm:text-3xl">
              {webProps.serverName}
            </p>
          </a>
          {isMobileMenuOpen && (
            <div
              id="mobile-menu"
              className="absolute top-[5.6rem] left-0 z-[70] mx-4 w-[calc(100%-2rem)] rounded-2xl border border-gaming-base-light/30 bg-gaming-base-main/95 shadow-2xl backdrop-blur-xl sm:top-24"
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
                    href="/armory"
                    className="block rounded-xl px-6 py-4 text-lg font-semibold text-white hover:text-amber-500 hover:bg-gradient-to-br hover:from-purple-500/10 hover:to-amber-500/10 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 relative group"
                  >
                    <span className="relative z-10">{t("armory.title")}</span>
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
                    href="/store"
                    className="block rounded-xl px-6 py-4 text-lg font-semibold text-white hover:text-amber-500 hover:bg-gradient-to-br hover:from-purple-500/10 hover:to-amber-500/10 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 relative group"
                  >
                    <span className="relative z-10">
                      {t("navbar_authenticated.sections.position-five")}
                    </span>
                    <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-amber-500 transform -translate-x-1/2 group-hover:w-full transition-all duration-300"></div>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/development"
                    className="block rounded-xl px-6 py-4 text-lg font-semibold text-white hover:text-amber-500 hover:bg-gradient-to-br hover:from-purple-500/10 hover:to-amber-500/10 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 relative group"
                  >
                    <span className="relative z-10">
                      {t("navbar_authenticated.sections.development")}
                    </span>
                    <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-amber-500 transform -translate-x-1/2 group-hover:w-full transition-all duration-300"></div>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/help"
                    className="block rounded-xl px-6 py-4 text-lg font-semibold text-white hover:text-amber-500 hover:bg-gradient-to-br hover:from-purple-500/10 hover:to-amber-500/10 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 relative group"
                  >
                    <span className="relative z-10">
                      {t("navbar_authenticated.sections.help")}
                    </span>
                    <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-amber-500 transform -translate-x-1/2 group-hover:w-full transition-all duration-300"></div>
                  </Link>
                </li>
              </ul>
            </div>
          )}
          <div className="hidden sm:ml-8 sm:flex sm:flex-1 sm:items-center">
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
                  href="/armory"
                >
                  <span className="relative z-10">{t("armory.title")}</span>
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
                  href="/store"
                >
                  <span className="relative z-10">
                    {t("navbar_authenticated.sections.position-five")}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-amber-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-amber-500 transform -translate-x-1/2 group-hover:w-full transition-all duration-300"></div>
                </Link>
                <Link
                  className="group relative rounded-xl px-6 py-4 text-xl font-bold text-white hover:text-amber-500 transition-all duration-300 hover:bg-gradient-to-br hover:from-purple-500/10 hover:to-amber-500/10 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/30"
                  href="/development"
                >
                  <span className="relative z-10">
                    {t("navbar_authenticated.sections.development")}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-amber-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-amber-500 transform -translate-x-1/2 group-hover:w-full transition-all duration-300"></div>
                </Link>
                <Link
                  className="group relative rounded-xl px-6 py-4 text-xl font-bold text-white hover:text-amber-500 transition-all duration-300 hover:bg-gradient-to-br hover:from-purple-500/10 hover:to-amber-500/10 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/30"
                  href="/help"
                >
                  <span className="relative z-10">
                    {t("navbar_authenticated.sections.help")}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-amber-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-amber-500 transform -translate-x-1/2 group-hover:w-full transition-all duration-300"></div>
                </Link>
              </div>
            </div>
          <div className="relative z-20 ml-auto flex items-center justify-end sm:ml-6">
            {/* Botón wallet: icono compacto, detalle en modal */}
            <button
              type="button"
              onClick={toggleWalletModal}
              className="relative mr-[0.6rem] rounded-2xl border border-slate-600 bg-slate-700/80 p-[0.7rem] text-slate-200 backdrop-blur-sm transition-all duration-200 hover:bg-slate-600/90 hover:text-white focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-midnight sm:mr-3 sm:p-3"
              aria-label={t("navbar_authenticated.wallet.title")}
              aria-expanded={isOpen}
            >
              <svg
                className="h-[2.6rem] w-[2.6rem] sm:h-8 sm:w-8"
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

            <WalletBalanceModal
              isOpen={isOpen}
              onClose={toggleWalletModal}
              loading={walletLoading}
              donationBalance={walletAmount}
              votingBalance={walletAmountVoting}
            />

            <button
              type="button"
              onClick={toggleNotificationsModal}
              className="relative rounded-2xl border border-slate-600 bg-slate-700/80 p-[0.7rem] text-slate-200 backdrop-blur-sm transition-all duration-200 hover:bg-slate-600/90 hover:text-white focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-midnight sm:p-3"
              aria-label={t("navbar_authenticated.notifications.title")}
              aria-expanded={isNotificationsOpen}
            >
              <svg
                className="h-[2.6rem] w-[2.6rem] sm:h-8 sm:w-8"
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
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-amber-500 px-1.5 text-xs font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {/* Modal de notificaciones */}
            {isNotificationsOpen && (
              <>
                <div
                  className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm"
                  aria-hidden="true"
                  onClick={toggleNotificationsModal}
                />
                <div
                  className="fixed left-1/2 top-1/2 z-[90] mx-2 flex max-h-[92vh] w-[min(96vw,48rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-3xl border border-slate-600/90 bg-slate-900/95 shadow-[0_24px_80px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:mx-4"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="notifications-title"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="border-b border-slate-700/90 bg-gradient-to-b from-slate-800/60 to-slate-900/20 px-6 py-5 sm:px-7">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2
                          id="notifications-title"
                          className="text-xl font-semibold text-white sm:text-2xl"
                        >
                          {t("navbar_authenticated.notifications.title")}
                        </h2>
                        <p className="mt-1 text-sm text-slate-400">
                          {unreadCount} pendiente{unreadCount === 1 ? "" : "s"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={toggleNotificationsModal}
                        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-700/80 hover:text-white"
                        aria-label={t(
                          "navbar_authenticated.notifications.close",
                        )}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
                    {notificationsLoading ? (
                      <div className="flex min-h-[14rem] items-center justify-center">
                        <LoadingSpinner />
                      </div>
                    ) : notifications.length > 0 ? (
                      <>
                        <div className="mb-3 flex justify-end">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAllAsRead();
                            }}
                            className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-sm font-medium text-cyan-300 transition hover:border-cyan-400/50 hover:bg-cyan-500/20 hover:text-cyan-200"
                          >
                            {t(
                              "navbar_authenticated.notifications.markAllRead",
                            )}
                          </button>
                        </div>
                        <div className="space-y-3">
                          {notifications.map((n) => (
                            <div
                              key={n.id}
                              role="button"
                              tabIndex={0}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(Number(n.id));
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  handleMarkAsRead(Number(n.id));
                                }
                              }}
                              className="cursor-pointer rounded-2xl border border-slate-700/90 bg-slate-800/65 p-4 text-left transition-all hover:border-slate-500 hover:bg-slate-800/90 sm:p-5"
                            >
                              <div className="flex gap-3.5 sm:gap-4">
                                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-slate-700">
                                  <svg
                                    className="h-6 w-6 text-slate-300"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                    />
                                  </svg>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-base font-semibold leading-snug text-white sm:text-lg">
                                    {n.title}
                                  </p>
                                  {n.message && (
                                    <p className="mt-1.5 line-clamp-4 text-sm leading-relaxed text-slate-300 sm:text-base">
                                      {n.message}
                                    </p>
                                  )}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleMarkAsRead(Number(n.id));
                                    }}
                                    className="mt-3 text-left text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
                                  >
                                    {t(
                                      "navbar_authenticated.notifications.markAsRead",
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="px-5 py-14 text-center text-base text-slate-400">
                        {t("navbar_authenticated.notifications.empty")}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="relative z-[70] ml-[0.8rem] sm:ml-5">
              <button
                type="button"
                className={`relative flex overflow-hidden rounded-xl bg-transparent text-sm ring-2 transition focus:outline-none focus:ring-cyan-400/70 ${
                  isUserMenuOpen
                    ? "ring-cyan-400/70"
                    : "ring-cyan-500/25 hover:ring-cyan-400/50"
                }`}
                id="user-menu-button"
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
                onClick={toggleUserMenu}
              >
                <span className="sr-only">Open user menu</span>
                {loggin && avatar ? (
                  <Image
                    className="h-[3.8rem] w-[3.8rem] rounded-xl object-cover sm:h-16 sm:w-16"
                    src={avatar}
                    alt="Icon profile"
                    width={64}
                    height={64}
                  />
                ) : (
                  <Image
                    className="h-[3.8rem] w-[3.8rem] rounded-xl object-cover sm:h-16 sm:w-16"
                    src={webProps.logo}
                    alt="WowLibre Logo"
                    width={64}
                    height={64}
                  />
                )}
              </button>
              {isUserMenuOpen && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-[74] cursor-default bg-transparent"
                    aria-label="Cerrar menú"
                    onClick={closeUserMenu}
                  />
                  <div
                    className="absolute right-0 z-[75] mt-3 w-[19rem] overflow-hidden rounded-2xl border border-cyan-500/20 bg-slate-950/95 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.85)] backdrop-blur-xl"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                  >
                    {loggin ? (
                      <>
                        <div className="border-b border-cyan-500/15 px-4 py-4">
                          <p className="text-lg font-bold text-white">
                            {t("navbar_authenticated.menu.logged-in.heading")}
                          </p>
                          <p className="mt-0.5 text-sm text-slate-400">
                            {t("navbar_authenticated.menu.logged-in.heading-hint")}
                          </p>
                        </div>
                        <div className="space-y-1 p-2">
                          <Link
                            href="/profile"
                            className={USER_MENU_ITEM}
                            role="menuitem"
                            onClick={closeUserMenu}
                          >
                            <UserMenuIcon d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            {t(
                              "navbar_authenticated.menu.logged-in.position-one",
                            )}
                          </Link>
                          <Link
                            href="/accounts"
                            className={USER_MENU_ITEM}
                            role="menuitem"
                            onClick={closeUserMenu}
                          >
                            <UserMenuIcon d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            {t(
                              "navbar_authenticated.menu.logged-in.position-two",
                            )}
                          </Link>
                          {user.is_admin && (
                            <Link
                              href="/realms"
                              className={USER_MENU_ITEM}
                              role="menuitem"
                              onClick={closeUserMenu}
                            >
                              <UserMenuIcon d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                              {t(
                                "navbar_authenticated.menu.logged-in.position-four",
                              )}
                            </Link>
                          )}
                        </div>
                        <div className="border-t border-cyan-500/15 p-2">
                          <button
                            type="button"
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-lg font-semibold text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200"
                            role="menuitem"
                            onClick={handleLogout}
                          >
                            <svg
                              className="h-5 w-5 shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.8}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                              />
                            </svg>
                            {t(
                              "navbar_authenticated.menu.logged-in.position-three",
                            )}
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-1 p-2">
                        <Link
                          href="/login"
                          className={USER_MENU_ITEM}
                          role="menuitem"
                          onClick={closeUserMenu}
                        >
                          <UserMenuIcon d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                          {t(
                            "navbar_authenticated.menu.logged-out.position-one",
                          )}
                        </Link>
                        <Link
                          href="/register"
                          className={USER_MENU_ITEM}
                          role="menuitem"
                          onClick={closeUserMenu}
                        >
                          <UserMenuIcon d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                          {t(
                            "navbar_authenticated.menu.logged-out.position-two",
                          )}
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavbarAuthenticated;

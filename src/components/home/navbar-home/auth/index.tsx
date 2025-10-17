import LoadingSpinner from "@/components/utilities/loading-spinner";
import { useUserContext } from "@/context/UserContext";
import Cookies from "js-cookie";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DropDown from "../dropdown";

const NavbarAuth = () => {
  const { t } = useTranslation();
  const { user, clearUserData } = useUserContext();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const jwt = Cookies.get("token");

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  useEffect(() => {
    setIsLoggedIn(user.logged_in && jwt != null);
    setIsLoading(false);
  }, [user]);

  if (isLoading) {
    return (
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
    );
  }

  return (
    <nav className="flex pl-4 gap-9 relative">
      {!isLoggedIn && (
        <>
          <Link
            className="inline-block text-2xl text-white font-serif hover:text-yellow-400"
            href="/login"
          >
            {t("navbar.sections.position-six")}
          </Link>
          <Link
            className="inline-block text-2xl text-white font-serif hover:text-yellow-400"
            href="/register"
          >
            {t("navbar.sections.position-seven")}
          </Link>
        </>
      )}

      {isLoggedIn && (
        <>
          <Link
            className="inline-block text-2xl text-white font-serif auth-link"
            href="/profile/purchases"
          >
            {t("navbar.sections.position-eight")}
          </Link>
          <Link
            className="inline-block text-2xl text-white font-serif auth-link"
            href="https://t.me/wowlibreservers/129"
          >
            {t("navbar.sections.position-nine")}
          </Link>

          <button
            className="inline-block text-2xl text-white"
            onClick={toggleDropdown}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img
                src={user.avatar}
                alt="Profile-Img"
                className="w-full h-full object-cover"
              />
            </div>
          </button>
        </>
      )}

      {showDropdown && (
        <div className="absolute top-full mt-2 right-0">
          <DropDown user={user} clearUserData={clearUserData} />
        </div>
      )}
    </nav>
  );
};

export default NavbarAuth;

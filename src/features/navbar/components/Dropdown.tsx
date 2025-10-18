"use client";
import { UserModel } from "@/context/UserContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

interface UserContextProps {
  user: UserModel;
  clearUserData: () => void;
}

const Dropdown = ({ user, clearUserData }: UserContextProps) => {
  const router = useRouter();
  const { t } = useTranslation();

  const handleLogout = () => {
    clearUserData();
    router.push("/");
  };

  const isLoggedIn = user.logged_in;

  return (
    <div className="relative">
      {isLoggedIn && (
        <ul className="absolute w-72 sm:w-64 right-0 bg-midnight rounded-lg shadow-md py-8 sm:py-10 px-4 sm:px-5 box-shadow-server z-50">
          <li>
            <Link
              className="dropdown-link block px-5 py-3 mb-5 text-white text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-2xl font-serif"
              href="/profile"
            >
              {t("navbar.drop_down.profile")}
            </Link>
          </li>
          <li>
            <Link
              className="dropdown-link block px-5 py-3 mb-5 text-white text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-2xl font-serif"
              href="/accounts"
            >
              {t("navbar.drop_down.account")}
            </Link>
          </li>
          <li>
            <a
              onClick={handleLogout}
              className="dropdown-link block px-4 py-3 text-white cursor-pointer text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-2xl font-serif"
            >
              {t("navbar.drop_down.close")}
            </a>
          </li>
        </ul>
      )}
    </div>
  );
};

export default Dropdown;

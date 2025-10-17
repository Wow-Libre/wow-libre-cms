import { UserModel } from "@/context/UserContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

interface UserContextProps {
  user: UserModel;
  clearUserData: () => void;
}

const DropDown = ({ user, clearUserData }: UserContextProps) => {
  const router = useRouter();
  const { t } = useTranslation();

  const handleLogout = () => {
    clearUserData();
    router.push("/");
  };

  const isLoggedIn = user.logged_in;

  return (
    <div className="relative positionAbsolut ">
      {isLoggedIn && (
        <ul className="absolute w-64 right-0 bg-midnight rounded-lg shadow-md py-10 px-5 box-shadow-server">
          <li>
            <Link
              className="block px-5 py-2 mb-5 text-white hoover-text-yellow  text-sm  sm:text-2xl md:text-2xl lg:text-2xl xl:text-2xl font-serif"
              href="/profile"
            >
              {t("navbar.drop_down.profile")}
            </Link>
          </li>
          <li>
            <Link
              className="block px-5 py-2 mb-5 text-white hoover-text-yellow  text-sm  sm:text-2xl md:text-2xl lg:text-2xl xl:text-2xl font-serif"
              href="/accounts"
            >
              {t("navbar.drop_down.account")}
            </Link>
          </li>
          <li>
            <a
              onClick={handleLogout}
              className="block px-4 py-2 text-white hoover-text-yellow cursor-pointer text-sm sm:text-2xl md:text-2xl lg:text-2xl xl:text-2xl font-serif"
            >
              {t("navbar.drop_down.close")}
            </a>
          </li>
        </ul>
      )}
    </div>
  );
};

export default DropDown;

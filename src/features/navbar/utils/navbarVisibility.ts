import { NavbarVisibilityConfig } from "../types";

export const defaultNavbarConfig: NavbarVisibilityConfig = {
  pathsWithoutNavbar: ["/login", "/register", "/congrats", "/account"],
};

export const shouldShowNavbar = (
  pathname: string,
  config: NavbarVisibilityConfig = defaultNavbarConfig
): boolean => {
  const isPathExcluded =
    config.pathsWithoutNavbar.includes(pathname) ||
    config.pathsWithoutNavbar.some((path) => pathname.startsWith(path));

  return !isPathExcluded;
};

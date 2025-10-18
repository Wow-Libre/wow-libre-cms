"use client";

import { usePathname } from "next/navigation";
import {
  shouldShowNavbar,
  defaultNavbarConfig,
} from "../utils/navbarVisibility";
import { NavbarVisibilityConfig } from "../types";

export const useNavbarVisibility = (
  config?: Partial<NavbarVisibilityConfig>
) => {
  const pathname = usePathname();
  const mergedConfig = { ...defaultNavbarConfig, ...config };

  return {
    shouldShowNavbar: shouldShowNavbar(pathname, mergedConfig),
    pathname,
  };
};

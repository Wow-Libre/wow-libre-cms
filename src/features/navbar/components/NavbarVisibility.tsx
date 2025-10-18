"use client";

import Navbar from "./Navbar";
import { useNavbarVisibility } from "../hooks/useNavbarVisibility";
import { NavbarVisibilityProps } from "../types";

export const NavbarVisibility = ({ config }: NavbarVisibilityProps) => {
  const { shouldShowNavbar } = useNavbarVisibility(config);

  return shouldShowNavbar ? <Navbar /> : null;
};

"use client";

import Navbar from "@/components/home/navbar-home/navbar";
import { useNavbarVisibility } from "../hooks/useNavbarVisibility";
import { NavbarVisibilityProps } from "../types";

export const NavbarVisibility = ({ config }: NavbarVisibilityProps) => {
  const { shouldShowNavbar } = useNavbarVisibility(config);

  return shouldShowNavbar ? <Navbar /> : null;
};

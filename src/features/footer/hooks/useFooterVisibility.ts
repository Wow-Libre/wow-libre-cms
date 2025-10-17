"use client";

import { usePathname } from "next/navigation";
import {
  shouldShowFooter,
  defaultFooterConfig,
} from "../utils/footerVisibility";

export const useFooterVisibility = () => {
  const pathname = usePathname();
  const isVisible = shouldShowFooter(pathname, defaultFooterConfig);

  return {
    isVisible,
    pathname,
  };
};

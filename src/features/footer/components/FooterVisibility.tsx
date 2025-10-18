"use client";

import Footer from "@/components/footer";
import { useFooterVisibility } from "../hooks/useFooterVisibility";

const FooterVisibility = () => {
  const { isVisible } = useFooterVisibility();

  return isVisible ? <Footer /> : null;
};

export default FooterVisibility;

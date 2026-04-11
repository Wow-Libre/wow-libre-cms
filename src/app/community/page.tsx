"use client";

import NavbarAuthenticated from "@/components/navbar-authenticated";
import { SocialFeedPage } from "@/features/social-feed";
import useAuth from "@/hook/useAuth";
import { useTranslation } from "react-i18next";

export default function CommunityPage() {
  const { t } = useTranslation();
  useAuth(t("community.login_required"));

  return (
    <div className="">
      <div className="contenedor">
        <NavbarAuthenticated />
      </div>
      <SocialFeedPage />
    </div>
  );
}

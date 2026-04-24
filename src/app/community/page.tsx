"use client";

import NavbarAuthenticated from "@/components/navbar-authenticated";
import { SocialFeedPage } from "@/features/social-feed";
import useAuth from "@/hook/useAuth";
import { useTranslation } from "react-i18next";

const REGISTER_DECORATIVE_TREANT =
  "https://static.wixstatic.com/media/5dd8a0_a1d175976a834a9aa2db34adb6d87d02~mv2.png";

export default function CommunityPage() {
  const { t } = useTranslation();
  useAuth(t("community.login_required"));

  return (
    <div className="relative overflow-visible bg-midnight pb-16">
      <div className="pointer-events-none absolute inset-0 fire-embers-blue opacity-50" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(56,189,248,0.10),transparent_38%),radial-gradient(circle_at_82%_84%,rgba(14,165,233,0.08),transparent_40%)]" />
      <img
        src={REGISTER_DECORATIVE_TREANT}
        alt="Treant decorativo"
        className="accounts-decoration-animated pointer-events-none absolute bottom-0 right-4 z-[1] hidden w-[20rem] opacity-80 drop-shadow-[0_0_28px_rgba(56,189,248,0.35)] md:block lg:right-10 lg:w-[24rem] xl:right-16 xl:w-[28rem]"
      />
      <div className="contenedor relative z-30 mb-6">
        <NavbarAuthenticated />
      </div>
      <div className="relative z-10">
        <SocialFeedPage />
      </div>
    </div>
  );
}

"use client";

import ArmoryStatsLeaderboards from "@/features/armory/components/ArmoryStatsLeaderboards";
import NavbarAuthenticated from "@/components/navbar-authenticated";
import Link from "next/link";
import { useTranslation } from "react-i18next";

const REGISTER_DECORATIVE_TREANT =
  "https://static.wixstatic.com/media/5dd8a0_a1d175976a834a9aa2db34adb6d87d02~mv2.png";

export default function ArmoryStatsPage() {
  const { t } = useTranslation();

  return (
    <div className="relative overflow-visible bg-midnight pb-16">
      <div className="pointer-events-none absolute inset-0 fire-embers-blue opacity-50" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(56,189,248,0.10),transparent_38%),radial-gradient(circle_at_82%_84%,rgba(14,165,233,0.08),transparent_40%)]" />
      <img
        src={REGISTER_DECORATIVE_TREANT}
        alt=""
        className="accounts-decoration-animated pointer-events-none absolute bottom-0 right-4 z-[1] hidden w-[20rem] opacity-80 drop-shadow-[0_0_28px_rgba(56,189,248,0.35)] md:block lg:right-10 lg:w-[24rem] xl:right-16 xl:w-[28rem]"
      />
      <div className="contenedor relative z-30">
        <NavbarAuthenticated />
      </div>
      <div className="contenedor relative z-10 min-h-[70vh] pb-32 pt-24">
        <div className="mb-8 text-center">
          <Link
            href="/armory"
            className="mb-4 inline-flex items-center gap-1 text-sm text-cyan-300/80 transition hover:text-cyan-200"
          >
            ← {t("armory.backToSearch")}
          </Link>
          <h1 className="text-4xl font-bold text-white">{t("armory.leaderboards.title")}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-slate-300">
            {t("armory.leaderboards.subtitle")}
          </p>
        </div>
        <ArmoryStatsLeaderboards />
      </div>
    </div>
  );
}

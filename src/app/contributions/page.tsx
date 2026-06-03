"use client";

import NavbarAuthenticated from "@/components/navbar-authenticated";
import {
  CONTRIBUTIONS_DECORATIVE_TREANT,
  ContributionsClientsSection,
  ContributionsHero,
} from "@/features/contributions";

export default function ContributionsPage() {
  return (
    <div className="relative overflow-visible bg-midnight pb-16">
      <div className="pointer-events-none absolute inset-0 fire-embers-blue opacity-50" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(56,189,248,0.10),transparent_38%),radial-gradient(circle_at_82%_84%,rgba(14,165,233,0.08),transparent_40%)]" />
      <img
        src={CONTRIBUTIONS_DECORATIVE_TREANT}
        alt=""
        role="presentation"
        className="accounts-decoration-animated pointer-events-none absolute bottom-0 right-4 z-[1] hidden w-[20rem] opacity-80 drop-shadow-[0_0_28px_rgba(56,189,248,0.35)] md:block lg:right-10 lg:w-[24rem] xl:right-16 xl:w-[28rem]"
      />

      <div className="contenedor relative z-30 mb-6">
        <NavbarAuthenticated />
      </div>

      <main className="relative z-10 contenedor py-8 md:py-12">
        <div className="mx-auto max-w-[92rem] space-y-16 px-4 sm:px-6 lg:space-y-20 lg:px-10">
          <ContributionsHero />
          <ContributionsClientsSection />
        </div>
      </main>
    </div>
  );
}

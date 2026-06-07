"use client";

import { getArmoryProfile } from "@/features/armory";
import CharacterProfile from "@/features/armory/components/CharacterProfile";
import NavbarAuthenticated from "@/components/navbar-authenticated";
import WowheadTooltip from "@/utils/wowhead";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ArmoryCharacterProfile } from "@/features/armory/types/armory.types";

const REGISTER_DECORATIVE_TREANT =
  "https://static.wixstatic.com/media/5dd8a0_a1d175976a834a9aa2db34adb6d87d02~mv2.png";

export default function ArmoryProfilePage() {
  const { t } = useTranslation();
  const params = useParams();
  const searchParams = useSearchParams();
  const characterName = decodeURIComponent(String(params.name ?? ""));
  const realmId = searchParams.get("realm_id");
  const realm = searchParams.get("realm") ?? undefined;
  const expansionId = searchParams.get("expansion_id");

  const [profile, setProfile] = useState<ArmoryCharacterProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!characterName) return;
    setLoading(true);
    setError(null);
    getArmoryProfile(
      characterName,
      realmId ? Number(realmId) : undefined,
      realm,
      expansionId ? Number(expansionId) : undefined
    )
      .then(setProfile)
      .catch((err: Error) => {
        setProfile(null);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [characterName, realmId, realm, expansionId]);

  return (
    <div className="relative overflow-visible bg-midnight pb-16">
      <WowheadTooltip />
      <div className="pointer-events-none absolute inset-0 fire-embers-blue opacity-50" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(56,189,248,0.10),transparent_38%),radial-gradient(circle_at_82%_84%,rgba(14,165,233,0.08),transparent_40%)]" />
      <img
        src={REGISTER_DECORATIVE_TREANT}
        alt=""
        className="accounts-decoration-animated pointer-events-none absolute bottom-0 right-4 z-[1] hidden w-[20rem] opacity-80 md:block lg:right-10 lg:w-[24rem] xl:right-16 xl:w-[28rem]"
      />
      <div className="contenedor relative z-30">
        <NavbarAuthenticated />
      </div>
      <div className="contenedor relative z-10 pb-12 pt-24">
        {loading && (
          <p className="text-center text-slate-400">{t("armory.loading")}</p>
        )}
        {!loading && error && (
          <div className="mx-auto max-w-lg rounded-xl border border-red-500/30 bg-black/40 p-8 text-center">
            <h2 className="text-xl font-semibold text-red-300">
              {t("armory.notFound.title")}
            </h2>
            <p className="mt-2 text-slate-400">{t("armory.notFound.hint")}</p>
            <Link
              href="/armory"
              className="mt-4 inline-block text-cyan-300 hover:text-cyan-200"
            >
              ← {t("armory.backToSearch")}
            </Link>
          </div>
        )}
        {!loading && profile && <CharacterProfile profile={profile} />}
      </div>
    </div>
  );
}

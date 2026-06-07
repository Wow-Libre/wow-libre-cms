"use client";

import PaperDoll from "@/features/armory/components/PaperDoll";
import ArmoryAchievementsPanel from "@/features/armory/components/ArmoryAchievementsPanel";
import ArmoryTalentsPanel from "@/features/armory/components/ArmoryTalentsPanel";
import ArmoryReputationPanel from "@/features/armory/components/ArmoryReputationPanel";
import ArmoryPvpPanel from "@/features/armory/components/ArmoryPvpPanel";
import { CLASS_COLORS } from "@/features/armory/constants/equipmentSlots";
import type { ArmoryCharacterProfile } from "@/features/armory/types/armory.types";
import Link from "next/link";
import { useTranslation } from "react-i18next";

interface CharacterProfileProps {
  profile: ArmoryCharacterProfile;
}

function formatPlaytime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}

const CharacterProfile = ({ profile }: CharacterProfileProps) => {
  const { t } = useTranslation();
  const classColor = CLASS_COLORS[profile.class_id] ?? "#FFFFFF";
  const isOnline = profile.online === 1;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/25 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.12),transparent_40%)]" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Link
              href="/armory"
              className="mb-3 inline-flex text-sm text-cyan-300/80 transition hover:text-cyan-200"
            >
              ← {t("armory.backToSearch")}
            </Link>
            <h1
              className="text-3xl font-bold md:text-4xl"
              style={{ color: classColor }}
            >
              {profile.name}
            </h1>
            <p className="mt-1 text-lg text-slate-200">
              {t("armory.level")} {profile.level}{" "}
              <span className="text-slate-400">
                {profile.race} {profile.class}
              </span>
            </p>
            {profile.guild_name && (
              <p className="mt-1 text-amber-200/90">
                &lt;{profile.guild_name}&gt;
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                isOnline
                  ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/40"
                  : "bg-slate-700/50 text-slate-300 ring-1 ring-slate-500/40"
              }`}
            >
              {isOnline ? t("armory.online") : t("armory.offline")}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                profile.faction === "alliance"
                  ? "bg-blue-500/20 text-blue-200"
                  : profile.faction === "horde"
                    ? "bg-red-500/20 text-red-200"
                    : "bg-slate-600/40 text-slate-200"
              }`}
            >
              {profile.faction}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <PaperDoll profile={profile} />

        <aside className="space-y-4">
          <div className="rounded-xl border border-slate-700/60 bg-black/40 p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-cyan-300">
              {t("armory.stats.title")}
            </h2>
            <dl className="space-y-2 text-sm text-slate-300">
              <div className="flex justify-between">
                <dt>{t("armory.stats.health")}</dt>
                <dd>{profile.health?.toLocaleString() ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt>{t("armory.stats.power")}</dt>
                <dd>{profile.power1?.toLocaleString() ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt>{t("armory.stats.honorKills")}</dt>
                <dd>{profile.total_kills?.toLocaleString() ?? "0"}</dd>
              </div>
              {(profile.achievement_count ?? 0) > 0 && (
                <div className="flex justify-between">
                  <dt>{t("armory.achievements.title")}</dt>
                  <dd>{profile.achievement_count.toLocaleString()}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt>{t("armory.stats.playtime")}</dt>
                <dd>{formatPlaytime(profile.total_time ?? 0)}</dd>
              </div>
            </dl>
          </div>

          {profile.professions.length > 0 && (
            <div className="rounded-xl border border-slate-700/60 bg-black/40 p-4">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-cyan-300">
                {t("armory.professions.title")}
              </h2>
              <ul className="space-y-3">
                {profile.professions.map((prof) => (
                  <li key={prof.id} className="flex items-center gap-3">
                    <img
                      src={prof.logo}
                      alt={prof.name}
                      className="h-8 w-8 rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-slate-200">{prof.name}</p>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-amber-400/80"
                          style={{
                            width: `${Math.min(100, (prof.value / Math.max(prof.max, 1)) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ArmoryTalentsPanel
          groups={profile.talent_groups ?? []}
          classId={profile.class_id}
        />
        <ArmoryAchievementsPanel
          count={profile.achievement_count ?? 0}
          achievements={profile.achievements ?? []}
        />
      </div>

      <ArmoryPvpPanel
        totalKills={profile.total_kills ?? 0}
        brackets={profile.pvp_brackets ?? []}
      />

      <ArmoryReputationPanel reputations={profile.reputations ?? []} />
    </div>
  );
};

export default CharacterProfile;

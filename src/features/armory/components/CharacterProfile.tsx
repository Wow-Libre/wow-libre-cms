"use client";

import ArmoryCharacterDetailsPanel from "@/features/armory/components/ArmoryCharacterDetailsPanel";
import PaperDoll from "@/features/armory/components/PaperDoll";
import ArmoryAchievementsPanel from "@/features/armory/components/ArmoryAchievementsPanel";
import ArmoryTalentsPanel from "@/features/armory/components/ArmoryTalentsPanel";
import ArmoryReputationPanel from "@/features/armory/components/ArmoryReputationPanel";
import ArmoryPvpPanel from "@/features/armory/components/ArmoryPvpPanel";
import {
  armoryFadeUp,
  armoryGlassPanelClass,
  ArmoryPanelHeading,
  ArmoryPanelShell,
  ArmorySectionHeading,
  armoryStagger,
} from "@/features/armory/components/ArmoryMotion";
import { CLASS_COLORS } from "@/features/armory/constants/equipmentSlots";
import type { ArmoryCharacterProfile } from "@/features/armory/types/armory.types";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslation } from "react-i18next";

interface CharacterProfileProps {
  profile: ArmoryCharacterProfile;
}

const CharacterProfile = ({ profile }: CharacterProfileProps) => {
  const { t } = useTranslation();
  const classColor = CLASS_COLORS[profile.class_id] ?? "#FFFFFF";
  const isOnline = profile.online === 1;

  return (
    <motion.div
      variants={armoryStagger}
      initial="hidden"
      animate="visible"
      className="space-y-10"
    >
      <motion.div
        variants={armoryFadeUp}
        className={`relative overflow-hidden p-6 md:p-8 ${armoryGlassPanelClass()}`}
        style={{
          borderColor: `${classColor}35`,
          boxShadow: `0 20px 60px rgba(0,0,0,0.55), 0 0 80px -20px ${classColor}44, inset 0 1px 0 rgba(255,255,255,0.06)`,
        }}
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full blur-3xl"
          style={{ backgroundColor: `${classColor}18` }}
          animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.08, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl"
          animate={{ opacity: [0.2, 0.45, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4 md:gap-5">
            <motion.div
              className="relative shrink-0"
              whileHover={{ scale: 1.04 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div
                className="absolute -inset-1 rounded-2xl opacity-60 blur-md"
                style={{ backgroundColor: `${classColor}55` }}
              />
              <div
                className="relative h-20 w-20 overflow-hidden rounded-2xl border-2 md:h-24 md:w-24"
                style={{
                  borderColor: `${classColor}88`,
                  boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 24px ${classColor}33`,
                }}
              >
                <img
                  src={profile.race_logo}
                  alt={profile.race}
                  className="h-full w-full object-cover"
                />
              </div>
              <motion.img
                src={profile.class_logo}
                alt={profile.class}
                className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full border-2 border-slate-950 bg-black/90 p-0.5 shadow-lg"
                whileHover={{ rotate: 12 }}
              />
            </motion.div>

            <div>
              <Link
                href="/armory"
                className="group mb-2 inline-flex items-center gap-1 text-sm text-cyan-300/80 transition hover:text-cyan-200"
              >
                <motion.span
                  className="inline-block"
                  whileHover={{ x: -3 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  ←
                </motion.span>
                {t("armory.backToSearch")}
              </Link>
              <motion.h1
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="text-3xl font-bold drop-shadow-lg md:text-4xl"
                style={{
                  color: classColor,
                  textShadow: `0 0 40px ${classColor}44`,
                }}
              >
                {profile.name}
              </motion.h1>
              <p className="mt-1.5 text-lg text-slate-200">
                {t("armory.level")}{" "}
                <span className="font-semibold text-white">{profile.level}</span>
                <span className="mx-2 text-slate-600">·</span>
                <span className="text-slate-400">
                  {profile.race} {profile.class}
                </span>
              </p>
              {profile.guild_name && (
                <p className="mt-2 text-sm font-medium text-amber-200/90 drop-shadow-sm">
                  &lt;{profile.guild_name}&gt;
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 lg:justify-end">
            <motion.span
              whileHover={{ scale: 1.05 }}
              className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide shadow-lg ${
                isOnline
                  ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/40 shadow-emerald-500/10"
                  : "bg-slate-700/50 text-slate-300 ring-1 ring-slate-500/40"
              }`}
            >
              {isOnline && (
                <motion.span
                  className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                  animate={{ opacity: [1, 0.4, 1], scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
              {isOnline ? t("armory.online") : t("armory.offline")}
            </motion.span>
            <motion.span
              whileHover={{ scale: 1.05 }}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide shadow-lg ${
                profile.faction === "alliance"
                  ? "bg-blue-500/20 text-blue-200 ring-1 ring-blue-400/30 shadow-blue-500/10"
                  : profile.faction === "horde"
                    ? "bg-red-500/20 text-red-200 ring-1 ring-red-400/30 shadow-red-500/10"
                    : "bg-slate-600/40 text-slate-200"
              }`}
            >
              {t(`armory.faction.${profile.faction}`, profile.faction)}
            </motion.span>
          </div>
        </div>
      </motion.div>

      <motion.div variants={armoryFadeUp}>
        <PaperDoll profile={profile} classColor={classColor} />
      </motion.div>

      <motion.div variants={armoryFadeUp}>
        <ArmorySectionHeading>{t("armory.characterDetails.title")}</ArmorySectionHeading>
        <ArmoryCharacterDetailsPanel profile={profile} classColor={classColor} />
      </motion.div>

      {profile.professions.length > 0 && (
        <motion.div variants={armoryFadeUp}>
          <ArmoryPanelShell>
            <ArmoryPanelHeading>{t("armory.professions.title")}</ArmoryPanelHeading>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profile.professions.map((prof, i) => (
              <motion.li
                key={prof.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.45 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/40 p-3 shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-shadow hover:shadow-[0_12px_32px_rgba(0,0,0,0.45),0_0_20px_rgba(251,191,36,0.08)]"
              >
                <img
                  src={prof.logo}
                  alt={prof.name}
                  className="h-10 w-10 rounded-lg shadow-md"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-200">{prof.name}</p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800 shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{
                        width: `${Math.min(100, (prof.value / Math.max(prof.max, 1)) * 100)}%`,
                      }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 + i * 0.05 }}
                      className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-200 shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                    />
                  </div>
                  <p className="mt-1 text-[10px] tabular-nums text-slate-500">
                    {prof.value} / {prof.max}
                  </p>
                </div>
              </motion.li>
            ))}
          </ul>
        </ArmoryPanelShell>
        </motion.div>
      )}

      <motion.div variants={armoryFadeUp} className="grid gap-6 lg:grid-cols-2">
        <ArmoryTalentsPanel
          groups={profile.talent_groups ?? []}
          classId={profile.class_id}
        />
        <ArmoryAchievementsPanel
          count={profile.achievement_count ?? 0}
          achievements={profile.achievements ?? []}
        />
      </motion.div>

      <motion.div variants={armoryFadeUp}>
        <ArmoryPvpPanel
          totalKills={profile.total_kills ?? 0}
          brackets={profile.pvp_brackets ?? []}
        />
      </motion.div>

      <motion.div variants={armoryFadeUp}>
        <ArmoryReputationPanel reputations={profile.reputations ?? []} />
      </motion.div>
    </motion.div>
  );
};

export default CharacterProfile;

"use client";

import type { ArmoryCharacterProfile } from "@/features/armory/types/armory.types";
import {
  ArmoryShimmerOverlay,
  armoryFadeUp,
  armoryScaleIn,
  armoryStagger,
} from "@/features/armory/components/ArmoryMotion";
import {
  formatPlaytimeSeconds,
  formatUnixTimestamp,
  parseWoWMoney,
} from "@/features/armory/utils/armoryFormat";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface ArmoryCharacterDetailsPanelProps {
  profile: ArmoryCharacterProfile;
  classColor?: string;
}

const cardShadow =
  "shadow-[0_12px_40px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.05)_inset]";

function Coin({ color, label }: { color: string; label: string }) {
  return (
    <motion.span
      whileHover={{ scale: 1.12, rotate: 8 }}
      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold shadow-[0_2px_8px_rgba(0,0,0,0.4)] ${color}`}
      aria-hidden
    >
      {label}
    </motion.span>
  );
}

function WowMoneyDisplay({ copper }: { copper: number }) {
  const { gold, silver, copper: c } = parseWoWMoney(copper);
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <span className="inline-flex items-center gap-2 text-xl font-bold text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.35)]">
        <Coin color="bg-gradient-to-br from-amber-300 to-amber-600 text-amber-950" label="G" />
        {gold.toLocaleString()}
      </span>
      <span className="inline-flex items-center gap-2 text-lg font-semibold text-slate-200">
        <Coin color="bg-gradient-to-br from-slate-200 to-slate-500 text-slate-900" label="S" />
        {silver}
      </span>
      <span className="inline-flex items-center gap-2 text-lg font-semibold text-orange-300">
        <Coin color="bg-gradient-to-br from-orange-400 to-orange-700 text-orange-950" label="C" />
        {c}
      </span>
    </div>
  );
}

const highlightStyles = {
  amber: {
    border: "border-amber-400/20",
    glow: "hover:shadow-[0_16px_48px_rgba(245,158,11,0.18)]",
    bg: "from-amber-500/15 via-amber-950/20 to-transparent",
    text: "text-amber-100",
  },
  rose: {
    border: "border-rose-400/20",
    glow: "hover:shadow-[0_16px_48px_rgba(244,63,94,0.18)]",
    bg: "from-rose-500/15 via-rose-950/20 to-transparent",
    text: "text-rose-100",
  },
  violet: {
    border: "border-violet-400/20",
    glow: "hover:shadow-[0_16px_48px_rgba(139,92,246,0.18)]",
    bg: "from-violet-500/15 via-violet-950/20 to-transparent",
    text: "text-violet-100",
  },
  emerald: {
    border: "border-emerald-400/20",
    glow: "hover:shadow-[0_16px_48px_rgba(16,185,129,0.18)]",
    bg: "from-emerald-500/15 via-emerald-950/20 to-transparent",
    text: "text-emerald-100",
  },
} as const;

function HighlightStat({
  label,
  value,
  accent = "amber",
}: {
  label: string;
  value: React.ReactNode;
  accent?: keyof typeof highlightStyles;
}) {
  const style = highlightStyles[accent];
  return (
    <motion.div
      variants={armoryScaleIn}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 backdrop-blur-md ${style.border} ${style.glow} ${cardShadow} ${style.bg}`}
    >
      <ArmoryShimmerOverlay />
      <p className="relative text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.15 }}
        className={`relative mt-2 text-3xl font-bold tabular-nums tracking-tight ${style.text}`}
      >
        {value}
      </motion.p>
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/5 blur-2xl transition group-hover:bg-white/10" />
    </motion.div>
  );
}

function DetailCard({
  title,
  children,
  className = "",
  index = 0,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  index?: number;
}) {
  return (
    <motion.section
      variants={armoryFadeUp}
      custom={index}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 350, damping: 24 }}
      className={`group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-slate-900/80 via-slate-950/90 to-black/70 backdrop-blur-xl ${cardShadow} hover:border-cyan-500/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_30px_rgba(34,211,238,0.06)] ${className}`}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent opacity-0 transition group-hover:opacity-100" />
      <div className="border-b border-white/[0.04] bg-slate-900/60 px-4 py-3 backdrop-blur-sm">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-300/90">
          {title}
        </h3>
      </div>
      <div className="relative p-4">{children}</div>
    </motion.section>
  );
}

function MiniStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, backgroundColor: "rgba(15,23,42,0.8)" }}
      className="rounded-xl border border-white/[0.05] bg-black/40 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors"
    >
      <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-base font-semibold tabular-nums text-slate-100">{value}</p>
    </motion.div>
  );
}

function WellbeingBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="font-semibold tabular-nums text-slate-200">{pct}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-800/80 shadow-inner">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="h-full rounded-full shadow-[0_0_12px_currentColor]"
          style={{ backgroundColor: color, color }}
        />
      </div>
    </div>
  );
}

const ArmoryCharacterDetailsPanel = ({
  profile,
  classColor = "#38bdf8",
}: ArmoryCharacterDetailsPanelProps) => {
  const { t } = useTranslation();
  const lastLogout = formatUnixTimestamp(profile.logout_time);
  const moneyCopper = Math.floor(profile.money ?? 0);

  let cardIndex = 0;

  return (
    <motion.div
      variants={armoryStagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className="space-y-6"
    >
      <motion.div variants={armoryStagger} className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <HighlightStat
          accent="amber"
          label={t("armory.characterDetails.gold")}
          value={parseWoWMoney(moneyCopper).gold.toLocaleString()}
        />
        <HighlightStat
          accent="rose"
          label={t("armory.stats.honorKills")}
          value={(profile.total_kills ?? 0).toLocaleString()}
        />
        <HighlightStat
          accent="violet"
          label={t("armory.characterDetails.honorTotal")}
          value={(profile.total_honor_points ?? 0).toLocaleString()}
        />
        <HighlightStat
          accent="emerald"
          label={t("armory.stats.playtime")}
          value={formatPlaytimeSeconds(profile.total_time ?? 0)}
        />
      </motion.div>

      <motion.div
        variants={armoryStagger}
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        <DetailCard index={cardIndex++} title={t("armory.characterDetails.wallet")}>
          <WowMoneyDisplay copper={moneyCopper} />
          <div className="mt-4 grid grid-cols-2 gap-2">
            <MiniStat
              label={t("armory.characterDetails.xp")}
              value={(profile.xp ?? 0).toLocaleString()}
            />
            {(profile.achievement_count ?? 0) > 0 && (
              <MiniStat
                label={t("armory.achievements.earned")}
                value={profile.achievement_count.toLocaleString()}
              />
            )}
          </div>
        </DetailCard>

        <DetailCard index={cardIndex++} title={t("armory.characterDetails.time")}>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <MiniStat
              label={t("armory.stats.playtime")}
              value={formatPlaytimeSeconds(profile.total_time ?? 0)}
            />
            <MiniStat
              label={t("armory.characterDetails.levelTime")}
              value={formatPlaytimeSeconds(profile.level_time ?? 0)}
            />
          </div>
          {!profile.online && lastLogout && (
            <p className="mt-3 rounded-xl border border-white/[0.05] bg-slate-900/50 px-3 py-2.5 text-xs text-slate-400 shadow-inner">
              <span className="font-semibold text-slate-300">
                {t("armory.characterDetails.lastLogout")}:{" "}
              </span>
              {lastLogout}
            </p>
          )}
        </DetailCard>

        <DetailCard index={cardIndex++} title={t("armory.characterDetails.combat")}>
          <div className="grid grid-cols-2 gap-2">
            <MiniStat
              label={t("armory.stats.health")}
              value={(profile.health ?? 0).toLocaleString()}
            />
            <MiniStat
              label={t("armory.stats.power")}
              value={(profile.power1 ?? 0).toLocaleString()}
            />
            <MiniStat
              label={t("armory.characterDetails.killsToday")}
              value={(profile.today_kills ?? 0).toLocaleString()}
            />
            <MiniStat
              label={t("armory.characterDetails.killsYesterday")}
              value={(profile.yesterday_kills ?? 0).toLocaleString()}
            />
          </div>
        </DetailCard>

        <DetailCard index={cardIndex++} title={t("armory.characterDetails.honor")}>
          <div className="grid grid-cols-2 gap-2">
            <MiniStat
              label={t("armory.characterDetails.honorToday")}
              value={(profile.today_honor_points ?? 0).toLocaleString()}
            />
            <MiniStat
              label={t("armory.characterDetails.honorYesterday")}
              value={(profile.yesterday_honor_points ?? 0).toLocaleString()}
            />
            <MiniStat
              label={t("armory.characterDetails.arenaPoints")}
              value={(profile.arena_points ?? 0).toLocaleString()}
            />
            <MiniStat
              label={t("armory.stats.honorKills")}
              value={(profile.total_kills ?? 0).toLocaleString()}
            />
          </div>
        </DetailCard>

        {(profile.dream != null ||
          profile.hunger != null ||
          profile.thirst != null) && (
          <DetailCard
            index={cardIndex++}
            title={t("armory.characterDetails.wellbeing")}
            className="md:col-span-2 xl:col-span-1"
          >
            <div className="space-y-4">
              {profile.dream != null && (
                <WellbeingBar
                  label={t("armory.characterDetails.dream")}
                  value={profile.dream}
                  color="#818cf8"
                />
              )}
              {profile.hunger != null && (
                <WellbeingBar
                  label={t("armory.characterDetails.hunger")}
                  value={profile.hunger}
                  color="#fbbf24"
                />
              )}
              {profile.thirst != null && (
                <WellbeingBar
                  label={t("armory.characterDetails.thirst")}
                  value={profile.thirst}
                  color="#38bdf8"
                />
              )}
            </div>
          </DetailCard>
        )}
      </motion.div>

      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 0.5 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="h-px w-full origin-center"
        style={{
          background: `linear-gradient(90deg, transparent, ${classColor}, transparent)`,
        }}
        aria-hidden
      />
    </motion.div>
  );
};

export default ArmoryCharacterDetailsPanel;

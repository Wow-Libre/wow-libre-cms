"use client";

import {
  armoryCardHover,
  ArmoryPanelHeading,
  ArmoryPanelShell,
} from "@/features/armory/components/ArmoryMotion";
import type { ArmoryAchievement } from "@/features/armory/types/armory.types";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface ArmoryAchievementsPanelProps {
  count: number;
  achievements: ArmoryAchievement[];
}

function wowheadAchievementUrl(id: number): string {
  return `https://www.wowhead.com/achievement=${id}`;
}

function formatAchievementDate(unixSeconds: number): string {
  if (!unixSeconds || unixSeconds <= 0) return "";
  return new Date(unixSeconds * 1000).toISOString().slice(0, 10);
}

const ArmoryAchievementsPanel = ({
  count,
  achievements,
}: ArmoryAchievementsPanelProps) => {
  const { t } = useTranslation();

  if (count <= 0) {
    return null;
  }

  const countBadge = (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="rounded-xl border border-amber-400/25 bg-gradient-to-br from-amber-500/15 to-amber-950/20 px-4 py-2 text-right shadow-[0_8px_24px_rgba(245,158,11,0.12)]"
    >
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.15 }}
        className="text-2xl font-bold tabular-nums text-amber-200 drop-shadow-[0_0_16px_rgba(251,191,36,0.35)]"
      >
        {count.toLocaleString()}
      </motion.p>
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
        {t("armory.achievements.earned")}
      </p>
    </motion.div>
  );

  return (
    <ArmoryPanelShell className="h-full">
      <ArmoryPanelHeading trailing={countBadge}>
        {t("armory.achievements.title")}
      </ArmoryPanelHeading>

      {achievements.length > 0 && (
        <>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
            {t("armory.achievements.recent")}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {achievements.map((item, i) => (
              <motion.a
                key={item.achievement_id}
                href={wowheadAchievementUrl(item.achievement_id)}
                data-wowhead={`achievement=${item.achievement_id}`}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                whileHover={{ y: -3, scale: 1.01 }}
                className={`flex items-center justify-between gap-2 rounded-xl border border-amber-500/20 bg-gradient-to-r from-slate-950/80 to-amber-950/20 px-3 py-2.5 text-sm shadow-[0_6px_20px_rgba(0,0,0,0.3)] ${armoryCardHover} hover:border-amber-400/45 hover:shadow-[0_12px_32px_rgba(245,158,11,0.12)]`}
              >
                <span className="truncate font-medium text-amber-100">
                  #{item.achievement_id}
                </span>
                {item.earned_date > 0 && (
                  <span className="shrink-0 text-xs tabular-nums text-slate-500">
                    {formatAchievementDate(item.earned_date)}
                  </span>
                )}
              </motion.a>
            ))}
          </div>
        </>
      )}
    </ArmoryPanelShell>
  );
};

export default ArmoryAchievementsPanel;

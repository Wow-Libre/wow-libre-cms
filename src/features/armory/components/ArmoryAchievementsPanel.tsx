"use client";

import type { ArmoryAchievement } from "@/features/armory/types/armory.types";
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

  return (
    <div className="rounded-xl border border-slate-700/60 bg-black/40 p-4 md:p-5">
      <div className="mb-4 flex items-end justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-cyan-300">
          {t("armory.achievements.title")}
        </h2>
        <div className="text-right">
          <p className="text-2xl font-bold text-amber-300">{count.toLocaleString()}</p>
          <p className="text-[10px] uppercase tracking-widest text-slate-500">
            {t("armory.achievements.earned")}
          </p>
        </div>
      </div>

      {achievements.length > 0 && (
        <>
          <p className="mb-3 text-[10px] uppercase tracking-widest text-slate-500">
            {t("armory.achievements.recent")}
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {achievements.map((item) => (
              <a
                key={item.achievement_id}
                href={wowheadAchievementUrl(item.achievement_id)}
                data-wowhead={`achievement=${item.achievement_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 rounded-lg border border-amber-500/20 bg-slate-950/60 px-3 py-2 text-sm transition hover:border-amber-400/50 hover:bg-amber-500/5"
              >
                <span className="truncate font-medium text-amber-100">
                  #{item.achievement_id}
                </span>
                {item.earned_date > 0 && (
                  <span className="shrink-0 text-xs text-slate-500">
                    {formatAchievementDate(item.earned_date)}
                  </span>
                )}
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ArmoryAchievementsPanel;

"use client";

import type { ArmoryReputation } from "@/features/armory/types/armory.types";
import { REP_RANK_COLORS } from "@/features/armory/constants/repRanks";
import { useTranslation } from "react-i18next";

interface ArmoryReputationPanelProps {
  reputations: ArmoryReputation[];
}

function wowheadFactionUrl(factionId: number): string {
  return `https://www.wowhead.com/faction=${factionId}`;
}

const ArmoryReputationPanel = ({ reputations }: ArmoryReputationPanelProps) => {
  const { t } = useTranslation();

  if (!reputations.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-700/60 bg-black/40 p-4 md:p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-cyan-300">
        {t("armory.reputation.title")}
      </h2>
      <div className="grid gap-2 sm:grid-cols-2">
        {reputations.map((rep) => {
          const color = REP_RANK_COLORS[rep.rank] ?? "#9a9a9a";
          const pct = Math.min(
            100,
            (rep.progress_value / Math.max(rep.progress_max, 1)) * 100
          );
          return (
            <div
              key={rep.faction_id}
              className="rounded-lg border border-slate-700/50 bg-slate-950/50 p-3"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <a
                  href={wowheadFactionUrl(rep.faction_id)}
                  data-wowhead={`faction=${rep.faction_id}`}
                  className="text-sm font-medium text-slate-100 hover:text-cyan-200"
                >
                  {rep.name}
                </a>
                <span
                  className="shrink-0 text-xs font-semibold uppercase tracking-wide"
                  style={{ color }}
                >
                  {rep.rank_label}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ArmoryReputationPanel;

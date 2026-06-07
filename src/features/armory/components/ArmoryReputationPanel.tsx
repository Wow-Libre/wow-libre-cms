"use client";

import {
  armoryCardHover,
  ArmoryPanelHeading,
  ArmoryPanelShell,
} from "@/features/armory/components/ArmoryMotion";
import { REP_RANK_COLORS } from "@/features/armory/constants/repRanks";
import type { ArmoryReputation } from "@/features/armory/types/armory.types";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface ArmoryReputationPanelProps {
  reputations: ArmoryReputation[];
}

function wowheadFactionUrl(factionId: number): string {
  return `https://www.wowhead.com/faction=${factionId}`;
}

const innerCard =
  "rounded-xl border border-white/[0.06] bg-black/35 p-4 shadow-[0_8px_24px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)]";

const ArmoryReputationPanel = ({ reputations }: ArmoryReputationPanelProps) => {
  const { t } = useTranslation();

  if (!reputations.length) {
    return null;
  }

  return (
    <ArmoryPanelShell>
      <ArmoryPanelHeading>{t("armory.reputation.title")}</ArmoryPanelHeading>

      <div className="grid gap-3 sm:grid-cols-2">
        {reputations.map((rep, i) => {
          const color = REP_RANK_COLORS[rep.rank] ?? "#9a9a9a";
          const pct = Math.min(
            100,
            (rep.progress_value / Math.max(rep.progress_max, 1)) * 100
          );
          return (
            <motion.div
              key={rep.faction_id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.45 }}
              whileHover={{ y: -3 }}
              className={`group ${innerCard} ${armoryCardHover}`}
              style={{
                boxShadow: `0 8px 24px rgba(0,0,0,0.35), 0 0 24px -12px ${color}33`,
              }}
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <a
                  href={wowheadFactionUrl(rep.faction_id)}
                  data-wowhead={`faction=${rep.faction_id}`}
                  className="text-sm font-medium text-slate-100 transition hover:text-cyan-200"
                >
                  {rep.name}
                </a>
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ring-white/10"
                  style={{ color, backgroundColor: `${color}18` }}
                >
                  {rep.rank_label}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-800/90 shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${pct}%` }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.85,
                    ease: [0.22, 1, 0.36, 1],
                    delay: 0.08 + i * 0.04,
                  }}
                  className="h-full rounded-full shadow-[0_0_10px_currentColor]"
                  style={{ backgroundColor: color, color }}
                />
              </div>
              <p className="mt-1.5 text-right text-[10px] tabular-nums text-slate-500">
                {rep.progress_value.toLocaleString()} / {rep.progress_max.toLocaleString()}
              </p>
            </motion.div>
          );
        })}
      </div>
    </ArmoryPanelShell>
  );
};

export default ArmoryReputationPanel;

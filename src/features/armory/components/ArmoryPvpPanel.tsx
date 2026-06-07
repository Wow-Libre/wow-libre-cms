"use client";

import {
  armoryCardHover,
  ArmoryPanelHeading,
  ArmoryPanelShell,
} from "@/features/armory/components/ArmoryMotion";
import type { ArmoryPvpBracket } from "@/features/armory/types/armory.types";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface ArmoryPvpPanelProps {
  totalKills: number;
  brackets: ArmoryPvpBracket[];
}

const innerCard =
  "rounded-xl border border-white/[0.06] bg-black/35 shadow-[0_8px_28px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.04)]";

const ArmoryPvpPanel = ({ totalKills, brackets }: ArmoryPvpPanelProps) => {
  const { t } = useTranslation();

  if (totalKills <= 0 && brackets.length === 0) {
    return null;
  }

  return (
    <ArmoryPanelShell>
      <ArmoryPanelHeading>{t("armory.pvp.title")}</ArmoryPanelHeading>

      <div className="grid gap-4 lg:grid-cols-[minmax(200px,1fr)_2fr]">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          whileHover={{ y: -4, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 380, damping: 24 }}
          className={`relative overflow-hidden p-5 ${innerCard} border-rose-400/20 bg-gradient-to-br from-rose-500/10 via-rose-950/25 to-transparent ${armoryCardHover}`}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-rose-500/15 blur-2xl"
          />
          <p className="relative text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            {t("armory.pvp.totalKills")}
          </p>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="relative mt-2 text-4xl font-bold tabular-nums text-rose-200 drop-shadow-[0_0_20px_rgba(244,63,94,0.35)]"
          >
            {totalKills.toLocaleString()}
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08, duration: 0.5 }}
          className={`p-5 ${innerCard}`}
        >
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            {t("armory.pvp.rated")}
          </p>
          {brackets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[280px] text-sm">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-wider text-slate-500">
                    <th className="pb-3 pr-4">{t("armory.pvp.bracket")}</th>
                    <th className="pb-3 pr-4">{t("armory.pvp.rating")}</th>
                    <th className="pb-3">{t("armory.pvp.wins")}</th>
                  </tr>
                </thead>
                <tbody>
                  {brackets.map((row, i) => (
                    <motion.tr
                      key={`${row.slot}-${row.bracket}`}
                      initial={{ opacity: 0, x: -8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06, duration: 0.4 }}
                      className="border-t border-white/[0.04] transition-colors hover:bg-white/[0.02]"
                    >
                      <td className="py-3 pr-4">
                        <span className="inline-flex rounded-full bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-300 ring-1 ring-cyan-400/25 shadow-[0_0_12px_rgba(34,211,238,0.12)]">
                          {row.bracket}
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-bold tabular-nums text-slate-100">
                        {row.rating.toLocaleString()}
                      </td>
                      <td className="py-3 tabular-nums text-slate-300">
                        {row.season_wins.toLocaleString()}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-500">{t("armory.pvp.noRated")}</p>
          )}
        </motion.div>
      </div>
    </ArmoryPanelShell>
  );
};

export default ArmoryPvpPanel;

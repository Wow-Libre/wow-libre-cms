"use client";

import {
  armoryCardHover,
  ArmoryPanelHeading,
  ArmoryPanelShell,
} from "@/features/armory/components/ArmoryMotion";
import { CLASS_COLORS } from "@/features/armory/constants/equipmentSlots";
import {
  hasMopTalentGrid,
  MOP_TALENT_GRID,
  mopTalentTierLevel,
} from "@/features/armory/constants/mopTalentGrid";
import type { ArmoryTalentGroup } from "@/features/armory/types/armory.types";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface ArmoryTalentsPanelProps {
  groups: ArmoryTalentGroup[];
  classId: number;
}

function wowheadSpellUrl(spellId: number): string {
  return `https://www.wowhead.com/spell=${spellId}`;
}

const innerCard =
  "rounded-xl border border-white/[0.06] bg-black/35 p-4 shadow-[0_8px_24px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)]";

const activeBadge =
  "rounded-full bg-sky-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-300 ring-1 ring-sky-400/35 shadow-[0_0_12px_rgba(56,189,248,0.15)]";

const ArmoryTalentsPanel = ({ groups, classId }: ArmoryTalentsPanelProps) => {
  const { t } = useTranslation();
  const classColor = CLASS_COLORS[classId] ?? "#69CCF0";

  if (!groups.length) {
    return null;
  }

  const sorted = [...groups].sort((a, b) => {
    if (a.active !== b.active) return a.active ? -1 : 1;
    return a.spec - b.spec;
  });

  const activeGroup = sorted.find((g) => g.active) ?? sorted[0];
  const chosenSpells = new Set(activeGroup?.spells ?? []);
  const showGrid = hasMopTalentGrid(classId);
  const grid = MOP_TALENT_GRID[classId];

  return (
    <ArmoryPanelShell className="h-full">
      <ArmoryPanelHeading>{t("armory.talents.title")}</ArmoryPanelHeading>

      {showGrid && activeGroup && grid && (
        <div className="mb-6 space-y-2.5">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-base font-semibold drop-shadow-sm" style={{ color: classColor }}>
              {activeGroup.spec_name ||
                t("armory.talents.group", { number: activeGroup.spec + 1 })}
            </span>
            <span className={activeBadge}>{t("armory.talents.active")}</span>
          </div>
          {grid.map((row, tierIdx) => (
            <motion.div
              key={tierIdx}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: tierIdx * 0.05, duration: 0.45 }}
              className="grid grid-cols-1 gap-2 sm:grid-cols-[3.5rem_repeat(3,minmax(0,1fr))]"
            >
              <div className="flex items-center justify-center rounded-xl border border-cyan-400/25 bg-gradient-to-br from-cyan-500/10 to-cyan-950/20 px-2 py-3 text-center text-xs font-bold text-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.1)]">
                Lv
                <br />
                {mopTalentTierLevel(tierIdx)}
              </div>
              {row.map((spellId) => {
                if (spellId <= 0) {
                  return (
                    <div
                      key={`${tierIdx}-${spellId}`}
                      className="min-h-[2.75rem] rounded-xl border border-dashed border-slate-700/40 bg-slate-950/30 opacity-30"
                    />
                  );
                }
                const chosen = chosenSpells.has(spellId);
                return (
                  <motion.a
                    key={`${tierIdx}-${spellId}`}
                    href={wowheadSpellUrl(spellId)}
                    data-wowhead={`spell=${spellId}`}
                    whileHover={{ y: chosen ? -2 : 0, scale: chosen ? 1.02 : 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    className={`flex min-h-[2.75rem] items-center rounded-xl border px-3 py-2 text-sm transition-shadow ${armoryCardHover} ${
                      chosen ? "font-semibold" : "opacity-55 hover:opacity-85"
                    }`}
                    style={
                      chosen
                        ? {
                            borderColor: `${classColor}88`,
                            color: classColor,
                            backgroundColor: `${classColor}14`,
                            boxShadow: `0 8px 28px rgba(0,0,0,0.35), 0 0 24px -8px ${classColor}99`,
                          }
                        : {
                            borderColor: "rgba(100,116,139,0.35)",
                            color: "#cdd5e0",
                          }
                    }
                  >
                    <span className="truncate">
                      {t("armory.talents.spell", { id: spellId })}
                    </span>
                  </motion.a>
                );
              })}
            </motion.div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {sorted.map((group, gi) => (
          <motion.div
            key={group.spec}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: gi * 0.06, duration: 0.45 }}
            className={innerCard}
          >
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="font-semibold" style={{ color: classColor }}>
                {group.spec_name ||
                  t("armory.talents.group", { number: group.spec + 1 })}
              </span>
              {group.active ? (
                <span className={activeBadge}>{t("armory.talents.active")}</span>
              ) : (
                <span className="text-xs text-slate-500">
                  {t("armory.talents.offspec")}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {group.spells.map((spellId, si) => (
                <motion.a
                  key={`${group.spec}-${spellId}`}
                  href={wowheadSpellUrl(spellId)}
                  data-wowhead={`spell=${spellId}`}
                  initial={{ opacity: 0, scale: 0.92 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: si * 0.03, duration: 0.35 }}
                  whileHover={{ y: -2 }}
                  className={`rounded-lg border border-slate-600/50 bg-slate-900/80 px-3 py-2 text-sm text-slate-200 shadow-md ${armoryCardHover} hover:border-cyan-400/45 hover:text-white hover:shadow-[0_8px_24px_rgba(34,211,238,0.12)]`}
                >
                  {t("armory.talents.spell", { id: spellId })}
                </motion.a>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </ArmoryPanelShell>
  );
};

export default ArmoryTalentsPanel;

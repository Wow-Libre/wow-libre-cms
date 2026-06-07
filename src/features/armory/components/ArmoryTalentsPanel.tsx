"use client";

import type { ArmoryTalentGroup } from "@/features/armory/types/armory.types";
import { CLASS_COLORS } from "@/features/armory/constants/equipmentSlots";
import {
  hasMopTalentGrid,
  MOP_TALENT_GRID,
  mopTalentTierLevel,
} from "@/features/armory/constants/mopTalentGrid";
import { useTranslation } from "react-i18next";

interface ArmoryTalentsPanelProps {
  groups: ArmoryTalentGroup[];
  classId: number;
}

function wowheadSpellUrl(spellId: number): string {
  return `https://www.wowhead.com/spell=${spellId}`;
}

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
    <div className="rounded-xl border border-slate-700/60 bg-black/40 p-4 md:p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-cyan-300">
        {t("armory.talents.title")}
      </h2>

      {showGrid && activeGroup && grid && (
        <div className="mb-6 space-y-2">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="font-semibold" style={{ color: classColor }}>
              {activeGroup.spec_name ||
                t("armory.talents.group", { number: activeGroup.spec + 1 })}
            </span>
            <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-300 ring-1 ring-sky-400/40">
              {t("armory.talents.active")}
            </span>
          </div>
          {grid.map((row, tierIdx) => (
            <div
              key={tierIdx}
              className="grid grid-cols-1 gap-2 sm:grid-cols-[3.5rem_repeat(3,minmax(0,1fr))]"
            >
              <div className="flex items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-2 py-3 text-center text-xs font-bold text-cyan-300">
                Lv
                <br />
                {mopTalentTierLevel(tierIdx)}
              </div>
              {row.map((spellId) => {
                if (spellId <= 0) {
                  return (
                    <div
                      key={`${tierIdx}-${spellId}`}
                      className="min-h-[2.75rem] rounded-lg border border-dashed border-slate-700/40 bg-slate-950/30 opacity-30"
                    />
                  );
                }
                const chosen = chosenSpells.has(spellId);
                return (
                  <a
                    key={`${tierIdx}-${spellId}`}
                    href={wowheadSpellUrl(spellId)}
                    data-wowhead={`spell=${spellId}`}
                    className={`flex min-h-[2.75rem] items-center rounded-lg border px-3 py-2 text-sm transition ${
                      chosen
                        ? "font-semibold shadow-[0_0_18px_-6px]"
                        : "opacity-55 hover:opacity-80"
                    }`}
                    style={
                      chosen
                        ? {
                            borderColor: classColor,
                            color: classColor,
                            backgroundColor: `${classColor}14`,
                            boxShadow: `0 0 18px -6px ${classColor}aa`,
                          }
                        : {
                            borderColor: "rgba(100,116,139,0.45)",
                            color: "#cdd5e0",
                          }
                    }
                  >
                    <span className="truncate">
                      {t("armory.talents.spell", { id: spellId })}
                    </span>
                  </a>
                );
              })}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {sorted.map((group) => (
          <div
            key={group.spec}
            className="rounded-lg border border-slate-700/50 bg-slate-950/50 p-3"
          >
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="font-semibold" style={{ color: classColor }}>
                {group.spec_name ||
                  t("armory.talents.group", { number: group.spec + 1 })}
              </span>
              {group.active ? (
                <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-300 ring-1 ring-sky-400/40">
                  {t("armory.talents.active")}
                </span>
              ) : (
                <span className="text-xs text-slate-500">
                  {t("armory.talents.offspec")}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {group.spells.map((spellId) => (
                <a
                  key={`${group.spec}-${spellId}`}
                  href={wowheadSpellUrl(spellId)}
                  data-wowhead={`spell=${spellId}`}
                  className="rounded-md border border-slate-600/60 bg-slate-900/80 px-3 py-2 text-sm text-slate-200 transition hover:border-cyan-400/50 hover:text-white"
                >
                  {t("armory.talents.spell", { id: spellId })}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArmoryTalentsPanel;

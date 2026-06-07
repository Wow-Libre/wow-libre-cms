"use client";

import type { ArmoryPvpBracket } from "@/features/armory/types/armory.types";
import { useTranslation } from "react-i18next";

interface ArmoryPvpPanelProps {
  totalKills: number;
  brackets: ArmoryPvpBracket[];
}

const ArmoryPvpPanel = ({ totalKills, brackets }: ArmoryPvpPanelProps) => {
  const { t } = useTranslation();

  if (totalKills <= 0 && brackets.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-700/60 bg-black/40 p-4 md:p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-cyan-300">
        {t("armory.pvp.title")}
      </h2>
      <div className="grid gap-4 lg:grid-cols-[minmax(180px,1fr)_2fr]">
        <div className="rounded-lg border border-rose-500/20 bg-rose-950/20 p-4">
          <p className="text-[10px] uppercase tracking-widest text-slate-500">
            {t("armory.pvp.totalKills")}
          </p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-rose-300">
            {totalKills.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border border-slate-700/50 bg-slate-950/50 p-4">
          <p className="mb-3 text-[10px] uppercase tracking-widest text-slate-500">
            {t("armory.pvp.rated")}
          </p>
          {brackets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[280px] text-sm">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-wider text-slate-500">
                    <th className="pb-2 pr-4">{t("armory.pvp.bracket")}</th>
                    <th className="pb-2 pr-4">{t("armory.pvp.rating")}</th>
                    <th className="pb-2">{t("armory.pvp.wins")}</th>
                  </tr>
                </thead>
                <tbody>
                  {brackets.map((row) => (
                    <tr
                      key={`${row.slot}-${row.bracket}`}
                      className="border-t border-slate-800/80"
                    >
                      <td className="py-2 pr-4">
                        <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-xs font-semibold text-cyan-300 ring-1 ring-cyan-400/30">
                          {row.bracket}
                        </span>
                      </td>
                      <td className="py-2 pr-4 font-bold tabular-nums text-slate-100">
                        {row.rating.toLocaleString()}
                      </td>
                      <td className="py-2 tabular-nums text-slate-300">
                        {row.season_wins.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-500">{t("armory.pvp.noRated")}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArmoryPvpPanel;

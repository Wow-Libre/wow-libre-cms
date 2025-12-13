import React from "react";
import { Teleport } from "@/model/teleport";
import TeleportCard from "./TeleportCard";

interface TeleportListProps {
  teleports: Teleport[];
  deleting: number | null;
  onDelete: (id: number) => void;
  t: (key: string) => string;
}

const TeleportList: React.FC<TeleportListProps> = ({
  teleports,
  deleting,
  onDelete,
  t,
}) => {
  return (
    <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 md:p-10 space-y-6 overflow-y-auto max-h-[80vh] scrollbar-hide transition-all duration-300 hover:border-slate-600/70 hover:shadow-lg">
      <div className="mb-8">
        <h2 className="text-xl md:text-2xl font-semibold text-slate-200 mb-3">
          {t("teleport-dashboard.teleports-list.title")}
        </h2>
        <div className="h-px bg-slate-700/50"></div>
      </div>

      {teleports.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 opacity-50">📍</div>
          <p className="text-slate-400 text-lg">
            {t("teleport-dashboard.teleports-list.empty")}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {teleports.map((tp) => (
            <TeleportCard
              key={tp.id}
              teleport={tp}
              onDelete={onDelete}
              deleting={deleting === tp.id}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TeleportList;

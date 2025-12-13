import React from "react";
import { Teleport } from "@/model/teleport";

interface TeleportCardProps {
  teleport: Teleport;
  onDelete: (id: number) => void;
  deleting: boolean;
  t: (key: string) => string;
}

const TeleportCard: React.FC<TeleportCardProps> = ({
  teleport,
  onDelete,
  deleting,
  t,
}) => {
  return (
    <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-sm space-y-4 hover:border-slate-600/70 hover:shadow-md transition-all duration-300">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              {t("teleport-dashboard.teleports-list.columns.name")}
            </span>
            <p className="text-white text-xl font-bold mt-1">{teleport.name}</p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
              teleport.faction === "HORDE"
                ? "bg-red-900/30 text-red-300 border border-red-700/50"
                : teleport.faction === "ALLIANCE"
                ? "bg-blue-900/30 text-blue-300 border border-blue-700/50"
                : "bg-slate-700/50 text-slate-300 border border-slate-600/50"
            }`}
          >
            {teleport.faction}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 md:gap-5 pt-3 border-t border-slate-700/50">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1">
              {t("teleport-dashboard.teleports-list.columns.location")}
            </span>
            <p className="text-slate-200 text-sm font-mono">
              X: {teleport.position_x.toFixed(2)}
              <br />
              Y: {teleport.position_y.toFixed(2)}
              <br />
              Z: {teleport.position_z.toFixed(2)}
            </p>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1">
              {t("teleport-dashboard.teleports-list.columns.map")}
            </span>
            <p className="text-slate-200 text-sm">{teleport.map}</p>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1">
              {t("teleport-dashboard.teleports-list.columns.zone")}
            </span>
            <p className="text-slate-200 text-sm">{teleport.zone}</p>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1">
              {t("teleport-dashboard.teleports-list.columns.area")}
            </span>
            <p className="text-slate-200 text-sm">{teleport.area}</p>
          </div>
          <div className="col-span-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1">
              {t("teleport-dashboard.teleports-list.columns.orientation")}
            </span>
            <p className="text-slate-200 text-sm font-mono">
              {teleport.orientation.toFixed(4)}
            </p>
          </div>
        </div>
      </div>

      {teleport.img_url && (
        <div className="pt-3 border-t border-slate-700/50">
          <img
            src={teleport.img_url}
            alt={teleport.name}
            className="w-full max-h-48 object-cover rounded-lg border border-slate-700/50 transition-all duration-300 hover:border-slate-600/70"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}

      <button
        onClick={() => onDelete(teleport.id)}
        disabled={deleting}
        className="w-full bg-slate-700 hover:bg-red-900/50 disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-semibold px-8 py-4 rounded-lg border border-slate-600/50 hover:border-red-700/50 transition-all duration-300 text-lg flex items-center justify-center gap-2"
      >
        {deleting ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>
              {t("teleport-dashboard.buttons.deleting") || "Deleting..."}
            </span>
          </>
        ) : (
          t("teleport-dashboard.buttons.delete-teleport")
        )}
      </button>
    </div>
  );
};

export default TeleportCard;

"use client";

import { SERVER_NAME } from "@/configs/configs";
import { useSearchParams } from "next/navigation";
import { DASHBOARD_OPTION_TITLES } from "../constants/menuConfig";
import { DASHBOARD_PALETTE } from "../styles/dashboardPalette";

const DashboardHeader: React.FC = () => {
  const searchParams = useSearchParams();
  const activeOption = searchParams.get("activeOption") || "dashboard";
  const sectionTitle = DASHBOARD_OPTION_TITLES[activeOption] ?? "Panel";

  return (
    <header
      className={`sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b ${DASHBOARD_PALETTE.border} bg-slate-900/95 px-4 backdrop-blur-md sm:px-6 lg:px-8`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <h1
          className={`truncate text-lg font-semibold tracking-tight sm:text-xl ${DASHBOARD_PALETTE.text}`}
        >
          {SERVER_NAME} CMS
        </h1>
        <span className="hidden shrink-0 text-slate-500 sm:inline">/</span>
        <span
          className={`truncate text-sm font-medium sm:inline ${DASHBOARD_PALETTE.textMuted}`}
        >
          {sectionTitle}
        </span>
      </div>
    </header>
  );
};

export default DashboardHeader;

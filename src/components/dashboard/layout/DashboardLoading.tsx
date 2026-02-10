"use client";

import React from "react";
import { DASHBOARD_PALETTE } from "../styles/dashboardPalette";

interface DashboardLoadingProps {
  message?: string;
}

const DashboardLoading: React.FC<DashboardLoadingProps> = ({
  message = "Cargando...",
}) => {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
      <div
        className={`h-10 w-10 animate-spin rounded-full border-2 ${DASHBOARD_PALETTE.spinner}`}
      />
      <p className={`text-sm font-medium ${DASHBOARD_PALETTE.textMuted}`}>
        {message}
      </p>
    </div>
  );
};

export default DashboardLoading;

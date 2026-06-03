"use client";

import React from "react";
import { DASHBOARD_PALETTE } from "../styles/dashboardPalette";

interface DashboardPageWrapperProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  /** Si es true, no aplica el contenedor con padding (el hijo controla todo) */
  fullWidth?: boolean;
}

const DashboardPageWrapper: React.FC<DashboardPageWrapperProps> = ({
  title,
  description,
  children,
  fullWidth = false,
}) => {
  return (
    <div className="min-h-0 w-full min-w-0 max-w-full overflow-x-hidden box-border">
      {(title || description) && (
        <header className="mb-6 sm:mb-8">
          <h1
            className={`text-2xl font-bold tracking-tight sm:text-3xl ${DASHBOARD_PALETTE.text}`}
          >
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-3xl text-base leading-relaxed text-slate-300 sm:mt-3 sm:text-lg">
              {description}
            </p>
          )}
        </header>
      )}
      {fullWidth ? (
        children
      ) : (
        <div className="space-y-6 sm:space-y-8">{children}</div>
      )}
    </div>
  );
};

export default DashboardPageWrapper;

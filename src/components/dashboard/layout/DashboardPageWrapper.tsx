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
            className={`text-xl font-semibold tracking-tight sm:text-2xl ${DASHBOARD_PALETTE.text}`}
          >
            {title}
          </h1>
          {description && (
            <p className={`mt-1 text-sm ${DASHBOARD_PALETTE.textMuted}`}>
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

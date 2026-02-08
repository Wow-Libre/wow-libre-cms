"use client";

import React from "react";
import { DASHBOARD_PALETTE } from "../styles/dashboardPalette";

interface DashboardSectionProps {
  title?: string;
  description?: string;
  /** Acción opcional (ej. botón "Agregar") al lado del título */
  action?: React.ReactNode;
  children: React.ReactNode;
  /** Sin padding interno (para tablas full-width dentro) */
  noPadding?: boolean;
}

const DashboardSection: React.FC<DashboardSectionProps> = ({
  title,
  description,
  action,
  children,
  noPadding = false,
}) => {
  return (
    <section
      className={`min-w-0 max-w-full overflow-x-auto rounded-xl ${DASHBOARD_PALETTE.card} shadow-lg backdrop-blur-sm`}
    >
      {(title || description || action) && (
        <div
          className={`flex flex-col gap-1 border-b ${DASHBOARD_PALETTE.border} px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4`}
        >
          <div>
            {title && (
              <h2 className={`text-base font-semibold ${DASHBOARD_PALETTE.text} sm:text-lg`}>
                {title}
              </h2>
            )}
            {description && (
              <p className={`mt-1 text-sm ${DASHBOARD_PALETTE.textMuted}`}>
                {description}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={noPadding ? "" : "p-5 sm:p-6"}>{children}</div>
    </section>
  );
};

export default DashboardSection;

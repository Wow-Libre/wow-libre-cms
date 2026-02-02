"use client";

import React from "react";
import { DashboardLoading, DashboardSection } from "@/components/dashboard/layout";
import { TeleportDashboardProps } from "../types";
import { useTeleportDashboard } from "../hooks/useTeleportDashboard";
import TeleportForm from "./TeleportForm";
import TeleportList from "./TeleportList";

const TeleportDashboard: React.FC<TeleportDashboardProps> = ({
  token,
  realmId,
  t,
}) => {
  const {
    loading,
    submitting,
    deleting,
    teleports,
    form,
    errors,
    handleChange,
    handleSubmit,
    handleDelete,
  } = useTeleportDashboard({ token, realmId, t });

  if (loading) {
    return (
      <div className="flex min-h-[280px] items-center justify-center">
        <DashboardLoading message={t("teleport-dashboard.loading") || "Cargando portales..."} />
      </div>
    );
  }

  return (
    <div className="grid w-full min-w-0 grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-[minmax(0,42rem)_1fr] lg:items-start">
      {/* Formulario: primera columna, ancho máximo 42rem */}
      <div className="min-w-0">
        <DashboardSection title={t("teleport-dashboard.title")}>
          <TeleportForm
            form={form}
            errors={errors}
            submitting={submitting}
            onChange={handleChange}
            onSubmit={handleSubmit}
            t={t}
          />
        </DashboardSection>
      </div>

      {/* Lista de teleports: segunda columna, ocupa todo el espacio restante (1fr) */}
      <div className="min-w-0">
        <DashboardSection title={t("teleport-dashboard.teleports-list.title")}>
          <TeleportList
            teleports={teleports}
            deleting={deleting}
            onDelete={handleDelete}
            t={t}
          />
        </DashboardSection>
      </div>
    </div>
  );
};

export default TeleportDashboard;

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
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
      {/* Formulario: columna izquierda (igual que PaymentMethods) */}
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

      {/* Lista de teleports: columna derecha (igual que PaymentMethods) */}
      <DashboardSection title={t("teleport-dashboard.teleports-list.title")}>
        <TeleportList
          teleports={teleports}
          deleting={deleting}
          onDelete={handleDelete}
          t={t}
        />
      </DashboardSection>
    </div>
  );
};

export default TeleportDashboard;

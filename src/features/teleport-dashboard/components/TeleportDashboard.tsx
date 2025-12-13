import React from "react";
import LoadingSpinnerCentral from "@/components/utilities/loading-spinner-v2";
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
      <div className="bg-gray-900 min-h-screen flex items-center justify-center">
        <LoadingSpinnerCentral />
      </div>
    );
  }

  return (
    <div className="relative text-white p-6 md:p-10 bg-slate-900/95 backdrop-blur-sm rounded-2xl mx-2 md:mx-6 my-6 border border-slate-700/50 shadow-xl">
      {/* Fondo sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl"></div>

      <div className="relative z-10">
        <div className="mb-10">
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-200 mb-2">
            {t("teleport-dashboard.intro-text")}
          </h1>
          <div className="h-px w-full bg-slate-700/50"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-[95rem] mx-auto">
          <TeleportForm
            form={form}
            errors={errors}
            submitting={submitting}
            onChange={handleChange}
            onSubmit={handleSubmit}
            t={t}
          />

          <TeleportList
            teleports={teleports}
            deleting={deleting}
            onDelete={handleDelete}
            t={t}
          />
        </div>
      </div>
    </div>
  );
};

export default TeleportDashboard;

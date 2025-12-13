import React from "react";
import LoadingSpinnerCentral from "@/components/utilities/loading-spinner-v2";
import { AdvertisingRealmDashboardProps } from "../types";
import { useAdvertisingRealm } from "../hooks/useAdvertisingRealm";
import AdvertisingRealmPreview from "./AdvertisingRealmPreview";
import AdvertisingRealmForm from "./AdvertisingRealmForm";

const AdvertisingRealmDashboard: React.FC<AdvertisingRealmDashboardProps> = ({
  token,
  realmId,
  t,
}) => {
  const {
    formData,
    copied,
    language,
    errors,
    loading,
    handleChange,
    handleSubmit,
    handleCopy,
    handleLanguageChange,
  } = useAdvertisingRealm({ token, realmId, t });

  if (loading) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center">
        <LoadingSpinnerCentral />
      </div>
    );
  }

  return (
    <div className="text-slate-200 flex flex-col items-center md:p-12 space-y-12">
      <AdvertisingRealmPreview
        formData={formData}
        copied={copied}
        onCopy={handleCopy}
        t={t}
      />

      <AdvertisingRealmForm
        formData={formData}
        errors={errors}
        language={language}
        onChange={handleChange}
        onLanguageChange={handleLanguageChange}
        onSubmit={handleSubmit}
        t={t}
      />
    </div>
  );
};

export default AdvertisingRealmDashboard;

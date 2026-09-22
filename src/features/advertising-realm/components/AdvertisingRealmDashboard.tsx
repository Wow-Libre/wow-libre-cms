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
    submitting,
    handleChange,
    handleSubmit,
    handleCopy,
    handleLanguageChange,
  } = useAdvertisingRealm({ token, realmId, t });

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-transparent">
        <LoadingSpinnerCentral />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-12 text-[#1d1d1f] md:p-4">
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
        submitting={submitting}
        token={token}
        onChange={handleChange}
        onLanguageChange={handleLanguageChange}
        onSubmit={handleSubmit}
        t={t}
      />
    </div>
  );
};

export default AdvertisingRealmDashboard;

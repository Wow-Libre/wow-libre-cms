"use client";

import BankDashboard from "@/components/dashboard/bank";
import {
  DashboardLoading,
  DashboardPageWrapper,
} from "@/components/dashboard/layout";
import Header from "@/components/dashboard/header";
import HomeDashboard from "@/components/dashboard/home";
import Sidebar from "@/components/dashboard/sidebard";
import UsersDashboard from "@/components/dashboard/user";
import {
  DASHBOARD_OPTION_DESCRIPTIONS,
  DASHBOARD_OPTION_TITLES,
} from "@/components/dashboard/constants/menuConfig";
import { useUserContext } from "@/context/UserContext";
import { AdvertisingRealmDashboard } from "@/features/advertising-realm";
import { PremiumDashboard } from "@/features/premium";
import { PromotionsDashboard } from "@/features/promotions";
import { TeleportDashboard } from "@/features/teleport-dashboard";
import Cookies from "js-cookie";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import BannersAdvertisingDashboard from "../dashboard/banners";
import FaqsDashboard from "../dashboard/faqs";
import GuildsDashboard from "../dashboard/guilds";
import NewsAdministrator from "../dashboard/news";
import PaymentMethodsDashboard from "../dashboard/paymentMethods";
import ProductDashboard from "../dashboard/products";
import ProviderConfigs from "../dashboard/providers";
import VotesDashboard from "../dashboard/votes";
import InterstitialDashboard from "../dashboard/interstitial";
import SubscriptionsDashboard from "../dashboard/subscriptions";
import PlansDashboard from "../dashboard/plans";
import NotificationsDashboard from "../dashboard/notifications";
import SettingsServer from "../settings";

const AdministratorServer = () => {
  const [activeOption, setActiveOption] = useState("dashboard");
  const searchParams = useSearchParams();
  const serverId = Number(searchParams.get("id"));
  const option = searchParams.get("activeOption");
  const router = useRouter();
  const token = Cookies.get("token");
  const [loading, setLoading] = useState(true);
  const { user } = useUserContext();
  const { t } = useTranslation();

  const handleOptionChange = (option: string) => {
    setActiveOption(option);
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("activeOption", option);
    searchParams.set("id", serverId.toString());
    router.push(`${window.location.pathname}?${searchParams.toString()}`);
  };

  useEffect(() => {
    if (option) {
      setActiveOption(option || "dashboard");
    }
  }, [option]);

  useEffect(() => {
    if (token && serverId) {
      setLoading(false);
    }
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <DashboardLoading message="Cargando panel..." />
      </div>
    );
  }

  const pageTitle = DASHBOARD_OPTION_TITLES[activeOption] ?? "Panel";
  const pageDescription = DASHBOARD_OPTION_DESCRIPTIONS[activeOption];

  return (
    <div className="flex min-h-screen w-full max-w-full overflow-x-hidden bg-slate-950 text-white">
      <Sidebar onOptionChange={handleOptionChange} />
      {/* Espaciador que reserva el ancho del sidebar (móvil: sin espacio; desktop: mismo ancho que el sidebar fijo) */}
      <div className="hidden shrink-0 md:block md:w-64 lg:w-56 xl:w-52 2xl:w-56" aria-hidden />
      {/* Columna de contenido: solo ocupa el espacio restante, sin margen que desborde */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col border-l border-slate-800/60 bg-slate-900/50 overflow-x-hidden">
        <Header />
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full min-w-0 overflow-x-hidden p-5 sm:p-6 lg:p-8 box-border">
            <DashboardPageWrapper title={pageTitle} description={pageDescription} fullWidth>
          {/* PORTALES */}
          {activeOption === "portals" && token && (
            <TeleportDashboard token={token} realmId={serverId} t={t} />
          )}
          {/* Reino */}
          {activeOption === "adversing" && token && (
            <AdvertisingRealmDashboard token={token} realmId={serverId} t={t} />
          )}
          {/* Promociones */}
          {activeOption === "promotions" && token && serverId && (
            <PromotionsDashboard
              token={token}
              realmId={serverId}
              language={user.language || "ES"}
            />
          )}
          {/* Premium */}
          {activeOption === "premium" && token && serverId && (
            <PremiumDashboard
              token={token}
              realmId={serverId}
              language={user.language || "ES"}
            />
          )}
          {/* HOME DASHBOARD */}
          {activeOption === "dashboard" && token && serverId && (
            <HomeDashboard token={token} serverId={serverId} />
          )}
          {activeOption === "products" && token && (
            <ProductDashboard token={token} realmId={serverId} />
          )}
          {activeOption === "settings" && token && serverId && (
            <SettingsServer token={token} serverId={serverId} />
          )}
          {activeOption === "bank" && token && serverId && (
            <BankDashboard token={token} serverId={serverId} />
          )}
          {activeOption === "guilds" && <GuildsDashboard />}
          {activeOption === "news" && token && (
            <NewsAdministrator token={token} />
          )}
          {activeOption === "users" && token && serverId && (
            <UsersDashboard token={token} serverId={serverId} />
          )}
          {activeOption === "faqs" && token && (
            <FaqsDashboard token={token} t={t} />
          )}
          {activeOption === "advertising" && token && (
            <BannersAdvertisingDashboard token={token} t={t} />
          )}
          {activeOption === "votes" && token && (
            <VotesDashboard token={token} t={t} />
          )}
          {activeOption === "interstitial" && token && (
            <InterstitialDashboard token={token} t={t} />
          )}
          {activeOption === "subscriptions" && token && (
            <SubscriptionsDashboard token={token} t={t} />
          )}
          {activeOption === "plans" && token && (
            <PlansDashboard token={token} t={t} />
          )}
          {activeOption === "notifications" && token && (
            <NotificationsDashboard token={token} t={t} />
          )}
          {activeOption === "provider" && token && (
            <ProviderConfigs token={token} t={t} />
          )}
          {activeOption === "paymentMethods" && token && (
            <PaymentMethodsDashboard token={token} t={t} />
          )}
            </DashboardPageWrapper>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdministratorServer;

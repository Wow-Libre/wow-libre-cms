"use client";

import { getSubscriptionActive } from "@/api/subscriptions";
import { getServerNameAndExpansion } from "@/api/vdp";
import NavbarAuthenticated from "@/components/navbar-authenticated";
import LoadingSpinner from "@/components/utilities/loading-spinner";
import ServerAnalytics from "@/components/vdp/analytics";
import VdpBody from "@/components/vdp/body";
import ServerEvents from "@/components/vdp/events";
import VdpBanner from "@/components/vdp/header";
import ServerInformationVdp from "@/components/vdp/information";
import { useUserContext } from "@/context/UserContext";
import { ServerVdpDto } from "@/model/model";
import Cookies from "js-cookie";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const Vdp = () => {
  const router = useRouter();
  const [redirect, setRedirect] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isLogged, setIsLogged] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fadeIn, setFadeIn] = useState<boolean>(false);

  const { t } = useTranslation();
  const { user } = useUserContext();

  const [vdpModel, setServerVdp] = useState<ServerVdpDto>();
  const searchParams = useSearchParams();
  const token = Cookies.get("token");

  const serverId = searchParams.get("id");
  const expansion = searchParams.get("expansion");

  useEffect(() => {
    const fetchData = async () => {
      if (!serverId || !expansion) {
        setRedirect(true);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const [subscriptionActive, serverVdp] = await Promise.all([
          token ? getSubscriptionActive(token) : Promise.resolve(false),
          getServerNameAndExpansion(serverId, expansion, user.language),
        ]);
        setServerVdp(serverVdp);
        setIsSubscribed(subscriptionActive);
        setIsLoading(false);
        // Trigger fade-in animation after a short delay
        setTimeout(() => setFadeIn(true), 100);
      } catch (error: any) {
        console.error("Error fetching VDP data:", error);
        setRedirect(true);
        setIsLoading(false);
      }
    };
    fetchData();
    if (!user.logged_in) setIsLogged(false);
    if (user && user.logged_in && token) setIsLogged(true);
  }, [serverId, expansion, user.language, token, user.logged_in]);

  useEffect(() => {
    if (redirect) {
      router.push("/");
    }
  }, [redirect, router]);

  if (isLoading || !vdpModel) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-white/70 text-lg animate-pulse">
            {t("vdp-server.loading") || "Cargando información del servidor..."}
          </p>
        </div>
      </div>
    );
  }

  if (!serverId || !expansion) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-white/70 text-lg">
            {t("vdp-server.redirecting") || "Redirigiendo..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Navbar Section - Sin fondo para que use su propio bg-midnight */}
      <div className="contenedor">
        <NavbarAuthenticated />
      </div>

      {/* Main Content with fade-in animation */}
      <div
        className={`text-white relative overflow-hidden transition-all duration-1000 ${
          fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
        style={{
          background:
            "linear-gradient(135deg, #0B1218 0%, #0f1729 20%, #1a2332 40%, #1e293b 60%, #1a2332 80%, #0B1218 100%)",
        }}
      >
        {/* Background decorative pattern */}
        <div className="absolute inset-0 opacity-15">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        {/* Animated background particles - más sutiles para combinar con midnight */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-slate-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-slate-600/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 right-1/3 w-64 h-64 bg-slate-400/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        {/* Content wrapper with relative positioning */}
        <div className="relative z-10">
          {/* Banner Section */}
          <VdpBanner
            type={vdpModel.type}
            name={vdpModel.name}
            realmlist={vdpModel.realmlist}
            description={vdpModel.disclaimer}
            url={vdpModel.url}
            isLogged={isLogged}
            logo={vdpModel.logo}
            headerImgCenter={vdpModel.header_center_img}
            headerImgLeft={vdpModel.header_left_img}
            headerImgRight={vdpModel.header_right_img}
            t={t}
          />

          {/* Analytics Section with separator */}
          <div className="relative py-12">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-500/30 to-transparent"></div>
            <ServerAnalytics cardData={vdpModel.cards} />
          </div>

          {/* Body Section with separator */}
          <div className="relative py-8">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500/40 to-transparent"></div>
            <VdpBody
              serverData={vdpModel.information}
              t={t}
              serverName={serverId}
              youtubeUrl={vdpModel.youtube_url}
            />
          </div>

          {/* Subscription Information Section */}
          <div className="relative py-8">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-400/30 to-transparent"></div>
            <ServerInformationVdp isSubscribed={isSubscribed} t={t} />
          </div>

          {/* Events Section with separator */}
          <div className="relative py-12 pb-20">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-500/30 to-transparent"></div>
            <ServerEvents events={vdpModel.events} t={t} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vdp;

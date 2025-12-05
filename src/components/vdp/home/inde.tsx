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
        setRedirect(false);
        return;
      }

      try {
        const [subscriptionActive, serverVdp] = await Promise.all([
          token ? getSubscriptionActive(token) : Promise.resolve(false),
          getServerNameAndExpansion(serverId, expansion, user.language),
        ]);
        setServerVdp(serverVdp);
        setIsSubscribed(subscriptionActive);
      } catch (error: any) {
        setRedirect(false);
      }
    };
    fetchData();
    if (!user.logged_in) setIsLogged(false);
    if (user && user.logged_in && token) setIsLogged(true);
  }, [serverId, expansion]);

  useEffect(() => {
    if (redirect) {
      router.push("/");
    }
  }, [redirect]);

  if (!vdpModel) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <LoadingSpinner />
      </div>
    );
  }
  if (!serverId || !expansion) {
    setRedirect(true);
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <LoadingSpinner />
      </div>
    );
  }
  return (
    <div>
      <div className="contenedor mb-6">
        <NavbarAuthenticated />
      </div>
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
      <ServerAnalytics cardData={vdpModel.cards} />
      <VdpBody
        serverData={vdpModel.information}
        t={t}
        serverName={serverId}
        youtubeUrl={vdpModel.youtube_url}
      />
      <ServerInformationVdp isSubscribed={isSubscribed} t={t} />

      <ServerEvents events={vdpModel.events} t={t} />
    </div>
  );
};

export default Vdp;

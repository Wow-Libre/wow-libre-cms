import Advertising from "@/components/home/banner";
import Bidding from "@/components/home/bidding";
import DownloadApp from "@/components/home/download-app";
import DownloadGame from "@/components/home/download-game";
import Interstitial from "@/components/home/interstitial";
import RealmsHome from "@/components/home/realms";
import ServerFeatures from "@/components/home/server-features";
import Subscription from "@/components/home/subscription";
import VotingSlider from "@/components/home/votingSlider";
import HeroSection from "@/components/home/welcome";
import { Navbar } from "@/features/navbar";

const HOME_SIDE_SWORD =
  "https://static.wixstatic.com/media/5dd8a0_9222be68baa94d82b57cdd840b2ec278~mv2.png";
const HOME_SIDE_SHIELD =
  "https://static.wixstatic.com/media/5dd8a0_345e699c01dd473894066e4b14870640~mv2.png";
const HOME_SIDE_SHIELD_TOP =
  "https://static.wixstatic.com/media/5dd8a0_f4846f95bf2443d5ab7f02ae4e0f7b9a~mv2.png";

const Home = () => {
  return (
    <div className="relative overflow-visible bg-midnight">
      <div className="pointer-events-none absolute inset-0 z-0 fire-embers-blue opacity-50" />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_20%_18%,rgba(56,189,248,0.10),transparent_38%),radial-gradient(circle_at_82%_84%,rgba(14,165,233,0.08),transparent_40%)]" />
      <img
        src={HOME_SIDE_SWORD}
        alt="Decoracion espada helada"
        className="store-sword-animated pointer-events-none absolute bottom-24 left-12 z-[1] hidden w-[22rem] opacity-65 lg:block xl:w-[26rem]"
      />
      <img
        src={HOME_SIDE_SHIELD}
        alt="Decoracion escudo y hachas"
        className="home-shield-animated pointer-events-none absolute bottom-20 right-10 z-[1] hidden w-[20rem] opacity-70 lg:block xl:w-[24rem]"
      />
      <img
        src={HOME_SIDE_SHIELD_TOP}
        alt="Decoracion superior junto al escudo"
        className="home-shield-animated pointer-events-none absolute bottom-[26rem] right-12 z-[1] hidden w-[12rem] opacity-70 lg:block xl:bottom-[28rem] xl:w-[14rem]"
      />
      <div className="contenedor relative z-30 mb-6">
        <Navbar />
      </div>
      <div className="relative z-10">
        <Advertising />
        <HeroSection />
        <RealmsHome />
        <VotingSlider />
        <ServerFeatures />
        <Bidding />
        <DownloadApp />
        <DownloadGame />
        <Subscription />
        <Interstitial />
      </div>
    </div>
  );
};
export default Home;

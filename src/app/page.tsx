import Advertising from "@/components/home/banner";
import Bidding from "@/components/home/bidding";
import DownloadApp from "@/components/home/download-app";
import DownloadGame from "@/components/home/download-game";
import Interstitial from "@/components/home/interstitial";
import LatestNews from "@/components/home/news";
import RealmsHome from "@/components/home/realms";
import ServerFeatures from "@/components/home/server-features";
import Subscription from "@/components/home/subscription";
import VotingSlider from "@/components/home/votingSlider";
import HeroSection from "@/components/home/welcome";
import { Navbar } from "@/features/navbar";

const Home = () => {
  return (
    <>
      <Navbar />
      <Advertising />
      <LatestNews />
      <HeroSection />
      <RealmsHome />
      <VotingSlider />
      <ServerFeatures />
      <Bidding />
      <DownloadApp />
      <DownloadGame />
      <Subscription />
      <Interstitial />
    </>
  );
};
export default Home;

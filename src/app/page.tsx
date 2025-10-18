import Advertising from "@/components/home/banner";
import Bidding from "@/components/home/bidding";
import DownloadGame from "@/components/home/download-game";
import ServerFeatures from "@/components/home/server-features";
import LatestNews from "@/components/home/news";
import RealmsHome from "@/components/home/realms";
import Subscription from "@/components/home/subscription";
import VotingSlider from "@/components/home/votingSlider";
import WelcomeHome from "@/components/home/welcome";
import { Navbar } from "@/features/navbar";

const Home = () => {
  return (
    <>
      <Navbar />
      <Advertising />
      <LatestNews />
      <WelcomeHome />
      <RealmsHome />
      <VotingSlider />
      <ServerFeatures />
      <Bidding />
      <DownloadGame />
      <Subscription />
    </>
  );
};
export default Home;

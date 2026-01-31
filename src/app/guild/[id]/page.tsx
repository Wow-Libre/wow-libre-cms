"use client";

import GuildCharacter from "@/components/guild_character";
import DisplayMoney from "@/components/money";
import NavbarAuthenticated from "@/components/navbar-authenticated";
import LoadingSpinner from "@/components/utilities/loading-spinner";
import Cookies from "js-cookie";
import Link from "next/link";
import Swal from "sweetalert2";

import { benefitsActive } from "@/api/benefit";
import { getGuild } from "@/api/guilds";
import { useUserContext } from "@/context/UserContext";
import { BenefitsModel } from "@/model/benefit-model";
import { GuildData } from "@/model/model";
import WowheadTooltip from "@/utils/wowhead";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const GuildDetail = () => {
  const searchParams = useSearchParams();

  const { user } = useUserContext();

  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const guildId = Number(id);
  const [guild, setGuild] = useState<GuildData>();
  const token = Cookies.get("token");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loggin, setLoggin] = useState(false);
  const [benefits, setBenefits] = useState<BenefitsModel[]>([]);
  const router = useRouter();
  const serverId = Number(searchParams.get("server"));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [guildsResponse, benefits] = await Promise.all([
          getGuild(guildId, serverId, user.language),
          benefitsActive(user.language),
        ]);

        if (!guildsResponse.public_access) {
          router.push("/guild");
        }

        setBenefits(benefits);
        setGuild(guildsResponse);
        setIsLoading(false);
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: `${error.message}`,
          color: "white",
          background: "#0B1218",
          willClose: () => {
            router.push("/guild");
          },
        }).then((result) => {
          if (result.isConfirmed) {
            router.push("/guild");
          }
        });
      }
    };
    fetchData();
    setLoggin(token != null && user.logged_in);
  }, [token, user.language, guildId, serverId]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen ">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <WowheadTooltip />
      <div className="contenedor">
        <NavbarAuthenticated />
      </div>
      <div
        className="text-white mt-14 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #0B1218 0%, #1a2332 25%, #2B5876 50%, #4E4376 75%, #0B1218 100%)",
        }}
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="contenedor mx-auto px-6 py-12 lg:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="flex flex-col justify-between max-w-2xl w-full">
              <div>
                <div className="inline-block px-4 py-2 bg-blue-500/20 rounded-full text-blue-300 text-sm font-medium mb-4 border border-blue-500/30">
                  {guild?.server_name}
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-10 text-white">
                  {t("guild-detail.welcome-txt")}:{" "}
                  <span className="text-blue-300">{guild?.name}</span>
                </h2>
                <p className="text-lg lg:text-2xl mb-4 break-words text-gray-200 leading-relaxed">
                  {guild?.info}
                </p>
              </div>
              <div>
                {loggin ? (
                  <>
                    <button
                      onClick={openModal}
                      className="group px-8 py-4 bg-blue-500 hover:bg-blue-600 rounded-xl text-white font-semibold mb-4 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 border border-blue-400/30"
                    >
                      <span className="flex items-center gap-2">
                        {t("guild-detail.btn-authenticated")}
                        <svg
                          className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </span>
                    </button>
                  </>
                ) : (
                  <Link
                    href="/register"
                    className="group inline-block px-8 py-4 bg-blue-500 hover:bg-blue-600 rounded-xl text-white font-semibold mb-4 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 border border-blue-400/30"
                  >
                    <span className="flex items-center gap-2">
                      {t("guild-detail.btn-unauthenticated")}
                      <svg
                        className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </span>
                  </Link>
                )}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <p className="text-lg pt-2 break-words text-gray-200 italic">
                    "{guild?.motd}"
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:gap-8 select-none">
              <div className="relative h-80 lg:h-auto group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl z-10"></div>
                <img
                  src="https://static.wixstatic.com/media/5dd8a0_d3843acf700e43b3a5aac5bf19f145b6~mv2.webp"
                  alt="guild-img-one"
                  className="object-cover rounded-xl w-full h-full transition-all duration-500 group-hover:scale-105 group-hover:brightness-110"
                />
                <div className="absolute bottom-4 left-4 right-4 z-20">
                  <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-white text-sm font-medium">Guild Hall</p>
                  </div>
                </div>
              </div>
              <div className="relative h-80 lg:h-auto group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl z-10"></div>
                <img
                  src="https://static.wixstatic.com/media/5dd8a0_aa7097f05b69423fb6e4da3c7f2a79e9~mv2.jpg"
                  alt="guild-img-two"
                  className="object-cover rounded-xl w-full h-full transition-all duration-500 group-hover:scale-105 group-hover:brightness-110"
                />
                <div className="absolute bottom-4 left-4 right-4 z-20">
                  <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-white text-sm font-medium">
                      Guild Events
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-24 sm:py-32 bg-midnight">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-6 py-3 bg-blue-500/20 rounded-full text-blue-300 text-sm font-medium mb-6 border border-blue-500/30">
              Guild Overview
            </div>
            <h2 className="text-4xl font-bold text-white mb-6">
              Guild Statistics
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Key metrics and information about this guild
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Members Card */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-3xl p-8 border border-blue-500/20 hover:border-blue-400/40 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg
                      className="w-7 h-7 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div className="text-right">
                    <div className="text-6xl font-bold text-blue-300 mb-2">
                      {guild?.members}
                    </div>
                    <div className="text-lg text-blue-400 font-medium">
                      Active Members
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">
                  {t("guild-detail.statistics.member-txt")}
                </h3>
                <p className="text-gray-400 text-lg">
                  Total registered guild members
                </p>
              </div>
            </div>

            {/* Benefits Card */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-3xl p-8 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg
                      className="w-7 h-7 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                      />
                    </svg>
                  </div>
                  <div className="text-right">
                    <div className="text-6xl font-bold text-purple-300 mb-2">
                      {0}
                    </div>
                    <div className="text-lg text-purple-400 font-medium">
                      Available
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">
                  {t("guild-detail.statistics.benefits-txt")}
                </h3>
                <p className="text-gray-400 text-lg">
                  Guild benefits and perks
                </p>
              </div>
            </div>

            {/* Gold Card */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 rounded-3xl p-8 border border-yellow-500/20 hover:border-yellow-400/40 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 bg-yellow-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg
                      className="w-7 h-7 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-yellow-300 mb-2">
                      <DisplayMoney money={guild?.bank_money || 0} />
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">
                  {t("guild-detail.statistics.gold-guild-txt")}
                </h3>
                <p className="text-gray-400 text-lg">
                  Total gold in guild bank
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="contenedor mb-20 bg-midnight py-20">
        <div className="container px-6 py-10 mx-auto">
          <div className="xl:flex xl:items-center xL:-mx-4">
            <div className="xl:w-1/2 xl:mx-4">
              <div className="inline-block px-4 py-2 bg-blue-500/20 rounded-full text-blue-300 text-sm font-medium mb-6 border border-blue-500/30">
                Guild Events
              </div>
              <h1 className="text-3xl font-bold lg:text-4xl text-white mb-6">
                {t("guild-detail.incentive.title")}
              </h1>

              <p className="max-w-2xl mt-4 text-gray-300 text-lg leading-relaxed">
                {t("guild-detail.incentive.description")}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 mt-8 xl:mt-0 xl:mx-4 xl:w-1/2 md:grid-cols-2">
              <div className="group bg-gray-800 rounded-2xl p-6 border border-gray-600 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10">
                <div className="relative overflow-hidden rounded-xl mb-4">
                  <img
                    className="object-cover aspect-square w-full transition-all duration-500 group-hover:scale-110"
                    src="https://static.wixstatic.com/media/5dd8a0_6974cde1ffe0448590a453517dcf4ec8~mv2.webp"
                    alt="guild-img-one"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-4 right-4 bg-blue-500/90 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Featured
                  </div>
                </div>

                <h1 className="mt-4 text-2xl font-bold capitalize text-white group-hover:text-blue-300 transition-colors duration-300">
                  {t("guild-detail.event.primary.title")}
                </h1>

                <p className="mt-2 text-gray-300 text-lg leading-relaxed">
                  {t("guild-detail.event.primary.description")}
                </p>
              </div>

              <div className="group bg-gray-800 rounded-2xl p-6 border border-gray-600 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10">
                <div className="relative overflow-hidden rounded-xl mb-4">
                  <img
                    className="object-cover aspect-square w-full transition-all duration-500 group-hover:scale-110"
                    src="https://static.wixstatic.com/media/5dd8a0_7229fb3584494cac8e35c956582bb47d~mv2.webp"
                    alt="guild-img-two"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-4 right-4 bg-purple-500/90 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Special
                  </div>
                </div>

                <h1 className="mt-4 text-2xl font-bold capitalize text-white group-hover:text-purple-300 transition-colors duration-300">
                  {t("guild-detail.event.secondary.title")}
                </h1>

                <p className="mt-2 text-gray-300 text-lg leading-relaxed">
                  {t("guild-detail.event.secondary.description")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-midnight py-20">
        <div className="container px-6 py-10 mx-auto">
          <div className="lg:-mx-6 lg:flex lg:items-center">
            <div className="relative lg:w-1/2 lg:mx-6 w-full">
              <div className="relative overflow-hidden rounded-2xl group">
                <img
                  className="object-cover object-center w-full h-96 lg:h-[36rem] transition-all duration-500 group-hover:scale-105"
                  src="https://static.wixstatic.com/media/5dd8a0_982b271da9de4ecc9c27c64387abb8a9~mv2.jpg"
                  alt="guild-competition"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-4 left-4 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Competition
                </div>
              </div>
            </div>

            <div className="mt-8 lg:w-1/2 lg:px-6 lg:mt-0">
              <div className="bg-gray-800 rounded-2xl p-8 border border-gray-600">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                      />
                    </svg>
                  </div>
                  <p className="text-4xl font-bold text-blue-500">"</p>
                </div>

                <h1 className="text-3xl font-bold text-white lg:text-4xl mb-6">
                  {t("guild-detail.competition.title")}
                </h1>

                <p className="max-w-lg mt-6 text-gray-300 text-lg leading-relaxed">
                  {t("guild-detail.competition.description")}
                </p>

                <div className="mt-8 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <h3 className="text-xl font-semibold text-blue-400 mb-2">
                    {guild?.server_name}
                  </h3>
                  <p className="text-gray-300 text-lg">
                    {t("guild-detail.competition.event-txt")}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-8 lg:justify-start">
                  <button
                    title="left arrow"
                    className="group p-3 text-gray-300 transition-all duration-300 border border-gray-600 rounded-full hover:border-blue-500 hover:bg-blue-500/10 hover:text-blue-400 hover:scale-110"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6 group-hover:translate-x-[-2px] transition-transform duration-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  <button
                    title="right arrow"
                    className="group p-3 text-gray-300 transition-all duration-300 border border-gray-600 rounded-full hover:border-purple-500 hover:bg-purple-500/10 hover:text-purple-400 hover:scale-110 lg:mx-6"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6 group-hover:translate-x-[2px] transition-transform duration-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="contenedor mt-10">
        <section className="bg-midnight py-20">
          <div className="container px-6 py-10 mx-auto">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-2 bg-blue-500/20 rounded-full text-blue-300 text-sm font-medium mb-6 border border-blue-500/30">
                Guild Events
              </div>
              <h1 className="text-3xl font-bold text-center text-white capitalize lg:text-4xl mb-4">
                {t("guild-detail.events.title")}
                <span className="block text-2xl lg:text-3xl text-blue-300 mt-2">
                  {t("guild-detail.events.duration")}
                </span>
              </h1>
              <p className="text-xl text-center text-gray-300 mt-4 max-w-2xl mx-auto leading-relaxed">
                {t("guild-detail.events.description")}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 mt-8 xl:mt-12 xl:gap-16 md:grid-cols-2 xl:grid-cols-3">
              {benefits.map((benefit) => (
                <div
                  key={benefit.id}
                  className="group flex flex-col items-center p-8 space-y-4 text-center bg-gray-800 rounded-2xl border border-gray-600 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                    <span className="relative inline-block p-4 bg-blue-500/10 rounded-full border border-blue-500/30">
                      <img
                        src={benefit.image_url}
                        alt="Logo"
                        className="w-32 h-32 rounded-full object-cover transition-all duration-300 group-hover:scale-110"
                      />
                    </span>
                  </div>

                  <div className="flex flex-col font-bold capitalize text-white space-y-2">
                    <div className="text-2xl lg:text-3xl group-hover:text-blue-300 transition-colors duration-300">
                      {benefit.title}
                    </div>
                    <div className="text-lg text-yellow-400 font-medium">
                      {benefit.sub_title}
                    </div>
                  </div>

                  <p className="text-gray-300 text-lg leading-relaxed max-w-xs">
                    {benefit.description}
                  </p>

                  <a
                    href={`${benefit.external_url}`}
                    data-wh-icon-size="small"
                    target="_blank"
                    className="group/link flex items-center gap-2 px-6 py-3 text-lg text-blue-400 capitalize transition-all duration-300 transform hover:text-blue-300 hover:scale-105 bg-blue-500/10 rounded-xl border border-blue-500/30 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/20"
                  >
                    <span>Detalle del ítem</span>
                    <svg
                      className="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="bg-midnight py-20">
        <div className="container px-6 py-10 mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-green-500/20 rounded-full text-green-300 text-sm font-medium mb-6 border border-green-500/30">
              Guild Benefits
            </div>
            <h1 className="text-3xl font-bold text-center text-white capitalize lg:text-4xl mb-4">
              {t("guild-detail.benefits.title")}
              <span className="block text-2xl lg:text-3xl text-green-300 mt-2">
                {t("guild-detail.benefits.subtitle")}
              </span>
            </h1>

            <p className="max-w-2xl mx-auto my-6 text-center text-gray-300 text-lg leading-relaxed">
              {t("guild-detail.benefits.disclaimer")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 mt-8 xl:mt-16 md:grid-cols-2 xl:grid-cols-2">
            {guild?.benefits && guild?.benefits.length > 0 ? (
              guild.benefits.map((benefit) => (
                <div
                  key={benefit.id}
                  className="group px-8 py-8 transition-all duration-300 transform border border-gray-600 cursor-pointer rounded-2xl hover:border-green-500/50 hover:bg-gray-800 hover:shadow-2xl hover:shadow-green-500/10 hover:scale-105"
                >
                  <div className="flex flex-col sm:-mx-4 sm:flex-row items-center sm:items-start">
                    <div className="relative mb-4 sm:mb-0">
                      <div className="absolute inset-0 bg-green-500/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-300"></div>
                      <img
                        className="relative flex-shrink-0 object-cover w-20 h-20 rounded-full sm:mx-4 ring-4 ring-gray-600 group-hover:ring-green-500/50 transition-all duration-300"
                        src={benefit.logo}
                        alt=""
                      />
                    </div>

                    <div className="mt-4 sm:mx-4 sm:mt-0 text-center sm:text-left">
                      <h1 className="text-xl font-bold text-white capitalize md:text-2xl group-hover:text-green-300 transition-colors duration-300">
                        {benefit.title}
                      </h1>

                      <p className="mt-2 text-gray-300 capitalize group-hover:text-gray-200 text-lg transition-colors duration-300">
                        {benefit.sub_title}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full flex justify-center items-center py-16">
                <div className="text-center">
                  <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                      className="w-12 h-12 text-yellow-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <p className="text-center text-yellow-400 text-2xl font-semibold">
                    {t("guild-detail.benefits.no-benefits")}
                  </p>
                  <p className="text-gray-400 text-lg mt-2">
                    No benefits available at the moment
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      {token && loggin && (
        <GuildCharacter
          isOpen={isModalOpen}
          token={token}
          guildId={guildId}
          serverId={serverId}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default GuildDetail;

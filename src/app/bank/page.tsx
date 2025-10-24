"use client";

import NavbarAuthenticated from "@/components/navbar-authenticated";
import Plans from "@/components/plan";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useUserContext } from "@/context/UserContext";
import BankCharacter from "@/components/bank_character";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "@/components/utilities/loading-spinner";
import { BankPlans } from "@/model/model";
import { getPlans } from "@/api/bank";

const Bank = () => {
  const token = Cookies.get("token");
  const { user } = useUserContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<number>();
  const [loggin, setLoggin] = useState(false);
  const { t, ready } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [bankPlans, setBankPlans] = useState<BankPlans[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const plans = await getPlans(user.language);
        setBankPlans(plans);
      } catch (error: any) {
        setBankPlans([]);
      }
    };

    setLoggin(token != null && user.logged_in);
    if (ready) {
      setLoading(false);
    }
    fetchData();
  }, [token]);

  const openModal = (planId: number) => {
    setIsModalOpen(true);
    setSelectedPlanId(planId);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="contenedor flex items-center justify-center mt-20">
        <NavbarAuthenticated />
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="">
      <div className="contenedor">
        <NavbarAuthenticated />
      </div>
      <div
        className="text-white mb-20 mt-14 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #533483 75%, #e94560 100%)",
        }}
      >
        {/* Efecto de partículas de fondo */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-20 w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-32 w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse delay-2000"></div>
          <div className="absolute bottom-40 right-10 w-1 h-1 bg-orange-300 rounded-full animate-pulse delay-500"></div>
        </div>
        <div className="contenedor mx-auto px-6 py-12 lg:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="flex flex-col justify-between max-w-2xl w-full">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-10 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                  {t("bank.title")}
                </h2>
                <p className="text-lg lg:text-2xl mb-4 break-words text-gray-200 leading-relaxed">
                  {t("bank.description")}
                </p>
                <ul className="list-disc list-inside text-lg lg:text-xl mb-4 pt-2 pl-6 space-y-2">
                  <li className="text-lg lg:text-xl font-semibold text-yellow-300">
                    {t("bank.benefits.primary")}
                  </li>
                </ul>
              </div>
              <div className="mt-10">
                {loggin ? (
                  <>
                    <Link
                      href="#plans"
                      className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 rounded-xl text-white font-semibold mb-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 inline-block"
                    >
                      {t("bank.btn.primary")}
                    </Link>
                  </>
                ) : (
                  <Link
                    href="/register"
                    className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 rounded-xl text-white font-semibold mb-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 inline-block"
                  >
                    {t("bank.btn.secondary")}
                  </Link>
                )}

                <p className="text-lg pt-4 break-words text-gray-300 leading-relaxed">
                  {t("bank.disclaimer")}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:gap-8">
              <div className="relative h-80 lg:h-auto select-none group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 rounded-xl"></div>
                <img
                  src="https://static.wixstatic.com/media/5dd8a0_e387b25639124394932b6ce314705d18~mv2.webp"
                  alt="Globin-loan"
                  className="object-cover rounded-xl w-full h-full transition duration-500 group-hover:scale-110 group-hover:opacity-90"
                />
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-yellow-400/50 rounded-xl transition-all duration-300"></div>
              </div>
              <div className="relative h-80 lg:h-auto select-none group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 rounded-xl"></div>
                <img
                  src="https://static.wixstatic.com/media/5dd8a0_3cbcda29d131473a9e9763813066cd75~mv2.webp"
                  alt="Globin-loan-bank"
                  className="object-cover rounded-xl w-full h-full transition duration-500 group-hover:scale-110 group-hover:opacity-90"
                />
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-orange-400/50 rounded-xl transition-all duration-300"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-between mt-20 mb-20 ">
        <div className="text-center">
          <p className="mt-4 text-lg leading-9 text-gray-300 font-regular">
            {t("bank.collection_guide.title")}
          </p>
          <h3 className="text-3xl sm:text-5xl leading-normal font-extrabold tracking-tight text-gray-100">
            {t("bank.collection_guide.sub_title")}
            <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              {t("bank.collection_guide.sub_title_two")}
            </span>
          </h3>
        </div>

        <div className="mt-20">
          <ul className="md:grid md:grid-cols-3 md:col-gap-10 md:row-gap-10">
            <li className="bg-gradient-to-br from-gray-100 to-gray-200 p-5 pb-10 text-center rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group">
              <div className="flex flex-col items-center">
                <div className="flex-shrink-0 relative top-0 -mt-16">
                  <div className="flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white border-4 border-white text-xl font-semibold shadow-lg group-hover:scale-110 transition-transform duration-200">
                    1
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="text-xl leading-6 font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                    {t("bank.collection_guide.guide_steps.primary.title")}
                  </h4>
                  <p className="mt-2 text-base leading-6 text-gray-800 group-hover:text-gray-700 transition-colors duration-300">
                    {t("bank.collection_guide.guide_steps.primary.description")}
                  </p>
                </div>
              </div>
            </li>
            <li className="bg-gradient-to-br from-gray-100 to-gray-200 p-5 pb-10 text-center rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group">
              <div className="flex flex-col items-center">
                <div className="flex-shrink-0 relative top-0 -mt-16">
                  <div className="flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-4 border-white text-xl font-semibold shadow-lg group-hover:scale-110 transition-transform duration-200">
                    2
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="text-xl leading-6 font-semibold text-gray-900 group-hover:text-orange-600 transition-colors duration-300">
                    {t("bank.collection_guide.guide_steps.secondary.title")}
                  </h4>
                  <p className="mt-2 text-base leading-6 text-gray-800 group-hover:text-gray-700 transition-colors duration-300">
                    {t(
                      "bank.collection_guide.guide_steps.secondary.description"
                    )}
                  </p>
                </div>
              </div>
            </li>
            <li className="bg-gradient-to-br from-gray-100 to-gray-200 p-5 pb-10 text-center rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group">
              <div className="flex flex-col items-center">
                <div className="flex-shrink-0 relative top-0 -mt-16">
                  <div className="flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white border-4 border-white text-xl font-semibold shadow-lg group-hover:scale-110 transition-transform duration-200">
                    3
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="text-xl leading-6 font-semibold text-gray-900 group-hover:text-red-600 transition-colors duration-300">
                    {t("bank.collection_guide.guide_steps.tertiary.title")}
                  </h4>
                  <p className="mt-2 text-base leading-6 text-gray-800 group-hover:text-gray-700 transition-colors duration-300">
                    {t(
                      "bank.collection_guide.guide_steps.tertiary.description"
                    )}
                  </p>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <section className=" py-12 sm:py-16 lg:py-20 xl:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-white">
              {t("bank.loan_guide.title")}
            </p>
            <h2 className="mt-6 text-3xl font-bold tracking-tight bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent sm:text-4xl lg:text-5xl">
              {t("bank.loan_guide.sub_title")}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg font-normal text-gray-300 lg:text-xl lg:leading-8">
              {t("bank.loan_guide.complementary_subtitle")}
            </p>
          </div>
          <ul className="mx-auto mt-12 grid max-w-md grid-cols-1 gap-10 sm:mt-16 lg:mt-20 lg:max-w-5xl lg:grid-cols-4">
            <li className="flex-start group relative flex lg:flex-col">
              <span
                className="absolute left-[18px] top-14 h-[calc(100%_-_32px)] w-px bg-gradient-to-b from-yellow-400 to-orange-400 lg:right-0 lg:left-auto lg:top-[18px] lg:h-px lg:w-[calc(100%_-_72px)]"
                aria-hidden="true"
              ></span>
              <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-yellow-400/50 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 transition-all duration-200 group-hover:border-yellow-400 group-hover:bg-gradient-to-br group-hover:from-yellow-400/30 group-hover:to-orange-400/30 group-hover:scale-110">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-yellow-400 group-hover:text-yellow-300"
                >
                  <path
                    d="M21 12C21 13.6569 16.9706 15 12 15C7.02944 15 3 13.6569 3 12M21 5C21 6.65685 16.9706 8 12 8C7.02944 8 3 6.65685 3 5M21 5C21 3.34315 16.9706 2 12 2C7.02944 2 3 3.34315 3 5M21 5V19C21 20.6569 16.9706 22 12 22C7.02944 22 3 20.6569 3 19V5"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </svg>
              </div>
              <div className="ml-6 lg:ml-0 lg:mt-10">
                <p className="text-lg font-bold text-white before:mb-2 before:block before:font-mono before:text-sm before:text-gray-500 uppercase group-hover:text-yellow-300 transition-colors duration-300">
                  {t("bank.loan_guide.guide_steps.primary.title")}
                </p>
                <ul className="list-disc list-inside">
                  <li className="mt-2 text-base text-gray-300 group-hover:text-gray-100 transition-colors duration-300">
                    {t(
                      "bank.loan_guide.guide_steps.primary.requirements.primary"
                    )}
                  </li>
                  <li className="mt-2 text-base text-gray-300 group-hover:text-gray-100 transition-colors duration-300">
                    {t(
                      "bank.loan_guide.guide_steps.primary.requirements.secondary"
                    )}
                  </li>
                </ul>
              </div>
            </li>
            <li className="flex-start group relative flex lg:flex-col">
              <span
                className="absolute left-[18px] top-14 h-[calc(100%_-_32px)] w-px bg-gradient-to-b from-orange-400 to-red-400 lg:right-0 lg:left-auto lg:top-[18px] lg:h-px lg:w-[calc(100%_-_72px)]"
                aria-hidden="true"
              ></span>
              <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-orange-400/50 bg-gradient-to-br from-orange-400/20 to-red-400/20 transition-all duration-200 group-hover:border-orange-400 group-hover:bg-gradient-to-br group-hover:from-orange-400/30 group-hover:to-red-400/30 group-hover:scale-110">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-orange-400 group-hover:text-orange-300"
                >
                  <path
                    d="M2 3L2 21M22 3V21M11.8 20H12.2C13.8802 20 14.7202 20 15.362 19.673C15.9265 19.3854 16.3854 18.9265 16.673 18.362C17 17.7202 17 16.8802 17 15.2V8.8C17 7.11984 17 6.27976 16.673 5.63803C16.3854 5.07354 15.9265 4.6146 15.362 4.32698C14.7202 4 13.8802 4 12.2 4H11.8C10.1198 4 9.27976 4 8.63803 4.32698C8.07354 4.6146 7.6146 5.07354 7.32698 5.63803C7 6.27976 7 7.11984 7 8.8V15.2C7 16.8802 7 17.7202 7.32698 18.362C7.6146 18.9265 8.07354 19.3854 8.63803 19.673C9.27976 20 10.1198 20 11.8 20Z"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </svg>
              </div>
              <div className="ml-6 lg:ml-0 lg:mt-10">
                <p className="text-xl font-bold text-white before:mb-2 before:block before:font-mono before:text-sm before:text-gray-500 uppercase group-hover:text-orange-300 transition-colors duration-300">
                  {t("bank.loan_guide.guide_steps.secondary.title")}
                </p>
                <p className="mt-2 text-base text-gray-300 group-hover:text-gray-100 transition-colors duration-300">
                  {t("bank.loan_guide.guide_steps.secondary.description")}
                </p>
              </div>
            </li>
            <li className="flex-start group relative flex lg:flex-col">
              <span
                className="absolute left-[18px] top-14 h-[calc(100%_-_32px)] w-px bg-gradient-to-b from-red-400 to-red-500 lg:right-0 lg:left-auto lg:top-[18px] lg:h-px lg:w-[calc(100%_-_72px)]"
                aria-hidden="true"
              ></span>
              <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-400/50 bg-gradient-to-br from-red-400/20 to-red-500/20 transition-all duration-200 group-hover:border-red-400 group-hover:bg-gradient-to-br group-hover:from-red-400/30 group-hover:to-red-500/30 group-hover:scale-110">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-red-400 group-hover:text-red-300"
                >
                  <path
                    d="M22 12C22 17.5228 17.5228 22 12 22M22 12C22 6.47715 17.5228 2 12 2M22 12C22 9.79086 17.5228 8 12 8C6.47715 8 2 9.79086 2 12M22 12C22 14.2091 17.5228 16 12 16C6.47715 16 2 14.2091 2 12M12 22C6.47715 22 2 17.5228 2 12M12 22C14.2091 22 16 17.5228 16 12C16 6.47715 14.2091 2 12 2M12 22C9.79086 22 8 17.5228 8 12C8 6.47715 9.79086 2 12 2M2 12C2 6.47715 6.47715 2 12 2"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </svg>
              </div>
              <div className="ml-6 lg:ml-0 lg:mt-10">
                <p className="text-xl font-bold text-white before:mb-2 before:block before:font-mono before:text-sm before:text-gray-500 uppercase group-hover:text-red-300 transition-colors duration-300">
                  {t("bank.loan_guide.guide_steps.tertiary.title")}
                </p>
                <p className="mt-2 text-base text-gray-300 group-hover:text-gray-100 transition-colors duration-300">
                  {t("bank.loan_guide.guide_steps.tertiary.description")}
                </p>
              </div>
            </li>
            <li className="flex-start group relative flex lg:flex-col">
              <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-yellow-400/50 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 transition-all duration-200 group-hover:border-yellow-400 group-hover:bg-gradient-to-br group-hover:from-yellow-400/30 group-hover:to-orange-400/30 group-hover:scale-110">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-yellow-400 group-hover:text-yellow-300"
                >
                  <path
                    d="M5.50049 10.5L2.00049 7.9999L3.07849 6.92193C3.964 6.03644 4.40676 5.5937 4.9307 5.31387C5.39454 5.06614 5.90267 4.91229 6.42603 4.86114C7.01719 4.80336 7.63117 4.92617 8.85913 5.17177L10.5 5.49997M18.4999 13.5L18.8284 15.1408C19.0742 16.3689 19.1971 16.983 19.1394 17.5743C19.0883 18.0977 18.9344 18.6059 18.6867 19.0699C18.4068 19.5939 17.964 20.0367 17.0783 20.9224L16.0007 22L13.5007 18.5M7 16.9998L8.99985 15M17.0024 8.99951C17.0024 10.1041 16.107 10.9995 15.0024 10.9995C13.8979 10.9995 13.0024 10.1041 13.0024 8.99951C13.0024 7.89494 13.8979 6.99951 15.0024 6.99951C16.107 6.99951 17.0024 7.89494 17.0024 8.99951ZM17.1991 2H16.6503C15.6718 2 15.1826 2 14.7223 2.11053C14.3141 2.20853 13.9239 2.37016 13.566 2.5895C13.1623 2.83689 12.8164 3.18282 12.1246 3.87469L6.99969 9C5.90927 10.0905 5.36406 10.6358 5.07261 11.2239C4.5181 12.343 4.51812 13.6569 5.07268 14.776C5.36415 15.3642 5.90938 15.9094 6.99984 16.9998V16.9998C8.09038 18.0904 8.63565 18.6357 9.22386 18.9271C10.343 19.4817 11.6569 19.4817 12.7761 18.9271C13.3643 18.6356 13.9095 18.0903 15 16.9997L20.1248 11.8745C20.8165 11.1827 21.1624 10.8368 21.4098 10.4331C21.6291 10.0753 21.7907 9.6851 21.8886 9.27697C21.9991 8.81664 21.9991 8.32749 21.9991 7.34918V6.8C21.9991 5.11984 21.9991 4.27976 21.6722 3.63803C21.3845 3.07354 20.9256 2.6146 20.3611 2.32698C19.7194 2 18.8793 2 17.1991 2Z"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </svg>
              </div>
              <div className="ml-6 lg:ml-0 lg:mt-10">
                <p className="text-xl font-bold text-white before:mb-2 before:block before:font-mono before:text-sm before:text-gray-500 uppercase group-hover:text-yellow-300 transition-colors duration-300">
                  {t("bank.loan_guide.guide_steps.quaternary.title")}
                </p>
                <p className="mt-2 text-base text-gray-300 group-hover:text-gray-100 transition-colors duration-300">
                  {t("bank.loan_guide.guide_steps.quaternary.description")}
                </p>
              </div>
            </li>
          </ul>
        </div>
      </section>
      <section id="plans">
        <Plans
          pricingPlans={bankPlans}
          onPlanSelect={openModal}
          isLogged={loggin}
        />
      </section>
      <section className=" pt-10 overflow-hidden  md:pt-0 sm:pt-16 2xl:pt-16 ">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent sm:text-5xl">
            {t("bank.our_clients.title")}{" "}
          </h2>
          <p className="mt-4 text-xl text-gray-400">
            {t("bank.our_clients.subtitle")}
          </p>
        </div>
        <div className="px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid items-center grid-cols-1 md:grid-cols-2">
            <div className="p-2">
              <h2 className="text-3xl font-bold leading-tight bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent sm:text-4xl lg:text-5xl">
                {t("bank.our_clients.testimony.title")}
                <br className="block " />
                {t("bank.our_clients.testimony.sub_title")}
              </h2>

              <div className="mt-8 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                <p className="text-lg text-gray-200 leading-relaxed">
                  {t("bank.our_clients.testimony.primary_paragraph")}
                </p>
                <p className="mt-4 text-lg text-gray-200 leading-relaxed">
                  {t("bank.our_clients.testimony.secondary_paragraph")}
                </p>
                <p className="mt-4 text-lg text-gray-200 leading-relaxed">
                  {t("bank.our_clients.testimony.tertiary_paragraph")}
                </p>

                <p className="mt-4 text-xl text-gray-300 md:mt-8">
                  <span className="relative inline-block">
                    <span className="absolute inline-block w-full bottom-0.5 h-2 bg-gradient-to-r from-yellow-400/30 to-orange-400/30"></span>
                    <span className="relative">
                      {t("bank.our_clients.testimony.text_link")}
                    </span>
                  </span>
                  <br className="block sm:hidden" />
                  {t("bank.our_clients.testimony.sub_text_link")}
                  <a
                    href="https://www.facebook.com/WowLibre/"
                    target="_blank"
                    title=""
                    className="transition-all duration-200 text-yellow-400 hover:text-orange-400 hover:underline hover:scale-105 inline-block"
                  >
                    {t("bank.our_clients.testimony.facebook_text_link")}
                  </a>
                </p>
              </div>
            </div>

            <div className="relative group">
              <img
                className="absolute inset-x-0 bottom-0 -mb-48 -translate-x-1/2 left-1/2 transition-transform duration-500 group-hover:scale-105"
                src="https://static.wixstatic.com/shapes/5dd8a0_fc26647a4c274a0a93baa31fa4be899a.svg"
                alt="goblin_ground"
              />

              <img
                className="relative w-full xl:max-w-lg xl:mx-auto 2xl:origin-bottom 2xl:scale-110 transition-transform duration-500 group-hover:scale-115"
                src="https://static.wixstatic.com/media/5dd8a0_168716ee99374e63aa3dd2f9aa448bf2~mv2.webp"
                alt="goblin_ground_bamboozled"
              />
            </div>
          </div>
        </div>
      </section>
      <div className="border-t border-gradient-to-r from-transparent via-gray-500 to-transparent contenedor relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gradient-to-r from-transparent via-gray-500 to-transparent"></div>
        </div>
        <div className="relative flex justify-center">
          <div className="bg-black px-4">
            <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"></div>
          </div>
        </div>
      </div>

      {token && loggin && selectedPlanId && (
        <BankCharacter
          isOpen={isModalOpen}
          token={token}
          planId={selectedPlanId}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default Bank;

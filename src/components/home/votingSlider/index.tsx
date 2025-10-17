"use client";

import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";

import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";

import { getPlatforms } from "@/api/voting";
import LoadingSpinner from "@/components/utilities/loading-spinner";
import { socialLinks } from "@/constants/socialLinks";
import { useUserContext } from "@/context/UserContext";
import { VotingPlatforms } from "@/model/VotingPlatforms";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FaFacebook,
  FaInstagram,
  FaTelegram,
  FaWhatsapp,
} from "react-icons/fa";
import Slider from "react-slick";

const iconComponents = {
  Facebook: FaFacebook,
  Instagram: FaInstagram,
  WhatsApp: FaWhatsapp,
  Telegram: FaTelegram,
};

const VotingSlider = () => {
  const [partners, setPartners] = useState<VotingPlatforms[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const { user } = useUserContext();
  const token = Cookies.get("token");
  const isAuthenticated = token && user.logged_in;

  useEffect(() => {
    const fetchPartners = async () => {
      setIsLoading(true);
      try {
        const data = await getPlatforms(token || null);
        setPartners(data);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };

    fetchPartners();
  }, [token]);

  const settings = {
    dots: false,
    infinite: partners.length > 2,
    arrows: true,
    speed: 300,
    slidesToShow: Math.min(3, partners.length),
    slidesToScroll: 1,
    autoplay: false,
    autoplaySpeed: 3000,
    adaptiveHeight: true,
    centerMode: false,
    focusOnSelect: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(2, partners.length),
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(2, partners.length),
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <section
      className="contenedor py-8 px-4 sm:py-10 sm:px-6"
      role="region"
      aria-label="Voting platforms section"
    >
      <div className="slider-introduction mt-3 mb-6 sm:mt-5 sm:mb-10 animate-fade-in-up">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
          <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
            {t("home-voting-platforms.title")}
          </span>
        </h2>
        <p className="text-base sm:text-lg md:text-xl text-gray-300 mt-3 sm:mt-4 animate-fade-in-up animation-delay-200">
          {t("home-voting-platforms.description")}
        </p>
        <a
          href="/help"
          target="_blank"
          className="inline-flex items-center text-lg text-yellow-500 mt-4 hover:text-yellow-400 transition-colors duration-300 animate-fade-in-up animation-delay-400"
          aria-label="Get help information"
        >
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          {t("home-voting-platforms.btn-information")}
        </a>
      </div>

      {isLoading ? (
        <div className="flex justify-center mt-20">
          <LoadingSpinner />
        </div>
      ) : partners.length === 0 ? (
        <div className="flex flex-col items-center text-white text-center mt-20">
          <img
            src="https://static.wixstatic.com/media/5dd8a0_3c182df4bbfb46f0aba9f5ce8a1be128~mv2.jpg"
            alt="partners-not-found"
            className="w-32 h-32 md:w-60 md:h-60 mb-6 select-none rounded-full transition-transform duration-500 ease-in-out transform hover:rotate-180"
          />
          <p className="text-2xl font-serif">
            ⚔️
            <span className="text-indigo-400">
              {t("home-voting-platforms.empty-server-list-title")}🛡️
            </span>
            ⚔️
          </p>
          <p className="text-lg mt-4">
            {t("home-voting-platforms.empty-server-list-subtitle")}🛡️
          </p>
        </div>
      ) : (
        <div className="relative">
          <Slider {...settings}>
            {partners.map((partner, index) => (
              <div
                key={partner.id}
                className="slider cursor-pointer px-1 sm:px-2"
              >
                <article className="relative group bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 sm:p-6 hover:bg-slate-800/50 hover:border-slate-600/50 transition-all duration-300">
                  {/* Efecto de brillo constante */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/2 via-white/5 to-white/2 opacity-20 rounded-xl"></div>

                  {/* Efecto de partículas flotantes dispersas */}
                  <div className="absolute inset-0 overflow-hidden rounded-xl">
                    {/* Partículas superiores */}
                    <div className="absolute top-2 left-1/6 w-1 h-1 bg-white/30 rounded-full animate-ping"></div>
                    <div className="absolute top-4 right-1/4 w-0.5 h-0.5 bg-white/20 rounded-full animate-ping delay-200"></div>
                    <div className="absolute top-3 left-2/3 w-1 h-1 bg-white/25 rounded-full animate-ping delay-500"></div>

                    {/* Partículas centrales */}
                    <div className="absolute top-1/2 left-1/5 w-0.5 h-0.5 bg-white/15 rounded-full animate-ping delay-100"></div>
                    <div className="absolute top-1/2 right-1/5 w-1 h-1 bg-white/22 rounded-full animate-ping delay-400"></div>
                    <div className="absolute top-1/2 left-3/4 w-0.5 h-0.5 bg-white/18 rounded-full animate-ping delay-800"></div>

                    {/* Partículas inferiores */}
                    <div className="absolute bottom-2 left-1/3 w-1 h-1 bg-white/28 rounded-full animate-ping delay-300"></div>
                    <div className="absolute bottom-3 right-1/3 w-0.5 h-0.5 bg-white/20 rounded-full animate-ping delay-600"></div>
                    <div className="absolute bottom-4 left-1/2 w-1 h-1 bg-white/25 rounded-full animate-ping delay-900"></div>

                    {/* Partículas laterales */}
                    <div className="absolute top-1/4 left-2 w-0.5 h-0.5 bg-white/18 rounded-full animate-ping delay-150"></div>
                    <div className="absolute top-3/4 right-2 w-1 h-1 bg-white/22 rounded-full animate-ping delay-450"></div>
                    <div className="absolute bottom-1/4 left-1 w-0.5 h-0.5 bg-white/15 rounded-full animate-ping delay-750"></div>
                  </div>

                  {/* Contenido principal */}
                  <div className="relative z-10">
                    <div className="text-center mb-6">
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 group-hover:text-yellow-300 transition-colors duration-300">
                        {partner.name}
                      </h3>
                      <p className="text-lg text-orange-300 italic font-medium">
                        {t("home-voting-platforms.benefit")}
                      </p>
                    </div>
                    <div className="flex justify-center items-center mb-6">
                      <div className="relative group/image">
                        <img
                          src={partner.img_url}
                          alt={`${partner.name} logo`}
                          draggable="false"
                          className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 object-cover rounded-full border-4 border-slate-600 shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:border-yellow-400"
                        />
                        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    </div>
                    <div className="text-center mb-6">
                      {isAuthenticated ? (
                        partner.postback_url && (
                          <Link
                            href={partner.postback_url}
                            target="_blank"
                            passHref
                            className="group/btn"
                          >
                            <button className="w-full sm:w-auto bg-gradient-to-r from-slate-800 to-slate-900 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl hover:shadow-slate-500/25 hover:from-slate-700 hover:to-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-all duration-300 ease-in-out hover:scale-105 border border-slate-600">
                              <span className="flex items-center justify-center gap-2">
                                <svg
                                  className="w-4 h-4"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                {t(
                                  "home-voting-platforms.btn-register-discover"
                                )}
                              </span>
                            </button>
                          </Link>
                        )
                      ) : (
                        <Link href="/register" passHref className="group/btn">
                          <button className="w-full sm:w-auto bg-gradient-to-r from-slate-600 to-slate-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl hover:shadow-slate-500/25 hover:from-slate-500 hover:to-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-all duration-300 ease-in-out hover:scale-105 border border-slate-500">
                            <span className="flex items-center justify-center gap-2">
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                              </svg>
                              {t("home-voting-platforms.btn-register-txt")}
                            </span>
                          </button>
                        </Link>
                      )}
                    </div>
                    <div className="text-center mb-4">
                      <div className="flex justify-center">
                        <p className="text-2xl sm:text-3xl font-bold">
                          {t("home-voting-platforms.disclaimer")
                            .split("")
                            .map((letter, index) => (
                              <span
                                key={index}
                                className="text-yellow-400 animate-color-cycle"
                                style={{ animationDelay: `${index * 100}ms` }}
                              >
                                {letter}
                              </span>
                            ))}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-center space-x-4">
                      {socialLinks.map((social) => {
                        const Icon =
                          iconComponents[
                            social.name as keyof typeof iconComponents
                          ];
                        return (
                          <a
                            key={social.name}
                            href={social.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Follow us on ${social.name}`}
                            className={`${social.color} text-2xl sm:text-3xl transition-all duration-300 hover:opacity-80 hover:scale-110`}
                          >
                            <Icon />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </Slider>
        </div>
      )}
    </section>
  );
};

export default VotingSlider;

"use client";
import { widgetSubscription } from "@/api/home";
import { getSubscriptionActive } from "@/api/subscriptions";
import LoadingSpinner from "@/components/utilities/loading-spinner";
import { useUserContext } from "@/context/UserContext";
import { PassAzerothData } from "@/model/model";
import Cookies from "js-cookie";
import Link from "next/link";
import { useEffect, useState } from "react";

const Subscription = () => {
  const [subscriptionData, setSubscriptionData] = useState<PassAzerothData>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [hasSubscription, setHasSubscription] = useState<boolean>(false);
  const { user } = useUserContext();
  const token = Cookies.get("token");

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        if (!token) {
          setHasSubscription(false);
        } else {
          const isActive = await getSubscriptionActive(token);
          setHasSubscription(isActive);
        }

        if (!hasSubscription) {
          const response = await widgetSubscription(user.language);
          setSubscriptionData(response);
        }
      } catch (err: any) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, [token, user.language]);

  if (loading) {
    return (
      <div className="flex justify-center items-center mt-5">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || hasSubscription || !subscriptionData) {
    return null;
  }

  return (
    <div className="contenedor relative mt-10 mb-1">
      <div className="relative bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border border-pink-500/30 rounded-2xl transition-all duration-300 hover:border-pink-400/50 hover:shadow-2xl hover:shadow-pink-500/20 overflow-hidden">
        <div className="max-w-9xl mx-auto">
          {/* HEADER */}
          <div className="relative p-8">
            {/* Badge decorativo */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 mb-6">
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse mr-2"></div>
              <p className="text-sm font-semibold text-pink-400">
                Premium Subscription
              </p>
            </div>

            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-400 bg-clip-text text-transparent">
                {subscriptionData.title}
              </span>
            </h2>

            <p className="text-2xl md:text-3xl text-white leading-relaxed max-w-3xl mb-8 font-medium">
              {subscriptionData.description}
            </p>
          </div>

          {/* BODY */}
          <div className="px-8 pb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {subscriptionData.benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-600/30 rounded-xl p-6 transition-all duration-300 hover:border-pink-400/50 hover:shadow-lg hover:shadow-pink-500/20"
                >
                  <div className="relative flex flex-col items-center text-center">
                    <div className="relative mb-4">
                      <div className="rounded-full h-24 w-24 overflow-hidden mx-auto border-2 border-pink-500/30 group-hover:border-pink-400/50 transition-colors duration-300">
                        <img
                          className="rounded-full h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          src={benefit.img}
                          alt={benefit.alt}
                        />
                      </div>
                      {/* Efecto de brillo sutil */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <h3 className="text-xl font-bold text-white group-hover:text-pink-300 transition-colors duration-300">
                      {benefit.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>

            {/* BOTÓN */}
            <div className="flex justify-center mt-8">
              <Link
                href="/subscriptions"
                className="group relative px-10 py-5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold text-xl rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/25 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {subscriptionData.btn}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;

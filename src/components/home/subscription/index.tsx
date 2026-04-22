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
    <div className="contenedor relative mt-10 mb-1 px-4">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/70 transition-all duration-300 hover:border-fuchsia-300/35 hover:shadow-2xl hover:shadow-fuchsia-500/10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(217,70,239,0.16),transparent_38%),radial-gradient(circle_at_86%_38%,rgba(59,130,246,0.15),transparent_36%)]" />
        <div className="max-w-9xl mx-auto">
          {/* HEADER */}
          <div className="relative p-6 md:p-8">
            {/* Badge decorativo */}
            <div className="mb-5 inline-flex items-center rounded-full border border-fuchsia-400/35 bg-gradient-to-r from-fuchsia-500/20 to-indigo-500/20 px-3.5 py-1.5">
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse mr-2"></div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-fuchsia-200">
                Premium Subscription
              </p>
            </div>

            <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-white md:text-5xl">
              <span className="bg-gradient-to-r from-fuchsia-300 via-violet-400 to-indigo-300 bg-clip-text text-transparent">
                {subscriptionData.title}
              </span>
            </h2>

            <p className="mb-4 max-w-3xl text-base leading-relaxed text-zinc-200/95 md:text-xl">
              {subscriptionData.description}
            </p>
          </div>

          {/* BODY */}
          <div className="px-6 pb-7 md:px-8 md:pb-8">
            <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-5">
              {subscriptionData.benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="group relative rounded-xl border border-white/10 bg-black/30 p-4 transition-all duration-300 hover:border-fuchsia-300/40 hover:bg-black/40 hover:shadow-lg hover:shadow-fuchsia-500/15"
                >
                  <div className="relative flex flex-col items-center text-center">
                    <div className="relative mb-3">
                      <div className="mx-auto h-20 w-20 overflow-hidden rounded-full border-2 border-fuchsia-400/30 transition-colors duration-300 group-hover:border-fuchsia-300/50 md:h-24 md:w-24">
                        <img
                          className="h-full w-full rounded-full object-cover transition duration-300 group-hover:scale-105"
                          src={benefit.img}
                          alt={benefit.alt}
                        />
                      </div>
                      {/* Efecto de brillo sutil */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-fuchsia-500/10 via-transparent to-indigo-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-100 transition-colors duration-300 group-hover:text-fuchsia-200 md:text-xl">
                      {benefit.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>

            {/* BOTÓN */}
            <div className="mt-7 flex justify-center">
              <Link
                href="/subscriptions"
                className="group relative rounded-xl bg-gradient-to-r from-fuchsia-500 to-violet-600 px-8 py-3.5 text-base font-semibold text-white transition-all duration-300 hover:from-fuchsia-400 hover:to-violet-500 hover:shadow-lg hover:shadow-fuchsia-500/25 focus:outline-none focus:ring-2 focus:ring-fuchsia-300 focus:ring-offset-2 focus:ring-offset-slate-900 md:px-10 md:text-lg"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <svg
                    className="h-5 w-5 md:h-6 md:w-6"
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

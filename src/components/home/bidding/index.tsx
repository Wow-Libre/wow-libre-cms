"use client";

import { getProductOffert } from "@/api/store";
import { useUserContext } from "@/context/UserContext";
import { Product } from "@/model/model";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import FeaturedOffers from "../carrousel-multiple";

const FALLBACK_OFFER_IMAGE =
  "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3cm8yZXJqcTd5c2x0ZzRtbXoxOGJoZmR6M3M0cTIycm84NnBnYnhoNCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/F9N48eIyrQ3kF9ooVz/giphy.gif";

const ctaPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-900/30 transition hover:from-cyan-500 hover:to-sky-500 hover:shadow-cyan-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-midnight";

const Bidding = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useUserContext();
  const [offer, setOffer] = useState<Product | null>(null);

  const handleSelectItem = (id: string) => {
    router.push(`/store/${id}`);
  };

  useEffect(() => {
    const fetchOffer = async () => {
      const productsWithDiscount = await getProductOffert(user.language);
      setOffer(productsWithDiscount);
    };

    void fetchOffer();
  }, [user]);

  const offerPrice = offer
    ? offer.use_points
      ? `${offer.discount_price} Points`
      : `$${offer.discount_price} USD`
    : null;

  return (
    <section
      className="relative py-12 sm:py-16 lg:py-20"
      role="region"
      aria-labelledby="home-offers-heading"
    >
      <div className="contenedor relative z-10 space-y-10 px-4 sm:space-y-12 sm:px-6 lg:px-10">
        <header className="text-center sm:text-left">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 sm:mx-0 sm:max-w-none sm:flex-row sm:items-end sm:gap-4">
            <span className="mb-3 hidden h-px w-12 shrink-0 bg-gradient-to-r from-transparent to-cyan-400/50 sm:block" />
            <div>
              <h2
                id="home-offers-heading"
                className="font-gaming text-3xl font-semibold tracking-wide text-white sm:text-4xl lg:text-[2.75rem]"
              >
                {t("home-products.title")}
              </h2>
              <p className="mx-auto mt-3 max-w-3xl text-base leading-relaxed text-slate-400 sm:mx-0 sm:text-lg">
                {t("home-products.subtitle")}
              </p>
            </div>
          </div>
        </header>

        {offer ? (
          <article className="grid overflow-hidden rounded-2xl border border-white/10 bg-gray-900/50 shadow-xl shadow-black/25 backdrop-blur-md md:grid-cols-[minmax(15rem,20rem)_1fr]">
            <div className="relative h-48 overflow-hidden md:h-auto">
              <img
                src={offer.img_url || FALLBACK_OFFER_IMAGE}
                alt={offer.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent md:bg-gradient-to-r" />
            </div>

            <div className="flex flex-col justify-center p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
                {t("home-products.offer-day.title")}
              </p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {offer.name}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs text-slate-300">
                  {offer.category}
                </span>
                <span className="rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs text-slate-300">
                  {offer.partner}
                </span>
              </div>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
                {offer.disclaimer ?? t("home-products.offer-day.disclaimer")}
              </p>
              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-2xl font-semibold text-cyan-300">
                  {offerPrice}
                </p>
                <button
                  type="button"
                  onClick={() => handleSelectItem(offer.reference_number)}
                  className={ctaPrimary}
                >
                  {t("home-products.offer-day.btn.primary")}
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </article>
        ) : null}

        <FeaturedOffers t={t} />
      </div>
    </section>
  );
};

export default Bidding;

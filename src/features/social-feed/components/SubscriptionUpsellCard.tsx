"use client";

import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { communityCard, communityMuted } from "../constants/communityStyles";

export function SubscriptionUpsellCard() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <section className={`${communityCard} overflow-hidden`}>
      <div className="bg-gradient-to-br from-gaming-primary-main/20 via-gaming-primary-dark/10 to-transparent px-4 pb-4 pt-5 sm:px-5">
        <span className="inline-flex rounded-full border border-gaming-primary-light/40 bg-gaming-primary-main/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-gaming-primary-light">
          {t("community.subscription_modal.badge")}
        </span>
        <h3 className="mt-3 text-lg font-semibold leading-tight text-white">
          {t("community.subscription_modal.title")}
        </h3>
        <p className={`mt-2 text-sm leading-relaxed ${communityMuted}`}>
          {t("community.subscription_modal.description")}
        </p>
      </div>

      <div className="border-t border-white/10 px-4 py-4 sm:px-5">
        <ul className={`space-y-1.5 text-sm ${communityMuted}`}>
          <li>{t("community.subscription_modal.benefit_1")}</li>
          <li>{t("community.subscription_modal.benefit_2")}</li>
        </ul>
        <button
          type="button"
          onClick={() => router.push("/subscriptions")}
          className="mt-4 w-full rounded-xl bg-gaming-primary-main px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-gaming-primary-dark/35 transition hover:bg-gaming-primary-hover"
        >
          {t("community.subscription_modal.cta")}
        </button>
      </div>
    </section>
  );
}


"use client";

import { useTranslation } from "react-i18next";
import { communityCard, communityMuted } from "../constants/communityStyles";

export function CommunityEmptyState() {
  const { t } = useTranslation();

  return (
    <div className={`px-8 py-16 text-center sm:px-10 sm:py-20 ${communityCard}`}>
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-gaming-primary-dark/40 to-midnight ring-1 ring-gaming-primary-light/20 sm:h-24 sm:w-24">
        <svg
          className="h-11 w-11 text-gaming-primary-light sm:h-12 sm:w-12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-13.5l1.409 1.409a2.25 2.25 0 010 3.182l-7.5 7.5a2.25 2.25 0 01-3.182 0l-7.5-7.5a2.25 2.25 0 010-3.182l1.409-1.409"
          />
        </svg>
      </div>
      <h2 className="font-gaming text-2xl font-semibold text-white sm:text-3xl lg:text-4xl">
        {t("community.empty.title")}
      </h2>
      <p className={`mx-auto mt-4 max-w-xl text-lg leading-relaxed sm:text-xl ${communityMuted}`}>
        {t("community.empty.hint")}
      </p>
      <p className="mt-10 text-xs font-medium uppercase tracking-[0.2em] text-slate-600 sm:text-sm">
        {t("community.empty.footer")}
      </p>
    </div>
  );
}

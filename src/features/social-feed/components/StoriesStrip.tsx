"use client";

import { webProps } from "@/constants/configs";
import { useUserContext } from "@/context/UserContext";
import { useTranslation } from "react-i18next";
import { communityCard } from "../constants/communityStyles";

/** Misma altura aproximada que `StoriesStrip`, sin avatar ni contexto (evita hydration mismatch). */
export function StoriesStripSkeleton() {
  return (
    <div className={`px-4 py-4 sm:px-5 sm:py-5 ${communityCard}`}>
      <div className="flex gap-4 overflow-x-auto pb-1 pt-1 sm:gap-5" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex shrink-0 flex-col items-center gap-2">
            <div className="h-[60px] w-[60px] animate-pulse rounded-full bg-white/10 sm:h-16 sm:w-16" />
            <div className="h-3 w-16 animate-pulse rounded bg-white/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function StoriesStrip() {
  const { t } = useTranslation();
  const { user } = useUserContext();

  const placeholders = [
    { key: "a", label: t("community.stories.guild") },
    { key: "b", label: t("community.stories.news") },
    { key: "c", label: t("community.stories.events") },
  ];

  return (
    <div className={`px-4 py-4 sm:px-5 sm:py-5 ${communityCard}`}>
      <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-1 pt-1 sm:gap-5">
        <button
          type="button"
          className="group flex shrink-0 flex-col items-center gap-2 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-gaming-primary-light/50"
          aria-label={t("community.stories.your_story")}
        >
          <div className="relative">
            <div
              className="rounded-full p-[2px]"
              style={{
                background:
                  "linear-gradient(135deg, #7c3aed, #a78bfa, #f59e0b, #fbbf24)",
              }}
            >
              <div className="rounded-full bg-gray-900 p-[2px]">
                <img
                  src={user.avatar || webProps.logo}
                  alt=""
                  className="h-[60px] w-[60px] rounded-full object-cover sm:h-16 sm:w-16"
                />
              </div>
            </div>
            <span className="absolute -bottom-0.5 left-1/2 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full bg-gaming-primary-main text-white shadow-lg shadow-gaming-primary-dark/40">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="text-white"
                aria-hidden
              >
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
            </span>
          </div>
          <span className="max-w-[88px] truncate text-center text-xs font-medium text-slate-400 sm:text-sm">
            {t("community.stories.your_story")}
          </span>
        </button>

        {placeholders.map((p) => (
          <div key={p.key} className="flex shrink-0 flex-col items-center gap-2 opacity-90">
            <div className="rounded-full bg-gradient-to-tr from-white/15 to-white/5 p-[2px]">
              <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-midnight/90 text-lg font-semibold text-slate-400 sm:h-16 sm:w-16 sm:text-xl">
                {p.label.charAt(0)}
              </div>
            </div>
            <span className="max-w-[88px] truncate text-center text-xs text-slate-500 sm:text-sm">
              {p.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

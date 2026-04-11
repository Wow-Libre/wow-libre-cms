"use client";

import type { NewsModel } from "@/model/News";
import { fetchCommunityNewsList } from "../api/communityNewsApi";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { communityCard, communityMuted } from "../constants/communityStyles";

const NEWS_PAGE_SIZE = 5;

function formatNewsDate(iso: string, locale: string) {
  try {
    return new Date(iso).toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function CommunityNewsSidebar() {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState<NewsModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(false);
      try {
        const data = await fetchCommunityNewsList(NEWS_PAGE_SIZE, 0);
        if (!cancelled) setItems(data);
      } catch (e) {
        console.error("[CommunityNewsSidebar]", e);
        if (!cancelled) {
          setItems([]);
          setError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const locale = i18n.language || "es";

  return (
    <div
      className={`${communityCard} flex max-h-[min(380px,48vh)] flex-col overflow-hidden lg:max-h-[calc(100vh-6rem)]`}
    >
      <div className="border-b border-white/10 px-4 py-4 sm:px-5 sm:py-5">
        <h2 className="font-gaming text-xl font-semibold tracking-wide text-white sm:text-[1.35rem]">
          {t("community.news_sidebar.title")}
        </h2>
        <p className={`mt-1.5 text-sm sm:text-[15px] ${communityMuted}`}>
          {t("community.news_sidebar.subtitle")}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3.5 sm:px-4 sm:py-4">
        {loading && (
          <ul className="space-y-3" aria-busy>
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="flex gap-3.5">
                <div className="h-[4.5rem] w-[6.25rem] shrink-0 animate-pulse rounded-lg bg-white/10" />
                <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
                  <div className="h-4 w-full animate-pulse rounded bg-white/10" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-white/5" />
                </div>
              </li>
            ))}
          </ul>
        )}

        {!loading && error && (
          <p className={`text-center text-sm ${communityMuted}`}>{t("community.news_sidebar.error")}</p>
        )}

        {!loading && !error && items.length === 0 && (
          <p className={`text-center text-sm ${communityMuted}`}>{t("community.news_sidebar.empty")}</p>
        )}

        {!loading && !error && items.length > 0 && (
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/news/${item.id}`}
                  className="group flex gap-3.5 rounded-xl p-2.5 transition hover:bg-white/[0.06]"
                >
                  <div className="relative h-[4.5rem] w-[6.25rem] shrink-0 overflow-hidden rounded-lg bg-black/40 ring-1 ring-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.img_url}
                      alt=""
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="min-w-0 flex-1 py-0.5">
                    <p className="line-clamp-2 text-[15px] font-semibold leading-snug text-slate-100 transition group-hover:text-gaming-primary-light sm:text-base">
                      {item.title}
                    </p>
                    <p className={`mt-1.5 text-xs sm:text-[13px] ${communityMuted}`}>
                      {formatNewsDate(item.created_at, locale)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-white/10 px-4 py-3.5 sm:px-5 sm:py-4">
        <Link
          href="/news"
          className="block text-center text-[15px] font-semibold text-gaming-primary-light transition hover:text-gaming-primary-main sm:text-base"
        >
          {t("community.news_sidebar.see_all")}
        </Link>
      </div>
    </div>
  );
}

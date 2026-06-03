"use client";

import { getNews } from "@/api/news";
import NavbarAuthenticated from "@/components/navbar-authenticated";
import { NewsFeaturedGrid, NewsStoriesSection } from "@/features/news";
import type { NewsModel } from "@/model/News";
import { useCallback, useEffect, useState } from "react";

const REGISTER_DECORATIVE_TREANT =
  "https://static.wixstatic.com/media/5dd8a0_a1d175976a834a9aa2db34adb6d87d02~mv2.png";

const FEATURED_COUNT = 6;
const INITIAL_FETCH_SIZE = 16;
const LOAD_MORE_SIZE = 10;

export function NewsPageClient() {
  const [featuredNews, setFeaturedNews] = useState<NewsModel[]>([]);
  const [moreStories, setMoreStories] = useState<NewsModel[]>([]);
  const [listPage, setListPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [noMoreStories, setNoMoreStories] = useState(false);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getNews(INITIAL_FETCH_SIZE, 0);
      setFeaturedNews(data.slice(0, FEATURED_COUNT));
      setMoreStories(data.slice(FEATURED_COUNT));
      setListPage(0);
      setNoMoreStories(data.length < INITIAL_FETCH_SIZE);
    } catch (error) {
      console.error("Error loading news:", error);
      setFeaturedNews([]);
      setMoreStories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const handleLoadMore = async () => {
    setLoadMoreLoading(true);
    try {
      const nextPage = listPage + 1;
      const newItems = await getNews(LOAD_MORE_SIZE, nextPage);
      const featuredIds = new Set(featuredNews.map((n) => n.id));
      const unique = newItems.filter((n) => !featuredIds.has(n.id));

      setMoreStories((prev) => {
        const existing = new Set(prev.map((n) => n.id));
        return [...prev, ...unique.filter((n) => !existing.has(n.id))];
      });
      setListPage(nextPage);

      if (newItems.length < LOAD_MORE_SIZE) {
        setNoMoreStories(true);
      }
    } catch (error) {
      console.error("Error loading more news:", error);
    } finally {
      setLoadMoreLoading(false);
    }
  };

  return (
    <div className="relative overflow-visible bg-midnight pb-16">
      <div className="pointer-events-none absolute inset-0 fire-embers-blue opacity-50" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(56,189,248,0.10),transparent_38%),radial-gradient(circle_at_82%_84%,rgba(14,165,233,0.08),transparent_40%)]" />
      <img
        src={REGISTER_DECORATIVE_TREANT}
        alt=""
        role="presentation"
        className="accounts-decoration-animated pointer-events-none absolute bottom-0 right-4 z-[1] hidden w-[20rem] opacity-80 drop-shadow-[0_0_28px_rgba(56,189,248,0.35)] md:block lg:right-10 lg:w-[24rem] xl:right-16 xl:w-[28rem]"
      />

      <div className="contenedor relative z-30 mb-6">
        <NavbarAuthenticated />
      </div>

      <main
        id="news-main"
        className="relative z-10 contenedor py-10 text-white md:py-14"
      >
        <div className="mx-auto max-w-[92rem] space-y-14 px-4 sm:px-6 lg:px-10">
          <header className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400/80">
              Wow Libre
            </p>
            <h1 className="title-server relative mt-3 text-4xl font-bold sm:text-5xl lg:text-[3.25rem]">
              <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent">
                Noticias y actualizaciones
              </span>
              <span className="absolute -bottom-2 left-0 h-1 w-20 rounded-full bg-gradient-to-r from-amber-300 to-orange-400" />
            </h1>
            <p className="mt-6 text-base leading-relaxed text-slate-400 sm:text-lg">
              Lo último del servidor: parches, eventos y novedades de la
              comunidad.
            </p>
          </header>

          <section aria-labelledby="news-featured-heading">
            <h2 id="news-featured-heading" className="sr-only">
              Noticias destacadas
            </h2>
            <NewsFeaturedGrid items={featuredNews} loading={loading} />
          </section>

          <NewsStoriesSection
            items={moreStories}
            loading={loading}
            loadMoreLoading={loadMoreLoading}
            hasMore={!noMoreStories && moreStories.length > 0}
            onLoadMore={handleLoadMore}
          />
        </div>
      </main>
    </div>
  );
}

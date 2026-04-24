"use client";
import NavbarAuthenticated from "@/components/navbar-authenticated";
import React, { useEffect, useState } from "react";
import { NewsModel } from "@/model/News";
import { getNews } from "@/api/news";
import Link from "next/link";

const REGISTER_DECORATIVE_TREANT =
  "https://static.wixstatic.com/media/5dd8a0_a1d175976a834a9aa2db34adb6d87d02~mv2.png";

const News = () => {
  const [mainNews, setMainNews] = useState<NewsModel[]>([]);
  const [forumNews, setForumNews] = useState<NewsModel[]>([]);
  const [forumPage, setForumPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [forumLoading, setForumLoading] = useState(false);
  const [noMoreForumNews, setNoMoreForumNews] = useState(false);

  useEffect(() => {
    const fetchMainNews = async () => {
      try {
        const data = await getNews(6, 0);
        setMainNews(data);
      } catch (error) {
        console.error("Error loading main news:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchForumNews = async () => {
      try {
        const data = await getNews(10, 0);
        setForumNews(data);
      } catch (error) {
        console.error("Error loading forum news:", error);
      }
    };

    fetchMainNews();
    fetchForumNews();
  }, []);

  const handleLoadMoreForumNews = async () => {
    setForumLoading(true);
    try {
      const nextPage = forumPage + 1;
      const newNews = await getNews(10, nextPage);
      setForumNews((prev) => [...prev, ...newNews]);
      setForumPage(nextPage);

      if (newNews.length < 10) {
        setNoMoreForumNews(true);
      }
    } catch (error) {
      console.error("Error loading more forum news:", error);
    } finally {
      setForumLoading(false);
    }
  };

  return (
    <div className="relative overflow-visible bg-midnight">
      <div className="pointer-events-none absolute inset-0 fire-embers-blue opacity-50" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(56,189,248,0.10),transparent_38%),radial-gradient(circle_at_82%_84%,rgba(14,165,233,0.08),transparent_40%)]" />
      <img
        src={REGISTER_DECORATIVE_TREANT}
        alt="Treant decorativo"
        className="accounts-decoration-animated pointer-events-none absolute bottom-0 right-4 z-[1] hidden w-[20rem] opacity-80 drop-shadow-[0_0_28px_rgba(56,189,248,0.35)] md:block lg:right-10 lg:w-[24rem] xl:right-16 xl:w-[28rem]"
      />
      <div className="contenedor relative z-30 mb-6">
        <NavbarAuthenticated />
      </div>
      <div className="relative z-10 text-white py-16 contenedor">
        <div className="mx-auto px-6 lg:px-10 space-y-16">
          {/* Grid Layout: 3 columnas x 3 filas */}
          {loading ? (
            // Skeleton layout (igual que antes)
            <div className="grid grid-cols-3 grid-rows-3 gap-6 h-[850px]">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className={`animate-pulse bg-zinc-800 rounded-2xl w-full h-full ${
                    idx === 0 ? "col-span-2 row-span-2" : ""
                  }`}
                >
                  <div className="w-full h-full flex flex-col justify-end p-4">
                    <div className="bg-zinc-700 h-6 w-3/4 mb-2 rounded" />
                    <div className="bg-zinc-600 h-4 w-full mb-1 rounded" />
                    <div className="bg-zinc-600 h-3 w-1/2 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : mainNews.length === 0 ? (
            // Vista cuando no hay mainNews
            <div className="flex flex-col items-center justify-center h-[850px] bg-zinc-900 rounded-5xl text-yellow-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-24 w-24 mb-6 animate-bounce"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 14l6-6m0 0l-6-6m6 6H3"
                />
              </svg>
              <h2 className="text-3xl font-bold mb-2">No news available</h2>
              <p className="text-lg max-w-md text-center">
                Sorry, we couldn't find any news at the moment. Please check
                back later.
              </p>
            </div>
          ) : (
            // Render mainNews normal
            <div className="grid grid-cols-3 grid-rows-3 gap-6 h-[850px]">
              {mainNews.map((card, idx) => (
                <Link
                  key={idx}
                  href={`/news/${card.id}`}
                  className={`relative rounded-2xl overflow-hidden shadow-xl transition duration-300 ease-in-out hover:scale-[1.02] hover:ring-4 hover:ring-yellow-400 ${
                    idx === 0 ? "col-span-2 row-span-2" : ""
                  }`}
                >
                  <img
                    src={card.img_url}
                    alt={card.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-6 flex flex-col justify-end">
                    <h3 className="text-yellow-400 font-bold text-lg md:text-2xl leading-tight">
                      {card.title}
                    </h3>
                    <p className="text-white text-sm md:text-base">
                      {card.sub_title}
                    </p>
                    <p className="text-gray-400 text-xs mt-2">
                      {new Date(card.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-gray-400 text-xs mt-2">0 comments</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Sección de foro / artículos destacados (puedes volverlo dinámico luego) */}
          <div className="space-y-6 p-1">
            {forumNews.length === 0 ? (
              <div className="flex flex-col items-center bg-zinc-900 justify-center py-20 text-yellow-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mb-4 animate-pulse"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2v-5a2 2 0 00-2-2H5a2 2 0 00-2 2v5a2 2 0 002 2z"
                  />
                </svg>
                <h3 className="text-xl font-semibold mb-1">
                  No forum news found
                </h3>
                <p className="max-w-xs text-center text-gray-300">
                  Looks like there are no forum stories available right now.
                  Check back soon!
                </p>
              </div>
            ) : (
              forumNews.map((card, idx) => (
                <Link
                  key={idx}
                  href={`/news/${card.id}`}
                  className="flex flex-col md:flex-row gap-6 border border-[#3a2a20] p-4 hover:bg-[#1e2b36] transition duration-300 cursor-pointer rounded-md"
                >
                  <img
                    src={card.img_url}
                    alt={card.title}
                    className="w-full md:w-64 h-36 object-cover border border-yellow-500 rounded"
                  />
                  <div className="text-white">
                    <h4 className="text-yellow-400 font-bold text-xl mb-1">
                      {card.title}
                    </h4>
                    <p className="text-sm text-gray-300 mb-2">
                      {card.sub_title}
                    </p>
                    <p className="text-sm text-gray-300 mb-2">
                      <span className="text-yellow-400">Author: </span>@
                      {card.author}
                    </p>
                    <span className="text-xs text-gray-400">
                      {new Date(card.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </Link>
              ))
            )}

            {/* Botón para cargar más */}
            {forumNews.length !== 0 && !noMoreForumNews && (
              <div className="flex justify-center pt-6">
                <button
                  onClick={handleLoadMoreForumNews}
                  className="border border-yellow-500 text-yellow-500 px-6 py-2 text-sm font-medium rounded hover:bg-yellow-500 hover:text-black transition disabled:opacity-50"
                  disabled={forumLoading}
                >
                  {forumLoading ? "Loading..." : "READ MORE STORIES"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default News;

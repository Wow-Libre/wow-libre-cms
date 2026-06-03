"use client";

import { getNewsById } from "@/api/news";
import NavbarAuthenticated from "@/components/navbar-authenticated";
import { webProps } from "@/constants/configs";
import { formatNewsDate } from "@/features/news/utils/formatNewsDate";
import { NewsSectionsDto } from "@/model/NewsSections";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export function NewsArticleClient() {
  const { id } = useParams();
  const [news, setNews] = useState<NewsSectionsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await getNewsById(Number(id));
        setNews(data);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Error al cargar la noticia";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchNews();
    }
  }, [id]);

  if (loading) {
    return (
      <div
        className="animate-pulse space-y-6 px-4 py-6"
        aria-busy="true"
        aria-label="Cargando noticia"
      >
        <div className="h-12 w-1/3 rounded bg-zinc-700" />
        <div className="h-[200px] rounded bg-zinc-800 md:h-[300px]" />
        <div className="space-y-4">
          <div className="h-4 w-2/3 rounded bg-zinc-700" />
          <div className="h-4 w-full rounded bg-zinc-700" />
          <div className="h-4 w-5/6 rounded bg-zinc-700" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <main className="p-4 text-red-400">
        <p role="alert">Error: {error}</p>
        <Link href="/news" className="mt-4 inline-block text-amber-400 hover:underline">
          Volver a noticias
        </Link>
      </main>
    );
  }

  if (!news) {
    return (
      <main className="p-4 text-amber-400">
        <h1 className="text-2xl font-bold text-white">Noticia no encontrada</h1>
        <Link href="/news" className="mt-4 inline-block hover:underline">
          Volver a noticias
        </Link>
      </main>
    );
  }

  return (
    <>
      <div className="contenedor mb-4 md:mb-6">
        <NavbarAuthenticated />
      </div>

      <main className="bg-midnight text-white">
        <nav aria-label="Breadcrumb" className="contenedor px-4 py-4 md:px-6">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
            <li>
              <Link href="/" className="transition hover:text-amber-300">
                {webProps.serverName || "Inicio"}
              </Link>
            </li>
            <li aria-hidden="true" className="text-slate-600">
              /
            </li>
            <li>
              <Link href="/news" className="transition hover:text-amber-300">
                Noticias
              </Link>
            </li>
            <li aria-hidden="true" className="text-slate-600">
              /
            </li>
            <li className="line-clamp-1 text-slate-300" aria-current="page">
              {news.title}
            </li>
          </ol>
        </nav>

        <article itemScope itemType="https://schema.org/NewsArticle">
          <meta itemProp="headline" content={news.title} />
          <meta itemProp="datePublished" content={news.created_at} />
          {news.author ? (
            <meta itemProp="author" content={news.author} />
          ) : null}

          <header className="relative h-[300px] w-full overflow-hidden md:h-[500px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={news.img_url}
              alt={news.title}
              className="h-full w-full object-cover object-center"
              itemProp="image"
            />
            <div className="absolute inset-0 block bg-gradient-to-r from-black/90 via-black/60 to-transparent px-4 pb-10 md:px-10 md:pb-16">
              <div className="contenedor absolute bottom-6 left-0 right-0 md:bottom-10">
                <h1
                  className="mb-2 text-4xl font-bold text-white md:text-6xl lg:text-7xl"
                  itemProp="name"
                >
                  {news.title}
                </h1>
                <p
                  className="mb-2 text-xl font-semibold text-slate-200 md:text-2xl lg:text-3xl"
                  itemProp="description"
                >
                  {news.sub_title}
                </p>
                <p className="text-xs text-gray-400 md:text-base">
                  <time dateTime={news.created_at} itemProp="datePublished">
                    {formatNewsDate(news.created_at)}
                  </time>
                  {news.author ? (
                    <>
                      {" "}
                      ·{" "}
                      <span itemProp="author">
                        <span className="text-amber-400/90">@{news.author}</span>
                      </span>
                    </>
                  ) : null}
                </p>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-7xl space-y-12 px-4 py-10 md:px-6 md:py-16">
            <Link
              href="/news"
              className="inline-flex text-lg text-amber-400 transition hover:text-amber-300 hover:underline"
            >
              ← Volver a noticias
            </Link>

            {news.sections.map((section, index) => (
              <section
                key={section.id}
                aria-labelledby={`section-${section.id}-title`}
                className="relative border-b border-zinc-800/50 py-16 last:border-b-0 md:py-20"
              >
                <div
                  className={`flex flex-col items-start gap-8 ${
                    index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                  } lg:gap-12`}
                >
                  <div
                    className={`flex-1 space-y-6 ${
                      index % 2 === 0 ? "lg:pr-8" : "lg:pl-8"
                    }`}
                  >
                    <h2
                      id={`section-${section.id}-title`}
                      className="text-3xl font-bold leading-tight tracking-tight text-amber-400 md:text-5xl lg:text-6xl"
                    >
                      {section.title}
                    </h2>

                    <div className="space-y-4 pt-4" itemProp="articleBody">
                      {section.content
                        .split(/\n{2,}|\r\n{2,}|(?:\s){2,}/)
                        .filter((p) => p.trim().length > 0)
                        .map((paragraph, idx) => (
                          <p
                            key={idx}
                            className="text-base leading-relaxed text-zinc-300 md:text-lg lg:text-xl"
                          >
                            {paragraph.trim()}
                          </p>
                        ))}
                    </div>
                  </div>

                  {section.img_url ? (
                    <figure
                      className={`w-full lg:w-1/2 ${
                        index % 2 === 0 ? "lg:pl-8" : "lg:pr-8"
                      }`}
                    >
                      <div className="group relative">
                        <div className="aspect-[16/10] overflow-hidden rounded-2xl border border-zinc-700/50 bg-gradient-to-br from-zinc-900 to-zinc-800 shadow-2xl">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={section.img_url}
                            alt={section.title}
                            className="h-full w-full object-cover object-center transition duration-700 ease-out group-hover:scale-105"
                            loading="lazy"
                          />
                        </div>
                      </div>
                    </figure>
                  ) : null}
                </div>
              </section>
            ))}
          </div>
        </article>
      </main>
    </>
  );
}

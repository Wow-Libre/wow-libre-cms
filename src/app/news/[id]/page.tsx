"use client";

import { getNewsById } from "@/api/news";
import NavbarAuthenticated from "@/components/navbar-authenticated";
import { NewsSectionsDto } from "@/model/NewsSections";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const NewContent: React.FC = () => {
  const { id } = useParams();
  const [news, setNews] = useState<NewsSectionsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await getNewsById(Number(id));
        setNews(data);
      } catch (err: any) {
        setError(err.message || "Error loading news");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchNews();
    }
  }, [id]);

  if (loading)
    return (
      <div className="animate-pulse space-y-6 px-4 py-6">
        <div className="h-12 bg-zinc-700 rounded w-1/3"></div>
        <div className="h-[200px] md:h-[300px] bg-zinc-800 rounded"></div>
        <div className="space-y-4">
          <div className="h-4 bg-zinc-700 rounded w-2/3"></div>
          <div className="h-4 bg-zinc-700 rounded w-full"></div>
          <div className="h-4 bg-zinc-700 rounded w-5/6"></div>
        </div>
        <div className="h-10 bg-zinc-800 rounded w-1/4"></div>
      </div>
    );
  if (error) return <div className="text-red-400 p-4">Error: {error}</div>;
  if (!news) return <div className="text-yellow-400 p-4">Not Found</div>;

  return (
    <div>
      <div className="contenedor mb-4 md:mb-6">
        <NavbarAuthenticated />
      </div>

      <div className="bg-midnight text-white">
        {/* Banner Principal */}
        <div className="relative h-[300px] md:h-[500px] w-full overflow-hidden">
          <img
            src={news.img_url}
            alt="Banner"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent block px-4 md:px-10 pb-10 md:pb-16">
            <div className="contenedor absolute bottom-6 md:bottom-10 left-0 right-0">
              <h1 className="text-4xl md:text-8xl font-bold text-white mb-2">
                {news.title}
              </h1>{" "}
              <p className="text-2xl md:text-4xl font-bold text-white mb-2">
                {news.sub_title}
              </p>
              <div className="text-xs md:text-2xl text-gray-400">
                {new Date(news.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}{" "}
                by <span className="text-yellow-400">{news.author}</span> ·{" "}
                <span>0 comment</span>
              </div>
            </div>
          </div>
        </div>
        {/* Botón volver a noticias */}

        {/* Contenido */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-16 space-y-12">
          <div className="max-w-6xl mx-auto  pb-1">
            <button
              onClick={() => router.push("/news")} // Si tienes ruta específica
              className="text-xl text-yellow-400 hover:underline"
            >
              ← Volver a noticias
            </button>
          </div>
          {/* Botones sociales */}
          <div className="flex flex-wrap gap-3">
            <button className="bg-blue-600 px-4 py-1 rounded text-white text-sm">
              Share
            </button>
            <button className="bg-sky-400 px-4 py-1 rounded text-white text-sm">
              Tweet
            </button>
            <button className="bg-yellow-500 text-black font-bold px-3 py-1 rounded text-xs">
              0 COMMENT
            </button>
          </div>

          {/* Secciones de la noticia */}
          {news.sections.map((section, index) => (
            <div
              key={section.id}
              className="relative py-16 md:py-20 border-b border-zinc-800/50 last:border-b-0"
            >
            

              {/* Layout alternado: imagen a la izquierda/derecha según el índice */}
              <div
                className={`flex flex-col ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                } gap-8 lg:gap-12 items-start`}
              >
                {/* Contenido de texto */}
                <div
                  className={`flex-1 space-y-6 ${
                    index % 2 === 0 ? 'lg:pr-8' : 'lg:pl-8'
                  }`}
                >
                  <div className="space-y-2">
                    <h2 className="text-yellow-400 text-3xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                      {section.title}
                    </h2>
                  </div>

                  <div className="space-y-4 pt-4">
                    {section.content
                      .split(/\n{2,}|\r\n{2,}|(?:\s){2,}/)
                      .filter((p) => p.trim().length > 0)
                      .map((paragraph, idx) => (
                        <p
                          key={idx}
                          className="text-base md:text-lg lg:text-xl text-zinc-300 leading-relaxed"
                        >
                          {paragraph.trim()}
                        </p>
                      ))}
                  </div>
                </div>

                {/* Imagen */}
                {section.img_url && (
                  <div
                    className={`w-full lg:w-1/2 ${
                      index % 2 === 0 ? 'lg:pl-8' : 'lg:pr-8'
                    }`}
                  >
                    <div className="relative group">
                      <div className="aspect-[16/10] bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl overflow-hidden shadow-2xl border border-zinc-700/50">
                        <img
                          src={section.img_url}
                          alt={section.title}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/800x500?text=No+Image';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      {/* Decorative border on hover */}
                      <div className="absolute inset-0 rounded-2xl border-2 border-yellow-400/0 group-hover:border-yellow-400/30 transition-all duration-300 pointer-events-none"></div>
                    </div>
                  </div>
                )}

                {/* Si no hay imagen, el texto ocupa todo el ancho */}
                {!section.img_url && (
                  <div className="w-full">
                    <div className="h-px bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent my-8"></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewContent;

"use client";

import { getNews } from "@/api/news";
import { getProducts } from "@/api/store";
import LoadingSpinnerCentral from "@/components/utilities/loading-spinner-v2";
import { useUserContext } from "@/context/UserContext";
import { Navbar } from "@/features/navbar";
import { CategoryDetail, Product } from "@/model/model";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface SearchResult {
  type: "news" | "product";
  id: number | string;
  title: string;
  description?: string;
  image?: string;
  url: string;
}

const SearchContent = () => {
  const { t } = useTranslation();
  const { user } = useUserContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (query.trim()) {
      performSearch(query.trim());
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    setHasSearched(true);
    const allResults: SearchResult[] = [];

    try {
      // Buscar noticias (filtrado del lado del cliente)
      try {
        const news = await getNews(50, 0);
        const filteredNews = news.filter(
          (item) =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.sub_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.author.toLowerCase().includes(searchQuery.toLowerCase())
        );

        filteredNews.forEach((item) => {
          allResults.push({
            type: "news",
            id: item.id,
            title: item.title,
            description: item.sub_title,
            image: item.img_url,
            url: `/news/${item.id}`,
          });
        });
      } catch (error) {
        console.error("Error buscando noticias:", error);
      }

      // Búsqueda de guildas removida - requiere selección de realm específico
      // Las guildas se pueden buscar directamente en la página /guild

      // Buscar productos (filtrado del lado del cliente)
      try {
        const productsData = await getProducts(user.language);

        // Convertir Map a array y buscar
        Object.entries(productsData).forEach(([category, categories]) => {
          categories.forEach((categoryDetail: CategoryDetail) => {
            categoryDetail.products.forEach((product: Product) => {
              if (
                product.name
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                product.description
                  ?.toLowerCase()
                  .includes(searchQuery.toLowerCase())
              ) {
                allResults.push({
                  type: "product",
                  id: product.reference_number,
                  title: product.name,
                  description: product.description,
                  image: product.img_url,
                  url: `/store/${product.reference_number}`,
                });
              }
            });
          });
        });
      } catch (error) {
        console.error("Error buscando productos:", error);
      }

      setResults(allResults);
    } catch (error) {
      console.error("Error en la búsqueda:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (newQuery: string) => {
    if (newQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(newQuery.trim())}`);
    }
  };

  const groupedResults = {
    news: results.filter((r) => r.type === "news"),
    products: results.filter((r) => r.type === "product"),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight via-midnight/95 to-gray-800/90 text-white">
      <div className="contenedor py-8 px-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
          {t("navbar.search.results") || "Resultados de búsqueda"}
        </h1>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinnerCentral />
          </div>
        ) : hasSearched ? (
          <>
            {results.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xl text-gray-400 mb-4">
                  {t("navbar.search.no-results") ||
                    "No se encontraron resultados para:"}
                </p>
                <p className="text-2xl font-semibold text-yellow-400">
                  &quot;{query}&quot;
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <p className="text-lg text-gray-300">
                    {t("navbar.search.found") || "Se encontraron"}{" "}
                    {results.length}{" "}
                    {t("navbar.search.results") || "resultados"} para &quot;
                    {query}&quot;
                  </p>
                </div>

                {/* Noticias */}
                {groupedResults.news.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-yellow-400">
                      {t("navbar.search.news") || "Noticias"}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {groupedResults.news.map((result) => (
                        <Link
                          key={`news-${result.id}`}
                          href={result.url}
                          className="bg-midnight/80 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 shadow-lg"
                        >
                          {result.image && (
                            <img
                              src={result.image}
                              alt={result.title}
                              className="w-full h-48 object-cover"
                            />
                          )}
                          <div className="p-4">
                            <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                              {result.title}
                            </h3>
                            {result.description && (
                              <p className="text-gray-400 text-sm line-clamp-2">
                                {result.description}
                              </p>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Productos */}
                {groupedResults.products.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-yellow-400">
                      {t("navbar.search.products") || "Productos"}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {groupedResults.products.map((result) => (
                        <Link
                          key={`product-${result.id}`}
                          href={result.url}
                          className="bg-midnight/80 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 shadow-lg"
                        >
                          {result.image && (
                            <img
                              src={result.image}
                              alt={result.title}
                              className="w-full h-48 object-cover"
                            />
                          )}
                          <div className="p-4">
                            <h3 className="text-lg font-semibold mb-2">
                              {result.title}
                            </h3>
                            {result.description && (
                              <p className="text-gray-400 text-sm line-clamp-2">
                                {result.description}
                              </p>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-gray-400">
              {t("navbar.search.enter-query") ||
                "Ingresa un término de búsqueda"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const SearchPage = () => {
  return (
    <>
      <Navbar />
      <Suspense
        fallback={
          <div className="min-h-screen bg-gradient-to-br from-midnight via-midnight/95 to-gray-800/90 text-white">
            <div className="contenedor py-8 px-4">
              <div className="flex justify-center items-center py-20">
                <LoadingSpinnerCentral />
              </div>
            </div>
          </div>
        }
      >
        <SearchContent />
      </Suspense>
    </>
  );
};

export default SearchPage;

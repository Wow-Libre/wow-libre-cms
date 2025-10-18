"use client";

import { getProducts } from "@/api/store";
import NavbarAuthenticated from "@/components/navbar-authenticated";
import AdvertisingStore from "@/components/store/banners";
import { useUserContext } from "@/context/UserContext";
import { CategoryDetail } from "@/model/model";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Store = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<{
    [key: string]: CategoryDetail[];
  }>({});
  const [loading, setLoading] = useState(true);
  const { user } = useUserContext();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await getProducts(user.language);
        let categoriesObject: { [key: string]: CategoryDetail[] } = {};
        if (productsData instanceof Map) {
          categoriesObject = Object.fromEntries(productsData);
        } else if (typeof productsData === "object" && productsData !== null) {
          categoriesObject = productsData as {
            [key: string]: CategoryDetail[];
          };
        }

        setCategories(categoriesObject);
      } catch (err: any) {
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user]);

  const handleSelectItem = (id: string) => {
    router.push(`/store/${id}`);
  };

  return (
    <div className="contenedor">
      <NavbarAuthenticated />
      <div className="mt-14">
        <AdvertisingStore />
      </div>

      {/* Optimized Loading Indicator */}
      {loading && (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="relative mb-8">
              {/* Simple Spinner */}
              <div className="w-20 h-20 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-orange-500 rounded-full animate-pulse"></div>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">
              Cargando productos...
            </h3>
            <p className="text-gray-400">
              Preparando la mejor experiencia de compra
            </p>
          </div>
        </div>
      )}

      <nav className="w-full flex items-center justify-start bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 text-white mt-10 mb-10 shadow-2xl border-t border-b border-orange-500/20 relative">
        {/* Enhanced Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-yellow-400/5"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-500/3 to-transparent"></div>

        {/* Decorative Corner Elements */}
        <div className="absolute top-2 left-2 w-3 h-3 bg-orange-500/40 rounded-full"></div>
        <div className="absolute top-2 right-2 w-2 h-2 bg-yellow-400/40 rounded-full"></div>
        <div className="absolute bottom-2 left-4 w-2 h-2 bg-orange-600/30 rounded-full"></div>
        <div className="absolute bottom-2 right-4 w-3 h-3 bg-yellow-500/30 rounded-full"></div>

        <div className="flex overflow-x-auto relative z-10">
          {Object.keys(categories).map((category, index) => (
            <a
              key={category}
              href={`#${category}`}
              className="hover:text-orange-300 px-8 py-6 hover:bg-gray-700/50 font-serif text-2xl text-yellow-400 whitespace-nowrap border-r border-gray-600/50 last:border-r-0"
              style={{
                background:
                  index === 0
                    ? "linear-gradient(135deg, rgba(251, 146, 60, 0.12), rgba(251, 146, 60, 0.06))"
                    : "transparent",
              }}
            >
              {category}
            </a>
          ))}
        </div>
      </nav>

      {Object.entries(categories).map(([categoryName, categoryDetails]) => (
        <div
          key={categoryName}
          id={categoryName}
          className="pt-20 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-500/10 to-transparent"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-shrink-0 md:w-1/3 flex flex-col justify-center text-center max-w-md mx-auto space-y-8">
                <div className="relative">
                  {/* Decorative Elements */}
                  <div className="absolute -top-6 -left-6 w-12 h-12 bg-gradient-to-br from-orange-500/20 to-yellow-400/20 rounded-full animate-pulse"></div>
                  <div
                    className="absolute -bottom-4 -right-4 w-8 h-8 bg-gradient-to-br from-yellow-400/30 to-orange-500/30 rounded-full animate-pulse"
                    style={{ animationDelay: "1s" }}
                  ></div>
                  <div className="absolute top-1/2 -left-8 w-6 h-6 bg-orange-600/20 rotate-45 animate-pulse"></div>

                  <h2 className="text-6xl font-bold text-white mb-8 relative z-10 bg-gradient-to-r from-white via-yellow-100 to-orange-200 bg-clip-text text-transparent">
                    {categoryName}
                  </h2>

                  {/* Category Badge */}
                  <div className="inline-block bg-gradient-to-r from-orange-500/20 to-yellow-400/20 backdrop-blur-sm px-6 py-2 rounded-full border border-orange-500/30 mb-6">
                    <span className="text-orange-300 font-semibold text-sm uppercase tracking-wider">
                      Categoría Premium
                    </span>
                  </div>
                </div>

                {categoryDetails[0]?.disclaimer && (
                  <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-yellow-400/5"></div>
                    <p className="text-gray-200 text-xl font-medium leading-relaxed relative z-10">
                      {categoryDetails[0].disclaimer}
                    </p>
                    <div className="absolute top-2 right-2 w-2 h-2 bg-orange-500/60 rounded-full animate-pulse"></div>
                    <div
                      className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-yellow-400/60 rounded-full animate-pulse"
                      style={{ animationDelay: "1s" }}
                    ></div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap md:w-2/3 gap-8 mb-10">
                {categoryDetails[0]?.products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 relative p-8 rounded-2xl shadow-2xl w-full sm:w-1/2 lg:w-1/3 xl:w-1/3 flex flex-col transform transition-all duration-700 hover:scale-110 hover:shadow-orange-500/30 border border-gray-700/50 hover:border-orange-500/50 group cursor-pointer overflow-hidden"
                    style={{ height: "520px" }}
                    onClick={() => handleSelectItem(product.reference_number)}
                  >
                    {/* Enhanced Discount Badge */}
                    {product.discount > 0 && (
                      <div className="absolute top-2 right-2 z-20">
                        <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg border border-orange-400/50">
                          <span className="flex items-center space-x-1">
                            <span>🔥</span>
                            <span>¡{product.discount}% OFF!</span>
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Enhanced Product Image */}
                    <div className="relative overflow-hidden rounded-xl mb-6 group-hover:scale-110 transition-transform duration-500">
                      <img
                        src={product.img_url}
                        alt={`Imagen de ${product.name}`}
                        className="w-full h-52 object-cover transition-transform duration-700 group-hover:scale-125"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-yellow-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>

                    <div className="flex flex-col flex-grow space-y-4">
                      <h3 className="text-white text-2xl leading-tight font-bold group-hover:text-orange-300 transition-colors duration-500">
                        {product.name}
                      </h3>

                      <p className="text-gray-300 text-lg leading-relaxed">
                        {product.disclaimer}
                      </p>

                      <div className="flex items-center space-x-3">
                        <span className="bg-gradient-to-r from-orange-500/30 to-yellow-400/30 text-orange-300 px-4 py-2 rounded-full text-sm font-semibold border border-orange-500/30">
                          {product.category}
                        </span>
                        <span className="text-gray-400 text-sm bg-gray-700/50 px-3 py-1 rounded-full">
                          {product.partner}
                        </span>
                      </div>

                      {/* Enhanced Price Section */}
                      <div className="mt-auto pt-6 border-t border-gray-700/50 relative">
                        {product.discount > 0 ? (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                              <p className="text-orange-400 font-bold text-3xl">
                                {product.use_points === false
                                  ? `$${product.discount_price} USD`
                                  : `${Math.floor(
                                      product.discount_price
                                    ).toLocaleString()} Points`}
                              </p>
                              <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-bold">
                                Ahorras{" "}
                                {Math.round(
                                  ((product.price - product.discount_price) /
                                    product.price) *
                                    100
                                )}
                                %
                              </span>
                            </div>
                            <p className="line-through text-gray-500 text-xl">
                              {product.use_points === false
                                ? `$${product.price.toLocaleString()} USD`
                                : `${product.price.toLocaleString()} Points`}
                            </p>
                          </div>
                        ) : (
                          <p className="text-orange-400 font-bold text-3xl">
                            {product.use_points === false
                              ? `$${product.price.toLocaleString()} USD`
                              : `${product.price.toLocaleString()} Points`}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Enhanced Hover Effects */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-yellow-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                    <div className="absolute top-4 left-4 w-2 h-2 bg-orange-500/60 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div
                      className="absolute bottom-4 right-4 w-1.5 h-1.5 bg-yellow-400/60 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ animationDelay: "0.5s" }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Store;

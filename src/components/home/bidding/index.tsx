"use client";
import { getProductOffert } from "@/api/store";
import { useUserContext } from "@/context/UserContext";
import { Product } from "@/model/model";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "react-multi-carousel/lib/styles.css";
import MultiCarousel from "../carrousel-multiple";

const Bidding = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product>();
  const { user } = useUserContext();

  const handleSelectItem = (id: string) => {
    router.push(`/store/${id}`);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsWithDiscount = await getProductOffert(user.language);
        setProducts(productsWithDiscount);
      } catch (err: any) {}
    };
    fetchProducts();
  }, [user]);

  return (
    <section
      className="relative overflow-hidden"
      role="region"
      aria-label="Bidding section"
    >
      {/* Fondo con gradiente gaming - más sutil */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/20 via-slate-900/10 to-midnight/30"></div>
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-midnight/40 to-transparent"></div>
      </div>

      <div className="relative z-10 contenedor py-8 px-4 sm:py-10 sm:px-6">
        <div className="mx-auto px-4">
          <div className="text-center md:text-left mb-12">
            {/* Badge decorativo */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 mb-6">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse mr-2"></div>
              <p className="text-sm font-semibold text-yellow-400">
                Special Offers
              </p>
            </div>

            <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-400 bg-clip-text text-transparent">
                {t("home-products.title")}
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-2xl">
              {t("home-products.subtitle")}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* OFERTA DEL DÍA */}
            <div className="relative bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border border-amber-500/30 rounded-2xl transition-all duration-300 hover:border-amber-400/50 hover:shadow-2xl hover:shadow-amber-500/20 p-6 sm:p-8 w-full lg:max-w-md h-auto lg:h-[50rem] flex flex-col overflow-hidden">
              {/* Efecto de brillo sutil */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>

              {/* Badge de oferta */}
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 mb-6 w-fit">
                <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse mr-2"></div>
                <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide">
                  {t("home-products.offer-day.title")}
                </p>
              </div>

              <div className="relative flex justify-center items-center mb-6 h-64 sm:h-80 rounded-xl overflow-hidden select-none bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50">
                <img
                  src={
                    products?.img_url ||
                    "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3cm8yZXJqcTd5c2x0ZzRtbXoxOGJoZmR6M3M0cTIycm84NnBnYnhoNCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/F9N48eIyrQ3kF9ooVz/giphy.gif"
                  }
                  alt="Product Max Discount"
                  className="w-full h-full object-contain transition duration-300 hover:scale-105"
                />
                {/* Overlay sutil */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent"></div>
              </div>

              <div className="text-white flex-1 flex flex-col justify-between relative z-10">
                {products ? (
                  <>
                    <div className="space-y-3">
                      <h4 className="text-2xl font-bold text-white leading-tight">
                        {products.name}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-sm font-medium rounded-full border border-amber-500/30">
                          {products.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">
                        {products.partner}
                      </p>
                    </div>

                    <div className="mt-6 p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-500/20">
                      <p className="text-3xl font-bold text-amber-400 text-center">
                        {products.use_points
                          ? `${products.discount_price} Points`
                          : `$ ${products.discount_price} USD`}
                      </p>
                    </div>

                    <p className="text-base text-gray-400 mt-2">
                      {products?.disclaimer ??
                        t("home-products.offer-day.disclaimer")}
                    </p>

                    {/* Botón mejorado */}
                    <div className="mt-auto">
                      <button
                        onClick={() =>
                          handleSelectItem(products.reference_number)
                        }
                        className="group relative w-full px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-lg rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {t("home-products.offer-day.btn.primary")}
                        </span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-base text-gray-400 mt-2">
                      {t("home-products.offer-day.disclaimer")}
                    </p>
                    {/* Botón alternativo mejorado */}
                    <div className="mt-auto">
                      <Link href="/store" passHref>
                        <button className="w-full px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-lg rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900">
                          {t("home-products.offer-day.btn.alternative")}
                        </button>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="relative bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border border-blue-500/30 rounded-2xl transition-all duration-300 hover:border-blue-400/50 hover:shadow-2xl hover:shadow-blue-500/20 p-6 sm:p-8 w-full h-auto lg:h-[50rem] overflow-hidden">
              {/* Efecto de brillo sutil */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>

              {/* Badge de productos */}
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/40 mb-6 w-fit">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse mr-2"></div>
                <p className="text-xs font-semibold text-blue-400 uppercase tracking-wide">
                  Featured Products
                </p>
              </div>

              <div className="relative z-10">
                <MultiCarousel t={t} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Bidding;

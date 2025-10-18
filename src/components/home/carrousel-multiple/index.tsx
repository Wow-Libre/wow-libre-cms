"use client";
import { getProductsDiscount } from "@/api/store";
import LoadingSpinner from "@/components/utilities/loading-spinner";
import { useUserContext } from "@/context/UserContext";
import { Product } from "@/model/model";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import "./style.css";

interface MultiCarouselProps {
  t: (key: string, options?: any) => string;
}

const MultiCarousel: React.FC<MultiCarouselProps> = ({ t }) => {
  const router = useRouter();
  const { user } = useUserContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsWithDiscount = await getProductsDiscount(user.language);
        setProducts(productsWithDiscount);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchProducts();
  }, [user]);

  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 3000 },
      items: 3,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 2,
    },
    tablet: {
      breakpoint: { max: 1024, min: 768 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 768, min: 0 },
      items: 1,
    },
  };

  const handleSelectItem = (id: string) => {
    router.push(`/store/${id}`);
  };

  return (
    <div className="rounded-2xl p-4">
      <div className="mb-4">
        <h3 className="text-start text-xl text-white lg:text-2xl">
          {t("home-products.carrousel-offert.title")}
        </h3>
      </div>
      {error ? (
        <div className="flex items-center justify-center h-full mt-20 select-none">
          <LoadingSpinner />
        </div>
      ) : products.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <LoadingSpinner />
        </div>
      ) : (
        <Carousel
          className="max-h-[50rem] max-w-[80rem]"
          responsive={responsive}
          autoPlay={false}
          autoPlaySpeed={3000}
          infinite={true}
          slidesToSlide={1}
          transitionDuration={500}
          showDots={true}
          dotListClass="custom-dot-list-style"
        >
          {products.map((product) => (
            <div
              className="group relative flex flex-col justify-between m-4 rounded-xl overflow-hidden p-4 transition-all duration-300 bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-600/30 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/20 min-h-[28rem] cursor-pointer"
              key={product.id}
              onClick={() => handleSelectItem(product.reference_number)}
            >
              <div className="relative">
                <img
                  src={product.img_url}
                  alt={product.name}
                  className="w-full h-[16rem] object-cover rounded-lg transition duration-300 group-hover:scale-105"
                />
                {/* Overlay sutil */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent rounded-lg"></div>
              </div>
              <div className="mt-3 flex flex-col flex-grow space-y-2">
                <h4 className="text-lg font-bold text-white leading-tight line-clamp-2">
                  {product.name}
                </h4>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full border border-blue-500/30">
                    {product.category}
                  </span>
                </div>

                <p className="text-xs text-gray-400">{product.partner}</p>

                <div className="mt-2 p-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20">
                  {product.use_points ? (
                    <p className="text-lg font-bold text-blue-400 text-center">
                      {product.price} Points
                    </p>
                  ) : (
                    <p className="text-lg font-bold text-blue-400 text-center">
                      ${product.price} USD
                    </p>
                  )}
                </div>

                <p className="text-xs text-gray-300 leading-relaxed line-clamp-2">
                  {product.disclaimer.length > 40
                    ? `${product.disclaimer.slice(0, 40)}...`
                    : product.disclaimer}
                </p>

                {/* Botón simplificado */}
                <div className="mt-auto">
                  <button className="w-full px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-bold text-sm rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-800">
                    <span className="flex items-center justify-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {t("home-products.carrousel-offert.btn")}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      )}
    </div>
  );
};

export default MultiCarousel;

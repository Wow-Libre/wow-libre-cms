"use client";

import { getProductsDiscount } from "@/api/store";
import LoadingSpinner from "@/components/utilities/loading-spinner";
import { useUserContext } from "@/context/UserContext";
import { Product } from "@/model/model";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "react-multi-carousel/lib/styles.css";
import "./style.css";

const Carousel = dynamic(() => import("react-multi-carousel"), {
  ssr: false,
  loading: () => <div className="h-48 animate-pulse rounded-2xl bg-slate-800/40" />,
});

interface FeaturedOffersProps {
  t: (key: string, options?: Record<string, unknown>) => string;
}

const responsive = {
  desktop: {
    breakpoint: { max: 4000, min: 1280 },
    items: 3,
  },
  tablet: {
    breakpoint: { max: 1280, min: 640 },
    items: 2,
  },
  mobile: {
    breakpoint: { max: 640, min: 0 },
    items: 1,
  },
};

function CarouselArrow({
  onClick,
  direction,
}: {
  onClick?: () => void;
  direction: "left" | "right";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "left" ? "Ofertas anteriores" : "Ofertas siguientes"}
      className={`absolute top-[42%] z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-slate-950/80 text-cyan-200 shadow-lg backdrop-blur-md transition hover:border-cyan-400/40 hover:text-white ${
        direction === "left" ? "left-0" : "right-0"
      }`}
    >
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden
      >
        {direction === "left" ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        )}
      </svg>
    </button>
  );
}

function ProductOfferCard({
  product,
  actionLabel,
  onSelect,
}: {
  product: Product;
  actionLabel: string;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(product.reference_number)}
      className="group h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-gray-900/50 text-left shadow-lg shadow-black/20 backdrop-blur-md transition hover:border-cyan-500/30 hover:bg-gray-900/70"
    >
      <div className="relative h-36 overflow-hidden">
        <img
          src={product.img_url}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />
      </div>
      <div className="p-4">
        <h4 className="truncate text-base font-semibold text-white transition group-hover:text-cyan-200">
          {product.name}
        </h4>
        <p className="mt-1 truncate text-sm text-slate-400">
          {product.category}
          {product.partner ? ` · ${product.partner}` : ""}
        </p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-base font-semibold text-cyan-300">
            {product.use_points
              ? `${product.price} Points`
              : `$${product.price} USD`}
          </span>
          <span className="text-sm font-medium text-cyan-200/90 group-hover:text-white">
            {actionLabel}
          </span>
        </div>
      </div>
    </button>
  );
}

const FeaturedOffers = ({ t }: FeaturedOffersProps) => {
  const router = useRouter();
  const { user } = useUserContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const productsWithDiscount = await getProductsDiscount(user.language);
      setProducts(productsWithDiscount ?? []);
      setLoading(false);
    };

    void fetchProducts();
  }, [user]);

  const handleSelectItem = (id: string) => {
    router.push(`/store/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  const actionLabel = t("home-products.carrousel-offert.btn");
  const useCarousel = products.length > 3;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <h3 className="font-gaming text-2xl font-semibold tracking-wide text-white sm:text-3xl lg:text-[2rem]">
          <span className="bg-gradient-to-r from-white via-cyan-100 to-cyan-200 bg-clip-text text-transparent">
            {t("home-products.carrousel-offert.title")}
          </span>
        </h3>
        {useCarousel ? (
          <Link
            href="/store"
            className="text-sm font-medium text-cyan-300 transition hover:text-cyan-100"
          >
            {t("home-products.offer-day.btn.alternative")}
          </Link>
        ) : null}
      </div>

      {useCarousel ? (
        <div className="featured-offers-carousel relative px-12">
          <Carousel
            responsive={responsive}
            infinite={products.length > 3}
            slidesToSlide={1}
            showDots
            arrows
            customLeftArrow={<CarouselArrow direction="left" />}
            customRightArrow={<CarouselArrow direction="right" />}
            itemClass="px-2 h-full"
            containerClass="featured-offers-track"
            dotListClass="featured-offers-dots"
          >
            {products.map((product) => (
              <ProductOfferCard
                key={product.id}
                product={product}
                actionLabel={actionLabel}
                onSelect={handleSelectItem}
              />
            ))}
          </Carousel>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductOfferCard
              key={product.id}
              product={product}
              actionLabel={actionLabel}
              onSelect={handleSelectItem}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeaturedOffers;

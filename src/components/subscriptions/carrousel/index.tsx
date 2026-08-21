"use client";

import dynamic from "next/dynamic";
import "react-multi-carousel/lib/styles.css";

const Carousel = dynamic(() => import("react-multi-carousel"), {
  ssr: false,
  loading: () => <div className="h-48 animate-pulse rounded-2xl bg-slate-800/40" />,
});

interface CarrouselSubscriptionProps {
  t: (key: string, options?: Record<string, unknown>) => string;
}

const items = (t: CarrouselSubscriptionProps["t"]) => [
  {
    id: 1,
    image:
      "https://static.wixstatic.com/media/5dd8a0_57ba2aff6dfd4f8483525fd40ba08790~mv2.webp",
    title: t("subscription.partners.slide1"),
  },
  {
    id: 2,
    image:
      "https://static.wixstatic.com/media/5dd8a0_d7d044f1286149d0b08551bb2b7127e9~mv2.webp",
    title: t("subscription.partners.slide2"),
  },
  {
    id: 3,
    image:
      "https://static.wixstatic.com/media/5dd8a0_9d8bc23f68b94f409c5dcf6d1e621352~mv2.webp",
    title: t("subscription.partners.slide3"),
  },
  {
    id: 4,
    image:
      "https://static.wixstatic.com/media/5dd8a0_8d0b91a14e3640ff9024b2d4d961fd64~mv2.webp",
    title: t("subscription.partners.slide4"),
  },
  {
    id: 5,
    image:
      "https://static.wixstatic.com/media/5dd8a0_3d95935e217346a4aaf11e254e29e758~mv2.webp",
    title: t("subscription.partners.slide5"),
  },
];

const MultiCarouselSubs: React.FC<CarrouselSubscriptionProps> = ({ t }) => {
  const itemsData = items(t);
  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 1280 },
      items: 4,
    },
    desktop: {
      breakpoint: { max: 1280, min: 1024 },
      items: 3,
    },
    tablet: {
      breakpoint: { max: 1024, min: 640 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 640, min: 0 },
      items: 1,
    },
  };

  return (
    <div className="mt-16">
      <header className="mb-8">
        <h3 className="font-gaming text-2xl font-semibold tracking-wide text-white sm:text-3xl lg:text-[2rem]">
          <span className="bg-gradient-to-r from-white via-cyan-100 to-cyan-200 bg-clip-text text-transparent">
            {t("subscription.partners.title")}
          </span>
        </h3>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-400 sm:text-lg">
          {t("subscription.partners.description")}
        </p>
      </header>

      <Carousel
        className="select-none pb-10"
        responsive={responsive}
        draggable={false}
        showDots
        infinite
        itemClass="px-2"
      >
        {itemsData.map((item) => (
          <article
            className="overflow-hidden rounded-2xl border border-white/10 bg-gray-900/50 shadow-lg shadow-black/20"
            key={item.id}
          >
            <div className="relative h-44 sm:h-52">
              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
              <p className="absolute inset-x-0 bottom-0 p-4 text-sm font-semibold text-white sm:text-base">
                {item.title}
              </p>
            </div>
          </article>
        ))}
      </Carousel>
    </div>
  );
};

export default MultiCarouselSubs;

"use client";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

interface CarrouselSubscriptionProps {
  t: (key: string, options?: any) => string;
}
const items = (t: any) => [
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
];

const MultiCarouselSubs: React.FC<CarrouselSubscriptionProps> = ({ t }) => {
  const itemsData = items(t);
  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 3000 },
      items: 5,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 5,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 5,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 4,
    },
  };

  return (
    <div className="rounded-[1%] mt-16">
      <div>
        <h3 className="text-start title-server text-white text-xl md:text-2xl lg:text-3xl xl:text-4xl mb-2">
          {t("subscription.partners.title")}
        </h3>
      </div>
      <Carousel
        className="m-0 max-h-[50rem] max-w-[1200rem] pt-4 select-none"
        responsive={responsive}
        draggable={false}
        showDots={true}
      >
        {itemsData.map((item: any) => (
          <div
            className="relative flex flex-col rounded-xl overflow-hidden max-w-auto pl-8"
            key={item.id}
          >
            <div className="relative">
              <img
                src={item.image}
                alt={item.title}
                className="h-[22rem] w-full object-cover"
              />
              {/* Nombre sobre la imagen */}
              <div className="absolute inset-0 flex items-end p-4 bg-gradient-to-t from-black/75 to-transparent">
                <p className="text-white text-lg font-bold">{item.title}</p>
              </div>
            </div>
          </div>
        ))}
      </Carousel>
      <div>
        <p className="text-start text-white text-xl md:text-2xl lg:text-3xl xl:text-2xl mt-10 font-light">
          {t("subscription.partners.description")}
        </p>
      </div>
    </div>
  );
};

export default MultiCarouselSubs;

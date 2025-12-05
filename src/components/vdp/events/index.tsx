import { EventsVdp } from "@/model/model";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // Importar los estilos

interface ServerEventsProps {
  events: EventsVdp[];
  t: (key: string, options?: any) => string;
}
const ServerEvents: React.FC<ServerEventsProps> = ({ events, t }) => {
  return (
    <section className="contenedor py-12 px-4">
      {/* Header Section with improved styling */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-slate-500/20 to-slate-600/20 border-2 border-slate-400/50 mb-4">
          <span className="text-3xl">📅</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-300 to-white mb-4">
          {t("vdp-server.events.title")}
        </h1>
        <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
          {t("vdp-server.events.description")}
        </p>
      </div>

      {/* Carousel with enhanced styling */}
      <div className="mt-8 max-w-5xl mx-auto">
        <Carousel
          showThumbs={false}
          autoPlay={true}
          infiniteLoop={true}
          interval={4000}
          transitionTime={600}
          showArrows={true}
          showIndicators={true}
          showStatus={false}
          swipeable={true}
          emulateTouch={true}
          className="custom-carousel"
        >
          {events.map((evento) => (
            <div key={evento.id} className="px-2 md:px-4">
              <a
                href="#"
                className="group relative block bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden shadow-2xl hover:shadow-slate-500/30 transition-all duration-500"
              >
                {/* Image with overlay effect */}
                <div className="relative h-[450px] md:h-[500px] overflow-hidden">
                  <img
                    alt="event-server"
                    src={evento.img}
                    className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500"></div>

                  {/* Content overlay */}
                  <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                    <div className="transform transition-all duration-500 group-hover:translate-y-0 translate-y-4">
                      <p className="text-sm font-semibold uppercase tracking-wider text-green-400 mb-2 inline-block px-3 py-1 rounded-full bg-green-400/10 border border-green-400/30">
                        {evento.title}
                      </p>
                      <p className="text-2xl md:text-3xl font-bold text-white mb-4 mt-2">
                        {evento.description}
                      </p>
                      <div className="opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-96 transition-all duration-500 overflow-hidden">
                        <p className="text-white/90 text-base md:text-lg leading-relaxed">
                          {evento.disclaimer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
};

export default ServerEvents;

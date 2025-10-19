import React from "react";

interface SingleCardProps {
  image: string;
  Button?: string;
  CardDescription: string;
  CardTitle: string;
  titleHref?: string;
  btnHref?: string;
}

const SingleCard: React.FC<SingleCardProps> = ({
  image,
  Button,
  CardDescription,
  CardTitle,
  titleHref,
  btnHref,
}) => {
  return (
    <div className="group relative overflow-hidden">
      {/* Imagen de la tarjeta con efectos premium */}
      <div className="relative h-80 w-full overflow-hidden rounded-2xl">
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
        
        {/* Imagen principal */}
        <img
          src={image}
          alt={CardTitle}
          className="h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-90"
        />
        
        {/* Efecto de brillo en hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
      </div>

      {/* Contenido de la tarjeta */}
      <div className="relative z-20 -mt-8 mx-4">
        <div className="bg-gradient-to-br from-gaming-base-main/95 to-gaming-base-dark/95 backdrop-blur-xl border border-gaming-base-light/30 rounded-2xl p-6 shadow-2xl">
          {/* Título */}
          <h3 className="mb-4">
            <a
              target="_blank"
              href={titleHref || "/#"}
              className="block text-2xl font-bold text-gaming-primary-light hover:text-gaming-primary-main transition-colors duration-300 leading-tight"
            >
              {CardTitle}
            </a>
          </h3>
          
          {/* Descripción */}
          <div className="mb-6">
            <p className="text-base leading-relaxed text-gray-300 font-light">
              {CardDescription}
            </p>
          </div>

          {/* Botón premium */}
          {Button && (
            <a
              target="_blank"
              href={btnHref || "#"}
              className="group/btn inline-flex items-center justify-center w-full bg-gradient-to-r from-gaming-primary-main to-gaming-primary-dark hover:from-gaming-primary-light hover:to-gaming-primary-main text-white px-6 py-3 rounded-xl font-semibold text-base transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-gaming-primary-main/30"
            >
              <span className="mr-2">{Button}</span>
              <svg className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default SingleCard;

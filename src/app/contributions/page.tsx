"use client";
import SingleCard from "@/components/contributions/card";
import NavbarAuthenticated from "@/components/navbar-authenticated";
import { addonsAvailable } from "@/constants/addons";
import { wowClients } from "@/constants/wowClients";

import Link from "next/link";

const Contributions = () => {
  return (
    <div>
      <div className="contenedor">
        <NavbarAuthenticated />
      </div>

      <div className="relative text-white mt-10 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-gaming-primary-main via-gaming-secondary-main to-gaming-primary-dark"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gaming-secondary-main/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 contenedor mx-auto px-6 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="flex flex-col justify-between max-w-2xl w-full">
              <div>
                {/* Badge */}
                <div className="mb-6">
                  <span className="inline-block px-4 py-2 bg-white/20 text-white text-sm font-semibold rounded-full border border-white/30 backdrop-blur-sm">
                    🎮 GAMING EXPERIENCE
                  </span>
                </div>
                
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-8 leading-tight">
                  ¿Buscas algún guía y<span className="sm:block"> descargar el juego?</span>
                </h2>
                <p className="text-lg sm:text-xl lg:text-2xl mb-6 break-words font-light leading-relaxed">
                  Descarga nuestro cliente de World of Warcraft y disfruta de la
                  experiencia clásica con gráficos mejorados.
                </p>
              </div>
              
              <div className="mt-8 sm:mt-10">
                <Link
                  href="#download"
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-white/20"
                >
                  <span>¡Descargar juego!</span>
                  <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </Link>
                <p className="text-lg pt-6 text-center sm:text-left break-words font-light">
                  Si tienes alguna duda, no dudes en contactarnos a través de
                  nuestro grupo de WhatsApp. ¡Estamos aquí para ayudarte! 📱💬
                </p>
              </div>
            </div>
            
            {/* Ocultar imágenes en mobile y mostrarlas en sm+ */}
            <div className="hidden sm:grid sm:grid-cols-2 gap-4 lg:gap-8 items-center">
              <div className="relative h-[450px] w-full select-none group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl z-10"></div>
                <img
                  src="https://static.wixstatic.com/media/5dd8a0_423a9b289cbb4211aeec71a2ca145926~mv2.webp"
                  alt="Decorations"
                  className="object-cover rounded-xl w-full h-full transition-all duration-500 group-hover:scale-105 group-hover:brightness-110"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out rounded-xl"></div>
              </div>
              <div className="relative h-[450px] w-full select-none group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl z-10"></div>
                <img
                  src="https://static.wixstatic.com/media/5dd8a0_7541713497634f41807acf80546c561c~mv2.webp"
                  alt="AzerothCore"
                  className="object-cover rounded-xl w-full h-full transition-all duration-500 group-hover:scale-105 group-hover:brightness-110"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Addons Section */}
      <section className="relative bg-midnight py-32 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-gaming-primary-main/5 via-transparent to-gaming-secondary-main/5"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gaming-primary-main/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gaming-secondary-main/10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-8">
          {/* Hero Section */}
          <div className="text-center mb-32">
            <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-gaming-primary-main/20 to-gaming-secondary-main/20 rounded-2xl mb-10 shadow-2xl border border-gaming-primary-main/30 backdrop-blur-sm">
              <span className="text-5xl">🔧</span>
            </div>
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-gaming-primary-main/20 text-gaming-primary-light text-sm font-semibold rounded-full border border-gaming-primary-main/30">
                PREMIUM ADDONS
              </span>
            </div>
            <h1 className="text-7xl md:text-8xl font-black text-gaming-primary-light mb-10 leading-tight">
              Addons<span className="sm:block"> Disponibles</span>
            </h1>
            <p className="text-2xl md:text-3xl text-gray-300 max-w-5xl mx-auto leading-relaxed font-light">
              Mejora tu experiencia de juego con nuestros addons premium desarrollados por expertos
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="text-center">
              <div className="text-4xl font-bold text-gaming-primary-light mb-2">50+</div>
              <div className="text-gray-400 font-medium">Addons Disponibles</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gaming-secondary-main mb-2">10K+</div>
              <div className="text-gray-400 font-medium">Descargas Totales</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gaming-status-success mb-2">99%</div>
              <div className="text-gray-400 font-medium">Satisfacción</div>
            </div>
          </div>

          {/* Addons Grid */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {addonsAvailable.map((addon, index) => (
              <div key={index} className="group">
                <div className="relative bg-gaming-base-main/40 backdrop-blur-sm border border-gaming-base-light/20 rounded-3xl p-8 transition-all duration-500 hover:border-gaming-primary-main/50 hover:shadow-2xl hover:shadow-gaming-primary-main/20 hover:scale-105 hover:-translate-y-2">
                  {/* Premium Badge */}
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-gaming-secondary-main to-gaming-primary-main text-white text-xs font-bold px-3 py-1 rounded-full">
                    PREMIUM
                  </div>
                  
                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gaming-primary-main/5 to-gaming-secondary-main/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10">
                    <SingleCard
                      image={addon.image}
                      CardTitle={addon.CardTitle}
                      titleHref={addon.titleHref}
                      btnHref={addon.btnHref}
                      CardDescription={addon.CardDescription}
                      Button={addon.Button}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clients & Guides Section */}
      <section className="relative bg-midnight py-32 overflow-hidden" id="download">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-tl from-gaming-secondary-main/5 via-transparent to-gaming-primary-main/5"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gaming-secondary-main/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-gaming-primary-main/10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-8">
          {/* Hero Section */}
          <div className="text-center mb-32">
            <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-gaming-secondary-main/20 to-gaming-primary-main/20 rounded-2xl mb-10 shadow-2xl border border-gaming-secondary-main/30 backdrop-blur-sm">
              <span className="text-5xl">🎮</span>
            </div>
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-gaming-secondary-main/20 text-gaming-secondary-main text-sm font-semibold rounded-full border border-gaming-secondary-main/30">
                GAMING RESOURCES
              </span>
            </div>
            <h1 className="text-7xl md:text-8xl font-black text-gaming-secondary-main mb-10 leading-tight">
              Clientes &<span className="sm:block"> Guías</span>
            </h1>
            <p className="text-2xl md:text-3xl text-gray-300 max-w-5xl mx-auto leading-relaxed font-light">
              ¡Domina Azeroth con el mejor contenido a tu alcance! 🚀🔥
            </p>
          </div>

          {/* Features Grid */}
          <div className="space-y-32">
            {wowClients.map((feature, index) => (
              <div
                key={index}
                className={`relative bg-gaming-base-main/40 backdrop-blur-sm border border-gaming-base-light/20 rounded-3xl p-16 lg:p-20 ${
                  feature.reverse ? "lg:flex-row-reverse" : ""
                } lg:flex lg:items-center lg:gap-20`}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-gaming-primary-main/3 to-gaming-secondary-main/3 rounded-3xl opacity-50"></div>
                
                <div className={`relative z-10 flex-1 ${feature.reverse ? "lg:order-2" : ""}`}>
                  {/* Icono separado */}
                  <div className="mb-8">
                    <div className="w-32 h-32 bg-gradient-to-br from-gaming-primary-main/20 to-gaming-secondary-main/20 rounded-3xl flex items-center justify-center border border-gaming-primary-main/30 backdrop-blur-sm shadow-2xl">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="h-16 w-16 text-gaming-primary-main"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d={feature.icon}
                        />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Título */}
                  <div className="mb-8">
                    <h2 className="text-5xl md:text-6xl font-black text-gaming-primary-light leading-tight mb-4">
                      {feature.title}
                    </h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-gaming-primary-main to-gaming-secondary-main rounded-full"></div>
                  </div>
                  
                  {/* Descripción */}
                  <div className="mb-12">
                    <p className="text-xl text-gray-300 leading-relaxed font-light">
                      {feature.description}
                    </p>
                  </div>
                  
                  {/* Botón */}
                  <a
                    target="_blank"
                    className="group inline-flex items-center gap-4 bg-gradient-to-r from-gaming-primary-main to-gaming-primary-dark hover:from-gaming-primary-light hover:to-gaming-primary-main text-white px-12 py-6 rounded-2xl font-semibold text-xl transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-gaming-primary-main/30"
                    href={feature.url}
                  >
                    {feature.btnText}
                    <svg className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
                
                <div className={`relative flex-1 mt-16 lg:mt-0 ${feature.reverse ? "lg:order-1" : ""}`}>
                  <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-r from-gaming-primary-main/20 to-gaming-secondary-main/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    <div className="relative bg-gaming-base-dark/50 rounded-2xl p-8 backdrop-blur-sm border border-gaming-base-light/20">
                      <img
                        className="w-full rounded-xl shadow-2xl transition-transform duration-500 group-hover:scale-105"
                        src={feature.image}
                        alt={feature.title}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contributions;

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import NavbarMinimalist from "@/components/navbar-minimalist";
import Footer from "@/components/footer";

const TermsAndConditions = () => {
  const router = useRouter();

  const handleAcceptClick = () => {
    router.back();
  };

  const handleBackClick = () => {
    router.push("/");
  };

  return (
    <div className="contenedor register bg-midnight min-h-screen">
      <NavbarMinimalist />
      
      <div className="register-container flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="max-w-4xl w-full bg-gray-900/80 backdrop-blur-sm rounded-lg shadow-2xl p-8 md:p-12 border border-gray-600/30">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-white text-center">
            Términos y Condiciones
          </h1>
          
          <div className="space-y-6 text-gray-200">
            <div className="bg-gray-800/40 backdrop-blur-sm rounded-lg p-6 border border-gray-600/20">
              <h2 className="text-xl font-semibold text-blue-400 mb-3">
                1. Aceptación de los Términos
              </h2>
              <p className="text-base leading-relaxed">
                Al acceder y utilizar nuestro sitio web, usted acepta cumplir y
                estar sujeto a los siguientes términos y condiciones. Si no está
                de acuerdo con estos términos, no utilice nuestro sitio web.
              </p>
            </div>

            <div className="bg-gray-800/40 backdrop-blur-sm rounded-lg p-6 border border-gray-600/20">
              <h2 className="text-xl font-semibold text-blue-400 mb-3">
                2. Uso del Sitio Web
              </h2>
              <p className="text-base leading-relaxed">
                Nuestro sitio web está destinado únicamente para su uso personal y
                no comercial. No debe utilizar el sitio para ningún propósito
                ilegal o no autorizado. Usted es responsable de cumplir con todas
                las leyes locales, estatales y nacionales mientras utiliza nuestro
                sitio.
              </p>
            </div>

            <div className="bg-gray-800/40 backdrop-blur-sm rounded-lg p-6 border border-gray-600/20">
              <h2 className="text-xl font-semibold text-blue-400 mb-3">
                3. Propiedad Intelectual
              </h2>
              <p className="text-base leading-relaxed">
                Todo el contenido y materiales en nuestro sitio web, incluidos
                pero no limitados a texto, gráficos, logotipos, imágenes, y
                software, son propiedad de nuestra empresa o de nuestros
                licenciantes y están protegidos por las leyes de propiedad
                intelectual.
              </p>
            </div>

            <div className="bg-gray-800/40 backdrop-blur-sm rounded-lg p-6 border border-gray-600/20">
              <h2 className="text-xl font-semibold text-blue-400 mb-3">
                4. Modificaciones del Servicio
              </h2>
              <p className="text-base leading-relaxed">
                Nos reservamos el derecho de modificar o discontinuar el servicio
                en cualquier momento sin previo aviso. No seremos responsables
                ante usted ni ante ningún tercero por cualquier modificación,
                suspensión o interrupción del servicio.
              </p>
            </div>

            <div className="bg-gray-800/40 backdrop-blur-sm rounded-lg p-6 border border-gray-600/20">
              <h2 className="text-xl font-semibold text-blue-400 mb-3">
                5. Enlaces a Sitios de Terceros
              </h2>
              <p className="text-base leading-relaxed">
                Nuestro sitio web puede contener enlaces a sitios web de terceros.
                No tenemos control sobre el contenido de esos sitios y no asumimos
                ninguna responsabilidad por ellos. Su uso de los sitios web de
                terceros está sujeto a los términos y condiciones de esos sitios.
              </p>
            </div>

            <div className="bg-gray-800/40 backdrop-blur-sm rounded-lg p-6 border border-gray-600/20">
              <h2 className="text-xl font-semibold text-blue-400 mb-3">
                6. Limitación de Responsabilidad
              </h2>
              <p className="text-base leading-relaxed">
                En la medida máxima permitida por la ley aplicable, no seremos
                responsables por daños indirectos, incidentales, especiales,
                consecuentes o punitivos, o por la pérdida de beneficios, datos o
                uso, que resulten del uso o la incapacidad de usar nuestro sitio
                web.
              </p>
            </div>

            <div className="bg-gray-800/40 backdrop-blur-sm rounded-lg p-6 border border-gray-600/20">
              <h2 className="text-xl font-semibold text-blue-400 mb-3">
                7. Indemnización
              </h2>
              <p className="text-base leading-relaxed">
                Usted acepta indemnizar y mantener a nuestra empresa y a nuestros
                afiliados, directores, empleados y agentes, indemnes de cualquier
                reclamo, demanda, responsabilidad, pérdida, daño o gasto
                (incluidos los honorarios legales razonables) que surjan de su uso
                del sitio web o de su incumplimiento de estos términos.
              </p>
            </div>

            <div className="bg-gray-800/40 backdrop-blur-sm rounded-lg p-6 border border-gray-600/20">
              <h2 className="text-xl font-semibold text-blue-400 mb-3">
                8. Ley Aplicable
              </h2>
              <p className="text-base leading-relaxed">
                Estos términos se regirán e interpretarán de acuerdo con las leyes
                del país donde se encuentra nuestra empresa, sin tener en cuenta
                los principios de conflicto de leyes. Cualquier disputa
                relacionada con estos términos estará sujeta a la jurisdicción
                exclusiva de los tribunales ubicados en nuestra sede.
              </p>
            </div>

            <div className="bg-gray-800/40 backdrop-blur-sm rounded-lg p-6 border border-gray-600/20">
              <h2 className="text-xl font-semibold text-blue-400 mb-3">
                9. Aviso Legal
              </h2>
              <p className="text-base leading-relaxed">
                Este sitio web no está afiliado, asociado, autorizado, respaldado
                por, o de cualquier forma conectado oficialmente con Blizzard
                Entertainment, Inc., o cualquiera de sus subsidiarias o sus
                afiliados. Los nombres de World of Warcraft, Warcraft, y Blizzard
                Entertainment, así como sus respectivos logotipos, son marcas
                comerciales o marcas registradas de Blizzard Entertainment, Inc.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:justify-center md:gap-6 mt-12">
            {/* Botón Aceptar */}
            <button
              className="text-white px-8 py-4 rounded-lg button-register relative group transition-all duration-500 hover:text-white hover:bg-gradient-to-r hover:from-gaming-primary-main hover:to-gaming-secondary-main hover:shadow-2xl hover:shadow-gaming-primary-main/40 hover:scale-[1.02] hover:-translate-y-1 overflow-hidden mb-4 md:mb-0"
              type="button"
              onClick={handleAcceptClick}
            >
              {/* Efecto de partículas flotantes */}
              <div className="absolute inset-0 overflow-hidden rounded-lg">
                <div className="absolute top-2 left-1/4 w-1 h-1 bg-white/60 rounded-full opacity-75"></div>
                <div className="absolute top-4 right-1/3 w-0.5 h-0.5 bg-white/40 rounded-full opacity-50"></div>
                <div className="absolute bottom-2 left-1/2 w-1 h-1 bg-white/50 rounded-full opacity-60"></div>
                <div className="absolute bottom-4 right-1/4 w-0.5 h-0.5 bg-white/35 rounded-full opacity-40"></div>
              </div>

              {/* Efecto de brillo profesional */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>

              {/* Efecto de borde luminoso */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-gaming-primary-main/20 via-gaming-secondary-main/20 to-gaming-primary-main/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <span className="relative z-10 font-semibold tracking-wide">Aceptar</span>
              
              {/* Línea inferior elegante */}
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-gaming-primary-main to-gaming-secondary-main group-hover:w-full transition-all duration-700 ease-out"></div>
            </button>

            {/* Botón Rechazar */}
            <button
              className="text-white px-8 py-4 rounded-lg button-register relative group transition-all duration-500 hover:text-white hover:bg-gradient-to-r hover:from-gray-600 hover:to-gray-700 hover:shadow-2xl hover:shadow-gray-500/40 hover:scale-[1.02] hover:-translate-y-1 overflow-hidden"
              type="button"
              onClick={handleBackClick}
            >
              {/* Efecto de partículas flotantes */}
              <div className="absolute inset-0 overflow-hidden rounded-lg">
                <div className="absolute top-2 left-1/4 w-1 h-1 bg-white/60 rounded-full opacity-75"></div>
                <div className="absolute top-4 right-1/3 w-0.5 h-0.5 bg-white/40 rounded-full opacity-50"></div>
                <div className="absolute bottom-2 left-1/2 w-1 h-1 bg-white/50 rounded-full opacity-60"></div>
                <div className="absolute bottom-4 right-1/4 w-0.5 h-0.5 bg-white/35 rounded-full opacity-40"></div>
              </div>

              {/* Efecto de brillo profesional */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>

              {/* Efecto de borde luminoso */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-gray-500/20 via-gray-600/20 to-gray-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <span className="relative z-10 font-semibold tracking-wide">Rechazar</span>
              
              {/* Línea inferior elegante */}
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-gray-500 to-gray-600 group-hover:w-full transition-all duration-700 ease-out"></div>
            </button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default TermsAndConditions;

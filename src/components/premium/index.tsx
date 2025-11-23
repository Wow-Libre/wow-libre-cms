import { claimBenefitsPremium, getBenefitsPremium } from "@/api/subscriptions";
import { SubscriptionsBenefit } from "@/model/model";
import Link from "next/link";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import LoadingSpinner from "../utilities/loading-spinner";

interface PremiumProps {
  language: string;
  token: string;
  serverId: number;
  accountId: number;
  characterId: number;
  t: (key: string, options?: any) => string;
}

const Premium: React.FC<PremiumProps> = ({
  serverId,
  accountId,
  characterId,
  language,
  token,
  t,
}) => {
  const [subscription, setSubscription] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);

  const [subscriptionBenefits, setSubscriptionBenefits] = useState<
    SubscriptionsBenefit[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const subscriptionData = await getBenefitsPremium(
          language,
          token,
          serverId
        );
        setSubscriptionBenefits(subscriptionData.benefits);
        setSubscription(subscriptionData.benefits.length > 0);
      } catch (error) {
        console.error("Error fetching subscription benefits:", error);
      } finally {
        setLoading(false);
        setRefresh(false);
      }
    };

    fetchBanners();
  }, [language, token, refresh, characterId]);

  const handleButtonClick = async (benefitId: number): Promise<void> => {
    try {
      await claimBenefitsPremium(
        serverId,
        accountId,
        characterId,
        benefitId,
        language,
        token
      );
      setRefresh(true);
      setCurrentPage(1);
      Swal.fire({
        icon: "success",
        title: "¡Beneficio reclamado con éxito! 🎉",
        text: "Tu recompensa ahora está disponible. ¡Disfrútala!",
        color: "white",
        background: "#0B1218",
        confirmButtonText: "¡Genial!",
        confirmButtonColor: "#1DB954",
        showClass: {
          popup: "animate__animated animate__fadeInDown",
        },
        hideClass: {
          popup: "animate__animated animate__fadeOutUp",
        },
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: `${error.message}`,
        color: "white",
        background: "#0B1218",
      });
      return;
    }
  };

  // Calcular los elementos actuales según la página
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = subscriptionBenefits.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(subscriptionBenefits.length / itemsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  if (loading) {
    return (
      <div className="contenedor flex items-center justify-center mt-20">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-8 rounded-2xl shadow-2xl border border-slate-700/50 relative overflow-hidden">
      {/* Efecto de fondo decorativo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500 rounded-full blur-3xl"></div>
      </div>

      {subscription && subscriptionBenefits.length > 0 ? (
        <div className="relative z-10">
          {/* Título de la sección */}
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 tracking-tight">
              Beneficios Premium
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-amber-500 to-yellow-500 mx-auto rounded-full"></div>
            <p className="mt-4 text-gray-400 text-lg">
              Reclama tus beneficios exclusivos
            </p>
          </div>

          {/* Contenedor general de las tarjetas */}
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentItems.map((card, index) => (
                <div
                  key={index}
                  className="group relative"
                >
                  <div className="h-full bg-gradient-to-br from-slate-800/90 via-slate-800/80 to-slate-900/90 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-700/50 shadow-xl transition-all duration-500 transform hover:scale-[1.03] hover:shadow-2xl hover:shadow-amber-500/20 hover:border-amber-500/30 flex flex-col">
                    {/* Imagen con overlay */}
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={card.img}
                        alt={card.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://via.placeholder.com/400x224?text=No+Image";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                      {/* Badge premium */}
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-amber-500/90 backdrop-blur-sm text-white text-xs font-bold rounded-full border border-amber-400/50 shadow-lg">
                          PREMIUM
                        </span>
                      </div>
                    </div>

                    {/* Contenido */}
                    <div className="flex flex-col flex-grow p-6">
                      <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-amber-300 transition-colors duration-300">
                        {card.name}
                      </h3>
                      <p className="text-gray-300 mb-6 text-base flex-grow leading-relaxed line-clamp-3">
                        {card.description}
                      </p>
                      <button
                        onClick={() => handleButtonClick(card.id)}
                        className="w-full py-3 px-4 text-base font-bold bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-amber-500/30 transform hover:scale-[1.02] active:scale-[0.98]"
                      >
                        {card.btn_txt}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Controles de paginación mejorados */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-10 gap-4">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="px-6 py-3 text-base font-medium bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-lg border border-slate-700/50 hover:border-slate-600/50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-800/50 transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Anterior
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg text-base font-medium transition-all duration-200 ${
                        currentPage === page
                          ? "bg-amber-600 text-white shadow-lg shadow-amber-500/30"
                          : "bg-slate-800/50 text-gray-300 hover:bg-slate-700/50 border border-slate-700/50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className="px-6 py-3 text-base font-medium bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-lg border border-slate-700/50 hover:border-slate-600/50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-800/50 transition-all duration-200 flex items-center gap-2"
                >
                  Siguiente
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="min-h-[390px] flex flex-col items-center justify-center p-8">
          <div className="text-center max-w-2xl">
            <div className="mb-6">
              <svg
                className="w-24 h-24 mx-auto text-yellow-500 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="text-4xl font-extrabold mb-4 text-yellow-500">
              Acceso Premium Requerido
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Para acceder a los beneficios premium, necesitas una suscripción activa.
            </p>
            <p className="text-lg text-gray-400 mb-8">
              Visita nuestra página de suscripciones para conocer los planes disponibles y sus beneficios.
            </p>
            <Link
              href="/subscriptions"
              className="inline-block px-8 py-3 text-lg font-bold bg-gradient-to-r from-yellow-500 to-yellow-700 hover:from-yellow-600 hover:to-yellow-800 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Ver Planes de Suscripción
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Premium;

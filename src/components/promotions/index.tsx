import { claimPromotion, getPromotions } from "@/api/promotions";
import { PromotionsModel } from "@/model/model";
import Link from "next/link";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import LoadingSpinner from "../utilities/loading-spinner";
import { InternalServerError } from "@/dto/generic";

interface PremiumProps {
  classId: number;
  serverId: number;
  accountId: number;
  characterId: number;
  language: string;
  token: string;
  t: (key: string, options?: any) => string;
}

const Promotions: React.FC<PremiumProps> = ({
  classId,
  serverId,
  accountId,
  characterId,
  language,
  token,
  t,
}) => {
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);

  const [subscriptionBenefits, setSubscriptionBenefits] = useState<
    PromotionsModel[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const promotionsData = await getPromotions(
          language,
          token,
          serverId,
          accountId,
          characterId,
          classId
        );
        setSubscriptionBenefits(promotionsData.promotions);
      } catch (error) {
        setLoading(false);
        setRefresh(false);
      } finally {
        setLoading(false);
        setRefresh(false);
      }
    };

    fetchPromos();
  }, [language, token, refresh, characterId]);

  const handleButtonClick = async (promotionId: number): Promise<void> => {
    try {
      await claimPromotion(
        serverId,
        accountId,
        characterId,
        promotionId,
        language,
        token
      );
      setRefresh(true);
      setCurrentPage(1);
      Swal.fire({
        icon: "success",
        title: t("promotions-character.messages.title-success-claim-promo"),
        text: t("promotions-character.messages.text-success-claim-promo"),
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
      if (error instanceof InternalServerError) {
        Swal.fire({
          icon: "error",
          title: "Opss!",
          html: `
            <p><strong>Message:</strong> ${error.message}</p>
            <hr style="border-color: #444; margin: 8px 0;">
            <p><strong>Transaction ID:</strong> ${error.transactionId}</p>
          `,
          color: "white",
          background: "#0B1218",
        });
        return;
      }
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
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-500 rounded-full blur-3xl"></div>
      </div>

      {subscriptionBenefits.length > 0 ? (
        <div className="relative z-10">
          {/* Título de la sección */}
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 tracking-tight">
              Promociones
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-indigo-500 to-violet-500 mx-auto rounded-full"></div>
            <p className="mt-4 text-gray-400 text-lg">
              Reclama tus promociones exclusivas
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
                  <div className="h-full bg-gradient-to-br from-slate-800/90 via-slate-800/80 to-slate-900/90 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-700/50 shadow-xl transition-all duration-500 transform hover:scale-[1.03] hover:shadow-2xl hover:shadow-indigo-500/20 hover:border-indigo-500/30 flex flex-col">
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
                      {/* Badge promoción */}
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-indigo-500/90 backdrop-blur-sm text-white text-xs font-bold rounded-full border border-indigo-400/50 shadow-lg">
                          PROMO
                        </span>
                      </div>
                    </div>

                    {/* Contenido */}
                    <div className="flex flex-col flex-grow p-6">
                      <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-indigo-300 transition-colors duration-300">
                        {card.name}
                      </h3>
                      <p className="text-gray-300 mb-4 text-base flex-grow leading-relaxed line-clamp-2">
                        {card.description}
                      </p>

                      {/* Niveles */}
                      <div className="flex items-center justify-between mb-6 px-3 py-2 bg-slate-700/30 rounded-lg border border-slate-600/50">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400">
                            {t("promotions-character.lvl-min")}
                          </span>
                          <span className="text-base font-bold text-white">
                            {card?.min_lvl || 0}
                          </span>
                        </div>
                        <span className="text-gray-500">-</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400">
                            {t("promotions-character.lvl-max")}
                          </span>
                          <span className="text-base font-bold text-white">
                            {card?.max_lvl || 100}
                          </span>
                        </div>
                      </div>

                      {/* Botón */}
                      <button
                        onClick={() => handleButtonClick(card.id)}
                        className="w-full py-3 px-4 text-base font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-indigo-500/30 transform hover:scale-[1.02] active:scale-[0.98]"
                        style={{ color: '#FFFFFF' }}
                      >
                        {card.btn_txt || "Reclamar"}
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
                  {t("promotions-character.btns.pagination-return")}
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg text-base font-medium transition-all duration-200 ${
                        currentPage === page
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
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
                  {t("promotions-character.btns.pagination-next")}
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="relative z-10 min-h-[390px] flex flex-col items-center justify-center p-8">
          <div className="text-center max-w-3xl">
            {/* Icono decorativo */}
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center border border-indigo-500/30">
                <svg
                  className="w-12 h-12 text-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                  />
                </svg>
              </div>
            </div>

            {/* Título y mensaje principal */}
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
              {t("promotions-character.promotion-empty.title")}
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-indigo-500 to-violet-500 mx-auto rounded-full mb-6"></div>
            <p className="text-xl text-gray-300 mb-3">
              {t("promotions-character.promotion-empty.subtitle")}
            </p>
            <p className="text-lg text-gray-400 mb-8">
              {t("promotions-character.promotion-empty.description")}
            </p>

            {/* Beneficios y Soporte */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Promociones Exclusivas */}
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                    <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-indigo-300">
                    {t("promotions-character.promotion-empty.benefit-promo.title")}
                  </h3>
                </div>
                <ul className="list-disc list-inside text-gray-300 text-base space-y-1">
                  <li>
                    {t(
                      "promotions-character.promotion-empty.benefit-promo.benefits.primary"
                    )}
                  </li>
                </ul>
              </div>

              {/* Soporte Prioritario */}
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
                    <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-violet-300">
                    {t("promotions-character.promotion-empty.support-promo.title")}
                  </h3>
                </div>
                <p className="text-gray-300 text-base leading-relaxed">
                  {t(
                    "promotions-character.promotion-empty.support-promo.description"
                  )}
                </p>
              </div>
            </div>

            {/* Botón de enlace */}
            <Link
              href="https://chat.whatsapp.com/KpvQJSOAujI4DlYjweWDxW"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-3 text-lg font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-indigo-500/30 transform hover:scale-105"
            >
              {t("promotions-character.promotion-empty.btn-invitation")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Promotions;

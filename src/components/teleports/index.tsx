import { getTeleports, teleport } from "@/api/teleports";
import { InternalServerError } from "@/dto/generic";
import { Teleport } from "@/model/teleport";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import LoadingSpinner from "../utilities/loading-spinner";

interface TeleportsProps {
  classId: number;
  serverId: number;
  accountId: number;
  characterId: number;
  raceId: number;
  language: string;
  token: string;
  t: (key: string, options?: any) => string;
}

const Teleports: React.FC<TeleportsProps> = ({
  serverId,
  accountId,
  characterId,
  raceId,
  language,
  token,
  t,
}) => {
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);

  const [teleportsData, setTeleports] = useState<Teleport[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const teleports = await getTeleports(raceId, serverId, token);
        setTeleports(teleports);
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

  const handleButtonClick = async (teleportId: number): Promise<void> => {
    try {
      await teleport(token, accountId, characterId, serverId, teleportId);
      setRefresh(true);
      setCurrentPage(1);
      Swal.fire({
        icon: "success",
        title: t("teleport.success.title"),
        text: t("teleport.success.text"),
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
  const currentItems = teleportsData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(teleportsData.length / itemsPerPage);

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
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500 rounded-full blur-3xl"></div>
      </div>

      {teleportsData.length > 0 ? (
        <div className="relative z-10">
          {/* Título de la sección */}
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 tracking-tight">
              Teleports
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-cyan-500 mx-auto rounded-full"></div>
            <p className="mt-4 text-gray-400 text-lg">
              Viaja instantáneamente a diferentes ubicaciones
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
                  <div className="h-full bg-gradient-to-br from-slate-800/90 via-slate-800/80 to-slate-900/90 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-700/50 shadow-xl transition-all duration-500 transform hover:scale-[1.03] hover:shadow-2xl hover:shadow-blue-500/20 hover:border-blue-500/30 flex flex-col">
                    {/* Imagen con overlay */}
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={card.img_url}
                        alt={card.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://via.placeholder.com/400x224?text=No+Image";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                      {/* Badge teleport */}
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-blue-500/90 backdrop-blur-sm text-white text-xs font-bold rounded-full border border-blue-400/50 shadow-lg">
                          TELEPORT
                        </span>
                      </div>
                    </div>

                    {/* Contenido */}
                    <div className="flex flex-col flex-grow p-6">
                      <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-blue-300 transition-colors duration-300 text-center">
                        {card.name}
                      </h3>
                      <p className="text-gray-300 mb-6 text-base flex-grow leading-relaxed text-center">
                        {t("teleport.available.description")}
                      </p>

                      {/* Botón */}
                      <button
                        onClick={() => handleButtonClick(card.id)}
                        className="w-full py-3 px-4 text-base font-bold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/30 transform hover:scale-[1.02] active:scale-[0.98] uppercase tracking-wide"
                        style={{ color: '#FFFFFF' }}
                      >
                        {t("teleport.available.btn-txt")}
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
                  {t("teleport.pagination.previous")}
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg text-base font-medium transition-all duration-200 ${
                        currentPage === page
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
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
                  {t("teleport.pagination.next")}
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
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/30">
                <svg
                  className="w-12 h-12 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Título y mensaje principal */}
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
              {t("teleport.empty.title")}
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-cyan-500 mx-auto rounded-full mb-6"></div>
            <p className="text-xl text-gray-300 mb-3">
              {t("teleport.empty.description")}
            </p>
            <p className="text-lg text-gray-400 mb-8">
              {t("teleport.empty.disclaimer")}
            </p>

            {/* Beneficios y Soporte */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card One */}
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                    <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-blue-300">
                    {t("teleport.empty.cards.card-one.title")}
                  </h3>
                </div>
                <p className="text-gray-300 text-base leading-relaxed">
                  {t("teleport.empty.cards.card-one.description")}
                </p>
              </div>

              {/* Card Two */}
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                    <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-cyan-300">
                    {t("teleport.empty.cards.card-two.title")}
                  </h3>
                </div>
                <p className="text-gray-300 text-base leading-relaxed">
                  {t("teleport.empty.cards.card-two.title")}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teleports;

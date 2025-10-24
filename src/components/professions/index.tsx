import { getProfessions } from "@/api/professions";
import { InternalServerError } from "@/dto/generic";
import { Character, Profession } from "@/model/model";
import React, { MouseEventHandler, useEffect, useState } from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import Swal from "sweetalert2";
import Announcement from "./annoucement";
import ProfesionService from "./service";
import "./style.css";

interface ProfessionsProps {
  character: Character;
  token: string;
  accountId: number;
  serverId: number;
  t: (key: string, options?: any) => string;
}
interface ArrowProps {
  onClick?: MouseEventHandler<HTMLButtonElement>;
}
const Professions: React.FC<ProfessionsProps> = ({
  character,
  token,
  accountId,
  serverId,
  t,
}) => {
  const [professions, setPartners] = useState<Profession[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProfession, setSelectedProfession] =
    useState<Profession | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProfession(null);
  };
  const handleAnnounce = (profession: Profession) => {
    setSelectedProfession(profession);
    setShowConfirmDialog(true);
  };

  const handleConfirmAnnounce = () => {
    Swal.fire({
      icon: "info",
      color: "white",
      background: "#0B1218",
      title: t("professions.messages.announcement-title"),
      text: t("professions.messages.announcement-description"),
      confirmButtonText: "Aceptar",
    }).then(() => {
      setShowConfirmDialog(false);
    });
  };

  const handleCancelAnnounce = () => {
    setShowConfirmDialog(false);
  };

  const refreshProfessions = async () => {
    try {
      const professions = await getProfessions(
        character.id,
        accountId,
        serverId,
        token
      );
      setPartners(professions);
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
    }
  };

  useEffect(() => {
    refreshProfessions();
  }, [character.id, token]);

  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 2,
      slidesToSlide: 2,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
      slidesToSlide: 2,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
      slidesToSlide: 1,
    },
  };

  if (!professions || professions.length <= 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl border border-gray-700 shadow-2xl">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-4xl">⚒️</span>
          </div>
          <h3 className="text-3xl font-bold text-white mb-4 bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
            {t("professions.empty.title")}
          </h3>
          <p className="text-xl text-gray-300 max-w-md">
            {t("professions.empty.subtitle")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="professions-carousel-container">
      <div className="info-section mb-8 p-6 bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-600/30 shadow-xl">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center mr-4 shadow-lg">
            <span className="text-2xl">⚒️</span>
          </div>
          <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
            {t("professions.question.title")}
          </h2>
        </div>
        <p className="text-gray-300 text-lg leading-relaxed">
          <span className="font-semibold text-orange-400">
            {t("professions.question.subtitle")}
          </span>{" "}
          {t("professions.question.description")}
        </p>
      </div>
      <Carousel
        responsive={responsive}
        swipeable={true}
        draggable={true}
        showDots={false}
        arrows={true}
        infinite={true}
        autoPlay={false}
        removeArrowOnDeviceType={["tablet", "mobile"]}
        itemClass="carousel-slide"
        containerClass="carousel-container"
        renderButtonGroupOutside={true}
        customLeftArrow={<CustomLeftArrow />}
        customRightArrow={<CustomRightArrow />}
      >
        {professions.map((profession) => (
          <div key={profession.name} className="carousel-slide select-none p-4">
            <div className="relative group bg-gradient-to-br from-gray-800 via-gray-900 to-black p-8 rounded-2xl border border-gray-700 shadow-2xl hover:shadow-orange-500/20 transition-all duration-500 hover:scale-[1.02] hover:border-orange-500/50 overflow-hidden">
              {/* Efecto de brillo de fondo */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Efecto de partículas flotantes */}
              <div className="absolute top-4 right-4 w-2 h-2 bg-orange-400/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute top-8 right-8 w-1 h-1 bg-red-400/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
              <div className="absolute bottom-6 left-6 w-1.5 h-1.5 bg-yellow-400/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-800"></div>

              <div className="relative z-10 flex flex-col lg:flex-row gap-8">
                {/* Sección de imagen */}
                <div className="lg:w-1/3 flex justify-center">
                  <div className="relative">
                    <div className="w-48 h-48 flex justify-center items-center overflow-hidden rounded-full bg-gradient-to-br from-orange-400/20 to-red-500/20 border-2 border-orange-500/50 shadow-xl group-hover:shadow-orange-500/30 transition-all duration-500">
                      <img
                        src={profession.logo}
                        alt={profession.name}
                        draggable="false"
                        className="w-full h-full object-cover rounded-full transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    {/* Indicador de nivel */}
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-400 to-red-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
                      Lv.{profession.value}
                    </div>
                  </div>
                </div>

                {/* Sección de contenido */}
                <div className="lg:w-2/3 space-y-6">
                  {/* Header con nombre y nivel */}
                  <div className="space-y-2">
                    <h3 className="text-3xl font-bold text-white bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                      {profession.name}
                    </h3>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400 text-sm">Nivel:</span>
                        <span className="text-orange-400 font-semibold">
                          {profession.value}
                        </span>
                      </div>
                      <div className="w-px h-4 bg-gray-600"></div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400 text-sm">Máximo:</span>
                        <span className="text-green-400 font-semibold">
                          {profession.max}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Barra de progreso */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Progreso</span>
                      <span>
                        {Math.round((profession.value / profession.max) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${
                            (profession.value / profession.max) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Estrellas de rating */}
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-400 text-sm mr-2">Rating:</span>
                    {Array.from({ length: 5 }, (_, index) => (
                      <span
                        key={index}
                        className={`text-xl transition-colors duration-300 ${
                          index < Math.floor(profession.value / 20)
                            ? "text-yellow-400"
                            : "text-gray-600"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>

                  {/* Descripción */}
                  {profession.service && (
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {profession.service.description.length > 200
                          ? `${profession.service.description.substring(
                              0,
                              200
                            )}...`
                          : profession.service.description}
                      </p>
                    </div>
                  )}

                  {/* Botón de acción */}
                  <div className="pt-4">
                    <button
                      onClick={() => handleAnnounce(profession)}
                      className="group/btn relative w-full bg-gradient-to-r from-orange-400 to-red-500 text-white font-semibold py-4 px-6 rounded-xl hover:from-orange-500 hover:to-red-600 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-orange-500/25 focus:outline-none focus:ring-2 focus:ring-orange-500/50 overflow-hidden"
                    >
                      {/* Efecto de brillo */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>

                      {/* Contenido del botón */}
                      <span className="relative z-10 flex items-center justify-center space-x-2">
                        <span>📢</span>
                        <span>{t("professions.btn.send-announcement")}</span>
                      </span>

                      {/* Línea inferior animada */}
                      <div className="absolute bottom-0 left-0 w-0 h-1 bg-white group-hover/btn:w-full transition-all duration-500 ease-out"></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Carousel>
      {showConfirmDialog && selectedProfession && (
        <Announcement
          cost={1000}
          serverId={serverId}
          characterId={character.id}
          skillId={selectedProfession.id}
          accountId={accountId}
          token={token}
          onConfirm={handleConfirmAnnounce}
          onCancel={handleCancelAnnounce}
          t={t}
        />
      )}
      {selectedProfession && (
        <ProfesionService
          isOpen={isModalOpen}
          is_public={
            selectedProfession.service != null &&
            selectedProfession.service.is_public
          }
          exist_services={selectedProfession.service != null}
          token={token}
          character_id={character.id}
          skill_id={selectedProfession.id}
          account_id={accountId}
          onClose={closeModal}
          onUpdate={refreshProfessions}
        />
      )}
    </div>
  );
};

const CustomLeftArrow: React.FC<ArrowProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="group absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-600 rounded-full flex items-center justify-center text-white hover:from-orange-500 hover:to-red-600 hover:border-orange-500 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-orange-500/25 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
      aria-label="Previous Slide"
    >
      <span className="text-xl font-bold group-hover:scale-110 transition-transform duration-200">
        ‹
      </span>
    </button>
  );
};

const CustomRightArrow: React.FC<ArrowProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="group absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-600 rounded-full flex items-center justify-center text-white hover:from-orange-500 hover:to-red-600 hover:border-orange-500 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-orange-500/25 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
      aria-label="Next Slide"
    >
      <span className="text-xl font-bold group-hover:scale-110 transition-transform duration-200">
        ›
      </span>
    </button>
  );
};

export default Professions;

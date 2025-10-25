import {
  claimBenefits,
  getMemberDetailGuild,
  unlinkGuild,
  update,
} from "@/api/guilds";
import EditGuildModal from "@/components/guild_edit";
import DisplayMoney from "@/components/money";
import LoadingSpinner from "@/components/utilities/loading-spinner";
import { InternalServerError } from "@/dto/generic";
import { GuildMemberDto } from "@/model/model";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

interface AccountGuildProps {
  serverId: number;
  characterId: number;
  token: string;
  accountId: number;
  t: (key: string, options?: any) => string;
  language: string;
}

const AccountGuild: React.FC<AccountGuildProps> = ({
  serverId,
  characterId,
  accountId,
  token,
  t,
  language,
}) => {
  const [guildData, setGuildData] = useState<GuildMemberDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refresh, setRefresh] = useState<boolean>(false);

  useEffect(() => {
    const fetchGuildData = async () => {
      try {
        const data = await getMemberDetailGuild(
          serverId,
          accountId,
          characterId,
          token
        );
        setGuildData(data);
      } catch (error: any) {
        setGuildData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchGuildData();
  }, [accountId, characterId, token, refresh]);

  const handleUnlinkGuild = async () => {
    try {
      await unlinkGuild(serverId, accountId, characterId, token);
      setGuildData(null);
      Swal.fire({
        icon: "success",
        title: t("guild-character.messages.title-vinculation-success"),
        text: t("guild-character.messages.text-vinculation-success"),
        color: "white",
        background: "#0B1218",
        timer: 4000,
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
        timer: 4000,
      });
    }
  };

  const handleBenefitsGuild = async () => {
    try {
      await claimBenefits(serverId, accountId, characterId, token, language);
      setRefresh(true);
      Swal.fire({
        icon: "success",
        title: t("guild-character.messages.title-benefit-success"),
        text: t("guild-character.messages.text-benefit-success"),
        color: "white",
        background: "#0B1218",
        timer: 4000,
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
    }
  };

  const handleEditSave = async (newSettings: {
    isPublic: boolean;
    isMultifactorEnabled: boolean;
    discordLink: string;
  }) => {
    setGuildData((prev) =>
      prev ? { ...prev, public_access: newSettings.isPublic } : prev
    );
    await update(
      serverId,
      accountId,
      characterId,
      newSettings.discordLink,
      newSettings.isMultifactorEnabled,
      newSettings.isPublic,
      token
    );
    Swal.fire({
      icon: "success",
      title: t("guild-character.messages.title-update-guild-success"),
      text: t("guild-character.messages.text-update-guild-success"),
      color: "white",
      background: "#0B1218",
      timer: 3000,
    });
  };

  if (loading)
    return (
      <div className="flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );

  return (
    <div className=" bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="contenedor mx-auto px-4 lg:px-6 py-8 lg:py-12">
        <div className="max-w-7xl mx-auto max-h-screen overflow-y-auto scrollbar-hide scroll-smooth">
          {guildData ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
              {/* Header principal - Izquierda */}
              <div className="lg:col-span-1 mb-6 lg:mb-0">
                <div className="relative">
                  {/* Fondo con efectos */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/10 rounded-2xl blur-xl"></div>

                  <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
                    {/* Título con efectos */}
                    <div className="text-center mb-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mb-3 shadow-lg">
                        <span className="text-xl">⚔️</span>
                      </div>
                      <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-2">
                        {guildData.name}
                      </h2>
                      <div className="w-20 h-1 bg-gradient-to-r from-orange-400 to-red-500 mx-auto rounded-full"></div>
                    </div>

                    {/* Información de la guild */}
                    <div className="space-y-3">
                      <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50">
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {guildData.info}
                        </p>
                      </div>

                      {/* Dinero de la guild */}
                      <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl p-4 border border-gray-700/50">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-sm">💰</span>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-400 text-xs mb-1">
                              Guild Bank
                            </p>
                            <div className="text-lg font-bold text-white">
                              <DisplayMoney money={guildData.bank_money} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contenido principal - Derecha */}
              <div className="lg:col-span-3 space-y-4 lg:space-y-6">
                {/* Grid de información: MOTD y Beneficios */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-4 lg:mb-6">
                  {/* MOTD - Izquierda */}
                  <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl p-4 lg:p-6 border border-yellow-500/20">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-lg">📢</span>
                      </div>
                      <h3 className="text-2xl font-bold text-yellow-400">
                        Message of the Day
                      </h3>
                    </div>
                    <p className="text-yellow-200 text-lg leading-relaxed break-words">
                      {guildData.motd}
                    </p>
                  </div>

                  {/* Beneficios disponibles - Derecha */}
                  <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl p-4 lg:p-6 border border-orange-500/20">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                        <span className="text-lg">🎁</span>
                      </div>
                      <h3 className="text-2xl font-bold text-orange-400">
                        Available Benefits
                      </h3>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-4xl font-bold text-orange-400">
                        {guildData.available_benefits}
                      </div>
                      <div className="text-gray-300 text-lg">
                        {t("guild-character.guild-section.benefits-available")}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información de la guild en grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                  {/* Líder */}
                  <div className="bg-gray-800/50 rounded-xl p-3 lg:p-4 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-lg">👑</span>
                      </div>
                      <h4 className="text-xl font-bold text-white">Leader</h4>
                    </div>
                    <p className="text-gray-300 text-lg font-medium">
                      {guildData.leader_name}
                    </p>
                  </div>

                  {/* Fecha de creación */}
                  <div className="bg-gray-800/50 rounded-xl p-3 lg:p-4 border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
                        <span className="text-lg">📅</span>
                      </div>
                      <h4 className="text-xl font-bold text-white">Created</h4>
                    </div>
                    <p className="text-gray-300 text-lg font-medium">
                      {new Date(guildData.create_date).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Discord */}
                  <div className="bg-gray-800/50 rounded-xl p-3 lg:p-4 border border-gray-700/50 hover:border-indigo-500/30 transition-all duration-300">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-lg">💬</span>
                      </div>
                      <h4 className="text-xl font-bold text-white">Discord</h4>
                    </div>
                    <a
                      href={`https://${guildData.discord}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-indigo-400 hover:text-indigo-300 transition-colors duration-300 group"
                    >
                      <i className="fab fa-discord text-lg mr-2 group-hover:scale-110 transition-transform duration-200"></i>
                      <span className="text-lg font-medium">
                        {guildData.discord}
                      </span>
                    </a>
                  </div>

                  {/* Estado de privacidad */}
                  <div className="bg-gray-800/50 rounded-xl p-3 lg:p-4 border border-gray-700/50 hover:border-green-500/30 transition-all duration-300">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                        <span className="text-lg">🔒</span>
                      </div>
                      <h4 className="text-xl font-bold text-white">Privacy</h4>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`h-5 w-5 rounded-full ${
                          guildData.public_access
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      ></div>
                      <span
                        className={`text-lg font-medium ${
                          guildData.public_access
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {guildData.public_access
                          ? t("guild-character.guild-section.public-access")
                          : t("guild-character.guild-section.private-access")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                  {guildData.is_leader && (
                    <EditGuildModal
                      isPublic={guildData.public_access}
                      isMultifactorEnabled={guildData.multi_faction}
                      discordLink={guildData.discord}
                      onSave={handleEditSave}
                      t={t}
                    />
                  )}

                  {guildData.available_benefits > 0 && (
                    <button
                      className="group relative w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-orange-500/30 text-orange-300 font-bold rounded-xl hover:from-orange-500/30 hover:to-red-500/30 hover:border-orange-400 hover:text-orange-200 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-orange-500/30 focus:outline-none focus:ring-2 focus:ring-orange-500/50 overflow-hidden"
                      onClick={handleBenefitsGuild}
                    >
                      {/* Efecto de brillo */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                      {/* Contenido del botón */}
                      <span className="relative z-10 flex items-center justify-center space-x-3">
                        <span className="text-xl">🎁</span>
                        <span className="text-lg">
                          {t("guild-character.guild-section.btn-claim-benefit")}
                        </span>
                      </span>
                    </button>
                  )}

                  <button
                    className="group relative w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-sm border border-red-500/30 text-red-300 font-bold rounded-xl hover:from-red-500/30 hover:to-red-600/30 hover:border-red-400 hover:text-red-200 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-red-500/30 focus:outline-none focus:ring-2 focus:ring-red-500/50 overflow-hidden"
                    onClick={handleUnlinkGuild}
                  >
                    {/* Efecto de brillo */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Contenido del botón */}
                    <span className="relative z-10 flex items-center justify-center space-x-3">
                      <span className="text-xl">🚪</span>
                      <span className="text-lg">
                        {t("guild-character.guild-section.btn-unvite-guild")}
                      </span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-80 lg:h-auto">
              <div className="relative w-full max-w-md">
                {/* Fondo con efectos */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 rounded-2xl blur-xl"></div>

                <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 shadow-2xl text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-3xl">🏰</span>
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
                    {t("guild-character.character-empty-guild.title")}
                  </h2>
                  <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                    {t("guild-character.character-empty-guild.description")}
                  </p>
                  <Link
                    href="/guild"
                    className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500/50 overflow-hidden"
                  >
                    {/* Efecto de brillo */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Contenido del botón */}
                    <span className="relative z-10 flex items-center space-x-2">
                      <span className="text-lg">🔍</span>
                      <span>
                        {t("guild-character.character-empty-guild.btn-txt")}
                      </span>
                    </span>

                    {/* Línea inferior animada */}
                    <div className="absolute bottom-0 left-0 w-0 h-1 bg-white group-hover:w-full transition-all duration-500 ease-out"></div>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountGuild;

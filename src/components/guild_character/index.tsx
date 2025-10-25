"use client";
import { getAccountAndServerId } from "@/api/account";
import { getCharacters } from "@/api/account/character";
import { attach } from "@/api/guilds";
import { InternalServerError } from "@/dto/generic";
import { AccountsModel, Character } from "@/model/model";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";

interface GuildCharacterProps {
  isOpen: boolean;
  token: string;
  guildId: number;
  serverId: number;
  onClose: () => void;
}

const GuildCharacter: React.FC<GuildCharacterProps> = ({
  isOpen,
  token,
  guildId,
  serverId,
  onClose,
}) => {
  const [accounts, setAccounts] = useState<AccountsModel[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    null
  );
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedAccounts = await getAccountAndServerId(token, serverId);
        setAccounts(fetchedAccounts.accounts);
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

    if (isOpen) {
      fetchData();
    }
  }, [isOpen, token]);

  const handleAccountChange = async (accountId: number) => {
    setSelectedAccountId(accountId);
    setSelectedCharacterId(null);

    try {
      const fetchedCharacters = await getCharacters(token, accountId, serverId);
      setCharacters(fetchedCharacters.characters);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: t("guild-detail.errors.failed-characters-fetch"),
        color: "white",
        background: "#0B1218",
        timer: 4500,
      });
      onClose();
    }
  };

  const handleCharacterChange = async (characterId: number) => {
    setSelectedCharacterId(characterId);
  };

  const handleJoinGuild = async () => {
    if (!selectedAccountId || !selectedCharacterId) {
      return;
    }

    setLoading(true);

    try {
      await attach(
        serverId,
        guildId,
        selectedAccountId,
        selectedCharacterId,
        token
      );
      Swal.fire({
        icon: "success",
        title: "Guild Success",
        text: t("guild-characters.message-success-guild-attach"),
        color: "white",
        background: "#0B1218",
        timer: 4500,
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
    } finally {
      setLoading(false);
      onClose();
    }
  };

  const handleClose = () => {
    onClose();
  };

  return isOpen ? (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/75 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 w-full max-w-md mx-4 border border-gray-700 shadow-2xl transform transition-all duration-300 scale-100">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {t("guild-characters.title")}
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            {t("guild-characters.description")}
          </p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t("guild-characters.select-account-txt")}
            </label>
            <div className="relative">
              <select
                onChange={(e) => handleAccountChange(Number(e.target.value))}
                value={selectedAccountId || ""}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer hover:bg-gray-700/50"
              >
                <option value="" disabled className="bg-gray-800 text-gray-400">
                  {t("guild-characters.select-account-txt")}
                </option>
                {accounts.map((account) => (
                  <option
                    className="bg-gray-800 text-white py-2"
                    key={account.id}
                    value={account.account_id}
                  >
                    {account.username}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Selector de personajes */}
          {selectedAccountId && (
            <div className="relative">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t("guild-characters.select-characters-txt")}
              </label>
              <div className="relative">
                <select
                  onChange={(e) =>
                    handleCharacterChange(Number(e.target.value))
                  }
                  value={selectedCharacterId || ""}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer hover:bg-gray-700/50"
                >
                  <option
                    value=""
                    disabled
                    className="bg-gray-800 text-gray-400"
                  >
                    {t("guild-characters.select-characters-txt")}
                  </option>
                  {characters.map((character) => (
                    <option
                      className="bg-gray-800 text-white py-2"
                      key={character.id}
                      value={character.id}
                    >
                      {character.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={handleClose}
            className="flex-1 px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-xl font-medium transition-all duration-200 border border-gray-600 hover:border-gray-500"
          >
            {t("guild-characters.btn.cancel")}
          </button>
          <button
            onClick={handleJoinGuild}
            disabled={!selectedAccountId || !selectedCharacterId || loading}
            className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              loading || !selectedAccountId || !selectedCharacterId
                ? "bg-gray-600 cursor-not-allowed text-gray-400"
                : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-blue-500/25 transform hover:scale-105"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                {t("guild-characters.btn.loading")}
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {t("guild-characters.btn.primary")}
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  ) : null;
};

export default GuildCharacter;

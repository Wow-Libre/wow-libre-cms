import { changePasswordGame } from "@/api/account/change-password";
import { AccountDetailDto } from "@/model/model";
import { ChangeEvent, useState } from "react";
import {
  FaExclamationTriangle,
  FaInfoCircle,
  FaLock,
  FaPencilAlt,
  FaSave,
  FaTimes,
  FaUser,
} from "react-icons/fa";
import Swal from "sweetalert2";

interface ProfileSecurityProps {
  account: AccountDetailDto;
  token: string;
  serverId: number;
  t: (key: string, options?: any) => string;
}

const DetailAccount = ({
  account,
  token,
  serverId,
  t,
}: ProfileSecurityProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [passwordWeb, setPasswordWeb] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleEditOtp = (event: ChangeEvent<HTMLInputElement>) => {
    setPasswordWeb(event.target.value);
  };

  const handleEditPasswordInGame = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };
  const handleConfirmPassword = (event: ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(event.target.value);
  };

  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  const handleSaveClick = async () => {
    if (password !== confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: t("account-character.messages.password-not-match"),
        text: t("account-character.messages.password-not-match-txt"),
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Entendido",
      });
      return;
    }

    if (!password.trim()) {
      Swal.fire({
        icon: "warning",
        title: t("account-character.messages.password-is-empty"),
        text: t("account-character.messages.password-is-empty-txt"),
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Entendido",
      });
      return;
    }

    if (password.trim().length < 5 || password.trim().length > 30) {
      Swal.fire({
        icon: "warning",
        title: t("account-character.messages.password-length-invalid"),
        text: t("account-character.messages.password-length-invalid-txt"),
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Entendido",
      });
      return;
    }

    const userSecurity = {
      server_id: serverId,
      new_password: password,
      password: passwordWeb,
      account_id: account.id,
    };

    try {
      await changePasswordGame(userSecurity, token);

      Swal.fire({
        icon: "success",
        title: t("account-character.messages.password-change-password-success"),
        text: t(
          "account-character.messages.password-change-password-success-txt"
        ),
        confirmButtonColor: "#3085d6",
        confirmButtonText: t(
          "account-character.messages.password-change-password-success-btn"
        ),
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: t("account-character.messages.error-change-password"),
        confirmButtonColor: "#3085d6",
        confirmButtonText: t(
          "account-character.messages.password-change-password-success-btn"
        ),
      });
    }
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Account Status Header */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 mb-8 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <FaUser className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {t("account-character.title")}
              </h1>
              <div className="flex items-center mt-2">
                <div
                  className={`w-3 h-3 rounded-full mr-2 ${
                    account.account_banned && account.account_banned.active
                      ? "bg-red-500"
                      : "bg-green-500"
                  }`}
                ></div>
                <span
                  className={`text-lg font-medium ${
                    account.account_banned && account.account_banned.active
                      ? "text-red-300"
                      : "text-green-300"
                  }`}
                >
                  {account.account_banned ? "Inhabilitada" : "Disponible"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Status Information */}
        {account.account_banned && account.account_banned.active && (
          <div className="bg-gradient-to-r from-red-900 to-red-800 border border-red-600 rounded-xl p-6 mb-6">
            <div className="flex items-center mb-4">
              <FaExclamationTriangle className="text-2xl text-red-300 mr-3" />
              <h3 className="text-xl font-bold text-red-200">
                Cuenta Bloqueada
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-red-800 bg-opacity-50 rounded-lg p-4 border border-red-600">
                <p className="text-red-200 font-semibold mb-1">
                  {t("account-character.account-banned.blocking-date")}
                </p>
                <p className="text-white font-bold">
                  {account.account_banned.bandate}
                </p>
              </div>
              <div className="bg-red-800 bg-opacity-50 rounded-lg p-4 border border-red-600">
                <p className="text-red-200 font-semibold mb-1">
                  {t("account-character.account-banned.unlock-date")}
                </p>
                <p className="text-white font-bold">
                  {account.account_banned.unbandate}
                </p>
              </div>
              <div className="md:col-span-2 bg-red-800 bg-opacity-50 rounded-lg p-4 border border-red-600">
                <p className="text-red-200 font-semibold mb-1">
                  {t("account-character.account-banned.banned-by")}
                </p>
                <p className="text-red-300 font-bold">
                  {account.account_banned.banned_by}
                </p>
              </div>
              <div className="md:col-span-2 bg-red-800 bg-opacity-50 rounded-lg p-4 border border-red-600">
                <p className="text-red-200 font-semibold mb-1">Motivo:</p>
                <p className="text-white break-words">
                  {account.account_banned.ban_reason.length > 60
                    ? `${account.account_banned.ban_reason.substring(0, 60)}...`
                    : account.account_banned.ban_reason}
                </p>
              </div>
            </div>
          </div>
        )}

        {account.mute && (
          <div className="bg-gradient-to-r from-yellow-900 to-orange-800 border border-yellow-600 rounded-xl p-6 mb-6">
            <div className="flex items-center mb-4">
              <FaExclamationTriangle className="text-2xl text-yellow-300 mr-3" />
              <h3 className="text-xl font-bold text-yellow-200">
                Cuenta Silenciada
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-yellow-800 bg-opacity-50 rounded-lg p-4 border border-yellow-600">
                <p className="text-yellow-200 font-semibold mb-1">
                  {t("account-character.account-banned.silenced-by")}
                </p>
                <p className="text-yellow-300 font-bold">{account.mute_by}</p>
              </div>
              <div className="bg-yellow-800 bg-opacity-50 rounded-lg p-4 border border-yellow-600">
                <p className="text-yellow-200 font-semibold mb-1">
                  Razón del muteo:
                </p>
                <p className="text-white">{account.mute_reason}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Password Management Section */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-700">
        <div className="flex items-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center mr-4 shadow-lg">
            <FaLock className="text-2xl text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            {t("account-character.description")}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Web Password */}
          <div className="space-y-4">
            <label className="block text-lg font-semibold text-gray-200">
              <div className="flex items-center">
                <FaLock className="mr-2 text-blue-400" />
                {t("account-character.form.password-web-txt")}
                <FaInfoCircle className="ml-2 text-blue-400" />
              </div>
            </label>
            {!isEditing ? (
              <div className="flex items-center space-x-3">
                <span className="text-gray-400">*********</span>
                <button
                  onClick={handleEditClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg transition-colors duration-200 flex items-center"
                  title={t("account-character.btn.edit")}
                >
                  <FaPencilAlt />
                </button>
              </div>
            ) : (
              <div>
                <input
                  type="password"
                  placeholder={t(
                    "account-character.form.password-web-placeholder"
                  )}
                  onChange={handleEditOtp}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
                <p className="text-gray-400 text-sm mt-2">
                  {t("account-character.form.password-web-disclaimer")}
                </p>
              </div>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-4">
            <label className="block text-lg font-semibold text-gray-200">
              <div className="flex items-center">
                <FaLock className="mr-2 text-green-400" />
                {t("account-character.form.new-password-account")}
              </div>
            </label>
            {!isEditing ? (
              <span className="text-gray-400">*******</span>
            ) : (
              <input
                type="password"
                placeholder={t(
                  "account-character.form.new-password-account-placeholder"
                )}
                onChange={handleEditPasswordInGame}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
              />
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-4">
            <label className="block text-lg font-semibold text-gray-200">
              <div className="flex items-center">
                <FaLock className="mr-2 text-purple-400" />
                {t("account-character.form.new-password-account-confirm")}
              </div>
            </label>
            {!isEditing ? (
              <span className="text-gray-400">*******</span>
            ) : (
              <input
                type="password"
                placeholder={t(
                  "account-character.form.new-password-account-confirm-placeholder"
                )}
                onChange={handleConfirmPassword}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
              />
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex justify-center mt-8 space-x-4">
            <button
              onClick={handleSaveClick}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 flex items-center"
            >
              <FaSave className="mr-2" />
              {t("account-character.btn.update")}
            </button>
            <button
              onClick={handleCancelClick}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 flex items-center"
            >
              <FaTimes className="mr-2" />
              {t("account-character.btn.cancel")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailAccount;

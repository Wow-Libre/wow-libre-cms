import {
  faCoins,
  faGift,
  faSortUp,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";

library.add(faCoins, faGift, faSortUp, faTrashAlt);
import React, { ChangeEvent, useEffect, useState } from "react";

import {
  deleteFriend,
  getInventory,
  sendItems,
  sendLevelByFriend,
  sendMoneyByFriend,
} from "@/api/account/character";
import { InternalServerError } from "@/dto/generic";
import { Character, CharacterInventory } from "@/model/model";
import Swal from "sweetalert2";

interface FriendsDetailProps {
  jwt: string;
  character: Character;
  friend: Character;
  accountId: number;
  serverId: number;
  onCloseModal: () => void;
  onFriendDeleted: (friendId: number) => void;
  t: (key: string, options?: any) => string;
}

const FriendDetail: React.FC<FriendsDetailProps> = ({
  jwt,
  character,
  friend,
  accountId,
  serverId,
  onCloseModal,
  onFriendDeleted,
  t,
}) => {
  const [giftLevels, setGiftLevels] = useState(0);
  const [giftMoney, setGiftMoney] = useState(0);

  const [isGiftLevelsOpen, setIsGiftLevelsOpen] = useState(false);
  const [isGiftOroOpen, setIsMoneyIsOpen] = useState(false);
  const [isSendItemsOpen, setSendItemsOpen] = useState(false);
  const [items, setItems] = useState<CharacterInventory[]>([]);

  useEffect(() => {
    if (isSendItemsOpen) {
      fetchInventory();
    }
  }, [isSendItemsOpen]);

  const fetchInventory = async () => {
    try {
      const inventory = await getInventory(
        jwt,
        accountId,
        serverId,
        character.id
      );
      setItems(inventory);
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
        title: "Error",
        text: `${error.message}`,
        color: "white",
        background: "#0B1218",
      });
    }
  };

  const handleSendItem = async (itemId: number, count: number) => {
    try {
      await sendItems(
        jwt,
        character.id,
        friend.id,
        accountId,
        serverId,
        itemId,
        count
      );
      await fetchInventory();
      Swal.fire({
        icon: "success",
        title: "Item enviado",
        text: "Por favor indicale al destinatario que use el correo para obtener lo enviado!",
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
        title: "Error",
        text: `${error.message}`,
        color: "white",
        background: "#0B1218",
      });
    }
  };

  const openGiftLevelsModal = () => {
    setIsGiftLevelsOpen(true);
  };

  const closeGiftLevelsModal = () => {
    setIsGiftLevelsOpen(false);
  };

  const openGiftMoneyOpenModal = () => {
    setIsMoneyIsOpen(true);
  };

  const openSendItemsOpenModal = () => {
    setSendItemsOpen(true);
  };
  const closeSendItemsModal = () => {
    setSendItemsOpen(false);
  };
  const deleteFriendInput = async () => {
    try {
      await deleteFriend(jwt, character.id, friend.id, accountId, serverId);
      Swal.fire({
        icon: "success",
        title: t("friend-detail-modal.messages-erros.delete-friend.title"),
        text: t("friend-detail-modal.messages-erros.delete-friend.success"),
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Ok",
      });
      onFriendDeleted(friend.id);
      onCloseModal();
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: t("friend-detail-modal.messages-erros.delete-friend.error"),
        text: `${error.message}`,
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Ok",
      });
    }
  };

  const closeGiftMoneyModal = () => {
    setIsMoneyIsOpen(false);
  };

  const handleGiftLevelsChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = Number(event.target.value);

    setGiftLevels(value);
  };

  const handleGiftMoneyChange = (event: ChangeEvent<HTMLInputElement>) => {
    setGiftMoney(Number(event.target.value));
  };

  const handleGiftLevelsSubmit = async () => {
    if (giftLevels > 80) {
      Swal.fire({
        icon: "error",
        title: "Opss!",
        text: t("friend-detail-modal.messages-erros.lvl-max"),
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Ok",
      });
      return;
    } else if (giftLevels <= 0) {
      Swal.fire({
        icon: "error",
        title: "Opss!",
        text: t("friend-detail-modal.messages-erros.lvl-min"),
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Ok",
      });
      return;
    }
    try {
      await sendLevelByFriend(
        jwt,
        character.id,
        friend.id,
        accountId,
        serverId,
        giftLevels
      );
      Swal.fire({
        icon: "success",
        title: t("friend-detail-modal.messages-erros.send-level.title"),
        text: t("friend-detail-modal.messages-erros.send-level.success"),
        color: "white",
        background: "#0B1218",
        timer: 4500,
      });
      onCloseModal();
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
        title: "Error",
        text: `${error.message}`,
        color: "white",
        background: "#0B1218",
      });
    }
    closeGiftLevelsModal();
  };

  const handleGiftMoneySubmit = async () => {
    if (giftMoney <= 0) {
      Swal.fire({
        icon: "error",
        title: "Opss!",
        text: t("friend-detail-modal.messages-erros.money-empty"),
        color: "white",
        background: "#0B1218",
        timer: 4500,
      });
      return;
    }
    try {
      await sendMoneyByFriend(
        jwt,
        character.id,
        friend.id,
        accountId,
        serverId,
        giftMoney
      );
      Swal.fire({
        icon: "success",
        title: t("friend-detail-modal.messages-erros.send-money.title"),
        text: t("friend-detail-modal.messages-erros.send-money.success"),
        color: "white",
        background: "#0B1218",
        timer: 4500,
      });
      onCloseModal();
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
        title: "Error",
        text: `${error.message}`,
        color: "white",
        background: "#0B1218",
        timer: 4500,
      });
    }
    closeGiftMoneyModal();
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-lg text-white w-full max-w-screen-lg mx-auto">
      <div className="flex flex-col items-center select-none">
        <img
          src={
            friend.race_logo
              ? friend.race_logo
              : "https://via.placeholder.com/150"
          }
          alt="Avatar del amigo"
          className="w-32 h-32 rounded-full border-4 border-neon_green shadow-lg mb-6"
        />
        <h2 className="text-2xl font-bold mb-2">{friend.name}</h2>
        <div className="text-gray-400 mb-4 flex flex-col items-center">
          <p>
            {t("friend-detail-modal.nivel")} {friend.level}
          </p>
          <p>
            {t("friend-detail-modal.clase")} {friend.class}
          </p>
          <p>
            {t("friend-detail-modal.raza")} {friend.race}
          </p>
          <p>
            {t("friend-detail-modal.estado")} {friend.flags}
          </p>
          {friend.note && (
            <p className="text-gray-400 italic mb-1 overflow-hidden max-h-24">
              {friend.note}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col space-y-4 items-center max-w-md mx-auto">
        <button
          className="w-full action-button bg-gradient-to-r from-green-500 to-lime-500 hover:from-green-600 hover:to-lime-600 text-white py-2 px-4 rounded-lg transition-all duration-300"
          onClick={openGiftLevelsModal}
        >
          <FontAwesomeIcon icon={faSortUp} className="mr-2" />
          {t("friend-detail-modal.send-levels.btn-txt")}
        </button>
        <button
          className="w-full action-button bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white py-2 px-4 rounded-lg transition-all duration-300"
          onClick={openGiftMoneyOpenModal}
        >
          <FontAwesomeIcon icon={faCoins} className="mr-2" />
          {t("friend-detail-modal.send-gold.btn-txt")}
        </button>
        <button
          className="w-full action-button bg-gradient-to-r from-green-400 to-green-800 hover:from-green-500 hover:to-green-700 text-white py-2 px-4 rounded-lg transition-all duration-300"
          onClick={openSendItemsOpenModal}
        >
          <FontAwesomeIcon icon={faGift} className="mr-2" />
          {t("friend-detail-modal.send-items.btn-txt")}
        </button>
        <button
          className="w-full action-button bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white py-2 px-4 rounded-lg transition-all duration-300"
          onClick={deleteFriendInput}
        >
          <FontAwesomeIcon icon={faTrashAlt} className="mr-2" />
          {t("friend-detail-modal.delete-friend.btn-txt")}
        </button>
      </div>

      {isGiftLevelsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-700">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-xl">⬆️</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      Regalo de Niveles
                    </h2>
                    <p className="text-green-100 text-xs">
                      Sube el nivel de tu amigo
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeGiftLevelsModal}
                  className="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-lg font-bold transition-colors duration-200 shadow-lg"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Cost Information */}
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 font-bold">💰</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {t("friend-detail-modal.send-levels.cost.title")}
                    </h3>
                    <p className="text-white text-base leading-relaxed">
                      <span className="font-bold ">5k Gold</span>{" "}
                      {t("friend-detail-modal.send-levels.cost.sub-title")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-gray-700 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-bold text-green-300 mb-3">
                  ⚠️ Información Importante
                </h3>
                <div className="space-y-3">
                  <p className="text-base text-gray-300 leading-relaxed">
                    {t("friend-detail-modal.send-levels.cost.note")}
                    <span className="font-bold text-white"> 80</span>.
                  </p>
                  <p className="text-base text-gray-300 leading-relaxed">
                    {t("friend-detail-modal.send-levels.cost.note-overcharge")}
                  </p>
                  <p className="text-base text-red-400 font-bold leading-relaxed">
                    {t(
                      "friend-detail-modal.send-levels.cost.note-overcharge-v2"
                    )}
                  </p>
                </div>
              </div>

              {/* Level Input */}
              <div className="mb-6">
                <label
                  htmlFor="giftLevels"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  {t("friend-detail-modal.send-levels.cost.question")}
                </label>
                <input
                  type="number"
                  id="giftLevels"
                  value={giftLevels}
                  min="1"
                  onChange={handleGiftLevelsChange}
                  className="w-full p-4 bg-gray-800 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-lg font-medium"
                  placeholder="Ingresa la cantidad de niveles..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                  onClick={handleGiftLevelsSubmit}
                >
                  ⬆️ {t("friend-detail-modal.send-levels.cost.btn.success")}
                </button>
                <button
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                  onClick={closeGiftLevelsModal}
                >
                  {t("friend-detail-modal.send-levels.cost.btn.back")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isGiftOroOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 text-xl">💰</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Regalo de Oro
                    </h2>
                    <p className="text-yellow-100 text-sm">
                      Envía oro a tu amigo
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeGiftMoneyModal}
                  className="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-lg font-bold transition-colors duration-200 shadow-lg"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Instructions */}
              <div className="bg-gray-700 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-yellow-300 mb-2">
                  💰 {t("friend-detail-modal.send-gold.gif-gold.title")}
                </h3>
                <p className="text-gray-300 text-sm">
                  {t("friend-detail-modal.send-gold.gif-gold.sub-title")}
                </p>
              </div>

              {/* Amount Input */}
              <div className="mb-6">
                <label
                  htmlFor="giftMoney"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Cantidad de Oro (Gold)
                </label>
                <input
                  type="number"
                  id="giftMoney"
                  value={giftMoney}
                  onChange={handleGiftMoneyChange}
                  className="w-full p-4 bg-gray-800 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 text-lg font-medium"
                  placeholder="Ingresa la cantidad de oro..."
                  min="1"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                  onClick={handleGiftMoneySubmit}
                >
                  💰 {t("friend-detail-modal.send-gold.gif-gold.btn.success")}
                </button>
                <button
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                  onClick={closeGiftMoneyModal}
                >
                  {t("friend-detail-modal.send-gold.gif-gold.btn.back")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isSendItemsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden border border-gray-700">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Envío de Objetos
                  </h2>
                  <p className="text-blue-100 mt-1">
                    Envía objetos a otros personajes sin costo
                  </p>
                </div>
                <button
                  onClick={closeSendItemsModal}
                  className="w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-xl font-bold transition-colors duration-200 shadow-lg"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Premium Notice */}
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 font-bold">★</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Función Premium</h3>
                    <p className="text-yellow-100 text-sm">
                      Disponible para miembros Premium
                    </p>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-gray-700 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-blue-300 mb-2">
                  ⚠️ Instrucciones Importantes
                </h3>
                <p className="text-gray-300 mb-2">
                  Para enviar objetos, asegúrate de haber cerrado sesión en tu
                  cuenta.
                </p>
                <p className="text-gray-400 text-sm">
                  La cantidad de objetos a enviar corresponde a la que se
                  muestra en la tabla.
                </p>
              </div>

              {/* Items Table */}
              <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-600">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-700 to-gray-600">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-200">
                          ID
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-200">
                          Nombre del Objeto
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-200">
                          Cantidad
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-200">
                          Acción
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-600">
                      {items.map((item, index) => (
                        <tr
                          key={item.item}
                          className={`hover:bg-gray-700 transition-colors duration-200 ${
                            index % 2 === 0 ? "bg-gray-800" : "bg-gray-750"
                          }`}
                        >
                          <td className="px-4 py-3">
                            <a
                              href={`https://www.wowhead.com/item=${item.item_id}`}
                              className="text-blue-400 hover:text-blue-300 font-mono text-sm transition-colors duration-200"
                              data-game="wow"
                              data-type="item"
                              data-wh-icon-added="true"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {item.item_id}
                            </a>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-white font-medium">
                              {item.name}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-sm font-bold">
                              {item.bag}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                              onClick={() =>
                                handleSendItem(item.item, item.bag)
                              }
                            >
                              📦 Enviar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end mt-6 pt-4 border-t border-gray-600">
                <button
                  className="bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                  onClick={closeSendItemsModal}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendDetail;

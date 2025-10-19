import { getMails } from "@/api/account/mails";
import DisplayMoney from "@/components/money";
import { Items, MailsDto } from "@/model/model";
import { faGift } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";

library.add(faGift);
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "./style.css";
import LoadingSpinner from "@/components/utilities/loading-spinner";

interface MailsProps {
  token: string;
  characterId: number;
  accountId: number;
  serverId: number;
  t: (key: string, options?: any) => string;
}

const Modal: React.FC<{
  isOpen: boolean;
  items: Items[];
  onClose: () => void;
  t: (key: string, options?: any) => string;
}> = ({ isOpen, items, onClose, t }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <FontAwesomeIcon
                  icon={faGift}
                  className="text-green-600 text-xl"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {t("mails-items.title")}
                </h2>
                <p className="text-green-100 text-sm">
                  Items encontrados en el correo
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-lg font-bold transition-colors duration-200 shadow-lg"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {items.length > 0 ? (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.item_id}
                  className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:bg-gray-600 transition-colors duration-200"
                >
                  <a
                    href={`https://www.wowhead.com/item=${item.item_id}`}
                    className="text-blue-400 hover:text-blue-300 font-medium flex items-center transition-colors duration-200"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-bold mr-3">
                      ID: {item.item_id}
                    </span>
                    <span className="text-white">
                      {t("mails-items.item-found")}
                    </span>
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-lg font-bold text-gray-300 mb-2">
                {t("mails-items.item-empty")}
              </h3>
              <p className="text-gray-400">
                No se encontraron items en este correo
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end mt-6 pt-4 border-t border-gray-600">
            <button
              className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-6 rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg"
              onClick={onClose}
            >
              {t("mails-items.btn-close")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Mails: React.FC<MailsProps> = ({
  token,
  characterId,
  serverId,
  accountId,
  t,
}) => {
  const [mails, setMails] = useState<MailsDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState(1);
  const mailsPerPage = 1;
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentItems, setCurrentItems] = useState<Items[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedMails: MailsDto = await getMails(
          token,
          characterId,
          accountId,
          serverId
        );
        setMails(fetchedMails);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: t("mails.error"),
          color: "white",
          background: "#0B1218",
          timer: 4500,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, characterId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const handleShowItems = (items: Items[]) => {
    if (items && Array.isArray(items)) {
      setCurrentItems(items);
    } else {
      setCurrentItems([]);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentItems([]);
  };

  const indexOfLastMail = currentPage * mailsPerPage;
  const indexOfFirstMail = indexOfLastMail - mailsPerPage;
  const currentMails =
    mails?.mails.slice(indexOfFirstMail, indexOfLastMail) || [];

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="p-6">
      <div className="text-center mx-auto mb-8 max-w-4xl">
        <h2 className="text-4xl font-bold mb-2 text-blue-300">
          {t("mails.title")}
        </h2>
        <div className="w-24 h-1 bg-blue-300 mx-auto rounded-full"></div>
      </div>

      <div className="space-y-6">
        {mails?.mails.length ? (
          currentMails.map((mail) => (
            <div
              key={mail.id}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl border border-gray-700 p-6 hover:shadow-2xl transition-all duration-300 min-h-[200px]"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-4xl font-bold text-blue-300 mb-2">
                    {mail.subject}
                  </h3>
                  <div className="flex items-center space-x-4 text-lg text-gray-400">
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      {new Date(mail.deliver_time).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {mail.has_items && (
                    <div className="bg-green-600 text-white px-3 py-1 rounded-full text-xl font-bold flex items-center">
                      <FontAwesomeIcon icon={faGift} className="mr-1" />
                      Items
                    </div>
                  )}
                  {mail.money > 0 && (
                    <div className="bg-yellow-600 text-white px-3 py-1 rounded-full text-xl font-bold">
                      💰 Dinero
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              {mail.body && (
                <div className="bg-gray-700 rounded-lg p-4 mb-4">
                  <div className="text-white text-lg leading-relaxed max-h-32 overflow-y-auto custom-scrollbar">
                    <p
                      dangerouslySetInnerHTML={{
                        __html: mail.body.replaceAll("$B$B", "<br />"),
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  {mail.has_items && (
                    <button
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center"
                      onClick={() => handleShowItems(mail.items || [])}
                    >
                      <FontAwesomeIcon icon={faGift} className="mr-2" />
                      {t("mails.detail-item")}
                    </button>
                  )}
                  {mail.money > 0 && (
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg border border-blue-500 text-lg">
                      💰 <DisplayMoney money={mail.money} />
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Info */}
              <div className="border-t border-gray-600 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg">
                  <div className="flex items-center text-gray-300">
                    <span className="font-medium text-blue-300 mr-2">
                      📧 {t("mails.submitted-by")}
                    </span>
                    <span className="text-white font-bold">
                      {mail.sender_name}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <span className="font-medium text-blue-300 mr-2">
                      ⏰ {t("mails.expires")}
                    </span>
                    <span className="text-white font-bold">
                      {new Date(mail.expire_time).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-2xl font-bold text-gray-300 mb-2">
                {t("mails.mail-empty")}
              </h3>
              <p className="text-gray-400">No tienes correos pendientes</p>
            </div>
          </div>
        )}
      </div>

      {/* Paginación */}
      {mails && mails?.mails.length > mailsPerPage && (
        <div className="mt-8">
          <div className="flex justify-center items-center space-x-2">
            <button
              className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                currentPage === 1
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-gray-700 hover:bg-gray-600 text-white shadow-md hover:shadow-lg"
              }`}
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ← {t("mails.btn.back")}
            </button>

            <div className="bg-gray-700 text-white px-4 py-2 rounded-lg font-bold">
              {currentPage} / {Math.ceil(mails.mails.length / mailsPerPage)}
            </div>

            <button
              className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                indexOfLastMail >= (mails?.mails.length || 0)
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-gray-700 hover:bg-gray-600 text-white shadow-md hover:shadow-lg"
              }`}
              onClick={() => paginate(currentPage + 1)}
              disabled={indexOfLastMail >= (mails?.mails.length || 0)}
            >
              {t("mails.btn.next")} →
            </button>
          </div>
        </div>
      )}
      <Modal
        isOpen={isModalOpen}
        items={currentItems}
        onClose={handleCloseModal}
        t={t}
      />
    </div>
  );
};

export default Mails;

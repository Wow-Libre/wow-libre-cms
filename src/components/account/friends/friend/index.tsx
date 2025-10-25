import React, { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";

import { getFriends } from "@/api/account/character";
import { Character, Friends } from "@/model/model";
import FriendDetail from "../detail";

interface CharacterProps {
  character: Character;
  token: string;
  accountId: number;
  serverId: number;
  t: (key: string, options?: any) => string;
}

const Friend: React.FC<CharacterProps> = ({
  character,
  token,
  accountId,
  serverId,
  t,
}) => {
  const [friendsModel, setFriends] = useState<Friends | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFriendId, setSelectedFriendId] = useState<Character | null>();

  const openModal = (friend: Character) => {
    setSelectedFriendId(friend);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (character && token) {
          const response: Friends = await getFriends(
            token,
            character.id,
            accountId,
            serverId
          );
          setFriends(response);
        }
      } catch (error) {
        setFriends(null);
      }
    };

    fetchData();
  }, [character, selectedFriendId]);

  if (!character || character == null) {
    return <p> {t("friend-detail.errors.character-is-null")}</p>;
  }

  if (!friendsModel || friendsModel.friends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-white text-3x1 font-semibold mb-2">
          {t("friend-detail.errors.friend-is-empty")}
        </p>
        <p className="text-white text-xl">
          {t("friend-detail.errors.friend-is-empty-description")}
        </p>
      </div>
    );
  }

  const itemsPerPage = 3;
  const indexOfLastFriend = (currentPage + 1) * itemsPerPage;
  const indexOfFirstFriend = indexOfLastFriend - itemsPerPage;
  const currentFriends = friendsModel.friends.slice(
    indexOfFirstFriend,
    indexOfLastFriend
  );

  const handlePageClick = (data: { selected: number }) => {
    const selectedPage = data.selected;
    setCurrentPage(selectedPage);
  };

  const onFriendDeleted = (friendId: number) => {
    if (friendsModel) {
      const updatedFriends = friendsModel.friends.filter(
        (friend) => friend.id !== friendId
      );
      setFriends({ ...friendsModel, friends: updatedFriends });
    }
  };
  return (
    <div className="p-6">
      <div className="text-center mx-auto mb-8 max-w-4xl">
        <h2 className="text-4xl font-bold mb-2 text-blue-300">
          {t("friend-detail.title")}
        </h2>
        <div className="w-24 h-1 bg-blue-300 mx-auto rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 select-none">
        {currentFriends.map((friend) => (
          <div
            key={friend.id}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl border border-gray-700 p-6 overflow-hidden cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:border-blue-400"
            onClick={() => openModal(friend)}
          >
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <img
                  src={
                    friend.race_logo
                      ? friend.race_logo
                      : "https://via.placeholder.com/80"
                  }
                  alt={`Avatar de ${friend.name}`}
                  className="w-20 h-20 rounded-full border-2 border-blue-400 shadow-lg"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-800"></div>
              </div>

              <h3 className="text-xl font-bold text-blue-300 mb-4 text-center break-words leading-tight">
                {friend.name}
              </h3>

              <div className="space-y-3 w-full">
                <div className="flex justify-between items-center bg-gray-700 rounded-lg px-4 py-3 min-h-[48px]">
                  <span className="text-blue-300 text-sm font-medium flex-shrink-0">
                    {t("friend-detail.nivel")}
                  </span>
                  <span className="text-white font-bold text-base ml-2 text-right break-words">
                    {friend.level}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-gray-700 rounded-lg px-4 py-3 min-h-[48px]">
                  <span className="text-blue-300 text-sm font-medium flex-shrink-0">
                    {t("friend-detail.clase")}
                  </span>
                  <span className="text-white font-bold text-base ml-2 text-right break-words">
                    {friend.class}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-gray-700 rounded-lg px-4 py-3 min-h-[48px]">
                  <span className="text-blue-300 text-sm font-medium flex-shrink-0">
                    {t("friend-detail.raza")}
                  </span>
                  <span className="text-white font-bold text-base ml-2 text-right break-words">
                    {friend.race}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-gray-700 rounded-lg px-4 py-3 min-h-[48px]">
                  <span className="text-blue-300 text-sm font-medium flex-shrink-0">
                    {t("friend-detail.estado")}
                  </span>
                  <span className="text-white font-bold text-base ml-2 text-right break-words">
                    {friend.flags}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && selectedFriendId != null && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700 relative max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <button
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-xl font-bold transition-colors duration-200 shadow-lg"
                onClick={closeModal}
              >
                ×
              </button>
              <div className="p-6">
                <FriendDetail
                  jwt={token}
                  accountId={accountId}
                  character={character}
                  serverId={serverId}
                  friend={selectedFriendId}
                  onCloseModal={closeModal}
                  onFriendDeleted={onFriendDeleted}
                  t={t}
                />
              </div>
            </div>
          </div>
        </>
      )}

      <div className="mt-8">
        <ReactPaginate
          forcePage={currentPage}
          previousLabel={t("friend-detail.btn.previous_label")}
          nextLabel={t("friend-detail.btn.next_label")}
          breakLabel={"..."}
          pageCount={Math.ceil(friendsModel.friends.length / itemsPerPage)}
          marginPagesDisplayed={2}
          pageRangeDisplayed={3}
          onPageChange={handlePageClick}
          containerClassName={"flex justify-center items-center space-x-2"}
          pageClassName={"page-item"}
          pageLinkClassName={
            "px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors duration-200 border border-gray-600 hover:border-blue-400"
          }
          activeClassName={"active"}
          activeLinkClassName={
            "bg-blue-600 text-white border-blue-500 shadow-md"
          }
          previousClassName={"mr-2"}
          previousLinkClassName={
            "px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors duration-200 border border-gray-600 hover:border-blue-400"
          }
          nextClassName={"ml-2"}
          nextLinkClassName={
            "px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors duration-200 border border-gray-600 hover:border-blue-400"
          }
          breakClassName={"mx-1"}
          breakLinkClassName={"px-3 py-2 text-gray-400"}
        />

        <div className="text-center mt-4">
          <p className="text-gray-400 text-sm">
            Página {currentPage + 1} de{" "}
            {Math.ceil(friendsModel.friends.length / itemsPerPage)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Friend;

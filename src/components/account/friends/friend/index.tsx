"use client";

import React, { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";

import { getFriends } from "@/api/account/character";
import FriendDetail from "../detail";
import { Character, Friends } from "@/model/model";

interface CharacterProps {
  character: Character;
  token: string;
  accountId: number;
  serverId: number;
  t: (key: string, options?: Record<string, unknown>) => string;
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
      } catch {
        setFriends(null);
      }
    };

    fetchData();
  }, [character, token, accountId, serverId, selectedFriendId]);

  if (!character) {
    return (
      <p className="text-center text-slate-400">
        {t("friend-detail.errors.character-is-null")}
      </p>
    );
  }

  if (!friendsModel || friendsModel.friends.length === 0) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center justify-center rounded-2xl border border-slate-700/70 bg-slate-900/40 px-8 py-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-500/10 text-3xl">
          👥
        </div>
        <p className="text-xl font-semibold text-white">
          {t("friend-detail.errors.friend-is-empty")}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          {t("friend-detail.errors.friend-is-empty-description")}
        </p>
      </div>
    );
  }

  const itemsPerPage = 6;
  const pageCount = Math.ceil(friendsModel.friends.length / itemsPerPage);
  const indexOfLastFriend = (currentPage + 1) * itemsPerPage;
  const indexOfFirstFriend = indexOfLastFriend - itemsPerPage;
  const currentFriends = friendsModel.friends.slice(
    indexOfFirstFriend,
    indexOfLastFriend
  );

  const handlePageClick = (data: { selected: number }) => {
    setCurrentPage(data.selected);
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
    <div>
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
          {t("friend-detail.badge")}
        </p>
        <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
          {t("friend-detail.title")}
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-400 sm:text-base">
          {t("friend-detail.subtitle")}
        </p>
        <div className="mx-auto mt-4 h-px w-24 bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
      </div>

      <div className="grid select-none grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {currentFriends.map((friend) => (
          <button
            key={friend.id}
            type="button"
            className="group flex flex-col rounded-xl border border-slate-700/70 bg-gradient-to-br from-slate-900/80 to-slate-950/90 p-5 text-left transition duration-200 hover:border-cyan-400/40 hover:shadow-[0_0_28px_rgba(34,211,238,0.1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
            onClick={() => openModal(friend)}
          >
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                <img
                  src={
                    friend.race_logo
                      ? friend.race_logo
                      : "https://via.placeholder.com/80"
                  }
                  alt={String(friend.name)}
                  className="h-16 w-16 rounded-full border-2 border-cyan-400/40 object-cover transition group-hover:border-cyan-300/60"
                />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="truncate text-lg font-bold text-white group-hover:text-cyan-100">
                  {String(friend.name)}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  {t("friend-detail.view-actions")}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-slate-700/60 bg-slate-800/50 px-3 py-2">
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                  {t("friend-detail.nivel")}
                </p>
                <p className="mt-0.5 text-sm font-bold text-white">
                  {friend.level}
                </p>
              </div>
              <div className="rounded-lg border border-slate-700/60 bg-slate-800/50 px-3 py-2">
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                  {t("friend-detail.clase")}
                </p>
                <p className="mt-0.5 truncate text-sm font-bold text-white">
                  {friend.class}
                </p>
              </div>
              <div className="rounded-lg border border-slate-700/60 bg-slate-800/50 px-3 py-2">
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                  {t("friend-detail.raza")}
                </p>
                <p className="mt-0.5 truncate text-sm font-bold text-white">
                  {friend.race}
                </p>
              </div>
              <div className="rounded-lg border border-slate-700/60 bg-slate-800/50 px-3 py-2">
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                  {t("friend-detail.estado")}
                </p>
                <p className="mt-0.5 truncate text-sm font-bold text-white">
                  {friend.flags}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {isModalOpen && selectedFriendId != null ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
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
      ) : null}

      {pageCount > 1 ? (
        <div className="mt-8">
          <ReactPaginate
            forcePage={currentPage}
            previousLabel={t("friend-detail.btn.previous_label")}
            nextLabel={t("friend-detail.btn.next_label")}
            breakLabel="..."
            pageCount={pageCount}
            marginPagesDisplayed={2}
            pageRangeDisplayed={3}
            onPageChange={handlePageClick}
            containerClassName="flex flex-wrap items-center justify-center gap-1"
            pageLinkClassName="flex min-w-[2.25rem] items-center justify-center rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-cyan-400/40 hover:text-white"
            activeLinkClassName="!border-cyan-500/50 !bg-cyan-500/20 !text-cyan-100"
            previousLinkClassName="rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-cyan-400/40 hover:text-white"
            nextLinkClassName="rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-cyan-400/40 hover:text-white"
            breakLinkClassName="px-2 text-slate-500"
          />

          <p className="mt-3 text-center text-sm text-slate-500">
            {t("friend-detail.page", {
              current: currentPage + 1,
              total: pageCount,
            })}
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default Friend;

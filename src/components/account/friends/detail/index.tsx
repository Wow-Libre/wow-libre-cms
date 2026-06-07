"use client";

import {
  faCoins,
  faGift,
  faSortUp,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import React, { ChangeEvent, useState } from "react";
import Swal from "sweetalert2";

import {
  deleteFriend,
  sendLevelByFriend,
  sendMoneyByFriend,
} from "@/api/account/character";
import SendItemsModal from "@/components/account/friends/detail/SendItemsModal";
import FriendSubModal, {
  accentStyles,
} from "@/components/account/friends/detail/FriendSubModal";
import { InternalServerError } from "@/dto/generic";
import { Character } from "@/model/model";

library.add(faCoins, faGift, faSortUp, faTrashAlt);

interface FriendsDetailProps {
  jwt: string;
  character: Character;
  friend: Character;
  accountId: number;
  serverId: number;
  onCloseModal: () => void;
  onFriendDeleted: (friendId: number) => void;
  t: (key: string, options?: Record<string, unknown>) => string;
}

type ActionAccent = "emerald" | "amber" | "cyan" | "red";

interface ActionCardProps {
  accent: ActionAccent;
  icon: typeof faGift;
  title: string;
  description: string;
  onClick: () => void;
}

function ActionCard({
  accent,
  icon,
  title,
  description,
  onClick,
}: ActionCardProps) {
  const accentMap: Record<ActionAccent, string> = {
    emerald:
      "border-emerald-500/25 bg-emerald-500/5 hover:border-emerald-400/50 hover:bg-emerald-500/10 group-hover:shadow-[0_0_24px_rgba(16,185,129,0.12)]",
    amber:
      "border-amber-500/25 bg-amber-500/5 hover:border-amber-400/50 hover:bg-amber-500/10 group-hover:shadow-[0_0_24px_rgba(245,158,11,0.12)]",
    cyan: "border-cyan-500/25 bg-cyan-500/5 hover:border-cyan-400/50 hover:bg-cyan-500/10 group-hover:shadow-[0_0_24px_rgba(34,211,238,0.12)]",
    red: "border-red-500/25 bg-red-500/5 hover:border-red-400/50 hover:bg-red-500/10 group-hover:shadow-[0_0_24px_rgba(239,68,68,0.12)]",
  };

  const iconMap: Record<ActionAccent, string> = {
    emerald: "bg-emerald-500/20 text-emerald-300",
    amber: "bg-amber-500/20 text-amber-300",
    cyan: "bg-cyan-500/20 text-cyan-300",
    red: "bg-red-500/20 text-red-300",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full min-h-[5.75rem] flex-col justify-center rounded-xl border p-5 text-left transition duration-200 sm:p-6 ${accentMap[accent]}`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconMap[accent]}`}
        >
          <FontAwesomeIcon icon={icon} className="text-xl" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-white">{title}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-700/60 bg-slate-800/40 px-4 py-3">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <span className="text-right text-sm font-semibold text-white">{value}</span>
    </div>
  );
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

  const deleteFriendInput = async () => {
    const result = await Swal.fire({
      icon: "warning",
      title: t("friend-detail-modal.delete-friend.confirm.title"),
      text: t("friend-detail-modal.delete-friend.confirm.body", {
        name: friend.name,
      }),
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#475569",
      confirmButtonText: t("friend-detail-modal.delete-friend.confirm.confirm"),
      cancelButtonText: t("friend-detail-modal.delete-friend.confirm.cancel"),
      color: "white",
      background: "#0B1218",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteFriend(jwt, character.id, friend.id, accountId, serverId);
      Swal.fire({
        icon: "success",
        title: t("friend-detail-modal.messages-erros.delete-friend.title"),
        text: t("friend-detail-modal.messages-erros.delete-friend.success"),
        confirmButtonColor: "#0891b2",
        confirmButtonText: "Ok",
        color: "white",
        background: "#0B1218",
      });
      onFriendDeleted(friend.id);
      onCloseModal();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : t("friend-detail-modal.messages-erros.delete-friend.error");
      Swal.fire({
        icon: "error",
        title: t("friend-detail-modal.messages-erros.delete-friend.error"),
        text: message,
        confirmButtonColor: "#0891b2",
        confirmButtonText: "Ok",
        color: "white",
        background: "#0B1218",
      });
    }
  };

  const handleGiftLevelsChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setGiftLevels(Number(event.target.value));
  };

  const handleGiftMoneyChange = (event: ChangeEvent<HTMLInputElement>) => {
    setGiftMoney(Number(event.target.value));
  };

  const handleGiftLevelsSubmit = async () => {
    if (giftLevels > 80) {
      Swal.fire({
        icon: "error",
        title: t("friend-detail-modal.messages-erros.oops"),
        text: t("friend-detail-modal.messages-erros.lvl-max"),
        confirmButtonColor: "#0891b2",
        color: "white",
        background: "#0B1218",
      });
      return;
    }
    if (giftLevels <= 0) {
      Swal.fire({
        icon: "error",
        title: t("friend-detail-modal.messages-erros.oops"),
        text: t("friend-detail-modal.messages-erros.lvl-min"),
        confirmButtonColor: "#0891b2",
        color: "white",
        background: "#0B1218",
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
      setIsGiftLevelsOpen(false);
      onCloseModal();
    } catch (error: unknown) {
      if (error instanceof InternalServerError) {
        Swal.fire({
          icon: "error",
          title: t("friend-detail-modal.messages-erros.oops"),
          html: `
          <p><strong>${t("friend-detail-modal.messages-erros.message")}:</strong> ${error.message}</p>
          <hr style="border-color: #444; margin: 8px 0;">
          <p><strong>Transaction ID:</strong> ${error.transactionId}</p>
        `,
          color: "white",
          background: "#0B1218",
        });
        return;
      }
      const message = error instanceof Error ? error.message : t("friend-detail-modal.messages-erros.generic");
      Swal.fire({
        icon: "error",
        title: t("friend-detail-modal.messages-erros.error"),
        text: message,
        color: "white",
        background: "#0B1218",
      });
    }
  };

  const handleGiftMoneySubmit = async () => {
    if (giftMoney <= 0) {
      Swal.fire({
        icon: "error",
        title: t("friend-detail-modal.messages-erros.oops"),
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
      setIsMoneyIsOpen(false);
      onCloseModal();
    } catch (error: unknown) {
      if (error instanceof InternalServerError) {
        Swal.fire({
          icon: "error",
          title: t("friend-detail-modal.messages-erros.oops"),
          html: `
            <p><strong>${t("friend-detail-modal.messages-erros.message")}:</strong> ${error.message}</p>
            <hr style="border-color: #444; margin: 8px 0;">
            <p><strong>Transaction ID:</strong> ${error.transactionId}</p>
          `,
          color: "white",
          background: "#0B1218",
        });
        return;
      }
      const message = error instanceof Error ? error.message : t("friend-detail-modal.messages-erros.generic");
      Swal.fire({
        icon: "error",
        title: t("friend-detail-modal.messages-erros.error"),
        text: message,
        color: "white",
        background: "#0B1218",
        timer: 4500,
      });
    }
  };

  const levelInputRing = accentStyles.emerald.ring;

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="friend-options-title"
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-700/80 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
      >
        <div className="shrink-0 border-b border-slate-700/80 bg-slate-900/95 px-6 py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400">
                {t("friend-detail-modal.header.badge")}
              </p>
              <h2
                id="friend-options-title"
                className="mt-1 text-xl font-bold text-white sm:text-2xl"
              >
                {t("friend-detail-modal.header.title", { name: friend.name })}
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                {t("friend-detail-modal.header.subtitle")}
              </p>
            </div>
            <button
              type="button"
              onClick={onCloseModal}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-600 bg-slate-800 text-lg font-bold text-slate-300 transition hover:border-red-500/50 hover:bg-red-500/20 hover:text-white"
              aria-label={t("friend-detail-modal.close")}
            >
              ×
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-7">
          <div className="space-y-7">
            <section className="rounded-xl border border-slate-700/70 bg-slate-800/30 p-5 sm:p-6">
              <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
                <img
                  src={
                    friend.race_logo
                      ? friend.race_logo
                      : "https://via.placeholder.com/150"
                  }
                  alt={String(friend.name)}
                  className="h-24 w-24 shrink-0 rounded-full border-2 border-cyan-400/50 object-cover shadow-[0_0_24px_rgba(34,211,238,0.2)] sm:h-28 sm:w-28"
                />

                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <h3 className="text-xl font-bold text-white sm:text-2xl">
                    {String(friend.name)}
                  </h3>
                  {friend.note ? (
                    <p className="mt-2 max-h-24 overflow-hidden text-sm italic leading-relaxed text-slate-400">
                      {String(friend.note)}
                    </p>
                  ) : null}

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <StatRow
                      label={t("friend-detail-modal.nivel")}
                      value={friend.level}
                    />
                    <StatRow
                      label={t("friend-detail-modal.clase")}
                      value={String(friend.class)}
                    />
                    <StatRow
                      label={t("friend-detail-modal.raza")}
                      value={String(friend.race)}
                    />
                    <StatRow
                      label={t("friend-detail-modal.estado")}
                      value={String(friend.flags)}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-slate-600/50 bg-slate-900/50 px-4 py-3.5">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {t("friend-detail-modal.sender.label")}
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-emerald-300">
                  {character.name}
                </p>
              </div>
            </section>

            <section>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">
                {t("friend-detail-modal.actions.title")}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <ActionCard
                  accent="emerald"
                  icon={faSortUp}
                  title={t("friend-detail-modal.actions.levels.title")}
                  description={t("friend-detail-modal.actions.levels.description")}
                  onClick={() => setIsGiftLevelsOpen(true)}
                />
                <ActionCard
                  accent="amber"
                  icon={faCoins}
                  title={t("friend-detail-modal.actions.gold.title")}
                  description={t("friend-detail-modal.actions.gold.description")}
                  onClick={() => setIsMoneyIsOpen(true)}
                />
                <ActionCard
                  accent="cyan"
                  icon={faGift}
                  title={t("friend-detail-modal.actions.items.title")}
                  description={t("friend-detail-modal.actions.items.description")}
                  onClick={() => setSendItemsOpen(true)}
                />
                <ActionCard
                  accent="red"
                  icon={faTrashAlt}
                  title={t("friend-detail-modal.actions.delete.title")}
                  description={t("friend-detail-modal.actions.delete.description")}
                  onClick={deleteFriendInput}
                />
              </div>
            </section>
          </div>
        </div>
      </div>

      {isGiftLevelsOpen ? (
        <FriendSubModal
          title={t("friend-detail-modal.send-levels.modal-title")}
          subtitle={t("friend-detail-modal.send-levels.modal-subtitle")}
          accent="emerald"
          closeLabel={t("friend-detail-modal.close")}
          onClose={() => setIsGiftLevelsOpen(false)}
          footer={
            <div className="flex gap-3">
              <button
                type="button"
                className="flex-1 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 py-3 px-4 font-medium text-white transition hover:from-emerald-600 hover:to-emerald-700"
                onClick={handleGiftLevelsSubmit}
              >
                {t("friend-detail-modal.send-levels.cost.btn.success")}
              </button>
              <button
                type="button"
                className="flex-1 rounded-lg border border-slate-600 bg-slate-800 py-3 px-4 font-medium text-slate-200 transition hover:bg-slate-700"
                onClick={() => setIsGiftLevelsOpen(false)}
              >
                {t("friend-detail-modal.send-levels.cost.btn.back")}
              </button>
            </div>
          }
        >
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
            <p className="text-sm font-semibold text-amber-200">
              {t("friend-detail-modal.send-levels.cost.title")}
              <span className="text-white"> 5k Gold </span>
              {t("friend-detail-modal.send-levels.cost.sub-title")}
            </p>
          </div>

          <div className="mt-4 rounded-xl border border-slate-600/60 bg-slate-800/40 px-4 py-3">
            <p className="text-sm font-semibold text-emerald-300">
              {t("friend-detail-modal.send-levels.info-title")}
            </p>
            <div className="mt-2 space-y-2 text-sm text-slate-400">
              <p>
                {t("friend-detail-modal.send-levels.cost.note")}
                <span className="font-semibold text-white"> 80</span>.
              </p>
              <p>{t("friend-detail-modal.send-levels.cost.note-overcharge")}</p>
              <p className="font-semibold text-red-400">
                {t("friend-detail-modal.send-levels.cost.note-overcharge-v2")}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <label
              htmlFor="giftLevels"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              {t("friend-detail-modal.send-levels.cost.question")}
            </label>
            <input
              type="number"
              id="giftLevels"
              value={giftLevels}
              min={1}
              max={80}
              onChange={handleGiftLevelsChange}
              className={`w-full rounded-lg border border-slate-600 bg-slate-800 p-3 text-lg font-medium text-white transition focus:outline-none focus:ring-2 ${levelInputRing}`}
              placeholder={t("friend-detail-modal.send-levels.placeholder")}
            />
          </div>
        </FriendSubModal>
      ) : null}

      {isGiftOroOpen ? (
        <FriendSubModal
          title={t("friend-detail-modal.send-gold.modal-title")}
          subtitle={t("friend-detail-modal.send-gold.modal-subtitle")}
          accent="amber"
          closeLabel={t("friend-detail-modal.close")}
          onClose={() => setIsMoneyIsOpen(false)}
          footer={
            <div className="flex gap-3">
              <button
                type="button"
                className="flex-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 py-3 px-4 font-medium text-white transition hover:from-amber-600 hover:to-orange-600"
                onClick={handleGiftMoneySubmit}
              >
                {t("friend-detail-modal.send-gold.gif-gold.btn.success")}
              </button>
              <button
                type="button"
                className="flex-1 rounded-lg border border-slate-600 bg-slate-800 py-3 px-4 font-medium text-slate-200 transition hover:bg-slate-700"
                onClick={() => setIsMoneyIsOpen(false)}
              >
                {t("friend-detail-modal.send-gold.gif-gold.btn.back")}
              </button>
            </div>
          }
        >
          <div className="rounded-xl border border-slate-600/60 bg-slate-800/40 px-4 py-3">
            <p className="text-sm font-semibold text-amber-300">
              {t("friend-detail-modal.send-gold.gif-gold.title")}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              {t("friend-detail-modal.send-gold.gif-gold.sub-title")}
            </p>
          </div>

          <div className="mt-4">
            <label
              htmlFor="giftMoney"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              {t("friend-detail-modal.send-gold.amount-label")}
            </label>
            <input
              type="number"
              id="giftMoney"
              value={giftMoney}
              min={1}
              onChange={handleGiftMoneyChange}
              className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3 text-lg font-medium text-white transition focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder={t("friend-detail-modal.send-gold.placeholder")}
            />
          </div>
        </FriendSubModal>
      ) : null}

      <SendItemsModal
        jwt={jwt}
        character={character}
        friend={friend}
        accountId={accountId}
        serverId={serverId}
        isOpen={isSendItemsOpen}
        onClose={() => setSendItemsOpen(false)}
        t={t}
      />
    </>
  );
};

export default FriendDetail;

"use client";

import { getInventory, sendItems } from "@/api/account/character";
import WowheadItemIcon from "@/components/wowhead/WowheadItemIcon";
import { refreshWowheadLinks } from "@/components/wowhead/refreshWowheadLinks";
import { InternalServerError } from "@/dto/generic";
import { Character, CharacterInventory } from "@/model/model";
import { useEffect, useMemo, useState } from "react";
import ReactPaginate from "react-paginate";
import Swal from "sweetalert2";

const ITEMS_PER_PAGE = 10;
const SEARCH_DEBOUNCE_MS = 250;
const MAX_SEND_QUANTITY = 10;

type SortOption = "name" | "slot" | "quantity";

function maxSendQuantityForStack(stackSize: number): number {
  return Math.min(Math.max(1, stackSize), MAX_SEND_QUANTITY);
}

function clampSendQuantity(value: number, max: number): number {
  return Math.min(Math.max(1, value), max);
}

interface SendItemsModalProps {
  jwt: string;
  character: Character;
  friend: Character;
  accountId: number;
  serverId: number;
  isOpen: boolean;
  onClose: () => void;
  t: (key: string, options?: Record<string, unknown>) => string;
}

function inventoryKey(item: CharacterInventory): string {
  return `${item.item}-${item.slot}-${item.instance_id}`;
}

function sortItems(items: CharacterInventory[], sortBy: SortOption): CharacterInventory[] {
  const sorted = [...items];
  sorted.sort((a, b) => {
    switch (sortBy) {
      case "slot":
        return a.slot - b.slot;
      case "quantity":
        return b.bag - a.bag || a.name.localeCompare(b.name);
      case "name":
      default:
        return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    }
  });
  return sorted;
}

export default function SendItemsModal({
  jwt,
  character,
  friend,
  accountId,
  serverId,
  isOpen,
  onClose,
  t,
}: SendItemsModalProps) {
  const [items, setItems] = useState<CharacterInventory[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [sendQuantity, setSendQuantity] = useState(1);

  const selectedItem = useMemo(
    () => items.find((item) => inventoryKey(item) === selectedKey) ?? null,
    [items, selectedKey]
  );

  const maxSendQuantity = selectedItem
    ? maxSendQuantityForStack(selectedItem.bag)
    : MAX_SEND_QUANTITY;

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const base = !query
      ? items
      : items.filter(
          (item) =>
            item.name.toLowerCase().includes(query) ||
            String(item.item_id).includes(query)
        );
    return sortItems(base, sortBy);
  }, [items, searchQuery, sortBy]);

  const pageCount = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));

  const paginatedItems = useMemo(() => {
    const safePage = Math.min(currentPage, pageCount - 1);
    const start = safePage * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage, pageCount]);

  const rangeFrom =
    filteredItems.length === 0 ? 0 : Math.min(currentPage, pageCount - 1) * ITEMS_PER_PAGE + 1;
  const rangeTo = Math.min(
    (Math.min(currentPage, pageCount - 1) + 1) * ITEMS_PER_PAGE,
    filteredItems.length
  );

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const inventory = await getInventory(
        jwt,
        accountId,
        serverId,
        character.id
      );
      setItems(inventory);
      setSelectedKey(null);
      setSendQuantity(1);
      setCurrentPage(0);
    } catch (error: unknown) {
      if (error instanceof InternalServerError) {
        Swal.fire({
          icon: "error",
          title: t("friend-detail-modal.send-items.errors.title"),
          html: `
            <p><strong>${t("friend-detail-modal.send-items.errors.message")}:</strong> ${error.message}</p>
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
        title: t("friend-detail-modal.send-items.errors.title"),
        text:
          error instanceof Error
            ? error.message
            : t("friend-detail-modal.send-items.errors.generic"),
        color: "white",
        background: "#0B1218",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      void fetchInventory();
    } else {
      setSearchInput("");
      setSearchQuery("");
      setSortBy("name");
      setCurrentPage(0);
      setSelectedKey(null);
      setSendQuantity(1);
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(0);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (currentPage > pageCount - 1) {
      setCurrentPage(Math.max(0, pageCount - 1));
    }
  }, [currentPage, pageCount]);

  useEffect(() => {
    if (!isOpen || loading) return;
    refreshWowheadLinks();
  }, [isOpen, loading, paginatedItems, currentPage, selectedKey]);

  useEffect(() => {
    if (!selectedItem) return;
    setSendQuantity((current) =>
      clampSendQuantity(current, maxSendQuantityForStack(selectedItem.bag))
    );
  }, [selectedItem?.item, selectedItem?.bag]);

  const handleSelectItem = (item: CharacterInventory) => {
    setSelectedKey(inventoryKey(item));
    setSendQuantity(1);
  };

  const handleQuantityChange = (value: number) => {
    if (!selectedItem) return;
    setSendQuantity(clampSendQuantity(value, maxSendQuantity));
  };

  const handleSend = async () => {
    if (!selectedItem || sending) return;

    if (sendQuantity > MAX_SEND_QUANTITY) {
      Swal.fire({
        icon: "error",
        title: t("friend-detail-modal.send-items.errors.title"),
        text: t("friend-detail-modal.send-items.errors.max-quantity", {
          max: MAX_SEND_QUANTITY,
        }),
        color: "white",
        background: "#0B1218",
      });
      return;
    }
    const confirm = await Swal.fire({
      icon: "question",
      title: t("friend-detail-modal.send-items.confirm.title"),
      html: `
        <p style="margin:0 0 8px;color:#cbd5e1;font-size:1rem;">
          ${t("friend-detail-modal.send-items.confirm.body", {
            item: selectedItem.name,
            quantity: sendQuantity,
            friend: friend.name,
          })}
        </p>
        <p style="margin:0;font-size:0.95rem;color:#94a3b8;">
          ${t("friend-detail-modal.send-items.confirm.hint")}
        </p>
      `,
      showCancelButton: true,
      confirmButtonText: t("friend-detail-modal.send-items.confirm.confirm"),
      cancelButtonText: t("friend-detail-modal.send-items.confirm.cancel"),
      color: "white",
      background: "#0B1218",
      confirmButtonColor: "#0891b2",
      cancelButtonColor: "#475569",
    });

    if (!confirm.isConfirmed) return;

    setSending(true);
    try {
      await sendItems(
        jwt,
        character.id,
        friend.id,
        accountId,
        serverId,
        selectedItem.item,
        sendQuantity
      );
      await fetchInventory();
      Swal.fire({
        icon: "success",
        title: t("friend-detail-modal.send-items.success.title"),
        text: t("friend-detail-modal.send-items.success.body"),
        color: "white",
        background: "#0B1218",
        timer: 5000,
      });
    } catch (error: unknown) {
      if (error instanceof InternalServerError) {
        Swal.fire({
          icon: "error",
          title: t("friend-detail-modal.send-items.errors.title"),
          html: `
            <p><strong>${t("friend-detail-modal.send-items.errors.message")}:</strong> ${error.message}</p>
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
        title: t("friend-detail-modal.send-items.errors.title"),
        text:
          error instanceof Error
            ? error.message
            : t("friend-detail-modal.send-items.errors.generic"),
        color: "white",
        background: "#0B1218",
      });
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="send-items-title"
        className="flex max-h-[82vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-700/80 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
      >
        {/* Header */}
        <div className="shrink-0 border-b border-slate-700/80 bg-slate-900/95 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400">
                {t("friend-detail-modal.send-items.badge")}
              </p>
              <h2
                id="send-items-title"
                className="mt-1 text-xl font-bold text-white sm:text-2xl"
              >
                {t("friend-detail-modal.send-items.title")}
              </h2>
              <p className="mt-1 text-sm text-slate-400 sm:text-base">
                {t("friend-detail-modal.send-items.subtitle")}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-600 bg-slate-800 text-lg font-bold text-slate-300 transition hover:border-red-500/50 hover:bg-red-500/20 hover:text-white"
              aria-label={t("friend-detail-modal.send-items.close")}
            >
              ×
            </button>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-emerald-400/40 bg-slate-900 text-sm font-bold text-emerald-300">
                {character.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-300/80">
                  {t("friend-detail-modal.send-items.from")}
                </p>
                <p className="truncate text-base font-semibold text-white">
                  {character.name}
                </p>
              </div>
            </div>
            <span className="hidden text-xl text-cyan-400 sm:block" aria-hidden>
              →
            </span>
            <div className="flex items-center gap-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2.5">
              <img
                src={friend.race_logo || "https://via.placeholder.com/40"}
                alt=""
                className="h-10 w-10 shrink-0 rounded-full border border-cyan-400/40 object-cover"
              />
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-cyan-300/80">
                  {t("friend-detail-modal.send-items.to")}
                </p>
                <p className="truncate text-base font-semibold text-white">
                  {friend.name}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="shrink-0 border-b border-slate-800/80 px-5 py-3">
          <div className="rounded-xl border border-slate-600/60 bg-slate-800/40 px-3 py-2.5">
            <p className="text-sm font-semibold text-slate-200">
              {t("friend-detail-modal.send-items.instructions.title")}
            </p>
            <p className="mt-0.5 text-sm text-slate-400">
              {t("friend-detail-modal.send-items.instructions.logout")}
            </p>
          </div>
        </div>

        {/* Body — two columns */}
        <div className="grid min-h-0 flex-1 md:grid-cols-[1.35fr_1fr]">
          {/* Inventory */}
          <section className="flex min-h-0 flex-col border-b border-slate-800/80 md:border-b-0 md:border-r">
            <div className="shrink-0 space-y-3 border-b border-slate-800/60 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-semibold text-white sm:text-lg">
                  {t("friend-detail-modal.send-items.inventory.title")}
                </h3>
                <span className="rounded-full border border-slate-600 bg-slate-800 px-2.5 py-0.5 text-sm font-medium text-slate-300">
                  {loading
                    ? "…"
                    : t("friend-detail-modal.send-items.inventory.showing", {
                        from: rangeFrom,
                        to: rangeTo,
                        total: filteredItems.length,
                      })}
                </span>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={t("friend-detail-modal.send-items.inventory.search")}
                  className="w-full rounded-xl border border-slate-600/80 bg-slate-950/80 px-3 py-2.5 text-base text-white outline-none placeholder:text-slate-500 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
                />
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as SortOption);
                    setCurrentPage(0);
                  }}
                  className="rounded-xl border border-slate-600/80 bg-slate-950/80 px-3 py-2.5 text-base text-white outline-none focus:border-cyan-500/60 sm:w-36"
                  aria-label={t("friend-detail-modal.send-items.inventory.sort-label")}
                >
                  <option value="name">
                    {t("friend-detail-modal.send-items.inventory.sort-name")}
                  </option>
                  <option value="slot">
                    {t("friend-detail-modal.send-items.inventory.sort-slot")}
                  </option>
                  <option value="quantity">
                    {t("friend-detail-modal.send-items.inventory.sort-quantity")}
                  </option>
                </select>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
              {loading ? (
                <div className="space-y-2 p-1">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-14 animate-pulse rounded-xl border border-slate-700/50 bg-slate-800/60"
                    />
                  ))}
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 px-4 text-center">
                  <p className="text-base font-semibold text-slate-300">
                    {searchQuery
                      ? t("friend-detail-modal.send-items.inventory.empty-search")
                      : t("friend-detail-modal.send-items.inventory.empty")}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    {t("friend-detail-modal.send-items.inventory.empty-hint")}
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {paginatedItems.map((item) => {
                    const key = inventoryKey(item);
                    const isSelected = selectedKey === key;
                    return (
                      <li key={key}>
                        <button
                          type="button"
                          onClick={() => handleSelectItem(item)}
                          className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${
                            isSelected
                              ? "border-cyan-400/60 bg-cyan-500/10 shadow-[0_0_0_1px_rgba(34,211,238,0.25)]"
                              : "border-slate-700/80 bg-slate-900/50 hover:border-slate-500 hover:bg-slate-800/70"
                          }`}
                        >
                          <WowheadItemIcon
                            itemId={item.item_id}
                            itemName={item.name}
                            size="sm"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-base font-medium text-white">
                              {item.name}
                            </p>
                            <p className="mt-0.5 font-mono text-sm text-cyan-400/80">
                              #{item.item_id}
                            </p>
                          </div>
                          <span className="shrink-0 rounded-full border border-slate-600 bg-slate-800 px-2.5 py-1 text-sm font-bold text-white">
                            ×{item.bag}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {!loading && pageCount > 1 && (
              <div className="shrink-0 border-t border-slate-800/80 px-3 py-2.5">
                <ReactPaginate
                  forcePage={Math.min(currentPage, pageCount - 1)}
                  previousLabel={t("friend-detail-modal.send-items.inventory.page-prev")}
                  nextLabel={t("friend-detail-modal.send-items.inventory.page-next")}
                  breakLabel="…"
                  pageCount={pageCount}
                  marginPagesDisplayed={1}
                  pageRangeDisplayed={2}
                  onPageChange={({ selected }) => setCurrentPage(selected)}
                  containerClassName="flex flex-wrap items-center justify-center gap-1.5"
                  pageLinkClassName="inline-flex min-h-[2rem] min-w-[2rem] items-center justify-center rounded-lg border border-slate-600 bg-slate-800 px-2 text-sm font-semibold text-slate-200 hover:border-cyan-500/40"
                  activeLinkClassName="!border-cyan-500/60 !bg-cyan-500/20 !text-cyan-100"
                  previousLinkClassName="inline-flex min-h-[2rem] items-center rounded-lg border border-slate-600 bg-slate-800 px-3 text-sm font-semibold text-slate-200 hover:border-cyan-500/40"
                  nextLinkClassName="inline-flex min-h-[2rem] items-center rounded-lg border border-slate-600 bg-slate-800 px-3 text-sm font-semibold text-slate-200 hover:border-cyan-500/40"
                  disabledLinkClassName="pointer-events-none opacity-40"
                />
              </div>
            )}
          </section>

          {/* Send panel */}
          <section className="flex min-h-0 flex-col bg-slate-950/30">
            <div className="shrink-0 border-b border-slate-800/60 px-4 py-3">
              <h3 className="text-base font-semibold text-white sm:text-lg">
                {t("friend-detail-modal.send-items.panel.title")}
              </h3>
              <p className="text-sm text-slate-400">
                {t("friend-detail-modal.send-items.panel.hint")}
              </p>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4">
              {!selectedItem ? (
                <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 px-4 py-8 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-600 bg-slate-800 text-2xl">
                    📦
                  </div>
                  <p className="text-base font-semibold text-slate-300">
                    {t("friend-detail-modal.send-items.panel.empty")}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    {t("friend-detail-modal.send-items.panel.empty-hint")}
                  </p>
                </div>
              ) : (
                <div className="flex flex-1 flex-col gap-4">
                  <div className="rounded-xl border border-slate-700/80 bg-slate-900/70 p-4">
                    <div className="flex items-start gap-3">
                      <WowheadItemIcon
                        itemId={selectedItem.item_id}
                        itemName={selectedItem.name}
                        size="md"
                        stopPropagation={false}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {t("friend-detail-modal.send-items.panel.selected")}
                        </p>
                        <p className="mt-1 text-lg font-bold leading-snug text-white">
                          {selectedItem.name}
                        </p>
                        <p className="mt-1 font-mono text-sm text-cyan-400">
                          ID {selectedItem.item_id}
                        </p>
                        <p className="mt-2 text-sm text-slate-400">
                          {t("friend-detail-modal.send-items.panel.available", {
                            count: selectedItem.bag,
                          })}
                        </p>
                        <p className="mt-1 text-xs text-amber-400/90">
                          {t("friend-detail-modal.send-items.panel.max-per-send", {
                            max: MAX_SEND_QUANTITY,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="send-quantity"
                      className="mb-2 block text-sm font-medium text-slate-300"
                    >
                      {t("friend-detail-modal.send-items.panel.quantity")}
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(sendQuantity - 1)}
                        disabled={sendQuantity <= 1 || sending}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-600 bg-slate-800 text-lg font-bold text-white transition hover:border-cyan-500/50 disabled:opacity-40"
                      >
                        −
                      </button>
                      <input
                        id="send-quantity"
                        type="number"
                        min={1}
                        max={maxSendQuantity}
                        value={sendQuantity}
                        onChange={(e) =>
                          handleQuantityChange(Number(e.target.value))
                        }
                        className="h-10 w-full rounded-xl border border-slate-600 bg-slate-950 px-3 text-center text-base font-semibold text-white outline-none focus:border-cyan-500/60"
                      />
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(sendQuantity + 1)}
                        disabled={sendQuantity >= maxSendQuantity || sending}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-600 bg-slate-800 text-lg font-bold text-white transition hover:border-cyan-500/50 disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setSendQuantity(1)}
                        className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm font-semibold text-slate-300 hover:border-cyan-500/40 hover:text-cyan-200"
                      >
                        {t("friend-detail-modal.send-items.panel.qty-one")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSendQuantity(maxSendQuantity)}
                        className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm font-semibold text-slate-300 hover:border-cyan-500/40 hover:text-cyan-200"
                      >
                        {t("friend-detail-modal.send-items.panel.qty-max", {
                          count: maxSendQuantity,
                        })}
                      </button>
                    </div>
                  </div>

                  <div className="mt-auto space-y-3">
                    <div className="rounded-xl border border-cyan-500/25 bg-cyan-500/5 px-3 py-2.5 text-sm text-cyan-100/90">
                      {t("friend-detail-modal.send-items.panel.summary", {
                        quantity: sendQuantity,
                        item: selectedItem.name,
                        friend: friend.name,
                      })}
                    </div>
                    <p className="text-sm text-slate-500">
                      {t("friend-detail-modal.send-items.instructions.mail")}
                    </p>
                    <button
                      type="button"
                      onClick={() => void handleSend()}
                      disabled={sending || loading}
                      className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 py-3 text-base font-semibold text-white shadow-lg shadow-cyan-900/25 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {sending
                        ? t("friend-detail-modal.send-items.panel.sending")
                        : t("friend-detail-modal.send-items.panel.send")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

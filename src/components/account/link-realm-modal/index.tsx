"use client";

import { linkRealmConfirm, linkRealmPreview } from "@/api/account";
import { getServers } from "@/api/account/realms";
import { InternalServerError } from "@/dto/generic";
import {
  LinkRealmPreviewAccount,
  LinkRealmPreviewResponse,
  ServerModel,
} from "@/model/model";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";

export type LinkRealmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  onLinked: () => void;
};

/** Clave estable para comparar fila seleccionada (evita undefined === undefined si faltan campos). */
function accountRowSelectionKey(acc: LinkRealmPreviewAccount): string {
  return `${acc.account_id}:${acc.source_account_game_id}`;
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className ?? "h-8 w-8"}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

const LinkRealmModal: React.FC<LinkRealmModalProps> = ({
  isOpen,
  onClose,
  token,
  onLinked,
}) => {
  const { t } = useTranslation();
  const [loadingData, setLoadingData] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [linking, setLinking] = useState(false);
  const [servers, setServers] = useState<ServerModel[]>([]);
  const [selectedRealmId, setSelectedRealmId] = useState<number | "">("");
  const [preview, setPreview] = useState<LinkRealmPreviewResponse | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<LinkRealmPreviewAccount | null>(null);

  const activeRealms = useMemo(
    () => servers.filter((s) => s.status !== false).sort((a, b) => a.name.localeCompare(b.name)),
    [servers],
  );

  const selectedRowKey = useMemo(
    () => (selectedAccount ? accountRowSelectionKey(selectedAccount) : null),
    [selectedAccount],
  );

  const loadData = useCallback(async () => {
    setLoadingData(true);
    setPreview(null);
    setSelectedAccount(null);
    try {
      const serverList = await getServers();
      setServers(serverList);
      setSelectedRealmId("");
    } catch (e: unknown) {
      const msg =
        e instanceof InternalServerError
          ? e.message
          : e instanceof Error
            ? e.message
            : t("account.link-realm.error-load");
      Swal.fire({
        icon: "error",
        title: t("account.link-realm.error-title"),
        text: msg,
        color: "white",
        background: "#0B1218",
      });
      onClose();
    } finally {
      setLoadingData(false);
    }
  }, [t, onClose]);

  useEffect(() => {
    if (isOpen) {
      void loadData();
    } else {
      setPreview(null);
      setSelectedRealmId("");
      setSelectedAccount(null);
      setServers([]);
    }
  }, [isOpen, loadData]);

  const handlePreview = async () => {
    if (selectedRealmId === "") {
      Swal.fire({
        icon: "warning",
        title: t("account.link-realm.missing-selection-title"),
        text: t("account.link-realm.missing-realm-text"),
        color: "white",
        background: "#0B1218",
      });
      return;
    }
    setLoadingPreview(true);
    setPreview(null);
    setSelectedAccount(null);
    try {
      const data = await linkRealmPreview(token, Number(selectedRealmId));
      setPreview(data);
      const linkable = data.linkable_accounts ?? [];
      if (linkable.length === 1 && linkable[0].can_link) {
        setSelectedAccount(linkable[0]);
      }
    } catch (e: unknown) {
      const msg =
        e instanceof InternalServerError
          ? e.message
          : e instanceof Error
            ? e.message
            : t("account.link-realm.preview-error");
      Swal.fire({
        icon: "error",
        title: t("account.link-realm.error-title"),
        text: msg,
        color: "white",
        background: "#0B1218",
      });
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleLink = async () => {
    if (selectedRealmId === "" || !selectedAccount?.can_link) {
      return;
    }
    setLinking(true);
    try {
      await linkRealmConfirm(token, Number(selectedRealmId), selectedAccount.source_account_game_id);
      Swal.fire({
        icon: "success",
        title: t("account.link-realm.success-title"),
        text: t("account.link-realm.success-text"),
        color: "white",
        background: "#0B1218",
        confirmButtonText: t("errors.show-alert.btn-primary"),
      });
      onLinked();
      onClose();
    } catch (e: unknown) {
      const msg =
        e instanceof InternalServerError
          ? e.message
          : e instanceof Error
            ? e.message
            : t("account.link-realm.link-error");
      Swal.fire({
        icon: "error",
        title: t("account.link-realm.error-title"),
        text: msg,
        color: "white",
        background: "#0B1218",
      });
    } finally {
      setLinking(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  const stepClass = (active: boolean, done: boolean) =>
    [
      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors",
      done
        ? "bg-emerald-500 text-slate-950"
        : active
          ? "border-2 border-emerald-400 bg-emerald-500/15 text-emerald-300"
          : "border border-slate-600 bg-slate-800/80 text-slate-500",
    ].join(" ");

  const realmChosen = selectedRealmId !== "";
  const verified = preview !== null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="link-realm-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" aria-hidden />

      <div
        className="relative flex max-h-[min(92vh,860px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-600/70 bg-slate-900 shadow-2xl shadow-black/50 lg:max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl"
          aria-hidden
        />

        <div className="relative flex shrink-0 items-start justify-between gap-4 border-b border-slate-700/80 px-6 pb-6 pt-7 sm:px-10 sm:pb-7 sm:pt-8">
          <div className="flex min-w-0 flex-1 gap-4 sm:gap-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-600 text-slate-900 shadow-lg shadow-emerald-500/20 sm:h-14 sm:w-14">
              <svg className="h-6 w-6 sm:h-7 sm:w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>
            <div className="min-w-0 pt-0.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400/90 sm:text-xs">
                {t("account.link-realm.kicker")}
              </p>
              <h2
                id="link-realm-modal-title"
                className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl"
              >
                {t("account.link-realm.title")}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">
                {t("account.link-realm.description")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full border border-slate-600 p-2 text-slate-400 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white"
            aria-label={t("account.link-realm.close")}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="relative flex-1 overflow-y-auto px-6 py-7 sm:px-10 sm:py-8">
          {!loadingData && (
            <div className="mb-8 flex items-center gap-2 sm:gap-3">
              <div className="flex flex-1 items-center gap-2 sm:gap-3">
                <span className={stepClass(realmChosen && !verified, realmChosen)} aria-hidden>
                  {realmChosen ? "✓" : "1"}
                </span>
                <span className="hidden text-xs font-medium text-slate-400 sm:inline">
                  {t("account.link-realm.step-1")}
                </span>
              </div>
              <div className="h-px min-w-[1rem] flex-1 bg-gradient-to-r from-slate-600 to-slate-700" />
              <div className="flex flex-1 items-center gap-2 sm:gap-3">
                <span className={stepClass(verified, verified)} aria-hidden>
                  {verified ? "✓" : "2"}
                </span>
                <span className="hidden text-xs font-medium text-slate-400 sm:inline">
                  {t("account.link-realm.step-2")}
                </span>
              </div>
              <div className="h-px min-w-[1rem] flex-1 bg-gradient-to-r from-slate-700 to-slate-600" />
              <div className="flex flex-1 items-center gap-2 sm:gap-3">
                <span className={stepClass(Boolean(selectedAccount?.can_link), Boolean(selectedAccount?.can_link))} aria-hidden>
                  {selectedAccount?.can_link ? "✓" : "3"}
                </span>
                <span className="hidden text-xs font-medium text-slate-400 sm:inline">
                  {t("account.link-realm.step-3")}
                </span>
              </div>
            </div>
          )}

          {loadingData ? (
            <div className="flex flex-col items-center justify-center gap-4 py-14 text-slate-400">
              <Spinner className="h-10 w-10 text-emerald-500" />
              <p className="text-sm font-medium text-slate-300">{t("account.link-realm.loading")}</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="link-realm-target"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  {t("account.link-realm.label-realm")}
                </label>
                <div className="relative">
                  <select
                    id="link-realm-target"
                    className="w-full appearance-none rounded-xl border border-slate-600 bg-slate-950/50 py-3.5 pl-4 pr-10 text-sm font-medium text-white shadow-inner transition focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
                    value={selectedRealmId}
                    onChange={(e) => {
                      setSelectedRealmId(e.target.value === "" ? "" : Number(e.target.value));
                      setPreview(null);
                      setSelectedAccount(null);
                    }}
                  >
                    <option value="">{t("account.link-realm.realm-placeholder")}</option>
                    {activeRealms.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => void handlePreview()}
                disabled={loadingPreview || selectedRealmId === ""}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/30 transition hover:from-emerald-500 hover:to-cyan-500 disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
              >
                {loadingPreview ? (
                  <>
                    <Spinner className="h-5 w-5 text-white" />
                    {t("account.link-realm.checking")}
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {t("account.link-realm.btn-check")}
                  </>
                )}
              </button>

              {preview && (
                <div className="overflow-hidden rounded-2xl border border-emerald-500/25 bg-slate-800/60 shadow-inner">
                  <div className="border-b border-slate-700/80 bg-slate-800/90 px-5 py-4 sm:px-6 sm:py-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400/90 sm:text-sm">
                      {t("account.link-realm.result-heading")}
                    </p>
                    <p className="mt-2 text-xl font-bold text-white sm:text-2xl">{preview.realm_name}</p>
                    <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">
                      {t("account.link-realm.pick-account-hint")}
                    </p>
                  </div>
                  <div className="space-y-4 p-5 sm:p-6">
                    {(preview.linkable_accounts ?? []).length === 0 ? (
                      <p className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-5 py-4 text-sm leading-relaxed text-amber-100/90 sm:text-base">
                        {t("account.link-realm.empty-linkable")}
                      </p>
                    ) : (
                      <ul className="space-y-3">
                        {(preview.linkable_accounts ?? []).map((acc, index) => {
                          const rowKey = accountRowSelectionKey(acc);
                          const selected = selectedRowKey !== null && selectedRowKey === rowKey;
                          return (
                            <li key={`${rowKey}-${index}`}>
                              <button
                                type="button"
                                onClick={() => setSelectedAccount(acc)}
                                className={[
                                  "flex w-full flex-col gap-2 rounded-xl border px-5 py-4 text-left transition sm:flex-row sm:items-center sm:justify-between sm:gap-4",
                                  selected
                                    ? "border-emerald-500/70 bg-emerald-500/15 ring-2 ring-emerald-400/40"
                                    : "border-slate-600/80 bg-slate-900/40 hover:border-slate-500 hover:bg-slate-900/60",
                                  !acc.can_link ? "opacity-90" : "",
                                ].join(" ")}
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="break-words text-base font-semibold text-white sm:text-lg">
                                    {acc.username || "—"}
                                  </p>
                                  <p className="mt-1 text-sm text-slate-400">
                                    {t("account.link-realm.account-id-label", { id: acc.account_id })}
                                  </p>
                                </div>
                                <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end sm:gap-2">
                                  <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-sm font-medium text-cyan-100 ring-1 ring-cyan-500/30">
                                    {t("account.link-realm.characters-summary", {
                                      count: acc.character_count,
                                    })}
                                  </span>
                                  {acc.can_link ? (
                                    <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-semibold text-emerald-100 ring-1 ring-emerald-500/35">
                                      {t("account.link-realm.can-link-pill")}
                                    </span>
                                  ) : (
                                    <span className="rounded-full bg-amber-500/15 px-3 py-1 text-sm font-semibold text-amber-100 ring-1 ring-amber-500/35">
                                      {t("account.link-realm.quota-pill")}
                                    </span>
                                  )}
                                </div>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}

                    {selectedAccount && selectedAccount.can_link ? (
                      <button
                        type="button"
                        onClick={() => void handleLink()}
                        disabled={linking}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-4 text-base font-bold text-slate-950 shadow-md shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-teal-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {linking ? (
                          <>
                            <Spinner className="h-5 w-5 text-slate-900" />
                            {t("account.link-realm.linking")}
                          </>
                        ) : (
                          <>
                            {t("account.link-realm.btn-link")}
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 7l5 5m0 0l-5 5m5-5H6"
                              />
                            </svg>
                          </>
                        )}
                      </button>
                    ) : null}

                    {selectedAccount && !selectedAccount.can_link ? (
                      <p className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-5 py-4 text-sm leading-relaxed text-amber-100/90 sm:text-base">
                        {t("account.link-realm.quota-hint")}
                      </p>
                    ) : null}
                  </div>
                </div>
              )}

              <p className="text-center text-xs leading-relaxed text-slate-500 sm:text-left sm:text-sm">
                {t("account.link-realm.footer-hint")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinkRealmModal;

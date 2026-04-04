"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { getServers } from "@/api/account/realms";
import { InternalServerError } from "@/dto/generic";
import type { ServerModel } from "@/model/model";
import Swal from "sweetalert2";
import { FaCloudUploadAlt, FaSyncAlt, FaTimes } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import {
  listCharacterMigrationAllowedSourcesMe,
  listCharacterMigrationMe,
  uploadCharacterMigrationMe,
  type CharacterMigrationAllowedSourceOption,
  type CharacterMigrationListItem,
} from "../api/characterMigrationApi";

const inputClass =
  "w-full rounded-xl border border-slate-600/90 bg-slate-950/50 px-4 py-3.5 text-base font-medium text-white shadow-inner placeholder:text-slate-200 transition focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/25";
const fileInputClass = `${inputClass} min-h-[3.5rem] cursor-pointer file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-emerald-600/90 file:px-4 file:py-2.5 file:text-base file:font-semibold file:text-white file:shadow-sm file:transition file:hover:bg-emerald-500`;

/** Límite de tamaño del dump (validación cliente; alinear con el backend si aplica). */
const MAX_MIGRATION_FILE_BYTES = 1024 * 1024;

const STATUS_BADGE: Record<
  CharacterMigrationListItem["status"],
  string
> = {
  PENDING: "border-amber-400/70 bg-amber-500/30 text-white",
  PROCESSING: "border-sky-400/70 bg-sky-500/30 text-white",
  COMPLETED: "border-emerald-400/70 bg-emerald-500/30 text-white",
  FAILED: "border-rose-400/70 bg-rose-500/30 text-white",
};

function formatMigrationDate(iso: string | undefined, locale: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(locale, {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function migrationSortKey(m: CharacterMigrationListItem): number {
  const raw = m.updatedAt ?? m.createdAt;
  const t = new Date(raw).getTime();
  return Number.isNaN(t) ? 0 : t;
}

/** Último envío del usuario para el reino (por fecha; empate por id). */
function pickLatestMigrationForRealm(
  list: CharacterMigrationListItem[],
  realmId: number
): CharacterMigrationListItem | undefined {
  const rows = list.filter((m) => m.realmId === realmId);
  if (rows.length === 0) return undefined;
  return rows.reduce((best, m) => {
    const t = migrationSortKey(m);
    const bt = migrationSortKey(best);
    if (t > bt) return m;
    if (t < bt) return best;
    return m.id >= best.id ? m : best;
  });
}

function isActiveMigrationRequest(status: CharacterMigrationListItem["status"]): boolean {
  return status === "PENDING" || status === "PROCESSING";
}

function isFileOverMigrationLimit(file: File): boolean {
  return file.size > MAX_MIGRATION_FILE_BYTES;
}

export interface CharacterMigrationUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
}

const CharacterMigrationUserModal: React.FC<CharacterMigrationUserModalProps> = ({
  isOpen,
  onClose,
  token,
}) => {
  const { t, i18n } = useTranslation();
  const [servers, setServers] = useState<ServerModel[]>([]);
  const [loadingServers, setLoadingServers] = useState(false);
  const [realmId, setRealmId] = useState<number | "">("");
  const [uploading, setUploading] = useState(false);
  const [migrations, setMigrations] = useState<CharacterMigrationListItem[]>([]);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [allowedSources, setAllowedSources] = useState<CharacterMigrationAllowedSourceOption[]>([]);
  const [loadingAllowedSources, setLoadingAllowedSources] = useState(false);
  const [allowedSourceId, setAllowedSourceId] = useState<number | "">("");

  const activeRealms = useMemo(
    () => servers.filter((s) => s.status !== false).sort((a, b) => a.name.localeCompare(b.name)),
    [servers]
  );

  const loadMigrations = useCallback(async () => {
    setLoadingStatus(true);
    try {
      const list = await listCharacterMigrationMe(token);
      setMigrations(list);
    } catch {
      setMigrations([]);
    } finally {
      setLoadingStatus(false);
    }
  }, [token]);

  const loadAllowedSources = useCallback(async () => {
    setLoadingAllowedSources(true);
    try {
      const list = await listCharacterMigrationAllowedSourcesMe(token);
      setAllowedSources(list);
    } catch (e) {
      setAllowedSources([]);
      const msg = e instanceof Error ? e.message : String(e);
      void Swal.fire({
        icon: "error",
        title: t("account.migrate-characters.load-sources-error"),
        text: msg,
        color: "white",
        background: "#0B1218",
      });
    } finally {
      setLoadingAllowedSources(false);
    }
  }, [t, token]);

  const loadServers = useCallback(async () => {
    setLoadingServers(true);
    try {
      const list = await getServers();
      setServers(list);
      if (list.length === 1 && list[0].id != null) {
        setRealmId(list[0].id);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      void Swal.fire({
        icon: "error",
        title: t("account.migrate-characters.load-realms-error"),
        text: msg,
        color: "white",
        background: "#0B1218",
      });
    } finally {
      setLoadingServers(false);
    }
  }, [t]);

  useEffect(() => {
    if (isOpen) {
      setAllowedSourceId("");
      void loadServers();
      void loadMigrations();
      void loadAllowedSources();
    }
  }, [isOpen, loadServers, loadMigrations, loadAllowedSources]);

  useEffect(() => {
    if (allowedSources.length === 1 && allowedSources[0].id != null) {
      setAllowedSourceId(allowedSources[0].id);
    }
    if (allowedSources.length === 0) {
      setAllowedSourceId("");
    }
  }, [allowedSources]);

  const requiresSourceSelection = allowedSources.length > 0;
  const sourceSelectionIncomplete =
    requiresSourceSelection && (loadingAllowedSources || allowedSourceId === "");

  const latestForRealm = useMemo(() => {
    if (realmId === "") return undefined;
    return pickLatestMigrationForRealm(migrations, Number(realmId));
  }, [migrations, realmId]);

  const uploadBlocked =
    latestForRealm !== undefined && isActiveMigrationRequest(latestForRealm.status);

  const handleDumpFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (uploadBlocked || uploading || sourceSelectionIncomplete) return;
      const f = e.target.files?.[0];
      if (f && isFileOverMigrationLimit(f)) {
        e.target.value = "";
        void Swal.fire({
          icon: "warning",
          title: t("account.migrate-characters.file-too-large-title"),
          text: t("account.migrate-characters.file-too-large-message"),
          color: "white",
          background: "#0B1218",
        });
      }
    },
    [t, uploadBlocked, uploading, sourceSelectionIncomplete]
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem("dump") as HTMLInputElement;
    const file = input?.files?.[0];
    if (realmId === "") {
      void Swal.fire({
        icon: "info",
        title: t("account.migrate-characters.pick-realm"),
        color: "white",
        background: "#0B1218",
      });
      return;
    }
    if (requiresSourceSelection && allowedSourceId === "") {
      void Swal.fire({
        icon: "info",
        title: t("account.migrate-characters.pick-source"),
        color: "white",
        background: "#0B1218",
      });
      return;
    }
    if (!file || file.size === 0) {
      void Swal.fire({
        icon: "info",
        title: t("account.migrate-characters.pick-file"),
        color: "white",
        background: "#0B1218",
      });
      return;
    }
    if (isFileOverMigrationLimit(file)) {
      void Swal.fire({
        icon: "warning",
        title: t("account.migrate-characters.file-too-large-title"),
        text: t("account.migrate-characters.file-too-large-message"),
        color: "white",
        background: "#0B1218",
      });
      return;
    }
    const latest = pickLatestMigrationForRealm(migrations, Number(realmId));
    if (latest !== undefined && isActiveMigrationRequest(latest.status)) {
      void Swal.fire({
        icon: "info",
        title: t("account.migrate-characters.upload-blocked-title"),
        text: t("account.migrate-characters.upload-blocked-message"),
        color: "white",
        background: "#0B1218",
      });
      return;
    }
    setUploading(true);
    try {
      await uploadCharacterMigrationMe(Number(realmId), file, token, {
        allowedSourceId:
          requiresSourceSelection && allowedSourceId !== ""
            ? Number(allowedSourceId)
            : undefined,
      });
      input.value = "";
      await loadMigrations();
      void Swal.fire({
        icon: "success",
        title: t("account.migrate-characters.upload-ok"),
        color: "white",
        background: "#0B1218",
        timer: 2600,
      });
      onClose();
    } catch (err) {
      const msg =
        err instanceof InternalServerError
          ? err.message
          : err instanceof Error
            ? err.message
            : String(err);
      void Swal.fire({
        icon: "error",
        title: t("account.migrate-characters.upload-fail"),
        text: msg,
        color: "white",
        background: "#0B1218",
      });
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  const locale =
    i18n.language === "es"
      ? "es-ES"
      : i18n.language === "pt"
        ? "pt-BR"
        : "en-US";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="migrate-characters-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" aria-hidden />

      <div
        className="relative flex max-h-[min(92vh,880px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-600/70 bg-slate-900 shadow-2xl shadow-black/50 lg:max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="pointer-events-none absolute -right-24 -top-20 h-64 w-64 rounded-full bg-emerald-500/12 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-28 -left-20 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl"
          aria-hidden
        />

        <div className="relative flex shrink-0 items-start justify-between gap-4 border-b border-slate-700/80 px-6 pb-6 pt-7 sm:px-10 sm:pb-7 sm:pt-8">
          <div className="flex min-w-0 flex-1 gap-4 sm:gap-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-600 text-slate-900 shadow-lg shadow-emerald-500/25 sm:h-14 sm:w-14">
              <FaCloudUploadAlt className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden />
            </div>
            <div className="min-w-0 pt-0.5">
              <h2
                id="migrate-characters-title"
                className="text-2xl font-bold tracking-tight text-white sm:text-3xl"
              >
                {t("account.migrate-characters.title")}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-white sm:text-lg">
                {t("account.migrate-characters.hint")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full border border-slate-500 p-2 text-slate-200 transition hover:border-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label={t("account.migrate-characters.close")}
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-6 py-7 sm:px-10 sm:py-8">
            <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[1fr_min(20rem,38%)] lg:items-start lg:gap-10">
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="migrate-characters-realm"
                    className="mb-2 block text-sm font-semibold uppercase tracking-wide text-white sm:text-base"
                  >
                    {t("account.migrate-characters.realm-label")}
                  </label>
                  <div className="relative">
                    <select
                      id="migrate-characters-realm"
                      value={realmId === "" ? "" : String(realmId)}
                      onChange={(e) =>
                        setRealmId(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      className={`${inputClass} appearance-none pr-10`}
                      disabled={loadingServers || uploading}
                      required
                    >
                      <option value="">
                        {loadingServers
                          ? t("account.migrate-characters.loading-realms")
                          : t("account.migrate-characters.realm-placeholder")}
                      </option>
                      {activeRealms.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex w-10 items-center justify-center text-white">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </div>
                </div>

                {requiresSourceSelection ? (
                  <div>
                    <label
                      htmlFor="migrate-characters-source"
                      className="mb-2 block text-sm font-semibold uppercase tracking-wide text-white sm:text-base"
                    >
                      {t("account.migrate-characters.source-label")}
                    </label>
                    <p className="mb-3 text-sm leading-relaxed text-white sm:text-base">
                      {t("account.migrate-characters.source-hint")}
                    </p>
                    <div className="relative">
                      <select
                        id="migrate-characters-source"
                        value={allowedSourceId === "" ? "" : String(allowedSourceId)}
                        onChange={(e) =>
                          setAllowedSourceId(e.target.value === "" ? "" : Number(e.target.value))
                        }
                        className={`${inputClass} appearance-none pr-10`}
                        disabled={loadingAllowedSources || uploading || realmId === ""}
                        required
                      >
                        <option value="">
                          {loadingAllowedSources
                            ? t("account.migrate-characters.loading-sources")
                            : t("account.migrate-characters.source-placeholder")}
                        </option>
                        {allowedSources.map((s) => {
                          const label = (s.displayName ?? s.realmlistHost).trim() || s.realmlistHost;
                          const same =
                            label.toLowerCase() === s.realmlistHost.trim().toLowerCase();
                          return (
                            <option key={s.id} value={s.id}>
                              {same ? label : `${label} (${s.realmlistHost})`}
                            </option>
                          );
                        })}
                      </select>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex w-10 items-center justify-center text-white">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                ) : null}

                <div>
                  <label
                    htmlFor="migrate-characters-file"
                    className="mb-2 block text-sm font-semibold uppercase tracking-wide text-white sm:text-base"
                  >
                    {t("account.migrate-characters.file-label")}
                  </label>
                  <p className="mb-3 text-sm leading-relaxed text-white sm:text-base">
                    {t("account.migrate-characters.file-max-size-hint")}
                  </p>
                  {uploadBlocked ? (
                    <p
                      className="mb-3 rounded-xl border border-slate-500/80 border-l-4 border-l-emerald-400 bg-slate-800/95 px-4 py-3.5 text-base font-semibold leading-relaxed text-white shadow-inner"
                      role="status"
                    >
                      {t("account.migrate-characters.upload-blocked-hint")}
                    </p>
                  ) : null}
                  <div
                    className={`rounded-xl border border-dashed border-slate-600/80 bg-slate-950/40 p-1 transition hover:border-emerald-500/35 hover:bg-slate-950/60 ${uploadBlocked || sourceSelectionIncomplete ? "pointer-events-none opacity-50" : ""}`}
                  >
                    <input
                      id="migrate-characters-file"
                      type="file"
                      name="dump"
                      accept=".txt,.lua,.dat,text/plain,*/*"
                      className={fileInputClass}
                      disabled={uploading || uploadBlocked || sourceSelectionIncomplete}
                      onChange={handleDumpFileChange}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-600/60 bg-gradient-to-b from-slate-800/50 to-slate-900/80 p-5 shadow-inner sm:p-6 lg:min-h-[280px]">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-base font-semibold text-white sm:text-lg">
                    {t("account.migrate-characters.status-title")}
                  </h3>
                  <button
                    type="button"
                    onClick={() => void loadMigrations()}
                    disabled={loadingStatus || uploading}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-500/60 bg-slate-800/60 px-3 py-2 text-sm font-semibold text-white transition hover:border-emerald-500/40 hover:bg-slate-800 disabled:opacity-50 sm:text-base"
                    aria-label={t("account.migrate-characters.status-refresh")}
                  >
                    <FaSyncAlt className={`h-3.5 w-3.5 shrink-0 ${loadingStatus ? "animate-spin" : ""}`} />
                    {t("account.migrate-characters.status-refresh")}
                  </button>
                </div>
                <div className="min-h-[7rem]">
                  {loadingStatus && migrations.length === 0 ? (
                    <p className="text-base leading-relaxed text-white sm:text-lg">
                      {t("account.migrate-characters.status-loading")}
                    </p>
                  ) : realmId === "" ? (
                    <p className="text-base leading-relaxed text-white sm:text-lg">
                      {t("account.migrate-characters.status-pick-realm")}
                    </p>
                  ) : requiresSourceSelection && loadingAllowedSources ? (
                    <p className="text-base leading-relaxed text-white sm:text-lg">
                      {t("account.migrate-characters.status-loading-sources")}
                    </p>
                  ) : requiresSourceSelection && allowedSourceId === "" ? (
                    <p className="text-base leading-relaxed text-white sm:text-lg">
                      {t("account.migrate-characters.status-pick-source")}
                    </p>
                  ) : !latestForRealm ? (
                    <p className="text-base leading-relaxed text-white sm:text-lg">
                      {t("account.migration-status.none")}
                    </p>
                  ) : (
                    <div className="space-y-4">
                      <span
                        className={`inline-flex w-fit items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold uppercase tracking-wide sm:text-base ${STATUS_BADGE[latestForRealm.status]}`}
                      >
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full bg-current opacity-90"
                          aria-hidden
                        />
                        {t(`account.migration-status.${latestForRealm.status}`)}
                      </span>
                      {latestForRealm.characterName ? (
                        <p className="text-lg font-medium text-white sm:text-xl">
                          <span className="text-base font-normal text-white">
                            {t("account.migrate-characters.status-character")}
                          </span>{" "}
                          {latestForRealm.characterName}
                        </p>
                      ) : null}
                      <p className="text-base text-white">
                        {t("account.migrate-characters.status-updated")}{" "}
                        <span className="font-semibold text-white">
                          {formatMigrationDate(
                            latestForRealm.updatedAt ?? latestForRealm.createdAt,
                            locale
                          )}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="shrink-0 border-t border-slate-700/80 bg-slate-900/95 px-6 py-5 sm:px-10">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-500 px-5 py-3 text-base font-semibold text-white transition hover:bg-slate-800 sm:min-w-[7rem]"
              >
                {t("account.migrate-characters.cancel")}
              </button>
              <button
                type="submit"
                disabled={
                  uploading || loadingServers || uploadBlocked || sourceSelectionIncomplete
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-3 text-base font-bold text-white shadow-lg shadow-emerald-900/30 transition hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50 sm:min-w-[10rem]"
              >
                <FaCloudUploadAlt className="h-4 w-4 shrink-0" />
                {uploading
                  ? t("account.migrate-characters.uploading")
                  : t("account.migrate-characters.submit")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CharacterMigrationUserModal;

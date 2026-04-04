"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { getServers } from "@/api/account/realms";
import { InternalServerError } from "@/dto/generic";
import type { ServerModel } from "@/model/model";
import Swal from "sweetalert2";
import { FaCloudUploadAlt, FaSyncAlt, FaTimes } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import {
  listCharacterMigrationMe,
  uploadCharacterMigrationMe,
  type CharacterMigrationListItem,
} from "../api/characterMigrationApi";

const inputClass =
  "w-full rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/40";
const fileInputClass = `${inputClass} file:mr-3 file:rounded-lg file:border-0 file:bg-slate-700 file:px-3 file:py-1.5 file:text-sm file:text-slate-200`;

const STATUS_BADGE: Record<
  CharacterMigrationListItem["status"],
  string
> = {
  PENDING: "border-amber-500/45 bg-amber-500/15 text-amber-100",
  PROCESSING: "border-sky-500/45 bg-sky-500/15 text-sky-100",
  COMPLETED: "border-emerald-500/45 bg-emerald-500/15 text-emerald-100",
  FAILED: "border-rose-500/45 bg-rose-500/15 text-rose-100",
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
      void loadServers();
      void loadMigrations();
    }
  }, [isOpen, loadServers, loadMigrations]);

  const latestForRealm = useMemo(() => {
    if (realmId === "") return undefined;
    const rid = Number(realmId);
    return migrations.find((m) => m.realmId === rid);
  }, [migrations, realmId]);

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
    if (!file || file.size === 0) {
      void Swal.fire({
        icon: "info",
        title: t("account.migrate-characters.pick-file"),
        color: "white",
        background: "#0B1218",
      });
      return;
    }
    setUploading(true);
    try {
      await uploadCharacterMigrationMe(Number(realmId), file, token);
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
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="migrate-characters-title"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-600 bg-slate-900 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-700 px-5 py-4">
          <h2 id="migrate-characters-title" className="text-lg font-semibold text-white">
            {t("account.migrate-characters.title")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            aria-label={t("account.migrate-characters.close")}
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 p-5">
          <p className="text-sm text-slate-400">{t("account.migrate-characters.hint")}</p>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              {t("account.migrate-characters.realm-label")}
            </label>
            <select
              value={realmId === "" ? "" : String(realmId)}
              onChange={(e) =>
                setRealmId(e.target.value === "" ? "" : Number(e.target.value))
              }
              className={inputClass}
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
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-sm font-medium text-slate-200">
                {t("account.migrate-characters.status-title")}
              </h3>
              <button
                type="button"
                onClick={() => void loadMigrations()}
                disabled={loadingStatus || uploading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600 px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-slate-700 disabled:opacity-50"
                aria-label={t("account.migrate-characters.status-refresh")}
              >
                <FaSyncAlt className={`h-3.5 w-3.5 ${loadingStatus ? "animate-spin" : ""}`} />
                {t("account.migrate-characters.status-refresh")}
              </button>
            </div>
            {loadingStatus && migrations.length === 0 ? (
              <p className="text-sm text-slate-500">{t("account.migrate-characters.status-loading")}</p>
            ) : realmId === "" ? (
              <p className="text-sm text-slate-500">{t("account.migrate-characters.status-pick-realm")}</p>
            ) : !latestForRealm ? (
              <p className="text-sm text-slate-500">{t("account.migration-status.none")}</p>
            ) : (
              <div className="space-y-2">
                <span
                  className={`inline-flex w-fit items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${STATUS_BADGE[latestForRealm.status]}`}
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full bg-current opacity-90"
                    aria-hidden
                  />
                  {t(`account.migration-status.${latestForRealm.status}`)}
                </span>
                {latestForRealm.characterName ? (
                  <p className="text-sm text-slate-300">
                    <span className="text-slate-500">
                      {t("account.migrate-characters.status-character")}
                    </span>{" "}
                    {latestForRealm.characterName}
                  </p>
                ) : null}
                <p className="text-xs text-slate-500">
                  {t("account.migrate-characters.status-updated")}{" "}
                  {formatMigrationDate(
                    latestForRealm.updatedAt ?? latestForRealm.createdAt,
                    locale
                  )}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              {t("account.migrate-characters.file-label")}
            </label>
            <input
              type="file"
              name="dump"
              accept=".txt,.lua,.dat,text/plain,*/*"
              className={fileInputClass}
              disabled={uploading}
            />
          </div>
          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-600 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800"
            >
              {t("account.migrate-characters.cancel")}
            </button>
            <button
              type="submit"
              disabled={uploading || loadingServers}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              <FaCloudUploadAlt className="h-4 w-4" />
              {uploading
                ? t("account.migrate-characters.uploading")
                : t("account.migrate-characters.submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CharacterMigrationUserModal;

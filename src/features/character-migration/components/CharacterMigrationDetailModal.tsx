"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DASHBOARD_PALETTE } from "@/components/dashboard/styles/dashboardPalette";
import Swal from "sweetalert2";
import { FaCheck, FaChevronDown, FaSave, FaTimes } from "react-icons/fa";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import {
  updateCharacterMigrationStatus,
  type CharacterMigrationDetail,
  type CharacterMigrationStatus,
} from "../api/characterMigrationApi";

const btnPrimaryClass = `${DASHBOARD_PALETTE.btnPrimary} inline-flex items-center justify-center gap-2`;
const btnSecondaryClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-500/60 bg-slate-600/40 px-4 py-3 text-sm font-semibold text-slate-100 transition-colors hover:bg-slate-600/60";

const STATUS_OPTIONS: CharacterMigrationStatus[] = [
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
];

/** Orden sugerido de bloques típicos del dump del addon. */
const SECTION_KEY_ORDER: string[] = [
  "ginf",
  "uinf",
  "inventory",
  "bags",
  "bank",
  "equipment",
  "skills",
  "spells",
  "talents",
  "glyphs",
  "currency",
  "quests",
  "achievements",
  "reputations",
  "pets",
  "mounts",
];

function sortSectionKeys(keys: string[]): string[] {
  const ordered = SECTION_KEY_ORDER.filter((k) => keys.includes(k));
  const rest = keys.filter((k) => !SECTION_KEY_ORDER.includes(k)).sort((a, b) => a.localeCompare(b));
  return [...ordered, ...rest];
}

function sectionLabel(key: string, t: TFunction, i18n: { exists: (k: string) => boolean }): string {
  const k = `character-migration-dashboard.sections.${key}`;
  if (i18n.exists(k)) return t(k);
  return t("character-migration-dashboard.section-unknown", { key });
}

const STATUS_BADGE: Record<CharacterMigrationStatus, string> = {
  PENDING: "border-amber-400/70 bg-amber-400/25 text-amber-50 shadow-sm shadow-amber-900/20",
  PROCESSING: "border-sky-400/70 bg-sky-400/25 text-sky-50 shadow-sm shadow-sky-900/20",
  COMPLETED: "border-emerald-400/70 bg-emerald-400/25 text-emerald-50 shadow-sm shadow-emerald-900/20",
  FAILED: "border-rose-400/70 bg-rose-400/25 text-rose-50 shadow-sm shadow-rose-900/20",
};

export interface CharacterMigrationDetailModalProps {
  open: boolean;
  detail: CharacterMigrationDetail | null;
  realmId: number;
  token: string;
  onClose: () => void;
  onSaved: (updated: CharacterMigrationDetail) => void;
  onError: (message: string | null) => void;
}

const CharacterMigrationDetailModal: React.FC<CharacterMigrationDetailModalProps> = ({
  open,
  detail,
  realmId,
  token,
  onClose,
  onSaved,
  onError,
}) => {
  const { t, i18n } = useTranslation();
  const [statusDraft, setStatusDraft] = useState<CharacterMigrationStatus>("PENDING");
  const [saving, setSaving] = useState(false);
  const sectionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (detail) {
      setStatusDraft(detail.status);
    }
  }, [detail?.id, detail?.status, detail]);

  const rawKeys = useMemo(() => {
    const raw = detail?.rawData;
    if (!raw || typeof raw !== "object") return [];
    return sortSectionKeys(Object.keys(raw as Record<string, unknown>));
  }, [detail?.rawData]);

  /** Abrir ginf/uinf por defecto tras pintar las secciones. */
  useEffect(() => {
    if (!detail || !sectionsRef.current) return;
    requestAnimationFrame(() => {
      sectionsRef.current?.querySelectorAll("details[data-section-key]").forEach((el) => {
        const key = el.getAttribute("data-section-key");
        if (key === "ginf" || key === "uinf") {
          (el as HTMLDetailsElement).open = true;
        }
      });
    });
  }, [detail?.id, rawKeys]);

  const persistStatus = useCallback(
    async (next: CharacterMigrationStatus) => {
      if (!detail) return;
      setSaving(true);
      onError(null);
      try {
        const updated = await updateCharacterMigrationStatus(realmId, detail.id, next, token);
        setStatusDraft(updated.status);
        onSaved(updated);
        void Swal.fire({
          icon: "success",
          title: t("character-migration-dashboard.status-saved"),
          color: "white",
          background: "#0B1218",
          timer: 2200,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        onError(msg);
        void Swal.fire({
          icon: "error",
          title: t("character-migration-dashboard.status-save-fail"),
          text: msg,
          color: "white",
          background: "#0B1218",
        });
      } finally {
        setSaving(false);
      }
    },
    [detail, realmId, token, onSaved, onError, t]
  );

  const handleApprove = async () => {
    if (!detail) return;
    const r = await Swal.fire({
      icon: "question",
      title: t("character-migration-dashboard.approve-confirm-title"),
      text: t("character-migration-dashboard.approve-confirm-text", {
        name: detail.characterName ?? "—",
      }),
      showCancelButton: true,
      confirmButtonText: t("character-migration-dashboard.approve"),
      cancelButtonText: t("character-migration-dashboard.cancel-action"),
      color: "white",
      background: "#0B1218",
    });
    if (!r.isConfirmed) return;
    await persistStatus("COMPLETED");
  };

  const handleReject = async () => {
    if (!detail) return;
    const r = await Swal.fire({
      icon: "warning",
      title: t("character-migration-dashboard.reject-confirm-title"),
      text: t("character-migration-dashboard.reject-confirm-text", {
        name: detail.characterName ?? "—",
      }),
      showCancelButton: true,
      confirmButtonText: t("character-migration-dashboard.reject"),
      cancelButtonText: t("character-migration-dashboard.cancel-action"),
      color: "white",
      background: "#0B1218",
    });
    if (!r.isConfirmed) return;
    await persistStatus("FAILED");
  };

  const handleSaveDraft = async () => {
    if (!detail || statusDraft === detail.status) return;
    await persistStatus(statusDraft);
  };

  const setAllSectionsOpen = (isOpen: boolean) => {
    sectionsRef.current?.querySelectorAll("details").forEach((el) => {
      (el as HTMLDetailsElement).open = isOpen;
    });
  };

  if (!open || !detail) {
    return null;
  }

  const canDecide = detail.status === "PENDING" || detail.status === "PROCESSING";

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/55 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="migration-detail-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Sin items-center: el modal arranca arriba y no se desborda hacia fuera del viewport */}
      <div className="flex min-h-full items-start justify-center px-4 py-6 sm:px-6 sm:py-8">
        <div
          className="flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-500/40 bg-gradient-to-b from-slate-800 via-slate-800 to-slate-900 shadow-2xl shadow-black/40 ring-1 ring-white/10"
          style={{ height: "min(880px, calc(100dvh - 3rem))" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-600/50 bg-slate-800 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h3
              id="migration-detail-title"
              className="text-xl font-bold tracking-tight text-white sm:text-2xl"
            >
              {t("character-migration-dashboard.detail-title")} #{detail.id}
            </h3>
            <p className="mt-2 truncate text-base text-slate-200">
              {detail.characterName ?? "—"} ·{" "}
              <span className="font-mono text-sm text-slate-300">{detail.characterGuid ?? "—"}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-slate-300 hover:bg-slate-600/50 hover:text-white"
            aria-label={t("character-migration-dashboard.close-detail")}
          >
            <FaTimes className="h-5 w-5" />
          </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain bg-slate-800/20 px-5 py-5 pb-10 sm:px-6">
          {/* Resumen */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-500/35 bg-gradient-to-br from-slate-600/50 to-slate-700/40 p-4 shadow-md">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                {t("character-migration-dashboard.summary-status")}
              </p>
              <span
                className={`mt-3 inline-flex rounded-lg border px-3 py-1.5 text-sm font-bold uppercase ${STATUS_BADGE[detail.status]}`}
              >
                {t(`character-migration-dashboard.status-${detail.status}`)}
              </span>
            </div>
            <div className="rounded-xl border border-slate-500/35 bg-gradient-to-br from-slate-600/50 to-slate-700/40 p-4 shadow-md">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                {t("character-migration-dashboard.summary-user")}
              </p>
              <p className="mt-3 font-mono text-2xl font-bold tabular-nums tracking-tight text-white sm:text-3xl">
                {detail.userId ?? "—"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-500/35 bg-gradient-to-br from-slate-600/50 to-slate-700/40 p-4 shadow-md">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                {t("character-migration-dashboard.summary-realm")}
              </p>
              <p className="mt-3 font-mono text-2xl font-bold tabular-nums tracking-tight text-white sm:text-3xl">
                {detail.realmId ?? "—"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-500/35 bg-gradient-to-br from-slate-600/50 to-slate-700/40 p-4 shadow-md">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                {t("character-migration-dashboard.summary-dates")}
              </p>
              <p className="mt-3 text-sm leading-snug text-slate-100">
                <span className="font-medium text-slate-400">
                  {t("character-migration-dashboard.summary-created")}
                </span>
                <br />
                {detail.createdAt ? new Date(detail.createdAt).toLocaleString() : "—"}
              </p>
              <p className="mt-2 text-sm leading-snug text-slate-100">
                <span className="font-medium text-slate-400">
                  {t("character-migration-dashboard.summary-updated")}
                </span>
                <br />
                {detail.updatedAt ? new Date(detail.updatedAt).toLocaleString() : "—"}
              </p>
            </div>
          </div>

          {/* Acciones */}
          <div className="mb-6 flex flex-col gap-4 rounded-xl border border-slate-500/35 bg-slate-700/25 p-5 shadow-inner">
            <p className="text-base font-semibold text-slate-100">
              {t("character-migration-dashboard.decision-title")}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={saving || !canDecide}
                onClick={() => void handleApprove()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 disabled:opacity-40"
              >
                <FaCheck className="h-4 w-4" />
                {t("character-migration-dashboard.approve")}
              </button>
              <button
                type="button"
                disabled={saving || !canDecide}
                onClick={() => void handleReject()}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-500/50 bg-rose-500/15 px-5 py-3 text-sm font-bold text-rose-100 transition-colors hover:bg-rose-500/25 disabled:opacity-40"
              >
                <FaTimes className="h-4 w-4" />
                {t("character-migration-dashboard.reject")}
              </button>
            </div>
            {!canDecide ? (
              <p className="text-sm text-slate-400">{t("character-migration-dashboard.decision-locked-hint")}</p>
            ) : null}

            <div className="border-t border-slate-500/30 pt-4">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
                {t("character-migration-dashboard.manual-status-title")}
              </p>
              <div className="flex flex-wrap items-end gap-3">
                <div className="min-w-[200px] flex-1">
                  <label className="mb-1 block text-sm text-slate-300">
                    {t("character-migration-dashboard.status-label")}
                  </label>
                  <select
                    value={statusDraft}
                    onChange={(e) => setStatusDraft(e.target.value as CharacterMigrationStatus)}
                    className={DASHBOARD_PALETTE.input}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {t(`character-migration-dashboard.status-${s}`)}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  disabled={saving || statusDraft === detail.status}
                  onClick={() => void handleSaveDraft()}
                  className={`${btnPrimaryClass} disabled:opacity-40`}
                >
                  <FaSave className="h-4 w-4" />
                  {saving
                    ? t("character-migration-dashboard.status-saving")
                    : t("character-migration-dashboard.status-save")}
                </button>
              </div>
            </div>
          </div>

          {detail.validationErrors ? (
            <div className="mb-6 rounded-xl border border-amber-400/45 bg-amber-400/15 px-4 py-4 text-sm text-amber-50">
              <p className="text-sm font-semibold uppercase tracking-wide text-amber-100">
                {t("character-migration-dashboard.validation-errors-title")}
              </p>
              <p className="mt-2 whitespace-pre-wrap">{detail.validationErrors}</p>
            </div>
          ) : null}

          {/* JSON por secciones */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-base font-semibold text-slate-100">
              {t("character-migration-dashboard.dump-sections-title")}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setAllSectionsOpen(true)}
                className={btnSecondaryClass}
              >
                <FaChevronDown className="h-3.5 w-3.5" />
                {t("character-migration-dashboard.expand-all")}
              </button>
              <button
                type="button"
                onClick={() => setAllSectionsOpen(false)}
                className={btnSecondaryClass}
              >
                {t("character-migration-dashboard.collapse-all")}
              </button>
            </div>
          </div>

          {rawKeys.length === 0 ? (
            <p className="text-sm text-slate-400">{t("character-migration-dashboard.dump-empty")}</p>
          ) : (
            <div ref={sectionsRef} className="space-y-2 pb-4">
              {rawKeys.map((key) => {
                const value = (detail.rawData as Record<string, unknown>)[key];
                const json = JSON.stringify(value ?? null, null, 2);
                return (
                  <details
                    key={key}
                    data-section-key={key}
                    className="group overflow-hidden rounded-xl border border-slate-500/30 bg-slate-700/35 shadow-sm"
                  >
                    <summary className="cursor-pointer list-none px-4 py-3.5 text-base font-semibold text-cyan-100 transition-colors marker:hidden hover:bg-slate-600/30 [&::-webkit-details-marker]:hidden">
                      <span className="inline-flex w-full items-center justify-between gap-2">
                        <span>{sectionLabel(key, t, i18n)}</span>
                        <code className="text-sm font-normal text-slate-400">{key}</code>
                      </span>
                    </summary>
                    <pre className="overflow-x-auto border-t border-slate-600/40 bg-slate-900/40 p-4 text-left text-sm leading-relaxed text-emerald-100">
                      {json}
                    </pre>
                  </details>
                );
              })}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterMigrationDetailModal;

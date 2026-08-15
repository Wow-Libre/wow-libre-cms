"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  InvalidImageError,
  MAX_IMAGE_BYTES,
  validateImageFile,
} from "@/lib/upload/imageValidation";

export type DashboardImageUploaderProps = {
  token: string;
  value: string;
  uploadFn: (token: string, file: File) => Promise<string>;
  onChange: (url: string) => void;
  /** Texto del botón/banner. Default: "Imagen". */
  label?: string;
  /** Texto del banner inferior. Default: copy genérica de ayuda al usuario. */
  hint?: string;
  /** Si true, muestra el fallback "O pegar URL" para power users. */
  allowManualUrl?: boolean;
  /** Etiqueta del contexto (solo para analytics/log). */
  context?: string;
  onError?: (msg: string) => void;
  disabled?: boolean;
  /** Color de acento ("blue" para news, "indigo" para votes, "amber" para battle-pass, etc.). */
  accent?: "blue" | "indigo" | "amber";
};

type Status =
  | { kind: "idle" }
  | { kind: "uploading"; progress: number }
  | { kind: "error"; message: string };

const SIZE_LIMIT_MB = Math.floor(MAX_IMAGE_BYTES / 1024 / 1024);

const ACCEPT_MIMES = "image/png,image/jpeg,image/gif,image/webp,image/avif";

export function DashboardImageUploader({
  token,
  value,
  uploadFn,
  onChange,
  label,
  hint,
  allowManualUrl = true,
  context = "image",
  onError,
  disabled = false,
  accent = "blue",
}: DashboardImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [dragOver, setDragOver] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [manualUrl, setManualUrl] = useState(value ?? "");

  useEffect(() => {
    setManualUrl(value ?? "");
  }, [value]);

  const handleUpload = useCallback(
    async (file: File) => {
      setStatus({ kind: "uploading", progress: 0 });
      try {
        const mime = await validateImageFile(file);
        if (mime !== file.type) {
          throw new InvalidImageError(
            `El archivo parece ${mime} pero fue enviado como ${file.type}.`,
          );
        }
        const url = await uploadFn(token, file);
        onChange(url);
        setManualUrl(url);
        setStatus({ kind: "idle" });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "No se pudo subir la imagen";
        setStatus({ kind: "error", message });
        onError?.(message);
      }
    },
    [token, uploadFn, onChange, onError],
  );

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) void handleUpload(f);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const f = e.dataTransfer.files?.[0];
    if (f) void handleUpload(f);
  };

  const onPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const it of items) {
      if (it.kind === "file") {
        const file = it.getAsFile();
        if (file && file.type.startsWith("image/")) {
          e.preventDefault();
          void handleUpload(file);
          return;
        }
      }
    }
  };

  const onManualSubmit = () => {
    if (!manualUrl.trim()) return;
    onChange(manualUrl.trim());
    setStatus({ kind: "idle" });
  };

  const onClear = () => {
    onChange("");
    setManualUrl("");
    setStatus({ kind: "idle" });
  };

  const isUploading = status.kind === "uploading";
  const hasImage =
    !!value && (value.startsWith("http://") || value.startsWith("https://"));

  const accentDropClass =
    accent === "indigo"
      ? "border-indigo-400 bg-indigo-500/10"
      : accent === "amber"
        ? "border-amber-400 bg-amber-500/10"
        : "border-blue-400 bg-blue-500/10";
  const accentHoverClass =
    accent === "indigo"
      ? "hover:border-indigo-400/70"
      : accent === "amber"
        ? "hover:border-amber-400/70"
        : "hover:border-blue-400/70";
  const accentButtonClass =
    accent === "indigo"
      ? "bg-indigo-600/90 hover:bg-indigo-500"
      : accent === "amber"
        ? "bg-amber-600/90 hover:bg-amber-500"
        : "bg-blue-600/90 hover:bg-blue-500";
  const accentSpinnerClass =
    accent === "indigo"
      ? "border-indigo-400 border-t-transparent"
      : accent === "amber"
        ? "border-amber-400 border-t-transparent"
        : "border-blue-400 border-t-transparent";
  const accentTextClass =
    accent === "indigo"
      ? "text-indigo-300"
      : accent === "amber"
        ? "text-amber-300"
        : "text-blue-300";
  const accentFocusRing =
    accent === "indigo"
      ? "focus:border-indigo-400 focus:ring-indigo-400/20"
      : accent === "amber"
        ? "focus:border-amber-400 focus:ring-amber-400/20"
        : "focus:border-blue-400 focus:ring-blue-400/20";

  return (
    <div className="space-y-2" data-context={context}>
      {label && (
        <label className="mb-2 block text-base font-medium text-slate-200">
          {label}
        </label>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onPaste={onPaste}
        tabIndex={0}
        role="button"
        aria-label="Soltar, pegar o seleccionar imagen"
        className={[
          "relative rounded-xl border-2 border-dashed p-4 transition-all outline-none",
          dragOver
            ? accentDropClass
            : `border-slate-600/50 bg-slate-800/40 ${accentHoverClass}`,
          disabled ? "pointer-events-none opacity-60" : "cursor-pointer",
        ].join(" ")}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_MIMES}
          onChange={onFileInput}
          hidden
          disabled={disabled || isUploading}
        />

        {hasImage ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative h-32 w-full overflow-hidden rounded-xl border border-slate-600/50 bg-slate-900/60 sm:w-48">
              {/* El src es una URL pública controlada por el bucket. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt={label || "Imagen"}
                className="h-full w-full object-cover"
                onError={() => {
                  setStatus({
                    kind: "error",
                    message: "No se pudo cargar la vista previa. Verifica la URL.",
                  });
                }}
              />
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <div
                    className={`h-8 w-8 animate-spin rounded-full border-4 ${accentSpinnerClass}`}
                  />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-3">
              <p className="break-all text-sm text-slate-400">{value}</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    inputRef.current?.click();
                  }}
                  disabled={disabled || isUploading}
                  className={`rounded-lg px-3.5 py-2 text-sm font-semibold text-white transition disabled:opacity-50 ${accentButtonClass}`}
                >
                  Reemplazar
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClear();
                  }}
                  disabled={disabled || isUploading}
                  className="rounded-lg border border-red-500/50 bg-red-500/10 px-3.5 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
                >
                  Quitar
                </button>
                {allowManualUrl && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowManual((v) => !v);
                    }}
                    disabled={disabled || isUploading}
                    className="rounded-lg border border-slate-600/60 bg-slate-700/50 px-3.5 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-700 disabled:opacity-50"
                  >
                    {showManual ? "Ocultar URL" : "Editar URL"}
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-9 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-11 w-11 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
            <p className="text-base font-semibold text-slate-200">
              Arrastra, pega o selecciona una imagen
            </p>
            <p className="text-sm text-slate-400">
              PNG / JPEG / GIF / WebP / AVIF — máx. {SIZE_LIMIT_MB} MB
            </p>
            {allowManualUrl && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowManual((v) => !v);
                }}
                disabled={disabled || isUploading}
                className={`mt-1 text-sm font-semibold underline-offset-2 hover:underline ${accentTextClass}`}
              >
                o pegar una URL manualmente
              </button>
            )}
          </div>
        )}

        {isUploading && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl bg-slate-900/40 backdrop-blur-sm">
            <div
              className={`h-10 w-10 animate-spin rounded-full border-4 ${accentSpinnerClass}`}
            />
            <p className="text-base font-semibold text-white">Subiendo a S3…</p>
          </div>
        )}
      </div>

      {status.kind === "error" && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {status.message}
        </p>
      )}

{allowManualUrl && showManual && (
        <div className="flex gap-2">
          <input
            type="url"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onManualSubmit();
            }}
            placeholder="https://bucket.s3.region.amazonaws.com/..."
            className={`flex-1 rounded-lg border border-slate-600/50 bg-slate-800/50 px-3 py-2 text-sm text-white outline-none focus:ring-2 ${accentFocusRing}`}
            disabled={disabled}
          />
          <button
            type="button"
            onClick={onManualSubmit}
            disabled={disabled || !manualUrl.trim()}
            className={`rounded-lg px-3 py-2 text-sm font-semibold text-white transition disabled:opacity-50 ${accentButtonClass}`}
          >
            Usar
          </button>
        </div>
      )}

      {hint && <p className="text-sm text-slate-400">{hint}</p>}
    </div>
  );
}

export default DashboardImageUploader;

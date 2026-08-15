"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  InvalidImageError,
  MAX_IMAGE_BYTES,
  validateImageFile,
} from "@/lib/upload/imageValidation";
import {
  InvalidMediaError,
  MAX_VIDEO_BYTES,
  validateVideoFile,
} from "@/lib/upload/mediaValidation";

export type DashboardMediaKind = "image" | "video";

export type DashboardMediaUploaderProps = {
  token: string;
  value: string;
  uploadFn: (token: string, file: File) => Promise<string>;
  onChange: (url: string) => void;
  /** Tipo de medio aceptado. Default: "image". */
  kind?: DashboardMediaKind;
  /** Texto de la etiqueta del campo. */
  label?: string;
  /** Texto del hint inferior. */
  hint?: string;
  /** Si true, muestra el fallback "Pegar URL manualmente". */
  allowManualUrl?: boolean;
  /** Etiqueta de contexto (logs / analytics). */
  context?: string;
  onError?: (msg: string) => void;
  disabled?: boolean;
  /** Color de acento (blue | indigo | cyan). */
  accent?: "blue" | "indigo" | "cyan";
};

type Status =
  | { kind: "idle" }
  | { kind: "uploading"; progress: number }
  | { kind: "error"; message: string };

const IMAGE_ACCEPT = "image/png,image/jpeg,image/gif,image/webp,image/avif";
const VIDEO_ACCEPT = "video/mp4,video/webm,video/quicktime";

export function DashboardMediaUploader({
  token,
  value,
  uploadFn,
  onChange,
  kind = "image",
  label,
  hint,
  allowManualUrl = true,
  context = "media",
  onError,
  disabled = false,
  accent = "cyan",
}: DashboardMediaUploaderProps) {
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
        if (kind === "image") {
          await validateImageFile(file);
        } else {
          await validateVideoFile(file);
        }
        const url = await uploadFn(token, file);
        onChange(url);
        setManualUrl(url);
        setStatus({ kind: "idle" });
      } catch (err) {
        const known =
          err instanceof InvalidImageError || err instanceof InvalidMediaError;
        const message = known
          ? (err as Error).message
          : err instanceof Error
            ? err.message
            : "No se pudo subir el archivo";
        setStatus({ kind: "error", message });
        onError?.(message);
      }
    },
    [token, uploadFn, onChange, onError, kind]
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
        if (!file) continue;
        if (kind === "image" && file.type.startsWith("image/")) {
          e.preventDefault();
          void handleUpload(file);
          return;
        }
        if (kind === "video" && file.type.startsWith("video/")) {
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
  const hasMedia =
    !!value && (value.startsWith("http://") || value.startsWith("https://"));
  const sizeLimitMb = Math.floor(
    (kind === "image" ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES) / 1024 / 1024
  );
  const accept = kind === "image" ? IMAGE_ACCEPT : VIDEO_ACCEPT;

  const accentDropClass = {
    blue: "border-blue-400 bg-blue-500/10",
    indigo: "border-indigo-400 bg-indigo-500/10",
    cyan: "border-cyan-400 bg-cyan-500/10",
  }[accent];
  const accentHoverClass = {
    blue: "hover:border-blue-400/70",
    indigo: "hover:border-indigo-400/70",
    cyan: "hover:border-cyan-400/70",
  }[accent];
  const accentButtonClass = {
    blue: "bg-blue-600/90 hover:bg-blue-500",
    indigo: "bg-indigo-600/90 hover:bg-indigo-500",
    cyan: "bg-cyan-600/90 hover:bg-cyan-500",
  }[accent];
  const accentSpinnerClass = {
    blue: "border-blue-400 border-t-transparent",
    indigo: "border-indigo-400 border-t-transparent",
    cyan: "border-cyan-400 border-t-transparent",
  }[accent];
  const accentTextClass = {
    blue: "text-blue-300",
    indigo: "text-indigo-300",
    cyan: "text-cyan-300",
  }[accent];

  return (
    <div className="space-y-2" data-context={context} data-kind={kind}>
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
        aria-label={`Soltar, pegar o seleccionar ${
          kind === "image" ? "imagen" : "video"
        }`}
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
          accept={accept}
          onChange={onFileInput}
          hidden
          disabled={disabled || isUploading}
        />

        {hasMedia ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative h-32 w-full overflow-hidden rounded-xl border border-slate-600/50 bg-slate-900/60 sm:w-56">
              {kind === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={value}
                  alt={label || "Vista previa"}
                  className="h-full w-full object-cover"
                  onError={() =>
                    setStatus({
                      kind: "error",
                      message:
                        "No se pudo cargar la vista previa. Verifica la URL.",
                    })
                  }
                />
              ) : (
                <video
                  src={value}
                  controls
                  className="h-full w-full object-cover"
                />
              )}
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
              {kind === "image" ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 7.5l-9-5.25-9 5.25m18 0v9l-9 5.25L3 16.5v-9m18 0L12 12.75 3 7.5"
                />
              )}
            </svg>
            <p className="text-base font-semibold text-slate-200">
              {kind === "image"
                ? "Arrastra, pega o selecciona una imagen"
                : "Arrastra, pega o selecciona un video"}
            </p>
            <p className="text-sm text-slate-400">
              {kind === "image"
                ? `PNG / JPEG / GIF / WebP / AVIF — máx. ${sizeLimitMb} MB`
                : `MP4 / WebM / MOV — máx. ${sizeLimitMb} MB`}
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
            <p className="text-base font-semibold text-white">
              Subiendo a S3…
            </p>
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
            placeholder="https://bucket.s3.region.amazonaws.com/banners/..."
            className={`flex-1 rounded-lg border border-slate-600/50 bg-slate-800/50 px-3 py-2.5 text-base text-white outline-none focus:ring-2 ${
              accent === "indigo"
                ? "focus:border-indigo-400 focus:ring-indigo-400/20"
                : accent === "blue"
                  ? "focus:border-blue-400 focus:ring-blue-400/20"
                  : "focus:border-cyan-400 focus:ring-cyan-400/20"
            }`}
            disabled={disabled}
          />
          <button
            type="button"
            onClick={onManualSubmit}
            disabled={disabled || !manualUrl.trim()}
            className={`rounded-lg px-4 py-2.5 text-base font-semibold text-white transition disabled:opacity-50 ${accentButtonClass}`}
          >
            Usar
          </button>
        </div>
      )}

      {hint && <p className="text-sm text-slate-400">{hint}</p>}
    </div>
  );
}

export default DashboardMediaUploader;

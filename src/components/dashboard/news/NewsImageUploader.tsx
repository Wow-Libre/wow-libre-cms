"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  InvalidImageError,
  MAX_IMAGE_BYTES,
  validateImageFile,
} from "@/lib/upload/imageValidation";
import { uploadNewsImage } from "@/lib/upload/newsImageUpload";

export type NewsImageUploaderProps = {
  token: string;
  value: string;
  onChange: (url: string) => void;
  /** Texto del botón/banner. Default: "Imagen de la noticia". */
  label?: string;
  /** Si true, muestra el fallback "O pegar URL" para power users. */
  allowManualUrl?: boolean;
  /** Etiqueta del contexto (solo para analytics/log). */
  context?: string;
  onError?: (msg: string) => void;
  disabled?: boolean;
};

type Status =
  | { kind: "idle" }
  | { kind: "uploading"; progress: number }
  | { kind: "error"; message: string };

const SIZE_LIMIT_MB = Math.floor(MAX_IMAGE_BYTES / 1024 / 1024);

const ACCEPT_MIMES = "image/png,image/jpeg,image/gif,image/webp,image/avif";

export function NewsImageUploader({
  token,
  value,
  onChange,
  label = "Imagen de la noticia",
  allowManualUrl = true,
  context = "news",
  onError,
  disabled = false,
}: NewsImageUploaderProps) {
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
          // validateImageFile ya lanza si no coincide; defensa redundante:
          throw new InvalidImageError(
            `El archivo parece ${mime} pero fue enviado como ${file.type}.`,
          );
        }
        const url = await uploadNewsImage(token, file);
        onChange(url);
        setManualUrl(url);
        setStatus({ kind: "idle" });
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "No se pudo subir la imagen";
        setStatus({ kind: "error", message });
        onError?.(message);
      }
    },
    [token, onChange, onError],
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

  const onManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
  const hasImage = !!value && (value.startsWith("http://") || value.startsWith("https://"));

  return (
    <div className="space-y-2" data-context={context}>
      <label className="block text-sm font-semibold text-slate-200">{label}</label>

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
          "relative rounded-2xl border-2 border-dashed p-4 transition-all outline-none",
          dragOver
            ? "border-blue-400 bg-blue-500/10"
            : "border-slate-600/50 bg-slate-800/40 hover:border-blue-400/70",
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
            <div className="relative h-32 w-full overflow-hidden rounded-xl border border-slate-600/50 sm:w-48">
              {/* El src es una URL pública controlada por el bucket; detrás
                  del proxy de Next.js /images se sanitiza al servir. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt={label}
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
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-400 border-t-transparent" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <p className="break-all text-xs text-slate-400">{value}</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    inputRef.current?.click();
                  }}
                  disabled={disabled || isUploading}
                  className="rounded-lg bg-blue-600/90 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
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
                  className="rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
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
                    className="rounded-lg border border-slate-600/60 bg-slate-700/50 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 disabled:opacity-50"
                  >
                    {showManual ? "Ocultar URL" : "Editar URL"}
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-slate-500"
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
            <p className="text-sm font-semibold text-slate-200">
              Arrastra, pega o selecciona una imagen
            </p>
            <p className="text-xs text-slate-400">
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
                className="mt-1 text-xs font-semibold text-blue-300 underline-offset-2 hover:underline"
              >
                o pegar una URL manualmente
              </button>
            )}
          </div>
        )}

        {isUploading && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl bg-slate-900/40 backdrop-blur-sm">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-400 border-t-transparent" />
            <p className="text-sm font-semibold text-white">Subiendo a S3…</p>
          </div>
        )}
      </div>

      {status.kind === "error" && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {status.message}
        </p>
      )}

      {allowManualUrl && showManual && (
        <form onSubmit={onManualSubmit} className="flex gap-2">
          <input
            type="url"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="https://bucket.s3.region.amazonaws.com/news/..."
            className="flex-1 rounded-lg border border-slate-600/50 bg-slate-800/50 px-3 py-2 text-sm text-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
            disabled={disabled}
          />
          <button
            type="submit"
            disabled={disabled || !manualUrl.trim()}
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
          >
            Usar
          </button>
        </form>
      )}

      <p className="text-xs text-slate-500">
        Sube la imagen directamente — no hace falta pegar URLs externas. El
        contenido se valida por magic bytes antes de enviarlo a S3.
      </p>
    </div>
  );
}

export default NewsImageUploader;

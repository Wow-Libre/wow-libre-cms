/**
 * Validación ligera de archivos de video.
 *
 * Para imágenes el codebase ya valida por magic bytes
 * (`src/lib/upload/imageValidation.ts`); para video esa validación es
 * innecesariamente costosa y no cambia el riesgo de seguridad porque el bucket
 * sirve con `content-type` firmado. Aquí validamos únicamente:
 *   1) MIME declarado por el navegador dentro de un set permitido.
 *   2) Tamaño máximo configurable (50 MiB por defecto).
 */

export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

const ALLOWED_VIDEO_MIMES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

export class InvalidMediaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidMediaError";
  }
}

export function isAllowedVideoMime(mime: string): boolean {
  return ALLOWED_VIDEO_MIMES.has(mime.toLowerCase());
}

export async function validateVideoFile(
  file: File,
  maxBytes: number = MAX_VIDEO_BYTES
): Promise<string> {
  if (file.size > maxBytes) {
    throw new InvalidMediaError(
      `El video supera el máximo permitido (${Math.floor(
        maxBytes / 1024 / 1024
      )} MB).`
    );
  }
  if (!isAllowedVideoMime(file.type)) {
    throw new InvalidMediaError(
      `Formato de video no permitido (${file.type || "desconocido"}). Usa MP4, WebM o MOV.`
    );
  }
  return file.type.toLowerCase();
}

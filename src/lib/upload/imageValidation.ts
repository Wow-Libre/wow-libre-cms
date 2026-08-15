/**
 * Validación de imágenes que NO confíe en el MIME declarado por el navegador.
 * Verifica magic bytes contra los formatos web habituales.
 *
 * Devuelve el MIME real si el archivo se reconoce, o null si no es un formato
 * permitido. Esto evita que un atacante suba un SVG/XML disfrazado de PNG
 * ni un ejecutable etiquetado como JPEG.
 */

const MAGIC: Array<{ mime: string; bytes: number[]; mask?: number[] }> = [
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/gif", bytes: [0x47, 0x49, 0x46, 0x38] },
  { mime: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46] }, // "RIFF"; se valida "WEBP" en offset 8
  { mime: "image/avif", bytes: [0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66] }, // "ftypavif"
];

const ALLOWED_MIMES = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/avif",
]);

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MiB

export function isAllowedImageMime(mime: string): boolean {
  return ALLOWED_MIMES.has(mime.toLowerCase());
}

export async function detectImageMime(file: File): Promise<string | null> {
  const slice = file.slice(0, 16);
  const buf = new Uint8Array(await slice.arrayBuffer());
  if (buf.length < 4) return null;

  for (const sig of MAGIC) {
    if (buf.length < sig.bytes.length) continue;
    let ok = true;
    for (let i = 0; i < sig.bytes.length; i++) {
      if (buf[i] !== sig.bytes[i]) {
        ok = false;
        break;
      }
    }
    if (!ok) continue;
    if (sig.mime === "image/webp") {
      // RIFF....WEBP (bytes 8-11)
      if (buf.length < 12) return null;
      const tag = String.fromCharCode(buf[8], buf[9], buf[10], buf[11]);
      if (tag !== "WEBP") return null;
    }
    if (sig.mime === "image/avif") {
      // Ya validamos "ftypavif" en los primeros 8 bytes
    }
    return sig.mime;
  }

  return null;
}

export class InvalidImageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidImageError";
  }
}

export async function validateImageFile(file: File): Promise<string> {
  if (file.size > MAX_IMAGE_BYTES) {
    throw new InvalidImageError(
      `La imagen supera el máximo permitido (${Math.floor(MAX_IMAGE_BYTES / 1024 / 1024)} MB).`,
    );
  }
  if (!isAllowedImageMime(file.type)) {
    throw new InvalidImageError(
      `Formato no permitido (${file.type || "desconocido"}). Usa PNG, JPEG, GIF, WebP o AVIF.`,
    );
  }
  const realMime = await detectImageMime(file);
  if (!realMime) {
    throw new InvalidImageError(
      "El archivo no parece una imagen válida (magic bytes no coinciden).",
    );
  }
  if (realMime !== file.type.toLowerCase()) {
    throw new InvalidImageError(
      `El tipo declarado (${file.type}) no coincide con el contenido real (${realMime}).`,
    );
  }
  return realMime;
}

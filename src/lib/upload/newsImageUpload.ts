/**
 * Sube imágenes de noticias a S3 reutilizando el endpoint de presign
 * de social (`/api/social/media/presign`) con el prefijo `news/`.
 *
 * Esto evita tener que desplegar un nuevo endpoint en el backend Wow Core
 * dedicado a news cuando el bucket y la política de firma son los mismos.
 */
import { uploadImageFile } from "@/lib/upload/presignedMediaUpload";

export const NEWS_S3_PREFIX = "news/";

export async function uploadNewsImage(
  token: string,
  file: File
): Promise<string> {
  return uploadImageFile(token, file, { prefix: NEWS_S3_PREFIX });
}

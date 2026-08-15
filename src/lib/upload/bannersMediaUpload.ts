/**
 * Sube el media de los banners publicitarios (imágenes o videos) a S3
 * reutilizando el endpoint de presign de social (`/api/social/media/presign`)
 * con el prefijo `banners/`.
 *
 * El prefijo segrega el contenido del bucket. La validación del lado cliente
 * (MIME + tamaño) se hace en `DashboardMediaUploader` antes de invocar este
 * helper; aquí solo se delega en `uploadImageFile`, que aunque se llama
 * "Image" en realidad sube cualquier blob — el `content_type` viaja en el
 * presign y S3 lo respeta al servir.
 */
import { uploadImageFile } from "@/lib/upload/presignedMediaUpload";

export const BANNERS_S3_PREFIX = "banners/";

export async function uploadBannersMedia(
  token: string,
  file: File
): Promise<string> {
  return uploadImageFile(token, file, { prefix: BANNERS_S3_PREFIX });
}

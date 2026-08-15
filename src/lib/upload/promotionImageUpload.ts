/**
 * Sube imágenes de promociones (carousel principal del dashboard de promos)
 * a S3 reutilizando el endpoint de presign de social
 * (`/api/social/media/presign`) con el prefijo `promotions/`.
 */
import { uploadImageFile } from "@/lib/upload/presignedMediaUpload";

export const PROMOTION_S3_PREFIX = "promotions/";

export async function uploadPromotionImage(
  token: string,
  file: File,
): Promise<string> {
  return uploadImageFile(token, file, { prefix: PROMOTION_S3_PREFIX });
}

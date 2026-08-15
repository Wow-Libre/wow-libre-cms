/**
 * Sube imágenes del banner "Promociona tu reino" a S3 reutilizando el endpoint
 * de presign de social (`/api/social/media/presign`) con el prefijo
 * `advertising-realm/`.
 *
 * Mismo patrón que `battlePassImageUpload.ts`, `interstitialImageUpload.ts`
 * y `teleportImageUpload.ts`.
 */
import { uploadImageFile } from "@/lib/upload/presignedMediaUpload";

export const ADVERTISING_REALM_S3_PREFIX = "advertising-realm/";

export async function uploadAdvertisingRealmImage(
  token: string,
  file: File,
): Promise<string> {
  return uploadImageFile(token, file, { prefix: ADVERTISING_REALM_S3_PREFIX });
}

/**
 * Sube imágenes de interstitial a S3 reutilizando el endpoint de presign
 * de social (`/api/social/media/presign`) con el prefijo `interstitial/`.
 *
 * Mismo patrón que `newsImageUpload.ts` y `votesImageUpload.ts`; solo cambia
 * el prefijo para mantener segregado el contenido del bucket por sección.
 */
import { uploadImageFile } from "@/lib/upload/presignedMediaUpload";

export const INTERSTITIAL_S3_PREFIX = "interstitial/";

export async function uploadInterstitialImage(
  token: string,
  file: File
): Promise<string> {
  return uploadImageFile(token, file, { prefix: INTERSTITIAL_S3_PREFIX });
}

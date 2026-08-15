/**
 * Sube imágenes de teleports a S3 reutilizando el endpoint de presign
 * de social (`/api/social/media/presign`) con el prefijo `teleports/`.
 *
 * Mismo patrón que `battlePassImageUpload.ts` e `interstitialImageUpload.ts`:
 * solo cambia el prefijo para mantener segregado el contenido del bucket
 * por sección.
 */
import { uploadImageFile } from "@/lib/upload/presignedMediaUpload";

export const TELEPORT_S3_PREFIX = "teleports/";

export async function uploadTeleportImage(
  token: string,
  file: File,
): Promise<string> {
  return uploadImageFile(token, file, { prefix: TELEPORT_S3_PREFIX });
}

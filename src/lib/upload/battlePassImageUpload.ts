/**
 * Sube imágenes del pase de batalla a S3 reutilizando el endpoint de presign
 * de social (`/api/social/media/presign`) con el prefijo `battle-pass/`.
 *
 * Mismo patrón que `interstitialImageUpload.ts`: solo cambia el prefijo para
 * mantener segregado el contenido del bucket por sección.
 */
import { uploadImageFile } from "@/lib/upload/presignedMediaUpload";

export const BATTLE_PASS_S3_PREFIX = "battle-pass/";

export async function uploadBattlePassImage(
  token: string,
  file: File,
): Promise<string> {
  return uploadImageFile(token, file, { prefix: BATTLE_PASS_S3_PREFIX });
}

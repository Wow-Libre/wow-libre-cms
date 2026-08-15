/**
 * Sube imágenes de plataformas de votación a S3 reutilizando el endpoint de
 * presign de social (`/api/social/media/presign`) con el prefijo `votes/`.
 *
 * Mismo patrón que `newsImageUpload.ts`; solo cambia el prefijo para mantener
 * segregado el contenido del bucket por sección.
 */
import { uploadImageFile } from "@/lib/upload/presignedMediaUpload";

export const VOTES_S3_PREFIX = "votes/";

export async function uploadVotesImage(
  token: string,
  file: File
): Promise<string> {
  return uploadImageFile(token, file, { prefix: VOTES_S3_PREFIX });
}

import { BASE_URL_CORE } from "@/configs/configs";
import { GenericResponseDto, InternalServerError } from "@/dto/generic";
import { v4 as uuidv4 } from "uuid";

export type NewsPresignPayload = {
  filename: string;
  content_type: string;
  byte_size: number;
};

export type NewsPresignResult = {
  upload_url: string;
  public_url: string;
};

function normalize(raw: Record<string, unknown>): NewsPresignResult {
  return {
    upload_url: String(raw.upload_url ?? raw.uploadUrl ?? ""),
    public_url: String(raw.public_url ?? raw.publicUrl ?? ""),
  };
}

/**
 * Pide al backend Wow Core una URL presignada para subir una imagen de noticia.
 * El backend debe exponer `POST /api/news/media/presign` que valide el token,
 * el content-type y el tamaño, y devuelva `{ upload_url, public_url }`.
 *
 * Si Wow Core no tiene ese endpoint todavía, el caller recibirá
 * `InternalServerError(404)` y la UI lo reportará al admin.
 */
export async function requestNewsImagePresign(
  token: string,
  payload: NewsPresignPayload
): Promise<NewsPresignResult> {
  const transactionId = uuidv4();
  const response = await fetch(`${BASE_URL_CORE}/api/news/media/presign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      transaction_id: transactionId,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      filename: payload.filename,
      content_type: payload.content_type,
      byte_size: payload.byte_size,
    }),
  });

  if (!response.ok) {
    const err = (await response.json()
      .catch(() => null)) as GenericResponseDto<void> | null;
    throw new InternalServerError(
      err?.message ?? response.statusText,
      response.status,
      transactionId
    );
  }

  const body = (await response.json()) as GenericResponseDto<Record<string, unknown>>;
  if (!body.data) {
    throw new Error("Respuesta inválida del servidor al presignar imagen de noticia");
  }
  return normalize(body.data);
}

/**
 * Sube el binario a la URL presignada. Por defecto lo hace a través del
 * proxy `/api/presigned-s3-upload` para sortear CORS en el navegador.
 * Activar `NEXT_PUBLIC_S3_UPLOAD_DIRECT=true` para subir directamente al
 * bucket cuando el CORS ya esté abierto en S3.
 */
export async function uploadNewsImageToPresignedUrl(
  uploadUrl: string,
  file: Blob,
  contentType: string
): Promise<void> {
  const direct =
    typeof window !== "undefined" &&
    process.env.NEXT_PUBLIC_S3_UPLOAD_DIRECT === "true";

  if (typeof window !== "undefined" && !direct) {
    const form = new FormData();
    form.append("uploadUrl", uploadUrl);
    form.append("context", "news");
    const name = file instanceof File ? file.name : "news-image.bin";
    form.append("file", file, name);

    const response = await fetch("/api/presigned-s3-upload", {
      method: "POST",
      body: form,
    });
    if (!response.ok) {
      let detail = response.statusText;
      try {
        const json = (await response.json()) as { message?: string };
        if (json.message) detail = json.message;
      } catch {
        /* ignore */
      }
      throw new Error(detail || `Error al subir imagen: ${response.status}`);
    }
    return;
  }

  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
  });
  if (!response.ok) {
    throw new Error(`Error al subir imagen: ${response.status}`);
  }
}

/**
 * Orquesta el flujo presign + upload y devuelve la URL pública final.
 */
export async function uploadNewsImage(
  token: string,
  file: File
): Promise<string> {
  const presign = await requestNewsImagePresign(token, {
    filename: file.name,
    content_type: file.type || "application/octet-stream",
    byte_size: file.size,
  });
  await uploadNewsImageToPresignedUrl(
    presign.upload_url,
    file,
    file.type || "application/octet-stream"
  );
  return presign.public_url;
}

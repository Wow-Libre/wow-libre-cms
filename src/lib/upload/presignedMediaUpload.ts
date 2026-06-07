import { BASE_URL_CORE } from "@/configs/configs";
import { GenericResponseDto, InternalServerError } from "@/dto/generic";
import { v4 as uuidv4 } from "uuid";

export type PresignPayload = {
  filename: string;
  content_type: string;
  byte_size: number;
};

export type PresignResult = {
  upload_url: string;
  public_url: string;
};

function normalizePresignResponse(raw: Record<string, unknown>): PresignResult {
  return {
    upload_url: String(raw.upload_url ?? raw.uploadUrl ?? ""),
    public_url: String(raw.public_url ?? raw.publicUrl ?? ""),
  };
}

export async function requestMediaPresign(
  token: string,
  payload: PresignPayload
): Promise<PresignResult> {
  const transactionId = uuidv4();
  const response = await fetch(`${BASE_URL_CORE}/api/social/media/presign`, {
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
    const err = (await response.json().catch(() => null)) as GenericResponseDto<void> | null;
    throw new InternalServerError(
      err?.message ?? response.statusText,
      response.status,
      transactionId
    );
  }

  const body = (await response.json()) as GenericResponseDto<Record<string, unknown>>;
  if (!body.data) {
    throw new Error("Respuesta inválida del servidor al presignar media");
  }
  return normalizePresignResponse(body.data);
}

export async function uploadFileToPresignedUrl(
  uploadUrl: string,
  file: Blob,
  contentType: string
): Promise<void> {
  const direct =
    typeof window !== "undefined" &&
    process.env.NEXT_PUBLIC_S3_UPLOAD_DIRECT === "true";

  if (typeof window !== "undefined" && !direct) {
    const formData = new FormData();
    formData.append("uploadUrl", uploadUrl);
    const name = file instanceof File ? file.name : "upload.bin";
    formData.append("file", file, name);

    const response = await fetch("/api/presigned-s3-upload", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      let detail = response.statusText;
      try {
        const json = (await response.json()) as { message?: string };
        if (json.message) detail = json.message;
      } catch {
        /* ignore */
      }
      throw new Error(detail || `Error al subir archivo: ${response.status}`);
    }
    return;
  }

  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
  });
  if (!response.ok) {
    throw new Error(`Error al subir archivo: ${response.status}`);
  }
}

export async function uploadImageFile(
  token: string,
  file: File
): Promise<string> {
  const presign = await requestMediaPresign(token, {
    filename: file.name,
    content_type: file.type || "application/octet-stream",
    byte_size: file.size,
  });
  await uploadFileToPresignedUrl(presign.upload_url, file, file.type || "application/octet-stream");
  return presign.public_url;
}

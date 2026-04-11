import { GenericResponseDto, InternalServerError } from "@/dto/generic";
import { v4 as uuidv4 } from "uuid";
import { getWowCoreFetchBase } from "./wowCoreClientBase";
import type {
  LikeToggleResult,
  PresignRequest,
  PresignResponse,
  SocialComment,
  SocialPost,
} from "../types";
import {
  extractPagedComments,
  extractPagedPosts,
  normalizeLikeToggleResult,
  normalizePresignResponse,
  normalizeSocialComment,
  normalizeSocialPost,
} from "./socialFeedMappers";

/** Rutas bajo Wow Core (`/core/api/...`). En el navegador usa proxy mismo-origen. */
function coreApi(path: string): string {
  const base = getWowCoreFetchBase();
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}

const jsonHeaders = (token: string, transactionId: string) => ({
  "Content-Type": "application/json",
  transaction_id: transactionId,
  Authorization: `Bearer ${token}`,
});

async function parseJsonSafe(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

export type FeedPageResult = {
  posts: SocialPost[];
  hasMore: boolean;
};

/**
 * Lista publicaciones (Wow Core: `GET /api/social/posts`).
 * Soporta `data` como array o como página tipo Spring (`content`, `last`, `totalPages`).
 */
export async function getFeedPosts(
  token: string,
  page: number,
  size: number
): Promise<FeedPageResult> {
  const transactionId = uuidv4();
  const url = `${coreApi("/api/social/posts")}?page=${page}&size=${size}`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: jsonHeaders(token, transactionId),
    });
    if (response.status === 204) return { posts: [], hasMore: false };
    if (!response.ok) {
      const err = (await parseJsonSafe(response)) as GenericResponseDto<void> | null;
      throw new InternalServerError(
        err?.message ?? response.statusText,
        response.status,
        transactionId
      );
    }
    const body = (await parseJsonSafe(response)) as GenericResponseDto<unknown> | null;
    const { items, hasMore } = extractPagedPosts(body, size, normalizeSocialPost);
    return { posts: items, hasMore };
  } catch (error: unknown) {
    if (error instanceof InternalServerError) throw error;
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Please try again later, services are not available.");
    }
    throw error instanceof Error
      ? error
      : new Error(`Unknown error - TransactionId: ${transactionId}`);
  }
}

/**
 * Crea publicación (`POST /api/social/posts`).
 * Cuerpo según spec: `media_urls`. En Wow Core, si el DTO Java solo expone `mediaUrls`, usa `@JsonProperty("media_urls")` o `@JsonAlias`.
 */
export async function createPost(
  token: string,
  content: string,
  mediaUrls: string[]
): Promise<SocialPost> {
  const transactionId = uuidv4();
  try {
    const response = await fetch(coreApi("/api/social/posts"), {
      method: "POST",
      headers: jsonHeaders(token, transactionId),
      body: JSON.stringify({
        content,
        media_urls: mediaUrls,
      }),
    });
    if (!response.ok) {
      const err = (await parseJsonSafe(response)) as GenericResponseDto<void> | null;
      throw new InternalServerError(
        err?.message ?? response.statusText,
        response.status,
        transactionId
      );
    }
    const body = (await parseJsonSafe(response)) as GenericResponseDto<unknown> | null;
    const raw = body?.data;
    if (raw == null) {
      throw new Error("Invalid response from server");
    }
    return normalizeSocialPost(raw);
  } catch (error: unknown) {
    if (error instanceof InternalServerError) throw error;
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Please try again later, services are not available.");
    }
    throw error instanceof Error
      ? error
      : new Error(`Unknown error - TransactionId: ${transactionId}`);
  }
}

export async function togglePostLike(
  token: string,
  postId: number
): Promise<LikeToggleResult> {
  const transactionId = uuidv4();
  try {
    const response = await fetch(
      coreApi(`/api/social/posts/${postId}/like`),
      {
        method: "POST",
        headers: jsonHeaders(token, transactionId),
      }
    );
    if (!response.ok) {
      const err = (await parseJsonSafe(response)) as GenericResponseDto<void> | null;
      throw new InternalServerError(
        err?.message ?? response.statusText,
        response.status,
        transactionId
      );
    }
    const body = (await parseJsonSafe(response)) as GenericResponseDto<unknown> | null;
    const raw = body?.data;
    if (raw == null) {
      throw new Error("Invalid response from server");
    }
    return normalizeLikeToggleResult(raw);
  } catch (error: unknown) {
    if (error instanceof InternalServerError) throw error;
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Please try again later, services are not available.");
    }
    throw error instanceof Error
      ? error
      : new Error(`Unknown error - TransactionId: ${transactionId}`);
  }
}

export async function getPostComments(
  token: string,
  postId: number,
  page: number,
  size: number
): Promise<SocialComment[]> {
  const transactionId = uuidv4();
  const url = `${coreApi(`/api/social/posts/${postId}/comments`)}?page=${page}&size=${size}`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: jsonHeaders(token, transactionId),
    });
    if (response.status === 204) return [];
    if (!response.ok) {
      const err = (await parseJsonSafe(response)) as GenericResponseDto<void> | null;
      throw new InternalServerError(
        err?.message ?? response.statusText,
        response.status,
        transactionId
      );
    }
    const body = (await parseJsonSafe(response)) as GenericResponseDto<unknown> | null;
    const { items } = extractPagedComments(body, size, normalizeSocialComment);
    return items;
  } catch (error: unknown) {
    if (error instanceof InternalServerError) throw error;
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Please try again later, services are not available.");
    }
    throw error instanceof Error
      ? error
      : new Error(`Unknown error - TransactionId: ${transactionId}`);
  }
}

export async function createComment(
  token: string,
  postId: number,
  content: string
): Promise<SocialComment> {
  const transactionId = uuidv4();
  try {
    const response = await fetch(
      coreApi(`/api/social/posts/${postId}/comments`),
      {
        method: "POST",
        headers: jsonHeaders(token, transactionId),
        body: JSON.stringify({ content }),
      }
    );
    if (!response.ok) {
      const err = (await parseJsonSafe(response)) as GenericResponseDto<void> | null;
      throw new InternalServerError(
        err?.message ?? response.statusText,
        response.status,
        transactionId
      );
    }
    const body = (await parseJsonSafe(response)) as GenericResponseDto<unknown> | null;
    const raw = body?.data;
    if (raw == null) {
      throw new Error("Invalid response from server");
    }
    return normalizeSocialComment(raw);
  } catch (error: unknown) {
    if (error instanceof InternalServerError) throw error;
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Please try again later, services are not available.");
    }
    throw error instanceof Error
      ? error
      : new Error(`Unknown error - TransactionId: ${transactionId}`);
  }
}

/** Presigned upload (Wow Core → S3). */
export async function requestMediaPresign(
  token: string,
  payload: PresignRequest
): Promise<PresignResponse> {
  const transactionId = uuidv4();
  try {
    const response = await fetch(coreApi("/api/social/media/presign"), {
      method: "POST",
      headers: jsonHeaders(token, transactionId),
      body: JSON.stringify({
        filename: payload.filename,
        content_type: payload.content_type,
        byte_size: payload.byte_size,
      }),
    });
    if (!response.ok) {
      const err = (await parseJsonSafe(response)) as GenericResponseDto<void> | null;
      throw new InternalServerError(
        err?.message ?? response.statusText,
        response.status,
        transactionId
      );
    }
    const body = (await parseJsonSafe(response)) as GenericResponseDto<unknown> | null;
    const raw = body?.data;
    if (raw == null) {
      throw new Error("Invalid response from server");
    }
    return normalizePresignResponse(raw);
  } catch (error: unknown) {
    if (error instanceof InternalServerError) throw error;
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Please try again later, services are not available.");
    }
    throw error instanceof Error
      ? error
      : new Error(`Unknown error - TransactionId: ${transactionId}`);
  }
}

/**
 * Sube el binario a la URL presignada.
 * En el **navegador** usa por defecto `POST /api/presigned-s3-upload` para evitar CORS
 * en el PUT directo a S3 (mismo patrón que subir desde backend). Desactivar con
 * `NEXT_PUBLIC_S3_UPLOAD_DIRECT=true` si el bucket ya tiene CORS para tu origen.
 */
export async function uploadFileToPresignedUrl(
  uploadUrl: string,
  file: Blob,
  contentType: string
): Promise<void> {
  const direct =
    typeof window !== "undefined" &&
    process.env.NEXT_PUBLIC_S3_UPLOAD_DIRECT === "true";

  if (typeof window !== "undefined" && !direct) {
    const fd = new FormData();
    fd.append("uploadUrl", uploadUrl);
    const name = file instanceof File ? file.name : "upload.bin";
    fd.append("file", file, name);

    const res = await fetch("/api/presigned-s3-upload", {
      method: "POST",
      body: fd,
    });
    if (!res.ok) {
      let detail = res.statusText;
      try {
        const j = (await res.json()) as { message?: string };
        if (j.message) detail = j.message;
      } catch {
        /* ignore */
      }
      throw new Error(detail || `Upload failed: ${res.status}`);
    }
    return;
  }

  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": contentType,
    },
  });
  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
  }
}

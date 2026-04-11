import type {
  LikeToggleResult,
  PresignResponse,
  SocialComment,
  SocialPost,
} from "../types";

/** Objeto plano devuelto por Wow Core (Jackson suele usar camelCase; el spec usa snake_case). */
type UnknownRecord = Record<string, unknown>;

function num(v: unknown, fallback = 0): number {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isNaN(n) ? fallback : n;
  }
  return fallback;
}

function str(v: unknown): string {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

function bool(v: unknown): boolean {
  return v === true || v === "true";
}

function strArr(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string");
}

function firstStringArray(...candidates: unknown[]): string[] {
  for (const v of candidates) {
    const a = strArr(v);
    if (a.length > 0) return a;
  }
  return [];
}

/**
 * Normaliza una publicación desde la respuesta de `GET/POST .../api/social/posts`.
 */
export function normalizeSocialPost(raw: unknown): SocialPost {
  const r = raw as UnknownRecord;
  const media = firstStringArray(r.media_urls, r.mediaUrls);

  return {
    id: num(r.id),
    user_id: num(r.user_id ?? r.userId),
    author_username: str(r.author_username ?? r.authorUsername),
    author_avatar: str(r.author_avatar ?? r.authorAvatar),
    author_premium: bool(r.author_premium ?? r.authorPremium),
    content: str(r.content),
    media_urls: media,
    likes_count: num(r.likes_count ?? r.likesCount),
    comments_count: num(r.comments_count ?? r.commentsCount),
    liked_by_me: bool(r.liked_by_me ?? r.likedByMe),
    created_at: str(r.created_at ?? r.createdAt),
  };
}

export function normalizeSocialComment(raw: unknown): SocialComment {
  const r = raw as UnknownRecord;
  return {
    id: num(r.id),
    user_id: num(r.user_id ?? r.userId),
    author_username: str(r.author_username ?? r.authorUsername),
    author_avatar: str(r.author_avatar ?? r.authorAvatar),
    content: str(r.content),
    created_at: str(r.created_at ?? r.createdAt),
  };
}

export function normalizeLikeToggleResult(raw: unknown): LikeToggleResult {
  const r = raw as UnknownRecord;
  return {
    liked: bool(r.liked ?? r.isLiked ?? r.like),
    likes_count: num(r.likes_count ?? r.likesCount),
  };
}

export function normalizePresignResponse(raw: unknown): PresignResponse {
  const r = raw as UnknownRecord;
  return {
    upload_url: str(r.upload_url ?? r.uploadUrl),
    public_url: str(r.public_url ?? r.publicUrl),
    key: str(r.key),
    expires_in_seconds: num(r.expires_in_seconds ?? r.expiresInSeconds, 300),
  };
}

export type PagedExtract<T> = {
  items: T[];
  /** Si el core no envía metadatos de página, se infiere con pageSize */
  hasMore: boolean;
};

/**
 * Extrae lista y “hay más páginas” desde `GenericResponseDto` o estructuras tipo Spring `Page`.
 */
export function extractPagedPosts(
  body: unknown,
  pageSize: number,
  normalize: (row: unknown) => SocialPost
): PagedExtract<SocialPost> {
  const empty: PagedExtract<SocialPost> = { items: [], hasMore: false };
  if (body == null || typeof body !== "object") return empty;

  const root = body as UnknownRecord;
  const data = root.data;

  if (Array.isArray(data)) {
    const items = data.map(normalize);
    return {
      items,
      hasMore: items.length >= pageSize,
    };
  }

  if (data && typeof data === "object" && !Array.isArray(data)) {
    const d = data as UnknownRecord;
    const rawList = d.content ?? d.items;
    if (Array.isArray(rawList)) {
      const items = rawList.map(normalize);
      if (typeof d.last === "boolean") {
        return { items, hasMore: !d.last };
      }
      const totalPages = num(d.totalPages);
      const number = num(d.number);
      if (totalPages > 0) {
        return { items, hasMore: number < totalPages - 1 };
      }
      return { items, hasMore: items.length >= pageSize };
    }
  }

  return empty;
}

export function extractPagedComments(
  body: unknown,
  pageSize: number,
  normalize: (row: unknown) => SocialComment
): PagedExtract<SocialComment> {
  const empty: PagedExtract<SocialComment> = { items: [], hasMore: false };
  if (body == null || typeof body !== "object") return empty;

  const root = body as UnknownRecord;
  const data = root.data;

  if (Array.isArray(data)) {
    const items = data.map(normalize);
    return { items, hasMore: items.length >= pageSize };
  }

  if (data && typeof data === "object" && !Array.isArray(data)) {
    const d = data as UnknownRecord;
    const rawList = d.content ?? d.items;
    if (Array.isArray(rawList)) {
      const items = rawList.map(normalize);
      if (typeof d.last === "boolean") {
        return { items, hasMore: !d.last };
      }
      const totalPages = num(d.totalPages);
      const number = num(d.number);
      if (totalPages > 0) {
        return { items, hasMore: number < totalPages - 1 };
      }
      return { items, hasMore: items.length >= pageSize };
    }
  }

  return empty;
}

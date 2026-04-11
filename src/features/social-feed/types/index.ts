/** Contrato alineado con `docs/social-feed-backend-spec.md` */

export interface SocialPost {
  id: number;
  user_id: number;
  author_username: string;
  author_avatar: string;
  author_premium: boolean;
  content: string;
  media_urls: string[];
  likes_count: number;
  comments_count: number;
  liked_by_me: boolean;
  created_at: string;
}

export interface SocialComment {
  id: number;
  user_id: number;
  author_username: string;
  author_avatar: string;
  content: string;
  created_at: string;
}

export interface LikeToggleResult {
  liked: boolean;
  likes_count: number;
}

export interface PresignRequest {
  filename: string;
  content_type: string;
  byte_size: number;
}

export interface PresignResponse {
  upload_url: string;
  public_url: string;
  key: string;
  expires_in_seconds: number;
}

export type NewsStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export const NEWS_STATUS: NewsStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];

export const DEFAULT_NEWS_STATUS: NewsStatus = "DRAFT";

export interface NewsModel {
  id: number;
  title: string;
  sub_title: string;
  img_url: string;
  author: string;
  created_at: string;
  /** Estado editorial. Si el backend no lo soporta, se omite en el payload. */
  status?: NewsStatus;
}

export type NewsStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface NewsModel {
  id: number;
  title: string;
  sub_title: string;
  img_url: string;
  author: string;
  created_at: string;
  /**
   * Futuro: estado editorial. El backend Wow Core aún no lo persiste,
   * así que el frontend lo trata como opcional. Si llega del backend,
   * se respeta; si no, se asume `PUBLISHED`.
   */
  status?: NewsStatus;
}

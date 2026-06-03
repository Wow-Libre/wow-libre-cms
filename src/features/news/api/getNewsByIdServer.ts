import { getNewsById } from "@/api/news";
import type { NewsSectionsDto } from "@/model/NewsSections";
import { cache } from "react";

/** Deduplicated server fetch for metadata + JSON-LD on article routes. */
export const getNewsByIdServer = cache(
  async (newsId: number): Promise<NewsSectionsDto | null> => {
    if (!Number.isFinite(newsId) || newsId <= 0) return null;
    try {
      return await getNewsById(newsId);
    } catch (error) {
      console.error("[getNewsByIdServer]", error);
      return null;
    }
  },
);

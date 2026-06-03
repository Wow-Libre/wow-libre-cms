import { getNews } from "@/api/news";
import { getSiteOrigin } from "@/lib/seo/site";
import type { MetadataRoute } from "next";

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  {
    url: "",
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1,
  },
  {
    url: "/news",
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.9,
  },
  {
    url: "/help",
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.5,
  },
  {
    url: "/store",
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = getSiteOrigin();

  const staticEntries = STATIC_ROUTES.map((entry) => ({
    ...entry,
    url: `${origin}${entry.url}`,
  }));

  try {
    const articles = await getNews(100, 0);
    const articleEntries: MetadataRoute.Sitemap = articles.map((item) => ({
      url: `${origin}/news/${item.id}`,
      lastModified: new Date(item.created_at),
      changeFrequency: "weekly" as const,
      priority: 0.75,
    }));

    return [...staticEntries, ...articleEntries];
  } catch (error) {
    console.error("[sitemap] Failed to fetch news:", error);
    return staticEntries;
  }
}

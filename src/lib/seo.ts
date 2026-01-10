import fs from "fs/promises";
import path from "path";
import { Metadata } from "next";
import { SEOConfig, PageSEO, RobotsDirectives } from "@/types/seo";

const SEO_FILE = path.join(process.cwd(), "data", "seo.json");

export async function loadSEOConfig(): Promise<SEOConfig> {
  try {
    const raw = await fs.readFile(SEO_FILE, "utf-8");
    return JSON.parse(raw) as SEOConfig;
  } catch (err) {
    console.warn("SEO config not found, using defaults", err);
    return {
      global: {
        siteName: "Site",
        title: "Site",
        description: "",
        canonicalBase: "https://example.com",
        defaultLocale: "es",
        locales: ["es"],
        defaultOgImage: "",
        robots: { index: true, follow: true },
        sitemapEnabled: true,
      },
      pages: [],
    };
  }
}

export function mergeRobots(globalRobots: RobotsDirectives, page?: PageSEO) {
  const noindex = page?.noindex;
  const nofollow = page?.nofollow;
  return {
    index: noindex === undefined ? globalRobots.index : !noindex,
    follow: nofollow === undefined ? globalRobots.follow : !nofollow,
    googleBot: globalRobots.googleBot,
  } satisfies Metadata["robots"];
}

export function getPageSEO(config: SEOConfig, pathname: string): PageSEO | undefined {
  const normalized = pathname.endsWith("/") && pathname !== "/"
    ? pathname.slice(0, -1)
    : pathname;
  return config.pages.find((p) => p.slug === normalized) || config.pages.find((p) => p.slug === pathname);
}

export function buildMetadata(config: SEOConfig, pathname: string): Metadata {
  const page = getPageSEO(config, pathname);
  const title = page?.title || config.global.title;
  const description = page?.description || config.global.description;
  const ogImage = page?.ogImage || config.global.defaultOgImage;
  const canonical = page?.canonical || `${config.global.canonicalBase}${page?.slug || pathname}`;
  const robots = mergeRobots(config.global.robots, page);

  const alternates = page?.localeAlternate
    ? { languages: page.localeAlternate }
    : {
        languages: Object.fromEntries(
          (config.global.locales || []).map((loc) => [loc, `/${loc}${page?.slug === "/" ? "" : page?.slug || pathname}`])
        ),
      };

  const metadata: Metadata = {
    title: {
      default: title,
      template: `%s | ${config.global.siteName}`,
    },
    description,
    metadataBase: new URL(config.global.canonicalBase),
    alternates: {
      canonical,
      ...alternates,
    },
    robots,
    openGraph: {
      type: "website",
      locale: config.global.defaultLocale,
      url: canonical,
      title: page?.ogTitle || title,
      description: page?.ogDescription || description,
      siteName: config.global.siteName,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      site: config.global.twitterHandle,
      creator: config.global.twitterHandle,
      title: page?.ogTitle || title,
      description: page?.ogDescription || description,
      images: ogImage ? [ogImage] : undefined,
    },
    verification: config.global.verification,
  };

  return metadata;
}

export function buildSchema(page?: PageSEO) {
  if (!page?.schemaJson) return undefined;
  return page.schemaJson;
}

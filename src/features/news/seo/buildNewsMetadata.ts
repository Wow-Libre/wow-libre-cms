import { webProps } from "@/constants/configs";
import { absoluteUrl, truncateMetaDescription } from "@/lib/seo/site";
import type { NewsSectionsDto } from "@/model/NewsSections";
import type { Metadata } from "next";

const NEWS_LIST_TITLE = "Noticias y actualizaciones";
const NEWS_LIST_DESCRIPTION =
  "Últimas noticias, parches, eventos y novedades del servidor privado de World of Warcraft. Mantente al día con la comunidad WoW Libre.";

export function buildNewsListMetadata(): Metadata {
  const canonical = "/news";
  return {
    title: NEWS_LIST_TITLE,
    description: NEWS_LIST_DESCRIPTION,
    keywords: [
      "noticias WoW",
      "actualizaciones servidor WoW",
      "WoW Libre noticias",
      "servidor privado World of Warcraft",
      "parches WoW",
      "eventos WoW",
      "comunidad WoW",
    ],
    alternates: {
      canonical,
      languages: {
        "es-ES": canonical,
        "en-US": canonical,
        "pt-BR": canonical,
      },
    },
    openGraph: {
      type: "website",
      locale: "es_ES",
      url: canonical,
      siteName: webProps.serverName || "WoW Libre",
      title: `${NEWS_LIST_TITLE} | ${webProps.serverName}`,
      description: NEWS_LIST_DESCRIPTION,
      images: [
        {
          url: webProps.homeFeaturesImg,
          width: 1200,
          height: 630,
          alt: `${webProps.serverName} — Noticias del servidor`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${NEWS_LIST_TITLE} | ${webProps.serverName}`,
      description: truncateMetaDescription(NEWS_LIST_DESCRIPTION),
      creator: "@wowlibre",
      site: "@wowlibre",
      images: [webProps.homeFeaturesImg],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function buildNewsArticleMetadata(
  news: NewsSectionsDto,
  newsId: number,
): Metadata {
  const path = `/news/${newsId}`;
  const description = truncateMetaDescription(
    news.sub_title || news.title,
  );
  const ogImage = news.img_url || webProps.homeFeaturesImg;

  return {
    title: news.title,
    description,
    authors: news.author ? [{ name: news.author }] : undefined,
    alternates: {
      canonical: path,
      languages: {
        "es-ES": path,
        "en-US": path,
        "pt-BR": path,
      },
    },
    openGraph: {
      type: "article",
      locale: "es_ES",
      url: path,
      siteName: webProps.serverName || "WoW Libre",
      title: news.title,
      description,
      publishedTime: news.created_at,
      authors: news.author ? [news.author] : undefined,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: news.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: news.title,
      description,
      creator: "@wowlibre",
      site: "@wowlibre",
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function buildNewsListJsonLd() {
  const origin = absoluteUrl("");
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: NEWS_LIST_TITLE,
    description: NEWS_LIST_DESCRIPTION,
    url: absoluteUrl("/news"),
    isPartOf: {
      "@type": "WebSite",
      name: webProps.serverName || "WoW Libre",
      url: origin,
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: webProps.serverName || "WoW Libre",
          item: origin,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: NEWS_LIST_TITLE,
          item: absoluteUrl("/news"),
        },
      ],
    },
  };
}

export function buildNewsArticleJsonLd(news: NewsSectionsDto, newsId: number) {
  const articleUrl = absoluteUrl(`/news/${newsId}`);
  const sectionText = news.sections
    .map((s) => s.content)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return [
    {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: news.title,
      description: news.sub_title,
      image: news.img_url ? [news.img_url] : undefined,
      datePublished: news.created_at,
      dateModified: news.created_at,
      author: news.author
        ? { "@type": "Person", name: news.author }
        : { "@type": "Organization", name: webProps.serverName || "WoW Libre" },
      publisher: {
        "@type": "Organization",
        name: webProps.serverName || "WoW Libre",
        url: absoluteUrl(""),
      },
      mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
      url: articleUrl,
      articleBody: sectionText || news.sub_title,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: webProps.serverName || "WoW Libre",
          item: absoluteUrl(""),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: NEWS_LIST_TITLE,
          item: absoluteUrl("/news"),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: news.title,
          item: articleUrl,
        },
      ],
    },
  ];
}

export function buildNewsNotFoundMetadata(): Metadata {
  return {
    title: "Noticia no encontrada",
    description: "La noticia que buscas no existe o ya no está disponible.",
    robots: { index: false, follow: false },
  };
}

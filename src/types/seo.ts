export type SEOConfig = {
  global: GlobalSEO;
  pages: PageSEO[];
};

export type GlobalSEO = {
  siteName: string;
  title: string;
  description: string;
  canonicalBase: string;
  defaultLocale: string;
  locales: string[];
  defaultOgImage: string;
  twitterHandle?: string;
  robots: RobotsDirectives;
  sitemapEnabled: boolean;
  robotsTxt?: string;
  verification?: {
    google?: string;
    yandex?: string;
    yahoo?: string;
    bing?: string;
  };
};

export type PageSEO = {
  slug: string; // e.g. "/", "/news", "/store/item"
  title?: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  localeAlternate?: Record<string, string>; // locale -> path
  noindex?: boolean;
  nofollow?: boolean;
  schemaType?: "organization" | "article" | "product" | "website" | string;
  schemaJson?: Record<string, any>;
  lastmod?: string;
  priority?: number;
};

export type RobotsDirectives = {
  index: boolean;
  follow: boolean;
  googleBot?: {
    index?: boolean;
    follow?: boolean;
    "max-image-preview"?: "large" | "standard" | "none";
    "max-snippet"?: number | "-1";
    "max-video-preview"?: number | "-1";
  };
};

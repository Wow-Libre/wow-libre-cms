import { getSiteOrigin } from "@/lib/seo/site";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const origin = getSiteOrigin();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/accounts/"],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
  };
}

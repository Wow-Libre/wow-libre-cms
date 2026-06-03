export function getSiteOrigin() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "https://wowlibre.com";
  return base.replace(/\/$/, "");
}

export function absoluteUrl(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteOrigin()}${normalized}`;
}

/** Meta descriptions: ~155–160 chars for SERP snippets. */
export function truncateMetaDescription(text: string, maxLength = 160) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxLength) return cleaned;
  const slice = cleaned.slice(0, maxLength - 1);
  const lastSpace = slice.lastIndexOf(" ");
  return `${(lastSpace > 80 ? slice.slice(0, lastSpace) : slice).trim()}…`;
}

import { NewsPageClient } from "@/features/news/components/NewsPageClient";
import { buildNewsListJsonLd } from "@/features/news/seo/buildNewsMetadata";
import { JsonLdScript } from "@/lib/seo/JsonLdScript";

export default function NewsPage() {
  return (
    <>
      <JsonLdScript data={buildNewsListJsonLd()} />
      <NewsPageClient />
    </>
  );
}

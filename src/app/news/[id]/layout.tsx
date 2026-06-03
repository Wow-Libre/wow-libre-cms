import { getNewsByIdServer } from "@/features/news/api/getNewsByIdServer";
import {
  buildNewsArticleJsonLd,
  buildNewsArticleMetadata,
  buildNewsNotFoundMetadata,
} from "@/features/news/seo/buildNewsMetadata";
import { JsonLdScript } from "@/lib/seo/JsonLdScript";
import type { Metadata } from "next";

type NewsArticleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: Pick<NewsArticleLayoutProps, "params">): Promise<Metadata> {
  const { id } = await params;
  const newsId = Number(id);
  const news = await getNewsByIdServer(newsId);

  if (!news) {
    return buildNewsNotFoundMetadata();
  }

  return buildNewsArticleMetadata(news, newsId);
}

export default async function NewsArticleLayout({
  children,
  params,
}: NewsArticleLayoutProps) {
  const { id } = await params;
  const newsId = Number(id);
  const news = await getNewsByIdServer(newsId);

  return (
    <>
      {news ? (
        <JsonLdScript data={buildNewsArticleJsonLd(news, newsId)} />
      ) : null}
      {children}
    </>
  );
}

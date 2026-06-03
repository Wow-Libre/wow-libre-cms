import { buildNewsListMetadata } from "@/features/news/seo/buildNewsMetadata";
import type { Metadata } from "next";

export const metadata: Metadata = buildNewsListMetadata();

export default function NewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

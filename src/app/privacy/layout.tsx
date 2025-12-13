import { webProps } from "@/constants/configs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how we collect, use, store, and protect your personal information when you visit our website.",
  keywords: [
    "privacy policy",
    "privacy",
    "data protection",
    "personal information",
    "personal data",
  ],
  openGraph: {
    title: "Privacy Policy",
    description:
      "Learn how we collect, use, store, and protect your personal information when you visit our website.",
    type: "website",
    siteName: webProps.serverName || "",
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy",
    description:
      "Learn how we collect, use, store, and protect your personal information when you visit our website.",
  },
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

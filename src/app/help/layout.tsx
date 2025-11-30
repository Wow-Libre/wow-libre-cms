import { webProps } from "@/constants/configs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support Service",
  description:
    "Explore our commitment to delivering exceptional quality support. Find answers to frequently asked questions and get help from our team.",
  keywords: [
    "support",
    "help",
    "faq",
    "frequently asked questions",
    "customer support",
    "assistance",
    "support center",
  ],
  openGraph: {
    title: "Support Service",
    description:
      "Explore our commitment to delivering exceptional quality support. Find answers to frequently asked questions and get help from our team.",
    type: "website",
    siteName: webProps.serverName || "",
  },
  twitter: {
    card: "summary",
    title: "Support Service",
    description:
      "Explore our commitment to delivering exceptional quality support. Find answers to frequently asked questions and get help from our team.",
  },
  alternates: {
    canonical: "/help",
  },
};

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

import { webProps } from "@/constants/configs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subscriptions",
  description:
    "Subscribe and enjoy the best benefits at an incredible price. Get exclusive mounts, items, free services, and premium features with our subscription plans.",
  keywords: [
    "subscription",
    "premium",
    "subscription plans",
    "premium benefits",
    "exclusive mounts",
    "exclusive items",
    "premium features",
    "monthly subscription",
  ],
  openGraph: {
    title: "Subscriptions",
    description:
      "Subscribe and enjoy the best benefits at an incredible price. Get exclusive mounts, items, free services, and premium features with our subscription plans.",
    type: "website",
    siteName: webProps.serverName || "",
  },
  twitter: {
    card: "summary_large_image",
    title: "Subscriptions",
    description:
      "Subscribe and enjoy the best benefits at an incredible price. Get exclusive mounts, items, free services, and premium features with our subscription plans.",
  },
  alternates: {
    canonical: "/subscriptions",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SubscriptionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

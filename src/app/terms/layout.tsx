import { webProps } from "@/constants/configs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description:
    "Read the terms and conditions that govern the use of our website. By accessing and using our site, you agree to comply with these conditions.",
  keywords: [
    "terms and conditions",
    "terms of use",
    "conditions of use",
    "usage policy",
    "legal terms",
  ],
  openGraph: {
    title: "Terms and Conditions",
    description:
      "Read the terms and conditions that govern the use of our website. By accessing and using our site, you agree to comply with these conditions.",
    type: "website",
    siteName: webProps.serverName || "",
  },
  twitter: {
    card: "summary",
    title: "Terms and Conditions",
    description:
      "Read the terms and conditions that govern the use of our website. By accessing and using our site, you agree to comply with these conditions.",
  },
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

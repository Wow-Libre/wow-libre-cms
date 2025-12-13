import { webProps } from "@/constants/configs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In",
  description:
    "Access your account securely. Log in to manage your profile, game accounts, and access exclusive features.",
  keywords: [
    "login",
    "sign in",
    "account access",
    "user authentication",
    "secure login",
  ],
  openGraph: {
    title: "Log In",
    description:
      "Access your account securely. Log in to manage your profile, game accounts, and access exclusive features.",
    type: "website",
    siteName: webProps.serverName || "",
  },
  twitter: {
    card: "summary",
    title: "Log In",
    description:
      "Access your account securely. Log in to manage your profile, game accounts, and access exclusive features.",
  },
  alternates: {
    canonical: "/login",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

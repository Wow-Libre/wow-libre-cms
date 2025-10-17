import { FooterVisibility } from "@/features/footer";
import { webProps } from "@/constants/configs";
import I18Next from "@/context/I8nProviders";
import UserProvider from "@/context/UserContext";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Inter, Cinzel, Crimson_Text } from "next/font/google";
import React from "react";
import "./globals.css";
import "./normalize.css";

const inter = Inter({ subsets: ["latin"] });
const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  weight: ["400", "500", "600", "700", "800", "900"],
});
const crimsonText = Crimson_Text({
  subsets: ["latin"],
  variable: "--font-crimson",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: webProps.serverName || "",
    template: `%s | ${webProps.serverName}`,
  },
  description:
    "¡Únete al mejor servidor privado de World of Warcraft! Experiencia épica, comunidad activa, eventos únicos y contenido exclusivo. ¡Comienza tu aventura en Azeroth hoy!",
  keywords: [
    "World of Warcraft",
    "WoW",
    "servidor privado",
    "MMORPG",
    "gaming",
    "Azeroth",
    "guild",
    "raids",
    "PvP",
    "The War Within",
    "WoW Libre",
    "juego online",
  ],
  authors: [{ name: "WoW Libre Team" }],
  creator: "WoW Libre",
  publisher: "WoW Libre",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://wowlibre.com"
  ),
  alternates: {
    canonical: "/",
    languages: {
      "es-ES": "/es",
      "en-US": "/en",
      "pt-BR": "/pt",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "/",
    title: webProps.serverName || "",
    description:
      "¡Únete al mejor servidor privado de World of Warcraft! Experiencia épica, comunidad activa, eventos únicos y contenido exclusivo.",
    siteName: webProps.serverName || "",
    images: [
      {
        url: webProps.homeFeaturesImg,
        width: 1200,
        height: 630,
        alt: `${webProps.serverName} - Servidor privado de World of Warcraft`,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: webProps.serverName,
    description:
      "¡Únete al mejor servidor privado de World of Warcraft! Experiencia épica, comunidad activa y contenido exclusivo.",
    creator: "@wowlibre",
    site: "@wowlibre",
    images: [webProps.homeFeaturesImg],
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    yahoo: process.env.YAHOO_VERIFICATION,
  },
  category: "gaming",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="bg-midnight">
      <UserProvider>
        <I18Next>
          <body
            className={`${inter.className} ${cinzel.variable} ${crimsonText.variable}`}
          >
            {children}
            <FooterVisibility />
            <Analytics />
            <SpeedInsights />
          </body>
        </I18Next>
      </UserProvider>
    </html>
  );
}

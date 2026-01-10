import { webProps } from "@/constants/configs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Suscripciones Premium",
  description:
    "Descubre nuestras suscripciones premium de World of Warcraft. Accede a beneficios exclusivos, monturas únicas, items especiales, servicios premium y puntos de slots gratis. Planes flexibles con descuentos increíbles. ¡Mejora tu experiencia de juego hoy!",
  keywords: [
    "suscripción premium",
    "premium subscription",
    "WoW premium",
    "World of Warcraft premium",
    "membresía premium",
    "beneficios premium",
    "servidor privado premium",
    "WoW subscription",
    "premium benefits",
    "exclusive mounts",
    "premium items",
    "premium features",
    "WoW Libre premium",
    "servidor WoW premium",
    "planes de suscripción",
    "subscription plans",
    "monthly subscription",
    "premium gaming",
    "WoW private server premium",
    "puntos de slots gratis",
    "premium services",
    "exclusive content",
    "premium membership",
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
  openGraph: {
    title: `Suscripciones Premium - ${webProps.serverName}`,
    description:
      "Descubre nuestras suscripciones premium de World of Warcraft. Accede a beneficios exclusivos, monturas únicas, items especiales y servicios premium con planes flexibles y descuentos increíbles.",
    type: "website",
    url: "/subscriptions",
    siteName: webProps.serverName || "",
    locale: "es_ES",
    images: [
      {
        url: webProps.homeFeaturesImg,
        width: 1200,
        height: 630,
        alt: `${webProps.serverName} - Suscripciones Premium`,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Suscripciones Premium - ${webProps.serverName}`,
    description:
      "Descubre nuestras suscripciones premium de World of Warcraft. Accede a beneficios exclusivos y mejora tu experiencia de juego.",
    creator: "@wowlibre",
    site: "@wowlibre",
    images: [webProps.homeFeaturesImg],
  },
  alternates: {
    canonical: "/subscriptions",
    languages: {
      "es-ES": "/subscriptions",
      "en-US": "/subscriptions",
      "pt-BR": "/subscriptions",
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
};

export default function SubscriptionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

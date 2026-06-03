import { webProps } from "@/constants/configs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Descargas y guías",
  description:
    "Descarga el cliente de World of Warcraft para Wow Libre y accede a los recursos para conectar al servidor.",
  alternates: { canonical: "/contributions" },
  openGraph: {
    title: `Descargas y guías | ${webProps.serverName}`,
    description:
      "Cliente del juego y recursos para conectar al servidor Wow Libre.",
    url: "/contributions",
    siteName: webProps.serverName || "WoW Libre",
    locale: "es_ES",
    type: "website",
  },
};

export default function ContributionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

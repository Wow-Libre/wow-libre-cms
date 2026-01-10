import { FooterVisibility } from "@/features/footer";
import I18Next from "@/context/I8nProviders";
import UserProvider from "@/context/UserContext";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { buildMetadata, loadSEOConfig } from "@/lib/seo";
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

export async function generateMetadata() {
  const config = await loadSEOConfig();
  return buildMetadata(config, "/");
}

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

import {
    Inter,
    Cinzel,
    Crimson_Text,
    Lora,
    Montserrat,
    Roboto,
} from "next/font/google";

// Fuente base del sitio (antes cargada via @import en globals.css).
// next/font las autohospeda en /public y elimina el handshake con Google.
export const inter = Inter({ subsets: ["latin"], display: "swap" });

// Solo los pesos que realmente se usan (antes 6 -> ahora 2).
export const cinzel = Cinzel({
    subsets: ["latin"],
    variable: "--font-cinzel",
    weight: ["400", "700"],
    display: "swap",
});

export const crimsonText = Crimson_Text({
    subsets: ["latin"],
    variable: "--font-crimson",
    weight: ["400", "600", "700"],
    display: "swap",
});

// Familias adicionales antes en @import.
export const lora = Lora({
    subsets: ["latin"],
    variable: "--font-lora",
    display: "swap",
});

export const montserrat = Montserrat({
    subsets: ["latin"],
    variable: "--font-montserrat",
    display: "swap",
});

export const roboto = Roboto({
    subsets: ["latin"],
    weight: ["400", "500", "700"],
    variable: "--font-roboto",
    display: "swap",
});

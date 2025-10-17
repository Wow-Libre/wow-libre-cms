import type { Config } from "tailwindcss/types/config";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        gaming: ["var(--font-cinzel)", "serif"],
        "gaming-alt": ["var(--font-crimson)", "serif"],
        sans: ["Inter", "sans-serif"],
      },
      keyframes: {
        shine: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        colorCycle: {
          "0%, 100%": { color: "#C5A880" }, // Dorado suave
          "25%": { color: "#8D99AE" }, // Plata/gris azulado
          "50%": { color: "#A26769" }, // Vino tinto suave
          "75%": { color: "#F5F5F5" }, // Blanco roto
        },
        "border-glow": {
          "0%, 100%": { borderColor: "transparent" },
          "50%": { borderColor: "#6366f1" }, // Indigo-500
        },
      },
      animation: {
        "color-cycle": "colorCycle 4s ease-in-out infinite",
        shine: "shine 1s ease-in-out",
        "border-glow": "border-glow 3s linear infinite",
      },
      colors: {
        midnight: "#0B1218",
        orange_500: "#f97316",
        btnPrimary: "#FF4E16",
        // Paleta de colores gaming
        gaming: {
          primary: {
            main: "#8B5CF6", // purple-500
            light: "#A78BFA", // purple-400
            dark: "#7C3AED", // purple-600
            hover: "#9333EA", // purple-700
          },
          secondary: {
            main: "#F59E0B", // amber-500
            light: "#FBBF24", // amber-400
            dark: "#D97706", // amber-600
            hover: "#B45309", // amber-700
          },
          base: {
            main: "#1F2937", // gray-800
            light: "#374151", // gray-700
            dark: "#111827", // gray-900
            hover: "#4B5563", // gray-600
          },
          accent: {
            purple: "#8B5CF6",
            gold: "#F59E0B",
            silver: "#9CA3AF",
          },
          status: {
            success: "#10B981", // emerald-500
            warning: "#F59E0B", // amber-500
            error: "#EF4444", // red-500
            info: "#3B82F6", // blue-500
          },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("tailwind-scrollbar-hide")],
};
export default config;

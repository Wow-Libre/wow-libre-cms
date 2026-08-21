export const DEVELOPMENT_DECORATIVE_TREANT =
  "https://static.wixstatic.com/media/5dd8a0_a1d175976a834a9aa2db34adb6d87d02~mv2.png";

export const DEVELOPMENT_CARD_SURFACE =
  "relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-slate-900/85 via-slate-950/90 to-black/70 shadow-[0_28px_70px_-18px_rgba(0,0,0,0.85),0_12px_32px_-8px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.04)_inset,0_1px_0_rgba(255,255,255,0.07)_inset] backdrop-blur-sm";

export const DEVELOPMENT_BTN_PRIMARY =
  "inline-flex items-center justify-center gap-2.5 rounded-lg bg-cyan-600 px-7 py-3.5 text-base font-semibold tracking-[0.02em] text-white transition-colors duration-200 hover:bg-cyan-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:px-8 sm:py-4 sm:text-lg";

export const DEVELOPMENT_BTN_SECONDARY =
  "inline-flex items-center justify-center gap-2.5 rounded-lg border border-white/15 bg-transparent px-7 py-3.5 text-base font-semibold tracking-[0.02em] text-slate-200 transition-colors duration-200 hover:border-white/25 hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:px-8 sm:py-4 sm:text-lg";

export const DEVELOPMENT_HERO_IMAGES = [
  {
    src: "https://static.wixstatic.com/media/5dd8a0_423a9b289cbb4211aeec71a2ca145926~mv2.webp",
    alt: "Herramientas Wow Libre",
  },
  {
    src: "https://static.wixstatic.com/media/5dd8a0_7541713497634f41807acf80546c561c~mv2.webp",
    alt: "Servidor privado de World of Warcraft",
  },
] as const;

export const developmentSoftware = [
  {
    id: "discord-register-bot",
    downloadUrl:
      "https://www.mediafire.com/file/4zeqhe355bciyyg/botwowlibre.jar/file",
    repoUrl: "https://github.com/Wow-Libre/botdiscord-private-server",
    cover:
      "https://wow.zamimg.com/uploads/screenshots/normal/611247-stormwind-city.jpg",
  },
] as const;

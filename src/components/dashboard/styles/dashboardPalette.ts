/**
 * Paleta del panel admin: superficie blanca, gris Apple y acento azul.
 */
export const DASHBOARD_PALETTE = {
  page: "bg-[#f5f5f7]",
  bg: "bg-[#f5f5f7]",
  card: "bg-white border border-black/[0.12] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_10px_28px_rgba(0,0,0,0.08)]",
  border: "border-black/[0.12]",
  text: "text-[#1d1d1f]",
  textMuted: "text-[#6e6e73]",
  label: "text-[#6e6e73]",
  accent: "text-[#0071e3]",
  accentBg: "bg-[#0071e3] hover:bg-[#0077ed]",
  accentBorder:
    "border-black/10 focus:border-[#0071e3] focus:ring-[#0071e3]/25",
  btnPrimary:
    "rounded-full bg-[#0071e3] px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-[#0077ed] dashboard-on-accent",
  btnDanger:
    "rounded-full border border-[#ff3b30]/25 bg-[#ff3b30]/8 px-4 py-2 text-sm font-medium text-[#ff3b30] transition-colors hover:bg-[#ff3b30]/12",
  input:
    "w-full rounded-xl border border-black/10 bg-[#fbfbfd] px-4 py-2.5 text-base text-[#1d1d1f] outline-none transition-colors placeholder:text-[#86868b] focus:border-[#0071e3] focus:bg-white focus:ring-2 focus:ring-[#0071e3]/15",
  spinner: "border-2 border-black/10 border-t-[#0071e3]",
} as const;

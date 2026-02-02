/**
 * Paleta unificada del dashboard. Usar estas clases en todos los componentes
 * del panel para mantener consistencia (slate + cyan).
 */
export const DASHBOARD_PALETTE = {
  /** Fondo principal del área de contenido */
  bg: "bg-slate-900/50",
  /** Fondo de tarjetas/secciones */
  card: "bg-slate-800/90 border border-slate-700/50",
  /** Bordes */
  border: "border-slate-700/50",
  /** Texto principal */
  text: "text-white",
  /** Texto secundario / descripciones */
  textMuted: "text-slate-400",
  /** Etiquetas (labels) */
  label: "text-slate-400",
  /** Acento principal (botones primarios, links, focus) */
  accent: "text-cyan-400",
  accentBg: "bg-cyan-600 hover:bg-cyan-500",
  accentBorder: "border-cyan-500/50 focus:border-cyan-500 focus:ring-cyan-500/20",
  /** Botón primario (gradiente) */
  btnPrimary:
    "rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-3 font-semibold text-white transition-opacity hover:opacity-95",
  /** Botón peligro (eliminar) */
  btnDanger:
    "rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20",
  /** Input / select */
  input:
    "w-full rounded-xl border border-slate-600/50 bg-slate-800/50 px-4 py-3 text-white outline-none transition-colors focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20",
  /** Spinner (loading) */
  spinner: "border-2 border-slate-600 border-t-cyan-500",
} as const;

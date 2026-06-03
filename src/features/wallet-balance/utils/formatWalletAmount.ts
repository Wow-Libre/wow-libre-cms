/** Formato legible para montos de billetera (sin abreviar K/M en el modal). */
export function formatWalletAmount(value: number, locale = "es-ES"): string {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  }).format(value);
}

/** Formato compacto para badges del navbar. */
export function formatWalletAmountCompact(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return String(value);
}

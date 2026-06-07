export function formatSubscriptionDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso.includes("T") ? iso : `${iso}T12:00:00`);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function formatSubscriptionPrice(
  price: number | null | undefined,
  currency: string | null | undefined,
): string {
  if (price == null) return "—";
  try {
    if (currency) {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currency.length === 3 ? currency : "USD",
      }).format(price);
    }
    return String(price);
  } catch {
    return `${price} ${currency ?? ""}`.trim();
  }
}

export function daysUntilRenewal(iso: string | null | undefined): number | null {
  if (!iso) return null;
  try {
    const d = new Date(iso.includes("T") ? iso : `${iso}T12:00:00`);
    if (Number.isNaN(d.getTime())) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
}

export function totalPeriodDays(
  activatedAt: string | null | undefined,
  renewsAt: string | null | undefined,
): number | null {
  if (!activatedAt || !renewsAt) return null;
  const start = new Date(activatedAt.includes("T") ? activatedAt : `${activatedAt}T12:00:00`).getTime();
  const end = new Date(renewsAt.includes("T") ? renewsAt : `${renewsAt}T12:00:00`).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return null;
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
}

export function billingPeriodProgress(
  activatedAt: string | null | undefined,
  renewsAt: string | null | undefined,
): number {
  if (!activatedAt || !renewsAt) return 0;
  const start = new Date(activatedAt.includes("T") ? activatedAt : `${activatedAt}T12:00:00`).getTime();
  const end = new Date(renewsAt.includes("T") ? renewsAt : `${renewsAt}T12:00:00`).getTime();
  const now = Date.now();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 0;
  if (now >= end) return 0;
  if (now <= start) return 100;
  return Math.round(((end - now) / (end - start)) * 100);
}

export function periodElapsedPercent(
  activatedAt: string | null | undefined,
  renewsAt: string | null | undefined,
): number {
  const remaining = billingPeriodProgress(activatedAt, renewsAt);
  return Math.max(0, Math.min(100, 100 - remaining));
}

export function formatFrequencyLabel(
  type: string | null | undefined,
  value: number | null | undefined,
  t: (key: string, options?: Record<string, string | number>) => string,
): string {
  if (!type || value == null) return "—";
  const u = type.toUpperCase();
  if (u === "YEARLY") {
    return value === 1
      ? t("profile.subscription-freq-year-one")
      : t("profile.subscription-freq-years", { n: value });
  }
  if (u === "MONTHLY") {
    return value === 1
      ? t("profile.subscription-freq-month-one")
      : t("profile.subscription-freq-months", { n: value });
  }
  return `${type} (${value})`;
}

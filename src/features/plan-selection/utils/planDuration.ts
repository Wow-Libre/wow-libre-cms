export type PlanFrequencyKey = "MONTHLY" | "YEARLY";
export type TrialFrequencyKey = "DAILY" | "MONTHLY";
export type AnyPlanFrequencyKey = "DAILY" | "MONTHLY" | "YEARLY";

export const MAX_FREQUENCY_DAYS = 90;
export const MAX_FREQUENCY_MONTHS = 36;
export const MAX_FREQUENCY_YEARS = 5;

export function normalizePlanFrequencyKey(
  raw: string | null | undefined,
): PlanFrequencyKey | null {
  if (!raw) {
    return null;
  }
  const v = raw.trim().toUpperCase();
  if (
    v === "MONTHLY" ||
    v === "MONTH" ||
    v === "MES" ||
    v === "MENSUAL" ||
    v === "M"
  ) {
    return "MONTHLY";
  }
  if (
    v === "YEARLY" ||
    v === "YEAR" ||
    v === "ANIO" ||
    v === "ANUAL" ||
    v === "Y"
  ) {
    return "YEARLY";
  }
  return null;
}

export function normalizeDisplayedFrequency(
  raw: string | null | undefined,
): AnyPlanFrequencyKey | null {
  const paid = normalizePlanFrequencyKey(raw);
  if (paid) {
    return paid;
  }
  if (!raw) {
    return null;
  }
  const value = raw.trim().toUpperCase();
  if (
    value === "DAILY" ||
    value === "DAY" ||
    value === "DAYS" ||
    value === "DIA" ||
    value === "DIAS" ||
    value === "D"
  ) {
    return "DAILY";
  }
  return null;
}

export function clampDisplayedFrequencyValue(
  type: AnyPlanFrequencyKey,
  value: unknown,
): number {
  const amount = Math.floor(Number(value));
  if (!Number.isFinite(amount) || amount < 1) {
    return 1;
  }
  const max =
    type === "YEARLY"
      ? MAX_FREQUENCY_YEARS
      : type === "DAILY"
        ? MAX_FREQUENCY_DAYS
        : MAX_FREQUENCY_MONTHS;
  return Math.min(amount, max);
}

export function clampPlanFrequencyValue(
  type: PlanFrequencyKey,
  value: unknown,
): number {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n) || n < 1) {
    return 1;
  }
  const max = type === "YEARLY" ? MAX_FREQUENCY_YEARS : MAX_FREQUENCY_MONTHS;
  return Math.min(n, max);
}

export function planPeriodMonths(
  type: string | null | undefined,
  value: number | null | undefined,
): number {
  const amount = value && value > 0 ? value : 1;
  const key = normalizeDisplayedFrequency(type);
  if (key === "YEARLY") {
    return amount * 12;
  }
  if (key === "DAILY") {
    return 0;
  }
  return amount;
}

export function isOneMonthPlan(
  type: string | null | undefined,
  value: number | null | undefined,
): boolean {
  const amount = value && value > 0 ? value : 1;
  return normalizePlanFrequencyKey(type) === "MONTHLY" && amount === 1;
}

export function checkoutPeriodLabel(
  type: string | null | undefined,
  value: number | null | undefined,
  t: (key: string, options?: Record<string, string | number>) => string,
): string {
  const amount = value && value > 0 ? value : 1;
  const key = normalizeDisplayedFrequency(type);
  if (key === "YEARLY") {
    return amount === 1
      ? t("register.plan.per-year")
      : t("register.plan.per-n-years", { n: amount });
  }
  if (key === "DAILY") {
    return amount === 1
      ? t("register.plan.per-day")
      : t("register.plan.per-n-days", { n: amount });
  }
  if (key === "MONTHLY") {
    return amount === 1
      ? t("register.plan.per-month")
      : t("register.plan.per-n-months", { n: amount });
  }
  return "";
}

export function checkoutPitch(
  type: string | null | undefined,
  value: number | null | undefined,
  t: (key: string, options?: Record<string, string | number>) => string,
): string {
  const amount = value && value > 0 ? value : 1;
  const key = normalizeDisplayedFrequency(type);
  if (key === "YEARLY") {
    return amount === 1
      ? t("register.plan.pitch-year")
      : t("register.plan.pitch-n-years", { n: amount });
  }
  if (key === "DAILY") {
    return amount === 1
      ? t("register.plan.pitch-day")
      : t("register.plan.pitch-n-days", { n: amount });
  }
  if (key === "MONTHLY") {
    return amount === 1
      ? t("register.plan.pitch-month")
      : t("register.plan.pitch-n-months", { n: amount });
  }
  return "";
}

export function durationSavingsPercent(
  planTotal: number,
  monthlyRate: number,
  periodMonths: number,
): number | null {
  if (monthlyRate <= 0 || periodMonths <= 1) {
    return null;
  }
  const equivalent = monthlyRate * periodMonths;
  if (equivalent <= planTotal) {
    return null;
  }
  return Math.round((1 - planTotal / equivalent) * 100);
}

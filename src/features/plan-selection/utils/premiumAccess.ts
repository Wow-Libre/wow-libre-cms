export const SELECTED_PLAN_STORAGE_KEY = "selectedPlan";
export const PENDING_PREMIUM_CHECKOUT_KEY = "pendingPremiumCheckout";

export const SUBSCRIPTION_POLL_INTERVAL_MS = 4000;
export const SUBSCRIPTION_POLL_MAX_ATTEMPTS = 45;

const PENDING_CHECKOUT_TTL_MS =
  SUBSCRIPTION_POLL_INTERVAL_MS * SUBSCRIPTION_POLL_MAX_ATTEMPTS + 30 * 60 * 1000;

export type PendingPremiumCheckout = {
  ownerId: string;
  referenceCode: string;
  planId: string | null;
  startedAt: number;
  attempt: number;
  modalDismissed?: boolean;
};

export function isPaidPlanPrice(price: unknown, discountedPrice: unknown): boolean {
  const amount = Number(price);
  const discounted = Number(discountedPrice);
  return (
    (Number.isFinite(amount) && amount > 0) ||
    (Number.isFinite(discounted) && discounted > 0)
  );
}

export function usernameAfterPlanPath(
  showWelcome: boolean | string | null,
): string {
  const welcome =
    showWelcome === true || showWelcome === "true" ? "true" : "false";
  return `/register/username?showWelcome=${welcome}`;
}

/** Entrada a crear cuenta de juego: siempre pasa por planes. Username solo lo resuelve /register/plan. */
export function createGameAccountPath(
  showWelcome: boolean | string | null,
): string {
  return planPath(showWelcome);
}

export function planPath(showWelcome: boolean | string | null): string {
  const welcome =
    showWelcome === true || showWelcome === "true" ? "true" : "false";
  return `/register/plan?showWelcome=${welcome}`;
}

export function premiumCheckoutOwnerId(user: {
  id?: number | null;
  email?: string | null;
}): string {
  if (user.id != null) {
    return String(user.id);
  }
  return (user.email || "anon").trim().toLowerCase() || "anon";
}

export function readPendingPremiumCheckout(
  ownerId: string,
): PendingPremiumCheckout | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(PENDING_PREMIUM_CHECKOUT_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as PendingPremiumCheckout;
    if (!parsed?.referenceCode || parsed.ownerId !== ownerId) {
      return null;
    }
    if (
      !Number.isFinite(parsed.startedAt) ||
      Date.now() - parsed.startedAt > PENDING_CHECKOUT_TTL_MS
    ) {
      clearPendingPremiumCheckout();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function savePendingPremiumCheckout(checkout: PendingPremiumCheckout): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(
      PENDING_PREMIUM_CHECKOUT_KEY,
      JSON.stringify(checkout),
    );
  } catch {
    // localStorage lleno o bloqueado; el modal solo vivirá en esta sesión.
  }
}

export function patchPendingPremiumCheckout(
  patch: Partial<Pick<PendingPremiumCheckout, "attempt" | "modalDismissed">>,
): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    const raw = window.localStorage.getItem(PENDING_PREMIUM_CHECKOUT_KEY);
    if (!raw) {
      return;
    }
    const parsed = JSON.parse(raw) as PendingPremiumCheckout;
    window.localStorage.setItem(
      PENDING_PREMIUM_CHECKOUT_KEY,
      JSON.stringify({ ...parsed, ...patch }),
    );
  } catch {
    // ignorar
  }
}

export function updatePendingPremiumCheckoutAttempt(attempt: number): void {
  patchPendingPremiumCheckout({ attempt });
}

export function clearPendingPremiumCheckout(): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.removeItem(PENDING_PREMIUM_CHECKOUT_KEY);
  } catch {
    // ignorar
  }
}

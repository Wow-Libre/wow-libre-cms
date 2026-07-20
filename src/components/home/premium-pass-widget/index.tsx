"use client";

import { getPlanAcquisition } from "@/api/home";
import { getSubscriptionActive } from "@/api/subscriptions";
import { useUserContext } from "@/context/UserContext";
import { PlansAcquisition } from "@/model/model";
import Cookies from "js-cookie";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

const SESSION_AUTO_OPEN_KEY = "wow_home_premium_pass_auto_v1";

const PREMIUM_HERO_IMG =
  "https://static.wixstatic.com/media/5dd8a0_0307782384a547ed9b1feb9f72b28650~mv2.webp";

function pickFeaturedPlan(plans: PlansAcquisition[]): PlansAcquisition | null {
  const paid = plans.filter((p) => p.price > 0 && p.status);
  if (paid.length === 0) return null;
  // Prefer planes anuales activos (mejor deal y más rentable para el usuario).
  const yearly = paid.filter(
    (p) => (p.frequency_type ?? "").toUpperCase() === "YEARLY",
  );
  if (yearly.length > 0) {
    return yearly.reduce((acc, p) =>
      (p.discounted_price ?? p.price) < (acc.discounted_price ?? acc.price)
        ? p
        : acc,
    );
  }
  // Si no hay yearly, el más barato.
  return paid.reduce((acc, p) => (p.price < acc.price ? p : acc));
}

function formatPrice(value: number, currency: string): string {
  if (!Number.isFinite(value)) return "";
  const symbol =
    currency === "USD"
      ? "$"
      : currency === "EUR"
        ? "€"
        : currency === "COP"
          ? "$"
          : currency === "MXN"
            ? "$"
            : "";
  const decimals = currency === "COP" ? 0 : 2;
  return `${symbol}${value.toLocaleString("es-ES", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export default function PremiumPassHomeWidget() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const { t, i18n } = useTranslation();
  const { user } = useUserContext();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [featured, setFeatured] = useState<PlansAcquisition | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isHome) return;

    const token = Cookies.get("token");
    const language = (i18n.language || "es").split("-")[0];

    let cancelled = false;
    setLoading(true);

    // Carga en paralelo: suscripción activa + planes.
    const plansP = getPlanAcquisition(language).catch(() => [] as PlansAcquisition[]);
    const subP = token
      ? getSubscriptionActive(token).catch(() => false)
      : Promise.resolve(false);

    Promise.all([plansP, subP])
      .then(([plans, active]) => {
        if (cancelled) return;
        setFeatured(pickFeaturedPlan(plans));
        setHasSubscription(Boolean(active));
      })
      .catch(() => {
        if (cancelled) return;
        setFeatured(null);
        setHasSubscription(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mounted, isHome, user.logged_in, i18n.language]);

  useEffect(() => {
    if (!mounted || !isHome || loading || hasSubscription) return;

    if (
      typeof window !== "undefined" &&
      !window.sessionStorage.getItem(SESSION_AUTO_OPEN_KEY)
    ) {
      window.sessionStorage.setItem(SESSION_AUTO_OPEN_KEY, "1");
      setIsOpen(true);
    }
  }, [mounted, isHome, loading, hasSubscription]);

  const ctaHref = useMemo(
    () => (user.logged_in ? "/subscriptions" : "/register"),
    [user.logged_in],
  );
  const ctaLabel = user.logged_in
    ? t("home.premium-pass-widget.cta-logged-in")
    : t("home.premium-pass-widget.cta-guest");

  if (!mounted || !isHome || loading || hasSubscription) {
    return null;
  }

  const currency = featured?.currency ?? "USD";
  const finalPrice = featured
    ? (featured.discounted_price ?? featured.price)
    : 0;
  const hasDiscount =
    !!featured &&
    featured.discount > 0 &&
    featured.discounted_price > 0 &&
    featured.discounted_price < featured.price;
  const frequencyKey =
    (featured?.frequency_type ?? "").toUpperCase() === "YEARLY"
      ? "yearly"
      : "monthly";

  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-[9997] bg-slate-950/55 backdrop-blur-[2px] transition-opacity"
          aria-label={t("home.premium-pass-widget.fab-close")}
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="fixed bottom-5 right-5 z-[9998] sm:bottom-6 sm:right-6">
        {isOpen && (
          <div
            className="home-premium-pass-glow relative mb-4 flex w-[min(96vw,680px)] max-h-[min(88vh,860px)] flex-col overflow-hidden rounded-2xl border-2 border-amber-400/45 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 shadow-[0_24px_70px_rgba(245,158,11,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md sm:w-[min(94vw,760px)]"
            role="dialog"
            aria-labelledby="home-premium-pass-title"
            aria-modal="true"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/90 to-transparent" />
            <div className="pointer-events-none absolute -top-28 left-1/2 h-56 w-80 -translate-x-1/2 rounded-full bg-amber-500/25 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full bg-orange-600/15 blur-3xl" />

            <span className="pointer-events-none absolute left-2 top-2 h-5 w-5 border-l-2 border-t-2 border-amber-300/80" />
            <span className="pointer-events-none absolute right-2 top-2 h-5 w-5 border-r-2 border-t-2 border-amber-300/80" />
            <span className="pointer-events-none absolute bottom-2 left-2 h-5 w-5 border-b-2 border-l-2 border-amber-300/80" />
            <span className="pointer-events-none absolute bottom-2 right-2 h-5 w-5 border-b-2 border-r-2 border-amber-300/80" />

            <div className="relative flex items-start justify-between gap-3 border-b border-amber-400/30 bg-gradient-to-r from-amber-500/15 via-orange-500/5 to-transparent px-6 py-5 sm:px-8 sm:py-6">
              <div className="min-w-0">
                <span className="font-gaming inline-flex items-center gap-2 rounded-md border border-amber-300/55 bg-amber-500/20 px-3 py-1.5 text-sm font-bold uppercase tracking-[0.22em] text-amber-100 sm:text-base">
                  <svg className="h-4 w-4 text-amber-200" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7L12 16.8 5.7 21l2.3-7-6-4.6h7.6L12 2z" />
                  </svg>
                  {t("home.premium-pass-widget.badge")}
                </span>
                <h2
                  id="home-premium-pass-title"
                  className="font-gaming mt-3 text-2xl font-bold leading-tight tracking-wide text-white sm:text-3xl"
                >
                  {t("home.premium-pass-widget.title")}
                </h2>
                <p className="mt-3 text-base leading-relaxed text-slate-200 sm:text-lg">
                  {t("home.premium-pass-widget.subtitle")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="shrink-0 rounded-lg border border-slate-700/60 bg-slate-900/60 p-2 text-slate-300 transition hover:border-red-400/60 hover:bg-red-500/10 hover:text-red-200"
                aria-label={t("home.premium-pass-widget.fab-close")}
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* Cuerpo: invitación + plan destacado */}
            <div className="relative flex-1 overflow-y-auto">
              {/* Copy de invitación emocional */}
              <div className="relative px-6 pt-6 sm:px-8 sm:pt-8">
                <p className="font-gaming text-[11px] font-bold uppercase tracking-[0.32em] text-amber-400/90">
                  {t("home.premium-pass-widget.invitation-kicker")}
                </p>
                <h3 className="font-gaming mt-2 text-xl font-bold leading-tight text-white sm:text-2xl">
                  {t("home.premium-pass-widget.invitation-headline")}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300 sm:text-base">
                  {t("home.premium-pass-widget.invitation-sub")}
                </p>
              </div>

              {/* Card destacada del plan */}
              {featured ? (
                <div className="relative mx-6 mt-6 sm:mx-8 sm:mt-7">
                  <div className="relative overflow-hidden rounded-2xl border-2 border-amber-400/60 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 shadow-[0_18px_50px_rgba(245,158,11,0.35)]">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400" />
                    <div className="pointer-events-none absolute -top-12 right-6 h-28 w-28 rounded-full bg-amber-500/30 blur-3xl" />

                    <div className="relative flex flex-wrap items-center justify-between gap-2 px-5 pt-5 sm:px-7 sm:pt-7">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-amber-300/90">
                          {t("home.premium-pass-widget.featured-label")}
                        </p>
                        <h4 className="font-gaming mt-1 truncate text-lg font-bold text-white sm:text-xl">
                          {featured.name}
                        </h4>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/55 bg-amber-500/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-100">
                        {t(`home.premium-pass-widget.featured-frequency-${frequencyKey}`)}
                      </span>
                    </div>

                    <div className="relative flex flex-wrap items-end gap-x-4 gap-y-2 px-5 pt-4 sm:px-7">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          {t("home.premium-pass-widget.featured-from")}
                        </span>
                        {hasDiscount && (
                          <span className="text-base font-medium text-slate-500 line-through sm:text-lg">
                            {formatPrice(featured.price, currency)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-gaming text-4xl font-black leading-none text-amber-300 drop-shadow-[0_0_18px_rgba(252,211,77,0.5)] sm:text-5xl">
                          {formatPrice(finalPrice, currency)}
                        </span>
                        <span className="text-sm font-semibold text-amber-100/80">
                          /
                          {frequencyKey === "yearly"
                            ? t("home.premium-pass-widget.featured-period-year")
                            : t("home.premium-pass-widget.featured-period-month")}
                        </span>
                      </div>
                      {hasDiscount && (
                        <span className="ml-auto inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-pink-500/40 ring-1 ring-white/20">
                          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                            <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7L12 16.8 5.7 21l2.3-7-6-4.6h7.6L12 2z" />
                          </svg>
                          {t("home.premium-pass-widget.featured-save-badge", {
                            percent: featured.discount,
                          })}
                        </span>
                      )}
                    </div>

                    {featured.features && featured.features.length > 0 && (
                      <ul className="relative grid gap-1.5 px-5 pt-4 pb-2 sm:grid-cols-2 sm:gap-2 sm:px-7">
                        {featured.features.slice(0, 4).map((feat, i) => (
                          <li
                            key={`${featured.id}-${i}`}
                            className="flex items-start gap-2 text-sm leading-snug text-slate-100"
                          >
                            <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-500/25 text-amber-200 ring-1 ring-amber-300/40">
                              <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                            <span className="line-clamp-2">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="relative grid grid-cols-1 gap-3 px-5 pb-5 pt-3 sm:grid-cols-2 sm:px-7 sm:pb-7 sm:pt-4">
                      <Link
                        href={ctaHref}
                        onClick={() => setIsOpen(false)}
                        className="font-gaming inline-flex items-center justify-center gap-2 rounded-xl border border-amber-200/50 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 px-6 py-3.5 text-base font-bold uppercase tracking-[0.12em] text-slate-950 shadow-[0_10px_30px_rgba(245,158,11,0.45)] transition hover:from-amber-300 hover:via-amber-400 hover:to-orange-400 sm:text-lg"
                      >
                        {ctaLabel}
                        <span aria-hidden>→</span>
                      </Link>
                      <Link
                        href="/subscriptions"
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-600/80 bg-slate-900/60 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-amber-400/40 hover:bg-slate-800/70"
                      >
                        {t("home.premium-pass-widget.cta-secondary")}
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative mx-6 mt-6 rounded-xl border border-amber-400/30 bg-slate-900/60 px-5 py-5 text-sm leading-relaxed text-slate-200 sm:mx-8">
                  <p>{t("home.premium-pass-widget.invitation-empty")}</p>
                  <Link
                    href="/subscriptions"
                    onClick={() => setIsOpen(false)}
                    className="font-gaming mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-amber-200/50 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-slate-950 shadow-[0_10px_30px_rgba(245,158,11,0.45)] transition hover:from-amber-300 hover:via-amber-400 hover:to-orange-400"
                  >
                    {ctaLabel}
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              )}

              {/* Imagen decorativa al fondo */}
              <div className="pointer-events-none relative mt-6 h-32 overflow-hidden sm:h-40">
                <img
                  src={PREMIUM_HERO_IMG}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-luminosity"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
              </div>
            </div>

            <div className="border-t border-amber-400/25 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent p-5 sm:p-6">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="font-gaming w-full rounded-xl border border-slate-600/80 bg-slate-800/60 px-4 py-3.5 text-base font-bold uppercase tracking-[0.18em] text-slate-200 transition hover:border-amber-300/50 hover:bg-slate-700/70 hover:text-white sm:text-lg"
              >
                {t("home.premium-pass-widget.dismiss")}
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`home-premium-fab font-gaming group relative inline-flex items-center gap-2.5 rounded-xl border-2 px-5 py-3 text-base font-bold uppercase tracking-[0.16em] text-white transition hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:ring-offset-2 focus:ring-offset-slate-950 sm:text-lg ${
            isOpen
              ? "border-slate-500/60 bg-gradient-to-br from-slate-700 to-slate-900 shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
              : "border-amber-200/70 bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 shadow-[0_10px_32px_rgba(245,158,11,0.55)]"
          }`}
          aria-label={
            isOpen
              ? t("home.premium-pass-widget.fab-close")
              : t("home.premium-pass-widget.fab-open")
          }
        >
          {isOpen ? (
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <>
              <span
                className="absolute -right-1 -top-1 h-3 w-3 animate-ping rounded-full bg-amber-200/80"
                aria-hidden
              />
              <svg className="relative h-5 w-5 shrink-0 text-amber-50" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7L12 16.8 5.7 21l2.3-7-6-4.6h7.6L12 2z" />
              </svg>
            </>
          )}
          <span>{t("home.premium-pass-widget.badge")}</span>
        </button>
      </div>
    </>
  );
}
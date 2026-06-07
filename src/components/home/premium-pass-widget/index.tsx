"use client";

import { getSubscriptionActive } from "@/api/subscriptions";
import { useUserContext } from "@/context/UserContext";
import Cookies from "js-cookie";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const SESSION_AUTO_OPEN_KEY = "wow_home_premium_pass_auto_v1";

const BENEFIT_TITLE_KEYS = [
  "subscription.benefits.tier11.title",
  "subscription.benefits.mounts.title",
  "subscription.benefits.accounts.title",
  "subscription.benefits.professions.title",
  "subscription.benefits.instant80.title",
  "subscription.benefits.primary.title",
  "subscription.benefits.tertiary.title",
] as const;

const PREMIUM_HERO_IMG =
  "https://static.wixstatic.com/media/5dd8a0_0307782384a547ed9b1feb9f72b28650~mv2.webp";

export default function PremiumPassHomeWidget() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const { t } = useTranslation();
  const { user } = useUserContext();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isHome) return;

    const token = Cookies.get("token");
    if (!token) {
      setHasSubscription(false);
      setLoading(false);
      return;
    }

    let cancelled = false;
    void getSubscriptionActive(token)
      .then((active) => {
        if (!cancelled) setHasSubscription(active);
      })
      .catch(() => {
        if (!cancelled) setHasSubscription(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mounted, isHome, user.logged_in]);

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

  if (!mounted || !isHome || loading || hasSubscription) {
    return null;
  }

  const ctaHref = user.logged_in ? "/subscriptions" : "/register";
  const ctaLabel = user.logged_in
    ? t("home.premium-pass-widget.cta-logged-in")
    : t("home.premium-pass-widget.cta-guest");

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

      <div className="fixed bottom-[6.75rem] right-5 z-[9998] sm:bottom-[7.25rem] sm:right-6">
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

            <div className="relative grid flex-1 overflow-hidden lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
              <div className="border-b border-slate-800/80 px-6 py-5 sm:px-8 sm:py-6 lg:border-b-0 lg:border-r">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400/90">
                  {t("home.premium-pass-widget.benefits-title")}
                </p>
                <ul className="mt-4 max-h-[min(42vh,380px)] space-y-2.5 overflow-y-auto pr-1 sm:space-y-3">
                  {BENEFIT_TITLE_KEYS.map((key, index) => (
                    <li
                      key={key}
                      className="home-premium-benefit-chip flex items-center gap-3 rounded-xl border border-amber-500/20 bg-slate-900/70 px-3.5 py-3 transition hover:border-amber-400/40 hover:bg-slate-900/90"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <span
                        className="font-gaming flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-400/35 bg-gradient-to-br from-amber-500/25 to-orange-600/20 text-sm font-bold text-amber-200"
                        aria-hidden
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm font-medium leading-snug text-slate-100 sm:text-base">
                        {t(key)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative min-h-[200px] overflow-hidden">
                <img
                  src={PREMIUM_HERO_IMG}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 h-full w-full object-cover opacity-35 mix-blend-luminosity"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-950/60 lg:bg-gradient-to-l lg:from-slate-950 lg:via-slate-950/80 lg:to-transparent" />

                <div className="relative flex h-full flex-col justify-end p-6 sm:p-8">
                  <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
                    {t("home.premium-pass-widget.hint")}
                  </p>
                  <div className="mt-5 flex flex-col gap-3">
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

"use client";

import {
  getCurrentSubscription,
  type CurrentSubscriptionDetail,
  type CurrentSubscriptionResponse,
} from "@/api/subscriptions";
import NavbarAuthenticated from "@/components/navbar-authenticated";
import SubscriptionPlansModal from "@/components/subscriptions/plans-modal";
import LoadingSpinner from "@/components/utilities/loading-spinner";
import { useUserContext } from "@/context/UserContext";
import { InternalServerError } from "@/dto/generic";
import useAuth from "@/hook/useAuth";
import SubscriptionPaymentMethodModal from "@/features/subscription-management/components/SubscriptionPaymentMethodModal";
import SubscriptionDonationWalletCard from "@/features/subscription-management/components/SubscriptionDonationWalletCard";
import { useSubscriptionCheckout } from "@/features/subscription-management/hooks/useSubscriptionCheckout";
import {
  billingPeriodProgress,
  daysUntilRenewal,
  formatFrequencyLabel,
  formatSubscriptionDate,
  formatSubscriptionPrice,
  periodElapsedPercent,
} from "@/features/subscription-management/utils/subscriptionFormat";
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";

const PREMIUM_HERO_IMG =
  "https://static.wixstatic.com/media/5dd8a0_0307782384a547ed9b1feb9f72b28650~mv2.webp";

const MANAGE_CARD =
  "premium-manage-card rounded-2xl border border-cyan-500/15 bg-slate-950/80 shadow-[0_24px_48px_-16px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-sm";

const PRIMARY_CTA =
  "inline-flex min-h-[3.5rem] items-center justify-center rounded-2xl bg-cyan-500 px-8 py-4 text-lg font-bold text-slate-950 shadow-[0_12px_28px_-10px_rgba(34,211,238,0.4)] transition hover:bg-cyan-400";

const SECONDARY_CTA =
  "inline-flex min-h-[3.5rem] items-center justify-center rounded-2xl border border-cyan-500/25 bg-slate-900/60 px-6 py-4 text-lg font-semibold text-white transition hover:border-cyan-400/50 hover:bg-slate-800";

const BENEFIT_SHORT_KEYS = [
  "profile.subscription-benefit-short-1",
  "profile.subscription-benefit-short-2",
  "profile.subscription-benefit-short-3",
] as const;

const BENEFIT_ICONS = ["🗺️", "🛡️", "💬"] as const;

function SubscriptionReveal({
  delayMs = 0,
  className,
  fadeOnly = false,
  children,
}: {
  delayMs?: number;
  className?: string;
  fadeOnly?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`${
        fadeOnly ? "opacity-0" : "animate-fade-in-up"
      } motion-reduce:animate-none motion-reduce:opacity-100 ${className ?? ""}`}
      style={
        fadeOnly
          ? { animation: `fadeIn 0.8s ease-out ${delayMs}ms forwards` }
          : { animationDelay: `${delayMs}ms` }
      }
    >
      {children}
    </div>
  );
}

function RenewalRing({
  daysLeft,
  elapsedPercent,
  expired,
  label,
}: {
  daysLeft: number | null;
  elapsedPercent: number;
  expired: boolean;
  label: string;
}) {
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (elapsedPercent / 100) * circumference;

  const ringColor = expired ? "stroke-rose-400" : "stroke-cyan-400";

  const glowColor = expired
    ? "drop-shadow-[0_0_16px_rgba(244,63,94,0.45)]"
    : "drop-shadow-[0_0_16px_rgba(34,211,238,0.4)]";

  return (
    <div className="relative flex flex-col items-center">
      <svg
        width="168"
        height="168"
        viewBox="0 0 168 168"
        className={`-rotate-90 ${glowColor}`}
        aria-hidden
      >
        <circle
          cx="84"
          cy="84"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-slate-800"
        />
        <circle
          cx="84"
          cy="84"
          r={radius}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          className={ringColor}
          strokeDasharray={`${strokeDash} ${circumference}`}
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-4xl font-bold tabular-nums text-white sm:text-5xl">
          {daysLeft !== null && daysLeft >= 0 ? daysLeft : "!"}
        </span>
        <span className="mt-1 max-w-[7rem] text-sm font-semibold uppercase leading-tight tracking-wide text-slate-200">
          {label}
        </span>
      </div>
    </div>
  );
}

function StatTile({ label, value, mono }: { label: string; value: ReactNode; mono?: boolean }) {
  return (
    <div className={`${MANAGE_CARD} px-5 py-5`}>
      <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`mt-2 text-lg font-semibold text-white sm:text-xl ${mono ? "font-mono text-base break-all sm:text-lg" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function QuickLink({
  href,
  icon,
  title,
}: {
  href: string;
  icon: ReactNode;
  title: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-cyan-500/15 bg-slate-950/40 px-4 py-3.5 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-400/40 hover:bg-slate-800/70"
    >
      <span className="text-xl" aria-hidden>
        {icon}
      </span>
      <span className="min-w-0 flex-1 text-base font-semibold text-white group-hover:text-cyan-100">
        {title}
      </span>
      <span className="text-lg text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-cyan-400" aria-hidden>
        →
      </span>
    </Link>
  );
}

function RenewSteps({ t }: { t: (key: string) => string }) {
  const steps = [
    t("profile.subscription-manage-step-1-title"),
    t("profile.subscription-manage-step-2-title"),
    t("profile.subscription-manage-step-3-title"),
  ];

  return (
    <ol className="mt-5 space-y-4">
      {steps.map((title, index) => (
        <li key={title} className="flex items-center gap-3 text-base text-slate-100 sm:text-lg">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cyan-500/25 bg-cyan-500/10 text-sm font-bold text-cyan-300">
            {index + 1}
          </span>
          {title}
        </li>
      ))}
    </ol>
  );
}

function ActiveSubscriptionView({
  sub,
  checkout,
  t,
  token,
  mounted,
}: {
  sub: CurrentSubscriptionDetail;
  checkout: ReturnType<typeof useSubscriptionCheckout>;
  t: (key: string, opts?: Record<string, string | number>) => string;
  token: string | undefined;
  mounted: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const daysLeft = daysUntilRenewal(sub.renews_or_expires_at);
  const expired = daysLeft !== null && daysLeft < 0;
  const urgentRenewal = !expired && daysLeft !== null && daysLeft <= 14;
  const elapsed = periodElapsedPercent(sub.activated_at, sub.renews_or_expires_at);

  const copyRef = useCallback(async () => {
    if (!sub.reference_number) return;
    try {
      await navigator.clipboard.writeText(sub.reference_number);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [sub.reference_number]);

  return (
    <>
      <SubscriptionReveal delayMs={220}>
      <section className="premium-manage-card relative mb-8 overflow-hidden rounded-3xl border border-cyan-500/20 bg-slate-950 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.9)]">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950 to-slate-950" />
        <img
          src={PREMIUM_HERO_IMG}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-luminosity"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/40" />

        <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/35 bg-cyan-500/10 px-3.5 py-1.5 text-sm font-semibold uppercase text-cyan-200">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                {t("profile.subscription-active-badge")}
              </span>
              {expired && (
                <span className="rounded-full border border-rose-500/40 bg-rose-500/10 px-3.5 py-1.5 text-sm font-semibold uppercase text-rose-300">
                  {t("profile.subscription-manage-expired-badge")}
                </span>
              )}
              {urgentRenewal && (
                <span className="rounded-full border border-cyan-500/35 bg-cyan-500/10 px-3.5 py-1.5 text-sm font-semibold uppercase text-cyan-200">
                  {t("profile.subscription-manage-urgent-badge")}
                </span>
              )}
            </div>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              {sub.plan_name ?? t("profile.subscription-premium-fallback")}
            </h2>
            <p className="mt-3 text-2xl font-semibold text-cyan-100">
              {formatSubscriptionPrice(sub.plan_price, sub.currency)}
              <span className="text-slate-500"> · </span>
              <span className="text-slate-100">
                {formatFrequencyLabel(sub.frequency_type, sub.frequency_value, t)}
              </span>
            </p>
            <p className="mt-5 text-lg text-slate-100 sm:text-xl">
              <span className="text-slate-400">{t("profile.subscription-renews")}: </span>
              {formatSubscriptionDate(sub.renews_or_expires_at)}
            </p>
            {daysLeft !== null && (
              <p
                className={`mt-2 text-base sm:text-lg ${
                  expired ? "text-rose-300" : urgentRenewal ? "text-cyan-200" : "text-slate-300"
                }`}
              >
                {expired
                  ? t("profile.subscription-manage-expired-days")
                  : daysLeft === 0
                    ? t("profile.subscription-renewal-today")
                    : daysLeft === 1
                      ? t("profile.subscription-days-one-short")
                      : t("profile.subscription-days-many-short", { count: daysLeft })}
              </p>
            )}
            <div className="mt-5 h-2.5 max-w-md overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full rounded-full ${
                  expired
                    ? "bg-rose-400"
                    : "bg-gradient-to-r from-cyan-600 via-cyan-400 to-sky-300"
                }`}
                style={{
                  width: `${billingPeriodProgress(sub.activated_at, sub.renews_or_expires_at)}%`,
                }}
              />
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => checkout.startCheckout(sub.plan_id)}
                className={PRIMARY_CTA}
              >
                {expired
                  ? t("profile.subscription-manage-reactivate-cta")
                  : t("profile.subscription-renew-now")}
              </button>
              <button
                type="button"
                onClick={() => checkout.startCheckout()}
                className={SECONDARY_CTA}
              >
                {t("profile.subscription-change-plan")}
              </button>
            </div>
          </div>

          <RenewalRing
            daysLeft={daysLeft}
            elapsedPercent={elapsed}
            expired={expired}
            label={t("profile.subscription-manage-days-left-label")}
          />
        </div>
      </section>
      </SubscriptionReveal>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <SubscriptionReveal delayMs={360}>
          <section className="grid gap-4 sm:grid-cols-2">
            <StatTile label={t("profile.subscription-started")} value={formatSubscriptionDate(sub.activated_at)} />
            <StatTile
              label={t("profile.subscription-reference")}
              value={
                <span className="flex flex-wrap items-center gap-2">
                  <span>{sub.reference_number ?? "—"}</span>
                  {sub.reference_number && (
                    <button
                      type="button"
                      onClick={() => void copyRef()}
                      className="rounded-md border border-slate-600 px-2.5 py-1 text-sm font-semibold text-cyan-300 hover:bg-slate-800"
                    >
                      {copied ? t("profile.subscription-manage-copied") : t("profile.subscription-manage-copy")}
                    </button>
                  )}
                </span>
              }
              mono
            />
          </section>
          </SubscriptionReveal>

          <SubscriptionReveal delayMs={480}>
          <section className={`${MANAGE_CARD} p-6 sm:p-7`}>
            <h3 className="text-xl font-bold text-white sm:text-2xl">
              {t("profile.subscription-manage-benefits-title")}
            </h3>
            <ul className="mt-5 grid gap-3 sm:grid-cols-3">
              {BENEFIT_SHORT_KEYS.map((key, i) => (
                <li
                  key={key}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3.5 text-base text-slate-100 sm:text-lg"
                >
                  <span className="text-xl" aria-hidden>
                    {BENEFIT_ICONS[i]}
                  </span>
                  {t(key)}
                </li>
              ))}
            </ul>
          </section>
          </SubscriptionReveal>

          <SubscriptionReveal delayMs={600}>
          <details className={`group ${MANAGE_CARD} p-6 sm:p-7`}>
            <summary className="cursor-pointer list-none text-xl font-bold text-white marker:content-none sm:text-2xl">
              <span className="flex items-center justify-between gap-3">
                {t("profile.subscription-manage-how-title")}
                <span className="text-slate-400 transition group-open:rotate-180" aria-hidden>
                  ▾
                </span>
              </span>
            </summary>
            <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">
              {t("profile.subscription-manage-how-summary")}
            </p>
            <RenewSteps t={t} />
          </details>
          </SubscriptionReveal>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
          <SubscriptionReveal delayMs={400} fadeOnly>
          <div className={`${MANAGE_CARD} overflow-hidden`}>
            <div className="border-b border-cyan-500/20 bg-cyan-500/10 px-5 py-4">
              <h3 className="text-xl font-bold text-white">
                {expired
                  ? t("profile.subscription-manage-reactivate-title")
                  : t("profile.subscription-manage-actions-title")}
              </h3>
            </div>
            <div className="space-y-3 p-5">
              <button
                type="button"
                onClick={() => checkout.startCheckout(sub.plan_id)}
                className={`w-full ${PRIMARY_CTA}`}
              >
                {expired
                  ? t("profile.subscription-manage-reactivate-cta")
                  : t("profile.subscription-renew-now")}
              </button>
              <button
                type="button"
                onClick={() => checkout.startCheckout()}
                className={`w-full ${SECONDARY_CTA} min-h-0 px-5 py-3.5 text-base`}
              >
                {t("profile.subscription-change-plan")}
              </button>
            </div>
          </div>
          </SubscriptionReveal>

          <SubscriptionReveal delayMs={520} fadeOnly>
          <SubscriptionDonationWalletCard token={token} mounted={mounted} />
          </SubscriptionReveal>

          <SubscriptionReveal delayMs={640} fadeOnly>
          <div className={`${MANAGE_CARD} space-y-2 p-4`}>
            <QuickLink
              href="/subscriptions"
              icon="⚔️"
              title={t("profile.subscription-explore-benefits")}
            />
            <QuickLink
              href="/accounts"
              icon="👤"
              title={t("profile.subscription-link-accounts")}
            />
            <QuickLink
              href="/profile/purchases"
              icon="🧾"
              title={t("profile.subscription-manage-purchases")}
            />
          </div>
          </SubscriptionReveal>
        </aside>
      </div>
    </>
  );
}

function InactiveSubscriptionView({
  checkout,
  t,
}: {
  checkout: ReturnType<typeof useSubscriptionCheckout>;
  t: (key: string, opts?: Record<string, string | number>) => string;
}) {
  const cheapestPaid = checkout.plans
    .filter((p) => p.price > 0)
    .sort((a, b) => a.price - b.price)[0];

  return (
    <section className="premium-manage-card relative overflow-hidden rounded-3xl border border-cyan-500/20 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.9)]">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950 to-slate-950" />
      <img
        src={PREMIUM_HERO_IMG}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover opacity-20"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-slate-950/60" />

      <div className="relative grid gap-10 p-8 sm:p-12 lg:grid-cols-2 lg:items-center">
        <div>
          <SubscriptionReveal delayMs={80}>
          <p className="text-base font-bold uppercase tracking-[0.22em] text-cyan-300/90">
            {t("profile.subscription-upsell-kicker")}
          </p>
          </SubscriptionReveal>
          <SubscriptionReveal delayMs={200}>
          <h2 className="mt-4 text-4xl font-bold text-white sm:text-5xl">
            {t("profile.subscription-no-active-title")}
          </h2>
          </SubscriptionReveal>
          <SubscriptionReveal delayMs={320}>
          <p className="mt-4 text-lg leading-relaxed text-slate-200 sm:text-xl">
            {t("profile.subscription-upsell-subtitle-short")}
          </p>
          </SubscriptionReveal>
          {cheapestPaid && (
            <SubscriptionReveal delayMs={420}>
            <p className="mt-6 inline-flex items-baseline gap-2 rounded-2xl border border-cyan-500/25 bg-cyan-500/10 px-5 py-3">
              <span className="text-lg text-cyan-100">{t("profile.subscription-manage-from")}</span>
              <span className="text-3xl font-bold text-white">
                {formatSubscriptionPrice(
                  cheapestPaid.discounted_price ?? cheapestPaid.price,
                  "USD",
                )}
              </span>
            </p>
            </SubscriptionReveal>
          )}
          <SubscriptionReveal delayMs={540}>
          <button
            type="button"
            onClick={() => checkout.startCheckout()}
            className={`mt-8 ${PRIMARY_CTA} gap-2 px-10`}
          >
            {t("profile.subscription-cta-primary")}
            <span aria-hidden>→</span>
          </button>
          </SubscriptionReveal>
          <SubscriptionReveal delayMs={640}>
          <p className="mt-4 text-base text-slate-400">{t("profile.subscription-trust-line-short")}</p>
          </SubscriptionReveal>
        </div>

        <ul className="space-y-3">
          {BENEFIT_SHORT_KEYS.map((key, i) => (
            <SubscriptionReveal key={key} delayMs={280 + i * 120}>
            <li className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/60 px-5 py-4 text-base text-slate-100 shadow-[0_12px_28px_-16px_rgba(0,0,0,0.8)] sm:text-lg">
              <span className="text-xl" aria-hidden>
                {BENEFIT_ICONS[i]}
              </span>
              {t(key)}
            </li>
            </SubscriptionReveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default function SubscriptionManagementClient() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, clearUserData } = useUserContext();
  const language = user?.language || "es";
  const [mounted, setMounted] = useState(false);
  const token = mounted ? Cookies.get("token") : undefined;

  const [loadingSub, setLoadingSub] = useState(true);
  const [subscriptionInfo, setSubscriptionInfo] =
    useState<CurrentSubscriptionResponse | null>(null);

  const checkout = useSubscriptionCheckout(language);

  useAuth(t("errors.message.expiration-session"));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!token) {
      router.replace("/login");
      return;
    }

    const load = async () => {
      setLoadingSub(true);
      try {
        const envelope = await getCurrentSubscription(token);
        setSubscriptionInfo(envelope);
      } catch (error: unknown) {
        if (error instanceof InternalServerError && error.statusCode === 401) {
          clearUserData();
          router.replace("/login");
          return;
        }
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text:
            error instanceof Error
              ? error.message
              : t("profile.subscription-manage-load-error"),
          color: "white",
          background: "#0B1218",
        });
      } finally {
        setLoadingSub(false);
      }
    };

    void load();
  }, [mounted, token, router, clearUserData, t]);

  const sub = subscriptionInfo?.subscription;
  const isActive = Boolean(subscriptionInfo?.active && sub);
  const showLoading = !mounted || loadingSub || checkout.loading;

  return (
    <div className="relative min-h-screen overflow-visible bg-midnight pb-20">
      <div className="pointer-events-none absolute inset-0 fire-embers-blue opacity-50" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(56,189,248,0.10),transparent_38%),radial-gradient(circle_at_82%_84%,rgba(14,165,233,0.08),transparent_40%)]" />

      <div className="contenedor relative z-30 mb-6">
        <NavbarAuthenticated />
      </div>

      <div className="contenedor relative z-10 py-6 sm:py-10">
        <header className="mb-8 sm:mb-10">
          <SubscriptionReveal>
            <Link
              href="/profile"
              className="inline-flex items-center gap-1.5 rounded-lg border border-transparent px-2 py-1 text-lg text-slate-300 transition hover:border-slate-700 hover:text-cyan-300"
            >
              <span aria-hidden>←</span>
              {t("profile.subscription-manage-back")}
            </Link>
          </SubscriptionReveal>
          <SubscriptionReveal delayMs={140}>
            <div className="mt-4">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                {t("profile.subscription-manage-title")}
              </h1>
            </div>
          </SubscriptionReveal>
        </header>

        {showLoading ? (
          <SubscriptionReveal delayMs={220}>
            <div className="flex min-h-[45vh] items-center justify-center rounded-3xl border border-slate-800/60 bg-slate-900/30">
              <LoadingSpinner />
            </div>
          </SubscriptionReveal>
        ) : isActive && sub ? (
          <ActiveSubscriptionView
            sub={sub}
            checkout={checkout}
            t={t}
            token={token}
            mounted={mounted}
          />
        ) : (
          <InactiveSubscriptionView checkout={checkout} t={t} />
        )}
      </div>

      <SubscriptionPlansModal
        open={checkout.showPlansModal}
        onClose={() => checkout.setShowPlansModal(false)}
        loading={checkout.loading}
        plans={checkout.plans}
        onSelectPlan={checkout.handlePlanSelect}
        recommendedPlanIndex={checkout.recommendedPlanIndex}
        monthlyPlan={checkout.monthlyPlan}
      />

      <SubscriptionPaymentMethodModal
        open={checkout.showPaymentModal}
        onClose={() => checkout.setShowPaymentModal(false)}
        paymentMethods={checkout.paymentMethods}
        onSelect={checkout.handlePaymentMethodSelect}
      />
    </div>
  );
}

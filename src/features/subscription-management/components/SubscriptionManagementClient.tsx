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
  totalPeriodDays,
} from "@/features/subscription-management/utils/subscriptionFormat";
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";

const DECORATIVE_TREANT =
  "https://static.wixstatic.com/media/5dd8a0_a1d175976a834a9aa2db34adb6d87d02~mv2.png";

const PREMIUM_HERO_IMG =
  "https://static.wixstatic.com/media/5dd8a0_0307782384a547ed9b1feb9f72b28650~mv2.webp";

const BENEFIT_KEYS = [
  "profile.subscription-benefit-1",
  "profile.subscription-benefit-2",
  "profile.subscription-benefit-3",
  "profile.subscription-benefit-4",
] as const;

const BENEFIT_ICONS = ["🎮", "✨", "📋", "🔄"] as const;

function RenewalRing({
  daysLeft,
  elapsedPercent,
  urgent,
  expired,
  label,
}: {
  daysLeft: number | null;
  elapsedPercent: number;
  urgent: boolean;
  expired: boolean;
  label: string;
}) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (elapsedPercent / 100) * circumference;

  const ringColor = expired
    ? "stroke-rose-400"
    : urgent
      ? "stroke-amber-400"
      : "stroke-cyan-400";

  const glowColor = expired
    ? "drop-shadow-[0_0_12px_rgba(244,63,94,0.5)]"
    : urgent
      ? "drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]"
      : "drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]";

  return (
    <div className="relative flex flex-col items-center">
      <svg
        width="140"
        height="140"
        viewBox="0 0 140 140"
        className={`-rotate-90 ${glowColor}`}
        aria-hidden
      >
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-slate-800"
        />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className={ringColor}
          strokeDasharray={`${strokeDash} ${circumference}`}
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-bold tabular-nums text-white">
          {daysLeft !== null && daysLeft >= 0 ? daysLeft : "!"}
        </span>
        <span className="mt-1 max-w-[5.5rem] text-xs font-semibold uppercase leading-tight tracking-wide text-slate-300">
          {label}
        </span>
      </div>
    </div>
  );
}

function StatTile({ label, value, mono }: { label: string; value: ReactNode; mono?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-slate-950/50 px-4 py-4 backdrop-blur-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`mt-2 text-base font-semibold text-slate-100 ${mono ? "font-mono text-sm break-all" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function QuickLink({
  href,
  icon,
  title,
  desc,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 rounded-2xl border border-slate-700/50 bg-slate-900/50 p-4 transition hover:border-cyan-500/30 hover:bg-slate-800/60"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-lg transition group-hover:bg-cyan-500/15">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold text-white group-hover:text-cyan-100">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-slate-300 sm:text-base">{desc}</p>
      </div>
      <span className="mt-1 text-lg text-slate-400 transition group-hover:text-cyan-400">→</span>
    </Link>
  );
}

function RenewSteps({ t }: { t: (key: string) => string }) {
  const steps = [
    { n: 1, title: t("profile.subscription-manage-step-1-title"), desc: t("profile.subscription-manage-step-1-desc") },
    { n: 2, title: t("profile.subscription-manage-step-2-title"), desc: t("profile.subscription-manage-step-2-desc") },
    { n: 3, title: t("profile.subscription-manage-step-3-title"), desc: t("profile.subscription-manage-step-3-desc") },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {steps.map((step) => (
        <div
          key={step.n}
          className="relative rounded-2xl border border-slate-700/40 bg-slate-900/40 p-4"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/15 text-sm font-bold text-amber-300">
            {step.n}
          </span>
          <p className="mt-3 text-base font-semibold text-white">{step.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-300 sm:text-base">{step.desc}</p>
        </div>
      ))}
    </div>
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
  const periodDays = totalPeriodDays(sub.activated_at, sub.renews_or_expires_at);

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
      {/* Hero premium */}
      <section className="relative mb-8 overflow-hidden rounded-3xl border border-amber-500/20 shadow-2xl shadow-black/50">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/80 via-slate-950 to-slate-950" />
        <img
          src={PREMIUM_HERO_IMG}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-luminosity"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/40" />
        <div className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl" />

        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center lg:p-10">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-sm font-semibold uppercase text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {t("profile.subscription-active-badge")}
              </span>
              {expired && (
                <span className="rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-sm font-semibold uppercase text-rose-300">
                  {t("profile.subscription-manage-expired-badge")}
                </span>
              )}
              {urgentRenewal && (
                <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-sm font-semibold uppercase text-amber-200">
                  {t("profile.subscription-manage-urgent-badge")}
                </span>
              )}
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
              {sub.plan_name ?? t("profile.subscription-premium-fallback")}
            </h2>
            <p className="mt-3 text-xl text-amber-200/95">
              {formatSubscriptionPrice(sub.plan_price, sub.currency)}
              <span className="text-slate-400"> · </span>
              <span className="text-slate-200">
                {formatFrequencyLabel(sub.frequency_type, sub.frequency_value, t)}
              </span>
            </p>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-300">
              {expired
                ? t("profile.subscription-manage-expired-desc")
                : t("profile.subscription-active-desc")}
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 lg:items-end">
            <RenewalRing
              daysLeft={daysLeft}
              elapsedPercent={elapsed}
              urgent={urgentRenewal}
              expired={expired}
              label={t("profile.subscription-manage-days-left-label")}
            />
            {periodDays != null && (
              <p className="text-center text-sm text-slate-300 lg:text-right">
                {t("profile.subscription-manage-period-total", { days: periodDays })}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {/* Renewal timeline card */}
          <section
            className={`rounded-3xl border p-6 sm:p-7 ${
              expired
                ? "border-rose-500/30 bg-rose-950/20"
                : urgentRenewal
                  ? "border-amber-500/30 bg-amber-950/15"
                  : "border-slate-700/50 bg-slate-900/50"
            }`}
          >
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                  {t("profile.subscription-renews")}
                </p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {formatSubscriptionDate(sub.renews_or_expires_at)}
                </p>
                {daysLeft !== null && (
                  <p
                    className={`mt-2 text-base ${
                      expired ? "text-rose-300" : urgentRenewal ? "text-amber-200" : "text-slate-300"
                    }`}
                  >
                    {expired
                      ? t("profile.subscription-manage-expired-days")
                      : daysLeft === 0
                        ? t("profile.subscription-renewal-today")
                        : daysLeft === 1
                          ? t("profile.subscription-days-one")
                          : t("profile.subscription-days-many", { count: daysLeft })}
                  </p>
                )}
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                  {t("profile.subscription-manage-period-left")}
                </p>
                <p className="text-3xl font-bold tabular-nums text-amber-300">
                  {billingPeriodProgress(sub.activated_at, sub.renews_or_expires_at)}%
                </p>
              </div>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  expired
                    ? "bg-gradient-to-r from-rose-600 to-rose-400"
                    : "bg-gradient-to-r from-amber-600 via-amber-400 to-amber-200"
                }`}
                style={{
                  width: `${billingPeriodProgress(sub.activated_at, sub.renews_or_expires_at)}%`,
                }}
              />
            </div>
          </section>

          {/* Details grid */}
          <section className="grid gap-3 sm:grid-cols-2">
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
                      className="rounded-md border border-slate-600 px-2.5 py-1 text-xs font-semibold text-cyan-300 hover:bg-slate-800"
                    >
                      {copied ? t("profile.subscription-manage-copied") : t("profile.subscription-manage-copy")}
                    </button>
                  )}
                </span>
              }
              mono
            />
          </section>

          {/* Benefits */}
          <section className="rounded-3xl border border-slate-700/50 bg-slate-900/40 p-6 sm:p-7">
            <h3 className="text-xl font-bold text-white">
              {t("profile.subscription-manage-benefits-title")}
            </h3>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {BENEFIT_KEYS.map((key, i) => (
                <li
                  key={key}
                  className="flex gap-3 rounded-2xl border border-slate-700/40 bg-slate-950/40 p-4"
                >
                  <span className="text-2xl" aria-hidden>
                    {BENEFIT_ICONS[i]}
                  </span>
                  <span className="text-base leading-relaxed text-slate-200">{t(key)}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* How renewal works */}
          <section className="rounded-3xl border border-slate-700/50 bg-slate-900/40 p-6 sm:p-7">
            <h3 className="text-xl font-bold text-white">{t("profile.subscription-manage-how-title")}</h3>
            <p className="mt-3 text-base leading-relaxed text-slate-300">{t("profile.subscription-renew-desc")}</p>
            <div className="mt-6">
              <RenewSteps t={t} />
            </div>
          </section>
        </div>

        {/* Sticky sidebar */}
        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <div className="overflow-hidden rounded-3xl border border-amber-500/25 bg-gradient-to-b from-slate-900 to-slate-950 shadow-xl shadow-amber-950/20">
            <div className="border-b border-amber-500/15 bg-amber-500/5 px-5 py-4">
              <h3 className="text-xl font-bold text-white">
                {expired
                  ? t("profile.subscription-manage-reactivate-title")
                  : t("profile.subscription-manage-actions-title")}
              </h3>
            </div>
            <div className="p-5">
              <button
                type="button"
                onClick={() => checkout.startCheckout(sub.plan_id)}
                className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4 text-base font-bold text-slate-900 shadow-lg shadow-amber-500/30 transition hover:from-amber-400 hover:to-amber-500"
              >
                <span className="relative z-10">
                  {expired
                    ? t("profile.subscription-manage-reactivate-cta")
                    : t("profile.subscription-renew-now")}
                </span>
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition group-hover:translate-x-full duration-700" />
              </button>
              <button
                type="button"
                onClick={() => checkout.startCheckout()}
                className="mt-3 w-full rounded-2xl border border-slate-600 bg-slate-800/60 px-6 py-3.5 text-base font-semibold text-slate-100 transition hover:border-amber-500/40 hover:text-white"
              >
                {t("profile.subscription-change-plan")}
              </button>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">
                {t("profile.subscription-renew-hint")}
              </p>
            </div>
          </div>

          <SubscriptionDonationWalletCard token={token} mounted={mounted} />

          <div className="space-y-2 rounded-3xl border border-slate-700/50 bg-slate-900/40 p-4">
            <p className="px-1 text-sm font-semibold uppercase tracking-wider text-slate-400">
              {t("profile.subscription-manage-links")}
            </p>
            <QuickLink
              href="/subscriptions"
              icon="⚔️"
              title={t("profile.subscription-explore-benefits")}
              desc={t("profile.subscription-manage-link-benefits-desc")}
            />
            <QuickLink
              href="/accounts"
              icon="👤"
              title={t("profile.subscription-link-accounts")}
              desc={t("profile.subscription-manage-link-accounts-desc")}
            />
            <QuickLink
              href="/profile/purchases"
              icon="🧾"
              title={t("profile.subscription-manage-purchases")}
              desc={t("profile.subscription-manage-link-purchases-desc")}
            />
          </div>
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
    <section className="relative overflow-hidden rounded-3xl border border-slate-700/50">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950/40 via-slate-950 to-slate-950" />
      <img
        src={PREMIUM_HERO_IMG}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover opacity-20"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-slate-950/60" />

      <div className="relative grid gap-10 p-8 sm:p-12 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-amber-400">
            {t("profile.subscription-upsell-kicker")}
          </p>
          <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
            {t("profile.subscription-no-active-title")}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-300">
            {t("profile.subscription-upsell-subtitle")}
          </p>
          {cheapestPaid && (
            <p className="mt-6 inline-flex items-baseline gap-2 rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-2">
              <span className="text-base text-amber-200">{t("profile.subscription-manage-from")}</span>
              <span className="text-2xl font-bold text-amber-300">
                {formatSubscriptionPrice(
                  cheapestPaid.discounted_price ?? cheapestPaid.price,
                  "USD",
                )}
              </span>
            </p>
          )}
          <button
            type="button"
            onClick={() => checkout.startCheckout()}
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-4 text-base font-bold text-slate-900 shadow-xl shadow-amber-500/25 transition hover:from-amber-400 hover:to-amber-500"
          >
            {t("profile.subscription-cta-primary")}
            <span aria-hidden>→</span>
          </button>
          <p className="mt-4 text-sm text-slate-300">{t("profile.subscription-trust-line")}</p>
        </div>

        <ul className="space-y-3">
          {BENEFIT_KEYS.map((key, i) => (
            <li
              key={key}
              className="flex gap-4 rounded-2xl border border-white/5 bg-slate-950/50 p-4 backdrop-blur-sm"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-lg">
                {BENEFIT_ICONS[i]}
              </span>
              <span className="text-base leading-relaxed text-slate-100">{t(key)}</span>
            </li>
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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_8%,rgba(251,191,36,0.14),transparent_32%),radial-gradient(circle_at_88%_92%,rgba(56,189,248,0.12),transparent_38%)]" />

      <img
        src={DECORATIVE_TREANT}
        alt=""
        aria-hidden
        className="accounts-decoration-animated pointer-events-none absolute bottom-0 right-4 z-[1] hidden w-[18rem] opacity-60 md:block lg:right-8 lg:w-[22rem]"
      />

      <div className="contenedor relative z-30 mb-6">
        <NavbarAuthenticated />
      </div>

      <div className="contenedor relative z-10 py-6 sm:py-10">
        <header className="mb-8 sm:mb-10">
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 rounded-lg border border-transparent px-2 py-1 text-base text-slate-300 transition hover:border-slate-700 hover:text-cyan-300"
          >
            <span aria-hidden>←</span>
            {t("profile.subscription-manage-back")}
          </Link>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-400">
                Azeroth Pass
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {t("profile.subscription-manage-title")}
              </h1>
              <p className="mt-3 max-w-xl text-lg leading-relaxed text-slate-300">
                {t("profile.manage-subscription-desc")}
              </p>
            </div>
            {isActive && sub && (
              <div className="hidden rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-right sm:block">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Plan</p>
                <p className="text-base font-semibold text-amber-200">{sub.plan_name}</p>
              </div>
            )}
          </div>
        </header>

        {showLoading ? (
          <div className="flex min-h-[45vh] items-center justify-center rounded-3xl border border-slate-800/60 bg-slate-900/30">
            <LoadingSpinner />
          </div>
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

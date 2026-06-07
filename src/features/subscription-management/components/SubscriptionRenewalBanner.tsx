"use client";

import type { CurrentSubscriptionDetail } from "@/api/subscriptions";
import {
  daysUntilRenewal,
  formatSubscriptionDate,
} from "@/features/subscription-management/utils/subscriptionFormat";
import Link from "next/link";
import { useTranslation } from "react-i18next";

interface SubscriptionRenewalBannerProps {
  active: boolean;
  subscription: CurrentSubscriptionDetail | null;
  variant?: "banner" | "inline";
  className?: string;
}

function useRenewalState(subscription: CurrentSubscriptionDetail | null) {
  const daysLeft = subscription
    ? daysUntilRenewal(subscription.renews_or_expires_at)
    : null;
  const expired = daysLeft !== null && daysLeft < 0;
  const urgent = !expired && daysLeft !== null && daysLeft <= 14;
  const showBanner =
    expired || urgent || (daysLeft !== null && daysLeft <= 30);

  return { daysLeft, expired, urgent, showBanner };
}

export default function SubscriptionRenewalBanner({
  active,
  subscription,
  variant = "banner",
  className = "",
}: SubscriptionRenewalBannerProps) {
  const { t } = useTranslation();

  if (!active || !subscription) return null;

  const { daysLeft, expired, urgent, showBanner } =
    useRenewalState(subscription);

  if (variant === "inline") {
    if (showBanner) {
      return (
        <span className={`account-subscription-btn account-subscription-btn--active inline-flex items-center gap-2 px-4 py-2.5 text-base font-semibold rounded-xl border cursor-default ${className}`}>
          <svg className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{t("account.service-available.btn-subscription-active")}</span>
        </span>
      );
    }

    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        <span className="account-subscription-btn account-subscription-btn--active inline-flex items-center gap-2 px-4 py-2.5 text-base font-semibold rounded-xl border cursor-default">
          <svg className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{t("account.service-available.btn-subscription-active")}</span>
        </span>
        <Link
          href="/profile/subscription"
          className="account-subscription-btn account-subscription-btn--cta inline-flex items-center gap-2 px-5 py-2.5 text-base font-semibold rounded-xl border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{t("profile.subscription-renew-now")}</span>
        </Link>
      </div>
    );
  }

  if (!showBanner) return null;

  return (
    <div className={className}>
      <div
        className={`relative overflow-hidden rounded-2xl border px-5 py-4 sm:px-6 sm:py-5 ${
          expired
            ? "border-rose-500/40 bg-gradient-to-r from-rose-950/50 via-slate-900/80 to-slate-900/80"
            : urgent
              ? "border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-slate-900/80 to-slate-900/80"
              : "border-cyan-500/25 bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-slate-900/80"
        }`}
      >
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-500/10 blur-2xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                expired
                  ? "bg-rose-500/15 text-rose-300"
                  : urgent
                    ? "bg-amber-500/15 text-amber-300"
                    : "bg-cyan-500/15 text-cyan-300"
              }`}
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {expired
                  ? t("profile.subscription-manage-expired-badge")
                  : urgent
                    ? t("profile.subscription-manage-urgent-badge")
                    : t("account.service-available.renewal-banner-kicker")}
              </p>
              <p className="mt-1 text-lg font-bold text-white sm:text-xl">
                {expired
                  ? t("account.service-available.renewal-banner-expired-title")
                  : urgent
                    ? t("account.service-available.renewal-banner-urgent-title")
                    : t("account.service-available.renewal-banner-title")}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {subscription.plan_name && (
                  <span className="text-slate-300">{subscription.plan_name} · </span>
                )}
                {t("profile.subscription-renews")}{" "}
                <span className="font-medium text-slate-200">
                  {formatSubscriptionDate(subscription.renews_or_expires_at)}
                </span>
                {daysLeft !== null && daysLeft >= 0 && (
                  <span className={urgent ? " text-amber-200" : ""}>
                    {" "}
                    (
                    {daysLeft === 0
                      ? t("profile.subscription-renewal-today")
                      : daysLeft === 1
                        ? t("profile.subscription-days-one")
                        : t("profile.subscription-days-many", { count: daysLeft })}
                    )
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
            <Link
              href="/profile/subscription"
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold shadow-lg transition hover:scale-[1.02] active:scale-[0.98] ${
                expired || urgent
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 shadow-amber-500/25 hover:from-amber-400 hover:to-amber-500"
                  : "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-cyan-500/20 hover:from-cyan-500 hover:to-blue-500"
              }`}
            >
              {expired
                ? t("profile.subscription-manage-reactivate-cta")
                : t("profile.subscription-renew-now")}
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/profile/subscription"
              className="inline-flex items-center justify-center rounded-xl border border-slate-600/60 bg-slate-800/60 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
            >
              {t("profile.subscription-manage-cta")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

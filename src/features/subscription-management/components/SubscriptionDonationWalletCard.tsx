"use client";

import { getAmountWallet } from "@/api/wallet";
import { formatWalletAmount } from "@/features/wallet-balance/utils/formatWalletAmount";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export const SUBSCRIPTION_DONATION_POINTS_MONTHLY = 1;
export const SUBSCRIPTION_DONATION_POINTS_YEARLY = 3;

interface SubscriptionDonationWalletCardProps {
  token: string | undefined;
  mounted: boolean;
}

function CoinMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12" aria-hidden>
      <defs>
        <linearGradient id="donation-coin" x1="8" y1="4" x2="42" y2="44">
          <stop offset="0%" stopColor="#a5f3fc" />
          <stop offset="45%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#0e7490" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="20" fill="url(#donation-coin)" />
      <circle cx="24" cy="24" r="15.5" fill="none" stroke="#ecfeff" strokeWidth="1.6" opacity="0.55" />
      <path
        d="M24 14.5v19M19 19.5c1.4-1.6 3-2.3 5-2.3 3.2 0 5.2 1.7 5.2 4.2 0 2.4-1.6 3.6-4.6 4.3l-2.2.5c-2.7.6-4 1.8-4 4 0 2.5 2.2 4.2 5.7 4.2 2.3 0 4.1-.8 5.5-2.3"
        fill="none"
        stroke="#082f49"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.72"
      />
    </svg>
  );
}

export default function SubscriptionDonationWalletCard({
  token,
  mounted,
}: SubscriptionDonationWalletCardProps) {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<number | null>(null);

  const locale =
    i18n.language === "en"
      ? "en-US"
      : i18n.language === "pt"
        ? "pt-BR"
        : "es-ES";

  useEffect(() => {
    if (!mounted || !token) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const points = await getAmountWallet(token);
        if (!cancelled) setBalance(points ?? 0);
      } catch {
        if (!cancelled) setBalance(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [mounted, token]);

  return (
    <article className="premium-manage-card relative overflow-hidden rounded-2xl border border-cyan-500/15 bg-slate-950">
      <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 left-0 h-28 w-28 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" />

      <div className="relative p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300/90">
              {t("profile.subscription-donation-wallet-kicker")}
            </p>
            <h3 className="mt-1 text-xl font-bold text-white">
              {t("profile.subscription-donation-wallet-title")}
            </h3>
          </div>
          <div className="shrink-0 drop-shadow-[0_8px_18px_rgba(34,211,238,0.35)]">
            <CoinMark />
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-black/35 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <p className="text-sm text-slate-400">
            {t("profile.subscription-donation-wallet-balance-label")}
          </p>
          {loading ? (
            <div className="mt-2 h-11 w-28 animate-pulse rounded-lg bg-slate-800" />
          ) : (
            <p className="mt-1 flex items-baseline gap-2">
              <span className="text-4xl font-bold tabular-nums tracking-tight text-white sm:text-5xl">
                {balance != null ? formatWalletAmount(balance, locale) : "—"}
              </span>
              <span className="text-base font-semibold uppercase tracking-wider text-cyan-200/80">
                {t("profile.subscription-donation-wallet-points-unit")}
              </span>
            </p>
          )}
        </div>

        <p className="mt-4 text-sm font-semibold text-slate-300">
          {t("profile.subscription-donation-wallet-earn-title")}
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-cyan-500/15 bg-slate-900/70 px-3 py-3 text-center">
            <p className="text-lg font-bold text-cyan-200">
              +{SUBSCRIPTION_DONATION_POINTS_MONTHLY}
            </p>
            <p className="mt-0.5 text-sm text-slate-400">
              {t("profile.subscription-donation-wallet-chip-monthly")}
            </p>
          </div>
          <div className="rounded-xl border border-cyan-500/15 bg-slate-900/70 px-3 py-3 text-center">
            <p className="text-lg font-bold text-cyan-200">
              +{SUBSCRIPTION_DONATION_POINTS_YEARLY}
            </p>
            <p className="mt-0.5 text-sm text-slate-400">
              {t("profile.subscription-donation-wallet-chip-yearly")}
            </p>
          </div>
        </div>

        <Link
          href="/store"
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-5 py-3.5 text-base font-bold text-cyan-100 transition hover:-translate-y-0.5 hover:border-cyan-300/60 hover:bg-cyan-400 hover:text-slate-950"
        >
          {t("profile.subscription-donation-wallet-store-cta")}
          <span aria-hidden>→</span>
        </Link>
      </div>
    </article>
  );
}

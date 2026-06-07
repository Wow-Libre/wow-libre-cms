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
    <div className="overflow-hidden rounded-3xl border border-emerald-500/25 bg-gradient-to-b from-emerald-950/30 via-slate-950 to-slate-950 shadow-lg shadow-emerald-950/20">
      <div className="border-b border-emerald-500/15 bg-emerald-500/5 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xl">
            💎
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400/90">
              {t("profile.subscription-donation-wallet-kicker")}
            </p>
            <h3 className="text-lg font-bold text-white">
              {t("profile.subscription-donation-wallet-title")}
            </h3>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="rounded-2xl border border-emerald-500/20 bg-slate-900/60 px-4 py-4">
          <p className="text-sm font-medium text-slate-400">
            {t("profile.subscription-donation-wallet-balance-label")}
          </p>
          {loading ? (
            <div className="mt-2 h-10 w-24 animate-pulse rounded-lg bg-slate-800" />
          ) : (
            <p className="mt-1 text-4xl font-bold tabular-nums tracking-tight text-emerald-300">
              {balance != null ? formatWalletAmount(balance, locale) : "—"}
              <span className="ml-2 text-base font-semibold text-slate-400">
                {t("profile.subscription-donation-wallet-points-unit")}
              </span>
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 px-4 py-4">
          <p className="text-sm font-semibold text-slate-200">
            {t("profile.subscription-donation-wallet-earn-title")}
          </p>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-300 sm:text-base">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 font-bold text-emerald-400">+{SUBSCRIPTION_DONATION_POINTS_MONTHLY}</span>
              <span>{t("profile.subscription-donation-wallet-earn-monthly")}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 font-bold text-emerald-400">+{SUBSCRIPTION_DONATION_POINTS_YEARLY}</span>
              <span>{t("profile.subscription-donation-wallet-earn-yearly")}</span>
            </li>
          </ul>
        </div>

        <p className="text-sm leading-relaxed text-slate-400 sm:text-base">
          {t("profile.subscription-donation-wallet-store-desc")}
        </p>

        <Link
          href="/store"
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-5 py-3.5 text-base font-bold text-white shadow-lg shadow-emerald-900/30 transition hover:from-emerald-500 hover:to-cyan-500"
        >
          {t("profile.subscription-donation-wallet-store-cta")}
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}

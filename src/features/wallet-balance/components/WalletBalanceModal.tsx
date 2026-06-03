"use client";

import { formatWalletAmount } from "@/features/wallet-balance/utils/formatWalletAmount";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

export interface WalletBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  donationBalance: number;
  votingBalance: number;
}

export default function WalletBalanceModal({
  isOpen,
  onClose,
  loading,
  donationBalance,
  votingBalance,
}: WalletBalanceModalProps) {
  const { t, i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);

  const locale =
    i18n.language === "en"
      ? "en-US"
      : i18n.language === "pt"
        ? "pt-BR"
        : "es-ES";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const totalPoints = donationBalance + votingBalance;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wallet-balance-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
        onClick={onClose}
        aria-label={t("navbar_authenticated.notifications.close")}
      />

      <div
        className="relative flex max-h-[min(94vh,720px)] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl border border-slate-600/60 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 shadow-[0_24px_80px_rgba(0,0,0,0.55)] sm:max-w-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-cyan-500/12 to-transparent" />

        <header className="relative shrink-0 border-b border-slate-700/50 px-6 py-5 sm:px-8 sm:py-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 shadow-[0_0_24px_rgba(34,211,238,0.12)]">
                <WalletIcon className="h-7 w-7 text-cyan-300" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400/90">
                  {t("navbar_authenticated.wallet.title")}
                </p>
                <h2
                  id="wallet-balance-modal-title"
                  className="mt-1 text-2xl font-bold leading-tight text-white sm:text-3xl"
                >
                  {t("navbar_authenticated.wallet.modalTitle")}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-400 sm:text-base">
                  {t("navbar_authenticated.wallet.modalSubtitle")}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-xl border border-slate-600/50 p-3 text-slate-400 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white"
              aria-label={t("navbar_authenticated.notifications.close")}
            >
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>
        </header>

        <div className="scrollbar-hide relative flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-7">
          {loading ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-4">
              <div className="h-11 w-11 animate-spin rounded-full border-[3px] border-cyan-400/30 border-t-cyan-400" />
              <p className="text-base text-slate-400">
                {t("navbar_authenticated.wallet.loading")}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 sm:text-sm">
                  {t("navbar_authenticated.wallet.totalLabel")}
                </p>
                <p className="mt-2 text-4xl font-bold tabular-nums tracking-tight text-white sm:text-5xl">
                  {formatWalletAmount(totalPoints, locale)}
                </p>
                <p className="mt-1 text-sm text-slate-400 sm:text-base">
                  {t("navbar_authenticated.wallet.pointsUnit")}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <BalanceCard
                  accent="emerald"
                  icon={<CoinIcon className="h-6 w-6" />}
                  title={t("navbar_authenticated.wallet.donationTitle")}
                  description={t(
                    "navbar_authenticated.wallet.donationDescription"
                  )}
                  amount={formatWalletAmount(donationBalance, locale)}
                  unit={t("navbar_authenticated.wallet.pointsUnit")}
                />
                <BalanceCard
                  accent="amber"
                  icon={<VoteIcon className="h-6 w-6" />}
                  title={t("navbar_authenticated.wallet.votingTitle")}
                  description={t(
                    "navbar_authenticated.wallet.votingDescription"
                  )}
                  amount={formatWalletAmount(votingBalance, locale)}
                  unit={t("navbar_authenticated.wallet.pointsUnit")}
                />
              </div>

              <p className="rounded-xl border border-slate-700/40 bg-slate-800/25 px-4 py-3 text-sm leading-relaxed text-slate-400 sm:text-base">
                {t("navbar_authenticated.wallet.rechargeHint")}
              </p>
            </div>
          )}
        </div>

        <footer className="flex shrink-0 flex-col gap-3 border-t border-slate-700/50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-6">
          <Link
            href="/bank"
            onClick={onClose}
            className="text-center text-sm font-medium text-slate-400 transition hover:text-cyan-300 sm:text-left sm:text-base"
          >
            {t("navbar_authenticated.wallet.bankLink")}
          </Link>
          <Link
            href="/store"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg transition hover:from-cyan-500 hover:to-sky-500 sm:py-4 sm:text-lg"
          >
            <PlusIcon className="h-5 w-5 shrink-0" />
            {t("navbar_authenticated.wallet.recharge")}
          </Link>
        </footer>
      </div>
    </div>,
    document.body
  );
}

function BalanceCard({
  accent,
  icon,
  title,
  description,
  amount,
  unit,
}: {
  accent: "emerald" | "amber";
  icon: ReactNode;
  title: string;
  description: string;
  amount: string;
  unit: string;
}) {
  const accentStyles =
    accent === "emerald"
      ? {
          border: "border-emerald-500/25",
          bg: "bg-emerald-500/8",
          icon: "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
          amount: "text-emerald-300",
        }
      : {
          border: "border-amber-500/25",
          bg: "bg-amber-500/8",
          icon: "border-amber-500/30 bg-amber-500/15 text-amber-200",
          amount: "text-amber-200",
        };

  return (
    <article
      className={`rounded-2xl border p-5 ${accentStyles.border} ${accentStyles.bg}`}
    >
      <div
        className={`mb-4 inline-flex rounded-xl border p-2.5 ${accentStyles.icon}`}
      >
        {icon}
      </div>
      <h3 className="text-base font-semibold text-white sm:text-lg">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>
      <div className="mt-4 border-t border-slate-700/40 pt-4">
        <p
          className={`text-2xl font-bold tabular-nums sm:text-3xl ${accentStyles.amount}`}
        >
          {amount}
        </p>
        <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">{unit}</p>
      </div>
    </article>
  );
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3"
      />
    </svg>
  );
}

function CoinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.878 4.004 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function VoteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.745 3.745 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.745 3.745 0 013.296-1.043A3.745 3.745 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.745 3.745 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  );
}

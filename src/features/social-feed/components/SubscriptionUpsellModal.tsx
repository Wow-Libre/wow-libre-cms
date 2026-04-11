"use client";

import { useTranslation } from "react-i18next";

type SubscriptionUpsellModalProps = {
  open: boolean;
  onClose: () => void;
  onGoToSubscriptions: () => void;
};

export function SubscriptionUpsellModal({
  open,
  onClose,
  onGoToSubscriptions,
}: SubscriptionUpsellModalProps) {
  const { t } = useTranslation();
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[30] bg-black/70 backdrop-blur-sm" aria-hidden onClick={onClose} />
      <div
        className="fixed left-1/2 top-1/2 z-[31] w-[min(96vw,40rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-white/15 bg-gray-900/95 shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="community-subscription-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-gradient-to-br from-gaming-primary-main/25 via-gaming-primary-dark/15 to-transparent px-6 pb-5 pt-6 sm:px-8 sm:pt-8">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
            aria-label={t("community.subscription_modal.close")}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <span className="inline-flex rounded-full border border-gaming-primary-light/40 bg-gaming-primary-main/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gaming-primary-light">
            {t("community.subscription_modal.badge")}
          </span>
          <h3 id="community-subscription-modal-title" className="mt-4 text-2xl font-semibold text-white sm:text-3xl">
            {t("community.subscription_modal.title")}
          </h3>
          <p className="mt-3 text-base leading-relaxed text-slate-300 sm:text-lg">
            {t("community.subscription_modal.description")}
          </p>
        </div>

        <div className="px-6 pb-6 pt-4 sm:px-8 sm:pb-8">
          <ul className="space-y-2.5 text-sm text-slate-300 sm:text-base">
            <li className="flex items-start gap-2.5">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-gaming-primary-light" />
              {t("community.subscription_modal.benefit_1")}
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-gaming-primary-light" />
              {t("community.subscription_modal.benefit_2")}
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-gaming-primary-light" />
              {t("community.subscription_modal.benefit_3")}
            </li>
          </ul>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
            >
              {t("community.subscription_modal.later")}
            </button>
            <button
              type="button"
              onClick={onGoToSubscriptions}
              className="rounded-xl bg-gaming-primary-main px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-gaming-primary-dark/35 transition hover:bg-gaming-primary-hover sm:text-base"
            >
              {t("community.subscription_modal.cta")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}


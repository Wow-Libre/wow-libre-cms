"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

interface PremiumActivationStatusProps {
  isOpen: boolean;
  confirmed: boolean;
  timedOut: boolean;
  pending: boolean;
  checking: boolean;
  attempt: number;
  maxAttempts: number;
  onCheckNow: () => void;
  onClose: () => void;
}

export function PremiumActivationStatus({
  isOpen,
  confirmed,
  timedOut,
  pending,
  checking,
  attempt,
  maxAttempts,
  onCheckNow,
  onClose,
}: PremiumActivationStatusProps) {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !confirmed) {
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, confirmed, onClose]);

  if (!mounted || !isOpen) {
    return null;
  }

  const waiting = pending && !confirmed;
  const canDismiss = !confirmed;
  const progress = confirmed
    ? 1
    : maxAttempts > 0
      ? Math.min(0.95, Math.max(0.08, attempt / maxAttempts))
      : 0.08;

  const statusLabel = confirmed
    ? t("register.plan.payment-pending-ready")
    : checking
      ? t("register.plan.payment-checking-now")
      : timedOut
        ? t("register.plan.payment-pending-timeout")
        : t("register.plan.payment-pending-waiting");

  const steps = [
    t("register.plan.payment-checking-step-pay"),
    t("register.plan.payment-checking-step-verify"),
    t("register.plan.payment-checking-step-account"),
  ];
  const activeStep = confirmed ? 2 : 1;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="premium-check-title"
      aria-live="polite"
    >
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={() => {
          if (canDismiss) {
            onClose();
          }
        }}
        aria-hidden
      />

      <div
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0b0e13] shadow-2xl shadow-black/50"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="h-1 bg-gradient-to-r from-cyan-500 via-sky-500 to-violet-500"
          aria-hidden
        />

        <div className="relative px-6 pb-2 pt-7 sm:px-8 sm:pt-8">
          {canDismiss ? (
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white sm:right-5 sm:top-5"
              aria-label={t("register.plan.payment-checking-close")}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          ) : null}
          <p className="mb-3 pr-10 text-[1.1rem] font-medium uppercase tracking-[0.22em] text-cyan-300">
            {t("register.plan.payment-checking-kicker")}
          </p>
          <h2
            id="premium-check-title"
            className="text-[2rem] font-semibold leading-tight tracking-tight text-white sm:text-[2.2rem]"
          >
            {confirmed
              ? t("register.plan.payment-pending-ready")
              : t("register.plan.payment-checking-title")}
          </h2>
          <p className="mt-2 text-[1.4rem] leading-snug text-slate-300">
            {confirmed
              ? t("register.plan.continue-create")
              : t("register.plan.payment-checking-text")}
          </p>
        </div>

        <div className="space-y-5 px-6 py-5 sm:px-8">
          {waiting || confirmed ? (
            <div>
              <div
                className="h-1.5 overflow-hidden rounded-full bg-white/10"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress * 100)}
                aria-label={statusLabel}
              >
                <div
                  className={`h-full rounded-full bg-gradient-to-r from-cyan-400 to-sky-400 transition-[width] duration-700 ${
                    checking ? "animate-pulse" : ""
                  }`}
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>
              <p className="mt-3 text-[1.3rem] text-cyan-100/90">{statusLabel}</p>
            </div>
          ) : (
            <p className="text-[1.35rem] leading-snug text-cyan-100">{statusLabel}</p>
          )}

          <ol className="space-y-3 rounded-xl border border-white/8 bg-[#0d1118] p-4">
            {steps.map((step, index) => {
              const done = index < activeStep;
              const current = index === activeStep && !confirmed;
              return (
                <li key={step} className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[1.15rem] font-semibold ${
                      done
                        ? "bg-cyan-500/20 text-cyan-200"
                        : current
                          ? "bg-cyan-500 text-slate-950"
                          : "bg-white/8 text-slate-500"
                    }`}
                  >
                    {done ? "✓" : index + 1}
                  </span>
                  <span
                    className={`pt-0.5 text-[1.35rem] leading-snug ${
                      current ? "text-white" : done ? "text-slate-300" : "text-slate-500"
                    }`}
                  >
                    {step}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="border-t border-white/8 px-6 py-5 sm:px-8">
          {confirmed ? (
            <p className="text-center text-[1.25rem] text-slate-400">
              {t("register.plan.payment-checking-hint")}
            </p>
          ) : (
            <button
              type="button"
              onClick={onCheckNow}
              disabled={checking}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 px-6 py-3.5 text-[1.45rem] font-semibold text-white shadow-lg shadow-cyan-900/30 transition hover:from-cyan-500 hover:to-sky-500 disabled:cursor-wait disabled:opacity-60"
            >
              {checking
                ? t("register.plan.payment-checking-now")
                : t("register.plan.payment-check")}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

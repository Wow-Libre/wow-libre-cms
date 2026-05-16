"use client";

import { PlansAcquisition } from "@/model/model";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FaCheck } from "react-icons/fa";

const PLANS_MODAL_DECORATIVE_SWORD =
  "https://static.wixstatic.com/media/5dd8a0_9222be68baa94d82b57cdd840b2ec278~mv2.png";

const PREVIEW_FEATURES = 5;

interface SubscriptionPlansModalProps {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  plans: PlansAcquisition[];
  onSelectPlan: (planId: string) => void;
  recommendedPlanIndex: number;
  monthlyPlan?: PlansAcquisition;
}

function getYearlySavingsPercent(
  yearlyPlan: PlansAcquisition,
  monthlyPlan?: PlansAcquisition,
): number | null {
  if (!monthlyPlan) {
    return null;
  }
  const monthlyRate = monthlyPlan.discounted_price || monthlyPlan.price;
  const yearlyTotal = yearlyPlan.discounted_price || yearlyPlan.price;
  const annualFromMonthly = monthlyRate * 12;
  if (annualFromMonthly <= yearlyTotal) {
    return null;
  }
  return Math.round((1 - yearlyTotal / annualFromMonthly) * 100);
}

export default function SubscriptionPlansModal({
  open,
  onClose,
  loading,
  plans,
  onSelectPlan,
  recommendedPlanIndex,
  monthlyPlan,
}: SubscriptionPlansModalProps) {
  const { t } = useTranslation();

  const orderedPlans = useMemo(() => {
    if (plans.length <= 1) {
      return plans;
    }
    const recommended = plans[recommendedPlanIndex];
    if (!recommended) {
      return plans;
    }
    const rest = plans.filter((_, i) => i !== recommendedPlanIndex);
    const mid = Math.floor(rest.length / 2);
    return [...rest.slice(0, mid), recommended, ...rest.slice(mid)];
  }, [plans, recommendedPlanIndex]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative flex max-h-[94vh] w-full max-w-6xl flex-col overflow-visible rounded-2xl border border-white/10 bg-[#0b0e13] shadow-2xl lg:max-w-7xl 2xl:max-w-[88rem]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="plans-modal-title"
      >
        {/* Decorative sword — visible on the right, not covered by heavy gradients */}
        <div
          className="pointer-events-none absolute -right-10 bottom-0 z-[3] w-[min(72vw,22rem)] sm:-right-6 sm:w-[26rem] lg:-right-4 lg:w-[30rem] xl:w-[34rem]"
          aria-hidden
        >
          <img
            src={PLANS_MODAL_DECORATIVE_SWORD}
            alt=""
            className="store-sword-animated h-auto w-full object-contain object-bottom opacity-65 mix-blend-screen lg:opacity-70"
          />
        </div>

        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_70%_55%_at_100%_85%,rgba(34,211,238,0.08),transparent_55%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-20 bg-gradient-to-b from-[#0b0e13] to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-16 bg-gradient-to-t from-[#0b0e13] to-transparent"
          aria-hidden
        />

        <div className="relative z-10 flex max-h-[92vh] min-h-0 flex-col bg-[#0b0e13]/95 backdrop-blur-sm">
          <header className="flex shrink-0 items-start justify-between gap-4 border-b border-white/8 px-6 py-5 sm:px-8 sm:py-6">
            <div className="min-w-0 pr-2 sm:max-w-[70%]">
              <p className="font-gaming-alt mb-2 text-xs font-medium uppercase tracking-[0.22em] text-cyan-300">
                {t("subscription.plans-modal.kicker")}
              </p>
              <h2
                id="plans-modal-title"
                className="font-gaming text-3xl font-semibold tracking-wide text-white sm:text-[2rem]"
              >
                {t("subscription.plans-modal.title")}
              </h2>
              <p className="font-gaming-alt mt-2.5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
                {t("subscription.plans-modal.subtitle")}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
              aria-label={t("subscription.plans-modal.close")}
            >
              <span className="text-2xl leading-none" aria-hidden>
                ×
              </span>
            </button>
          </header>

          <div className="modal-scroll-slate min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-white/80" />
                <p className="font-gaming-alt text-base text-slate-400">
                  {t("subscription.plans-modal.loading")}
                </p>
              </div>
            ) : plans.length === 0 ? (
              <p className="font-gaming-alt py-20 text-center text-base text-slate-400">
                {t("subscription.plans-modal.no-plans")}
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6 xl:pr-6">
                {orderedPlans.map((plan) => {
                  const originalIndex = plans.findIndex((p) => p.id === plan.id);
                  const isRecommended = originalIndex === recommendedPlanIndex;
                  const isFree = plan.price === 0;
                  const isYearly =
                    plan.frequency_type === "YEARLY" && plan.price > 0;
                  const savings = isYearly
                    ? getYearlySavingsPercent(plan, monthlyPlan)
                    : null;
                  const hasDiscount = (plan.discount ?? 0) > 0;
                  const displayPrice = hasDiscount
                    ? `$${Number(plan.discounted_price ?? 0).toFixed(2)}`
                    : plan.price_title;
                  const priceSuffix =
                    hasDiscount && plan.price > 0
                      ? plan.frequency_type === "YEARLY"
                        ? t("subscription.per-year")
                        : t("subscription.recurrency")
                      : null;
                  const previewFeatures = plan.features.slice(0, PREVIEW_FEATURES);
                  const moreFeatures = plan.features.length - PREVIEW_FEATURES;

                  return (
                    <article
                      key={plan.id}
                      className={`flex min-h-[460px] flex-col rounded-xl border p-6 transition sm:p-8 ${
                        isRecommended
                          ? "border-amber-500/55 bg-[#121820]/92 shadow-[0_0_0_1px_rgba(245,158,11,0.15)] backdrop-blur-md"
                          : "border-white/12 bg-[#0d1118]/92 hover:border-white/20 backdrop-blur-md"
                      }`}
                    >
                      {isRecommended ? (
                        <span className="font-gaming mb-4 inline-block w-fit rounded-md bg-amber-500/20 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-300 sm:text-xs">
                          {t("subscription.plans-modal.recommended")}
                        </span>
                      ) : (
                        <span className="mb-4 block h-6" aria-hidden />
                      )}

                      <h3 className="font-gaming text-2xl font-semibold tracking-wide text-white">
                        {plan.name}
                      </h3>

                      <p className="font-gaming mt-3 text-4xl font-semibold tabular-nums tracking-tight text-white sm:text-[2.75rem]">
                        {displayPrice}
                        {priceSuffix ? (
                          <span className="font-gaming-alt ml-1 text-lg font-normal text-slate-400 sm:text-xl">
                            {priceSuffix}
                          </span>
                        ) : null}
                      </p>

                      {savings != null && savings > 0 ? (
                        <p className="font-gaming-alt mt-2 text-base font-medium text-emerald-300">
                          {t("subscription.plans-modal.savings-vs-monthly", {
                            percent: savings,
                          })}
                        </p>
                      ) : (
                        <span className="mt-2 block h-5" aria-hidden />
                      )}

                      {plan.description ? (
                        <p className="font-gaming-alt mt-4 text-base leading-relaxed text-slate-300">
                          {plan.description}
                        </p>
                      ) : null}

                      <ul className="mt-6 flex-1 space-y-3 border-t border-white/8 pt-5">
                        {previewFeatures.map((feature, idx) => (
                          <li
                            key={`${plan.id}-feature-${idx}`}
                            className="flex gap-3 text-base leading-snug text-slate-200"
                          >
                            <FaCheck
                              className="mt-1 shrink-0 text-emerald-400"
                              size={14}
                              aria-hidden
                            />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {moreFeatures > 0 ? (
                        <p className="font-gaming-alt mt-3 text-sm text-slate-400">
                          {t("subscription.plans-modal.more-features", {
                            count: moreFeatures,
                          })}
                        </p>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => onSelectPlan(String(plan.id))}
                        className={`font-gaming mt-6 w-full rounded-lg px-4 py-4 text-base font-semibold uppercase tracking-wide transition ${
                          isFree
                            ? "border border-white/25 bg-transparent text-white hover:bg-white/5"
                            : isRecommended
                              ? "bg-amber-500 text-black hover:bg-amber-400"
                              : "bg-white text-black hover:bg-slate-200"
                        }`}
                      >
                        {isFree
                          ? t("subscription.plans-modal.free-cta")
                          : isRecommended
                            ? t("subscription.plans-modal.subscribe-cta")
                            : t("subscription.plans-modal.select-plan")}
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <footer className="shrink-0 border-t border-white/8 px-6 py-4 text-center sm:px-8">
            <p className="font-gaming-alt text-sm tracking-wide text-slate-400 sm:text-[15px]">
              {t("subscription.plans-modal.trust-footer")}
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}

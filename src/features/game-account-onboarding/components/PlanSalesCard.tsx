"use client";

import { FaCheck } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { checkoutPitch } from "@/features/plan-selection/utils/planDuration";

export interface PlanSalesCardModel {
  id: string;
  name: string;
  price: number;
  description?: string;
  discount?: number;
  discounted_price: number;
  currency: string;
  frequency_type: string | null;
  frequency_value: number | null;
  features: string[];
  recommended?: boolean;
}

interface PlanSalesCardProps {
  plan: PlanSalesCardModel;
  selected: boolean;
  recommended: boolean;
  displayAmount: number;
  period: string;
  hasDiscount: boolean;
  savingsPercent: number | null;
  monthlyEquivalent: string | null;
  formatMoney: (amount: number, currency: string) => string;
  onSelect: () => void;
}

export function PlanSalesCard({
  plan,
  selected,
  recommended,
  displayAmount,
  period,
  hasDiscount,
  savingsPercent,
  monthlyEquivalent,
  formatMoney,
  onSelect,
}: PlanSalesCardProps) {
  const { t } = useTranslation();
  const pitch = checkoutPitch(plan.frequency_type, plan.frequency_value, t);

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className={`relative flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl border p-7 text-left transition duration-300 sm:p-8 ${
        recommended ? "lg:-translate-y-3 lg:scale-[1.03]" : ""
      } ${
        selected
          ? "border-cyan-300 bg-[#0b1219] shadow-[0_28px_70px_-24px_rgba(34,211,238,0.55)]"
          : recommended
            ? "border-cyan-400/50 bg-gradient-to-b from-cyan-950/50 via-[#0b1219] to-[#080c12] shadow-[0_24px_60px_-28px_rgba(34,211,238,0.4)]"
            : "border-white/10 bg-[#0b0f16] hover:border-cyan-400/35 hover:bg-[#0d141c]"
      }`}
    >
      {recommended || selected ? (
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-44 w-56 -translate-x-1/2 rounded-full bg-cyan-400/25 blur-3xl"
          aria-hidden
        />
      ) : null}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-1 ${
          recommended || selected
            ? "bg-gradient-to-r from-transparent via-cyan-300 to-transparent"
            : "bg-gradient-to-r from-transparent via-white/20 to-transparent"
        }`}
      />

      {recommended ? (
        <p className="relative mb-5 inline-flex w-fit rounded-full bg-cyan-400 px-3 py-1 text-[1.15rem] font-bold uppercase tracking-[0.16em] text-slate-950">
          {t("register.plan.recommended-badge")}
        </p>
      ) : (
        <p className="relative mb-5 text-[1.15rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Premium
        </p>
      )}

      <h3 className="font-gaming relative text-[2.4rem] font-semibold tracking-wide text-white">
        {plan.name}
      </h3>

      <div className="relative mt-4 flex flex-wrap items-end gap-x-2">
        {hasDiscount ? (
          <span className="mb-1 text-[1.4rem] text-slate-500 line-through">
            {formatMoney(plan.price, plan.currency)}
          </span>
        ) : null}
        <p className="font-gaming text-[4.4rem] font-semibold leading-none tracking-tight text-white">
          {formatMoney(displayAmount, plan.currency)}
          {period ? (
            <span className="font-gaming-alt ml-1 text-[1.6rem] font-normal text-slate-400">
              {period}
            </span>
          ) : null}
        </p>
      </div>

      {savingsPercent != null && savingsPercent > 0 ? (
        <p className="relative mt-3 inline-flex w-fit rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[1.3rem] font-semibold text-cyan-200">
          {t("subscription.plans-modal.savings-vs-monthly", {
            percent: savingsPercent,
          })}
        </p>
      ) : monthlyEquivalent ? (
        <p className="relative mt-3 text-[1.35rem] text-slate-400">
          {t("register.plan.billed-as-monthly", { price: monthlyEquivalent })}
        </p>
      ) : (
        <p className="relative mt-3 h-7" aria-hidden>
          &nbsp;
        </p>
      )}

      {pitch ? (
        <p className="font-gaming-alt relative mt-4 text-[1.45rem] leading-relaxed text-slate-300">
          {pitch}
        </p>
      ) : null}

      <ul className="relative mt-6 flex-1 space-y-3 border-t border-white/10 pt-5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-400/15 text-cyan-300">
              <FaCheck size={11} aria-hidden />
            </span>
            <span className="text-[1.45rem] leading-snug text-slate-200">
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <div
        className={`font-gaming relative mt-7 w-full rounded-xl px-4 py-4 text-center text-[1.5rem] font-semibold uppercase tracking-[0.08em] transition ${
          selected || recommended
            ? "bg-cyan-400 text-slate-950 shadow-[0_14px_30px_-12px_rgba(34,211,238,0.7)]"
            : "bg-white text-slate-950"
        }`}
      >
        {selected
          ? t("register.plan.cta-selected")
          : recommended
            ? t("register.plan.cta-start")
            : t("register.plan.cta-select")}
      </div>
    </article>
  );
}

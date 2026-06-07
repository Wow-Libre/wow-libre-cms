"use client";

import { PaymentMethodsGatewayReponse } from "@/dto/response/PaymentMethodsResponse";
import { useTranslation } from "react-i18next";
import { FaCreditCard } from "react-icons/fa";

interface SubscriptionPaymentMethodModalProps {
  open: boolean;
  onClose: () => void;
  paymentMethods: PaymentMethodsGatewayReponse[];
  onSelect: (method: PaymentMethodsGatewayReponse) => void;
}

export default function SubscriptionPaymentMethodModal({
  open,
  onClose,
  paymentMethods,
  onSelect,
}: SubscriptionPaymentMethodModalProps) {
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center bg-black/80 p-0 backdrop-blur-md sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-t-3xl border border-slate-600/60 bg-slate-950 shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-violet-500/10 to-transparent" />
        <div className="relative border-b border-slate-700/60 px-5 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/20">
              <FaCreditCard className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-violet-300/90">
                {t("subscription.payment-modal.kicker")}
              </p>
              <h3 className="mt-1 text-lg font-bold text-white">
                {t("subscription.payment-modal.title")}
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                {t("subscription.payment-modal.subtitle")}
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-2 p-4 pb-6">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              type="button"
              onClick={() => onSelect(method)}
              className="flex w-full items-center gap-3 rounded-2xl border border-slate-700/60 bg-slate-900/80 px-4 py-4 text-left transition hover:border-cyan-500/40 hover:bg-slate-800"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-violet-300">
                <FaCreditCard className="h-4 w-4" />
              </span>
              <span className="flex-1 font-semibold text-white">{method.name}</span>
              <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-medium uppercase text-slate-400">
                {method.payment_type}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

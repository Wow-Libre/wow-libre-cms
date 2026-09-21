"use client";

import {
  formatPurchaseDate,
  formatPurchasePrice,
} from "@/features/purchases/utils/formatPurchaseDate";
import {
  getTransactionProgress,
  getTransactionProgressBarClass,
  getTransactionStatusColorClass,
  getTransactionStatusLabel,
} from "@/lib/transaction/transactionStatus";
import { Transaction } from "@/model/model";

interface PurchaseCardProps {
  transaction: Transaction;
  onViewDetail: (referenceNumber: string, preview: Transaction) => void;
}

export default function PurchaseCard({
  transaction,
  onViewDetail,
}: PurchaseCardProps) {
  const progress = getTransactionProgress(
    transaction.status,
    transaction.progress
  );
  const statusLabel = getTransactionStatusLabel(transaction.status);

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-cyan-500/15 bg-slate-900/50 p-5 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-cyan-400/35 hover:bg-slate-900/70 sm:p-6">
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-5">
          <div className="relative shrink-0">
            <img
              src={transaction.logo}
              alt=""
              className="h-20 w-20 rounded-xl border border-cyan-500/20 object-cover shadow-md transition-transform duration-300 group-hover:scale-[1.02] sm:h-24 sm:w-24"
            />
            <span
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-slate-900 bg-cyan-500 text-sm font-bold text-slate-950"
              aria-hidden
            >
              $
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h3 className="text-xl font-semibold leading-snug text-white transition-colors group-hover:text-cyan-100 sm:text-2xl">
                {transaction.product_name}
              </h3>
              <span
                className={`inline-flex shrink-0 items-center rounded-full border px-3.5 py-1.5 text-base font-semibold ${getTransactionStatusColorClass(
                  transaction.status
                )}`}
              >
                {statusLabel}
              </span>
            </div>

            <p className="mt-2 font-mono text-base text-slate-400">
              {transaction.reference_number}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-base text-slate-300 sm:text-lg">
              <time dateTime={transaction.date}>
                {formatPurchaseDate(transaction.date)}
              </time>
              <span className="hidden text-slate-600 sm:inline">·</span>
              <span className="font-medium text-slate-200">
                Entrega {progress}%
              </span>
            </div>

            <div className="mt-4 h-2 w-full max-w-xs overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getTransactionProgressBarClass(
                  progress
                )}`}
                style={{ width: `${progress}%` }}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Progreso de entrega: ${progress}%`}
              />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-row items-center justify-between gap-5 border-t border-cyan-500/15 pt-5 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0 sm:text-right">
          <div>
            <p className="text-base uppercase tracking-wider text-slate-400">
              Total
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-white sm:text-3xl">
              {formatPurchasePrice(transaction.price, transaction.currency)}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              onViewDetail(transaction.reference_number, transaction)
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-5 py-3 text-base font-semibold text-cyan-100 transition-colors hover:border-cyan-400/60 hover:bg-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 sm:text-lg"
          >
            Ver detalle
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
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}

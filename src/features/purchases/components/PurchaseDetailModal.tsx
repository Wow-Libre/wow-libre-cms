"use client";

import {
  formatPurchaseDate,
  formatPurchasePrice,
} from "@/features/purchases/utils/formatPurchaseDate";
import {
  buildPurchaseSupportMessage,
  getWhatsAppSupportHref,
} from "@/features/purchases/utils/whatsappSupport";
import {
  getTransactionProgress,
  getTransactionProgressBarClass,
  getTransactionStatusColorClass,
  getTransactionStatusLabel,
  normalizeTransactionStatus,
  TRANSACTION_STATUS,
} from "@/lib/transaction/transactionStatus";
import { Transaction } from "@/model/model";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface PurchaseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-slate-700/40 py-4 last:border-0 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:py-5">
      <span className="shrink-0 text-base font-medium text-slate-400">
        {label}
      </span>
      <span
        className={`text-base font-semibold leading-relaxed text-white sm:max-w-[62%] sm:text-lg sm:text-right ${mono ? "font-mono break-all" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

function formatPaymentMethod(method: string): string {
  const labels: Record<string, string> = {
    PAYU: "PayU",
    MERCADOPAGO: "Mercado Pago",
    PAYPAL: "PayPal",
    STRIPE: "Stripe",
    POINTS: "Créditos",
  };
  const key = method.toUpperCase().replace(/\s+/g, "_");
  return labels[key] ?? method;
}

export default function PurchaseDetailModal({
  isOpen,
  onClose,
  transaction,
  loading,
  error,
  onRetry,
}: PurchaseDetailModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

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

  const copyText = useCallback(async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      window.setTimeout(() => setCopiedField(null), 2000);
    } catch {
      setCopiedField(null);
    }
  }, []);

  const whatsAppSupportHref = getWhatsAppSupportHref();
  const whatsAppSupportHint = buildPurchaseSupportMessage(
    transaction
      ? {
          reference_number: transaction.reference_number,
          product_name: transaction.product_name,
          status: transaction.status,
        }
      : null
  );

  const handleWhatsAppHelp = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(whatsAppSupportHint);
    } catch {
      /* el enlace sigue abriendo el grupo aunque no se copie */
    }
  }, [whatsAppSupportHint]);

  if (!isOpen || !mounted) return null;

  const progress = transaction
    ? getTransactionProgress(transaction.status, transaction.progress)
    : 0;
  const statusKey = transaction
    ? normalizeTransactionStatus(transaction.status)
    : "";
  const isDelivered =
    statusKey === TRANSACTION_STATUS.DELIVERED ||
    statusKey === TRANSACTION_STATUS.PAID;
  const showSkeleton = loading && !transaction;

  const modal = (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="purchase-detail-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
        onClick={onClose}
        aria-label="Cerrar detalle"
      />

      <div
        className="relative flex max-h-[min(94vh,840px)] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl border border-slate-600/60 bg-slate-950 text-base shadow-[0_24px_80px_rgba(0,0,0,0.55)] sm:max-w-3xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-cyan-500/15 to-transparent" />

        <header className="relative flex shrink-0 items-start justify-between gap-4 border-b border-slate-700/50 px-6 py-5 sm:px-8 sm:py-6">
          <div className="min-w-0 pr-2">
            <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400/90">
              Detalle del pedido
            </p>
            <h2
              id="purchase-detail-title"
              className="mt-2 text-2xl font-bold leading-tight text-white sm:text-3xl"
            >
              {showSkeleton
                ? "Cargando..."
                : transaction?.product_name ?? "Transacción"}
            </h2>
            {transaction?.reference_number && !showSkeleton && (
              <p className="mt-2 break-all font-mono text-sm text-slate-400 sm:text-base">
                {transaction.reference_number}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-xl border border-slate-600/50 p-3 text-slate-400 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white"
            aria-label="Cerrar"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </header>

        <div className="scrollbar-hide relative flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-7">
          {loading && transaction && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/50 backdrop-blur-[2px]"
              aria-hidden
            >
              <div className="h-11 w-11 animate-spin rounded-full border-[3px] border-cyan-400/30 border-t-cyan-400" />
            </div>
          )}

          {showSkeleton ? (
            <div className="space-y-6 animate-pulse">
              <div className="flex gap-5">
                <div className="h-28 w-28 rounded-xl bg-slate-800 sm:h-32 sm:w-32" />
                <div className="flex-1 space-y-3">
                  <div className="h-7 w-3/4 rounded-lg bg-slate-800" />
                  <div className="h-5 w-1/2 rounded-lg bg-slate-800" />
                </div>
              </div>
              <div className="h-28 rounded-xl bg-slate-800/80" />
              <div className="h-40 rounded-xl bg-slate-800/80" />
            </div>
          ) : error && !transaction ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-rose-500/30 bg-rose-500/10">
                <svg
                  className="h-8 w-8 text-rose-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <p className="text-base text-slate-300 sm:text-lg">{error}</p>
              <button
                type="button"
                onClick={onRetry}
                className="mt-5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-6 py-3 text-base font-semibold text-cyan-100 hover:bg-cyan-500/20"
              >
                Reintentar
              </button>
            </div>
          ) : transaction ? (
            <div
              className={`space-y-6 transition-opacity ${loading ? "opacity-50" : ""}`}
            >
              {error && (
                <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100 sm:text-base">
                  {error} — Mostrando datos parciales.
                </p>
              )}

              <section className="flex gap-5 rounded-xl border border-slate-700/50 bg-slate-800/40 p-5 sm:p-6">
                <img
                  src={transaction.logo}
                  alt=""
                  className="h-24 w-24 shrink-0 rounded-xl border border-slate-600/50 object-cover sm:h-32 sm:w-32"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span
                      className={`inline-flex rounded-full border px-3.5 py-1.5 text-sm font-semibold sm:text-base ${getTransactionStatusColorClass(
                        transaction.status
                      )}`}
                    >
                      {getTransactionStatusLabel(transaction.status)}
                    </span>
                    {transaction.subscription && (
                      <span className="rounded-full border border-violet-400/30 bg-violet-500/15 px-3.5 py-1.5 text-sm font-semibold text-violet-200 sm:text-base">
                        Suscripción
                      </span>
                    )}
                  </div>
                  {transaction.product_id?.description && (
                    <p className="mt-3 line-clamp-4 text-base leading-relaxed text-slate-300 sm:text-lg">
                      {transaction.product_id.description}
                    </p>
                  )}
                  <p className="mt-4 text-3xl font-bold tabular-nums text-white sm:text-4xl">
                    {formatPurchasePrice(
                      transaction.price,
                      transaction.currency
                    )}
                  </p>
                </div>
              </section>

              <section className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-5 sm:p-6">
                <h3 className="mb-4 text-base font-semibold uppercase tracking-wider text-slate-400 sm:text-lg">
                  Entrega
                </h3>
                <div className="mb-3 flex items-center justify-between text-base sm:text-lg">
                  <span className="text-slate-400">Progreso</span>
                  <span className="text-lg font-bold tabular-nums text-white sm:text-xl">
                    {progress}%
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-700/80 sm:h-3.5">
                  <div
                    className={`h-full rounded-full transition-all ${getTransactionProgressBarClass(progress)}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-400 sm:text-base">
                  {isDelivered
                    ? "El beneficio fue procesado correctamente."
                    : progress >= 50
                      ? "Pago registrado. La entrega puede estar en curso."
                      : "En espera de confirmación de pago o procesamiento."}
                </p>
                {transaction.send !== undefined && (
                  <p className="mt-3 text-base text-slate-300 sm:text-lg">
                    Entregado en el juego:{" "}
                    <span className="font-semibold text-white">
                      {transaction.send ? "Sí" : "Pendiente"}
                    </span>
                  </p>
                )}
              </section>

              <section className="rounded-xl border border-slate-700/50 bg-slate-800/30 px-5 sm:px-6">
                <h3 className="border-b border-slate-700/40 py-4 text-base font-semibold uppercase tracking-wider text-slate-400 sm:text-lg">
                  Información
                </h3>
                <DetailRow
                  label="Fecha"
                  value={formatPurchaseDate(transaction.date)}
                />
                <DetailRow
                  label="Referencia del pedido"
                  value={
                    <CopyableValue
                      text={transaction.reference_number}
                      copied={copiedField === "ref"}
                      onCopy={() =>
                        copyText(transaction.reference_number, "ref")
                      }
                    />
                  }
                  mono
                />
                {transaction.reference_payment && (
                  <DetailRow
                    label="Referencia de pago"
                    value={
                      <CopyableValue
                        text={transaction.reference_payment}
                        copied={copiedField === "pay"}
                        onCopy={() =>
                          copyText(transaction.reference_payment!, "pay")
                        }
                      />
                    }
                    mono
                  />
                )}
                {transaction.payment_method && (
                  <DetailRow
                    label="Método de pago"
                    value={formatPaymentMethod(transaction.payment_method)}
                  />
                )}
                {transaction.product_id?.realm_name && (
                  <DetailRow
                    label="Reino"
                    value={transaction.product_id.realm_name}
                  />
                )}
                {transaction.product_id?.product_category_id?.name && (
                  <DetailRow
                    label="Categoría"
                    value={transaction.product_id.product_category_id.name}
                  />
                )}
                {transaction.account_id != null && (
                  <DetailRow
                    label="Cuenta de juego"
                    value={`#${transaction.account_id}`}
                    mono
                  />
                )}
                {transaction.realm_id != null && !transaction.product_id?.realm_name && (
                  <DetailRow
                    label="Reino (ID)"
                    value={`#${transaction.realm_id}`}
                    mono
                  />
                )}
                {transaction.credit_points !== undefined && (
                  <DetailRow
                    label="Pago con créditos"
                    value={transaction.credit_points ? "Sí" : "No"}
                  />
                )}
                <DetailRow
                  label="ID interno"
                  value={`#${transaction.id}`}
                  mono
                />
              </section>
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-base text-slate-400 sm:text-lg">
                No hay datos para mostrar.
              </p>
              {error && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="mt-5 text-base font-semibold text-cyan-300 hover:text-cyan-200"
                >
                  Reintentar
                </button>
              )}
            </div>
          )}
        </div>

        <footer className="flex shrink-0 flex-col gap-3 border-t border-slate-700/50 px-6 py-5 sm:flex-row sm:items-center sm:px-8 sm:py-6">
          <a
            href={whatsAppSupportHref}
            target="_blank"
            rel="noopener noreferrer"
            title={whatsAppSupportHint}
            onClick={() => void handleWhatsAppHelp()}
            className="inline-flex flex-1 items-center justify-center gap-2.5 rounded-xl border border-emerald-500/40 bg-emerald-600/90 py-3.5 text-base font-semibold text-white shadow-lg transition hover:border-emerald-400/60 hover:bg-emerald-500 sm:flex-none sm:px-6 sm:py-4 sm:text-lg"
          >
            <WhatsAppIcon className="h-6 w-6 shrink-0" />
            Pedir ayuda por WhatsApp
          </a>
          <div className="flex flex-1 gap-3 sm:ml-auto sm:flex-none">
            {error && transaction && (
              <button
                type="button"
                onClick={onRetry}
                className="flex-1 rounded-xl border border-cyan-500/40 bg-cyan-500/10 py-3.5 text-base font-semibold text-cyan-100 hover:bg-cyan-500/20 sm:px-6 sm:py-4"
              >
                Actualizar
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-600/50 bg-slate-800/80 py-3.5 text-base font-semibold text-white transition hover:border-cyan-500/40 hover:bg-slate-800 sm:min-w-[10rem] sm:px-8 sm:py-4 sm:text-lg"
            >
              Cerrar
            </button>
          </div>
        </footer>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function CopyableValue({
  text,
  copied,
  onCopy,
}: {
  text: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <span className="inline-flex flex-wrap items-center justify-end gap-3">
      <span className="break-all text-base sm:text-lg">{text}</span>
      <button
        type="button"
        onClick={onCopy}
        className="shrink-0 rounded-lg border border-slate-600/50 px-3 py-1.5 text-sm font-medium text-cyan-300 hover:border-cyan-400/40 hover:bg-cyan-500/10 sm:text-base"
      >
        {copied ? "Copiado" : "Copiar"}
      </button>
    </span>
  );
}

"use client";

import { getAccountAndServerId } from "@/api/account";
import { getPaymentMethodsGateway } from "@/api/payment_methods";
import { buyProduct } from "@/api/store";
import { getAmountWallet } from "@/api/wallet";
import { PaymentMethodsGatewayReponse } from "@/dto/response/PaymentMethodsResponse";
import { parseSizeOptions } from "@/features/store/utils/physicalStock";
import { AccountsModel, BuyRedirectDto } from "@/model/model";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Swal from "sweetalert2";

interface BuyProps {
  isOpen: boolean;
  reference: string;
  token: string;
  realmId: number;
  onClose: () => void;
  isPhysical?: boolean;
  finalPriceUsd?: number;
  sizeOptions?: string | null;
}

const inputClass =
  "mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20";

const labelClass = "block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400";

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

const Buy: React.FC<BuyProps> = ({
  isOpen,
  token,
  reference,
  realmId,
  onClose,
  isPhysical = false,
  finalPriceUsd = 0,
  sizeOptions,
}) => {
  const router = useRouter();

  const [accounts, setAccounts] = useState<AccountsModel[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<number | null>(null);
  const [paymentType, setPaymentType] = useState<PaymentMethodsGatewayReponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [donationPoints, setDonationPoints] = useState(0);
  const [pointsToApply, setPointsToApply] = useState(0);
  const [shipping, setShipping] = useState({
    full_name: "",
    phone: "",
    email: "",
    country: "",
    region: "",
    city: "",
    postal_code: "",
    address_line: "",
    notes: "",
    size: "",
  });

  const sizes = useMemo(() => parseSizeOptions(sizeOptions), [sizeOptions]);
  const maxPoints = useMemo(() => {
    const priceCap = Math.max(0, Math.floor(finalPriceUsd));
    return Math.min(donationPoints, priceCap);
  }, [donationPoints, finalPriceUsd]);
  const remainingUsd = Math.max(0, finalPriceUsd - pointsToApply);
  const coveredByPoints = isPhysical && remainingUsd < 0.01 && pointsToApply > 0;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const requests: Promise<unknown>[] = [getPaymentMethodsGateway(token)];
        if (!isPhysical) {
          requests.unshift(getAccountAndServerId(token, realmId));
        } else {
          requests.unshift(getAmountWallet(token));
        }
        const results = await Promise.all(requests);
        if (isPhysical) {
          setDonationPoints(Number(results[0] ?? 0));
          setPaymentType(results[1] as PaymentMethodsGatewayReponse[]);
        } else {
          const fetchedAccounts = results[0] as { accounts: AccountsModel[] };
          setAccounts(fetchedAccounts.accounts);
          setPaymentType(results[1] as PaymentMethodsGatewayReponse[]);
        }
      } catch (error: unknown) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: error instanceof Error ? error.message : "No se pudo cargar el checkout",
          color: "white",
          background: "#0B1218",
          timer: 4500,
        });
      }
    };

    if (isOpen) {
      setPointsToApply(0);
      void fetchData();
    }
  }, [isOpen, token, realmId, isPhysical]);

  const handleClose = () => {
    onClose();
  };

  const updateShipping = (field: keyof typeof shipping, value: string) => {
    setShipping((prev) => ({ ...prev, [field]: value }));
  };

  const shippingValid =
    !isPhysical ||
    (shipping.full_name.trim() &&
      shipping.phone.trim() &&
      shipping.country.trim() &&
      shipping.city.trim() &&
      shipping.address_line.trim() &&
      (sizes.length === 0 || shipping.size.trim()));

  const canSubmit = isPhysical
    ? Boolean(shippingValid) && (coveredByPoints || selectedPaymentMethod != null) && !loading
    : Boolean(selectedAccountId && selectedPaymentMethod) && !loading;

  const handleBuy = async () => {
    try {
      if (!canSubmit) return;
      setLoading(true);

      const selectedPayment = paymentType.find((p) => p.id === selectedPaymentMethod);
      const paymentTypeName = coveredByPoints
        ? "POINTS"
        : selectedPayment?.payment_type || "";

      const response: BuyRedirectDto = await buyProduct(
        isPhysical ? null : selectedAccountId,
        token,
        false,
        reference,
        paymentTypeName,
        realmId,
        isPhysical
          ? {
              pointsToApply,
              shipping: {
                full_name: shipping.full_name.trim(),
                phone: shipping.phone.trim(),
                email: shipping.email.trim() || undefined,
                country: shipping.country.trim(),
                region: shipping.region.trim() || undefined,
                city: shipping.city.trim(),
                postal_code: shipping.postal_code.trim() || undefined,
                address_line: shipping.address_line.trim(),
                notes: shipping.notes.trim() || undefined,
                size: shipping.size.trim() || undefined,
              },
            }
          : undefined
      );
      if (!response.is_payment) {
        router.push(response.redirect);
        return;
      }

      if (paymentTypeName.toLowerCase() === "payu") {
        const paymentData: Record<string, string> = {
          merchantId: response.payu.merchant_id,
          accountId: response.payu.account_id,
          description: response.description,
          referenceCode: response.reference_code,
          amount: response.amount,
          tax: response.tax,
          taxReturnBase: response.tax_return_base,
          currency: response.currency,
          signature: response.payu.signature,
          test: response.payu.test,
          buyerEmail: response.buyer_email,
          responseUrl: response.response_url,
          confirmationUrl: response.confirmation_url,
        };

        const form = document.createElement("form");
        form.method = "POST";
        form.action = response.redirect;

        Object.keys(paymentData).forEach((key) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = String(paymentData[key]);
          form.appendChild(input);
          form.target = "_blank";
        });

        document.body.appendChild(form);
        form.submit();
      } else {
        window.open(response.redirect, "_blank");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "No se pudo completar la compra";
      const isOutOfStock =
        /agotado|no hay claves|out of stock|claves disponibles|physical product is out of stock/i.test(
          message
        );

      Swal.fire({
        icon: "error",
        title: isOutOfStock ? "Producto agotado" : "Oops...",
        text: isOutOfStock
          ? "Este producto ya no tiene unidades disponibles. Intenta más tarde o elige otro artículo."
          : message,
        color: "white",
        background: "#0B1218",
        timer: isOutOfStock ? 6000 : 4500,
      });
    } finally {
      setLoading(false);
      onClose();
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  const modal = (
    <div className="fixed inset-0 z-[200] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        onClick={handleClose}
        aria-label="Cerrar"
      />
      <div
        className={`relative flex max-h-[min(94vh,920px)] w-full flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 shadow-[0_28px_80px_rgba(2,6,23,0.72)] sm:rounded-2xl ${
          isPhysical ? "max-w-5xl" : "max-w-lg"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-cyan-500/12 via-transparent to-transparent" />

        <header className="relative flex shrink-0 items-start justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-8 sm:py-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300">
              Checkout
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Completar compra
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
              {isPhysical
                ? "Indica a dónde enviamos el pedido. 1 punto de donación descuenta 1 USD."
                : "Elige la cuenta de juego y el método de pago para completar la donación."}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full border border-white/10 bg-slate-900/70 p-2 text-slate-400 transition hover:border-cyan-400/40 hover:text-white"
            aria-label="Cerrar"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="relative min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-8 sm:py-6">
          {isPhysical ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.9fr)] lg:items-start">
              <section className="rounded-2xl border border-white/10 bg-slate-900/55 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-6">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">
                  Dirección de envío
                </h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label="Nombre completo">
                    <input
                      className={inputClass}
                      value={shipping.full_name}
                      onChange={(e) => updateShipping("full_name", e.target.value)}
                      autoComplete="name"
                    />
                  </Field>
                  <Field label="Teléfono">
                    <input
                      className={inputClass}
                      value={shipping.phone}
                      onChange={(e) => updateShipping("phone", e.target.value)}
                      autoComplete="tel"
                    />
                  </Field>
                  <Field label="País">
                    <input
                      className={inputClass}
                      value={shipping.country}
                      onChange={(e) => updateShipping("country", e.target.value)}
                      autoComplete="country-name"
                    />
                  </Field>
                  <Field label="Departamento / región">
                    <input
                      className={inputClass}
                      value={shipping.region}
                      onChange={(e) => updateShipping("region", e.target.value)}
                    />
                  </Field>
                  <Field label="Ciudad">
                    <input
                      className={inputClass}
                      value={shipping.city}
                      onChange={(e) => updateShipping("city", e.target.value)}
                      autoComplete="address-level2"
                    />
                  </Field>
                  <Field label="Código postal">
                    <input
                      className={inputClass}
                      value={shipping.postal_code}
                      onChange={(e) => updateShipping("postal_code", e.target.value)}
                      autoComplete="postal-code"
                    />
                  </Field>
                  <Field label="Dirección" className="sm:col-span-2">
                    <textarea
                      className={`${inputClass} resize-none`}
                      rows={2}
                      value={shipping.address_line}
                      onChange={(e) => updateShipping("address_line", e.target.value)}
                      autoComplete="street-address"
                    />
                  </Field>
                  <Field label="Notas (opcional)" className="sm:col-span-2">
                    <input
                      className={inputClass}
                      value={shipping.notes}
                      onChange={(e) => updateShipping("notes", e.target.value)}
                      placeholder="Referencias de entrega"
                    />
                  </Field>
                </div>
              </section>

              <div className="space-y-4 lg:sticky lg:top-0">
                {sizes.length > 0 ? (
                  <section className="rounded-2xl border border-white/10 bg-slate-900/55 p-5 sm:p-6">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">
                      Talla
                    </h3>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {sizes.map((size) => {
                        const selected = shipping.size === size;
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => updateShipping("size", size)}
                            className={`min-w-[3.25rem] rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                              selected
                                ? "border-cyan-400/60 bg-cyan-500/15 text-cyan-100 ring-1 ring-cyan-400/30"
                                : "border-white/10 bg-slate-950/50 text-slate-300 hover:border-cyan-400/30"
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                ) : null}

                <section className="rounded-2xl border border-cyan-400/25 bg-gradient-to-br from-cyan-500/12 via-slate-900/80 to-slate-950 p-5 sm:p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">
                    Puntos de donación
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    Saldo <span className="font-semibold text-white">{donationPoints}</span>
                    {" · "}1 punto = 1 USD
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/10 bg-slate-950/50 px-3 py-3">
                      <p className="text-[11px] uppercase tracking-wider text-slate-500">Precio</p>
                      <p className="mt-1 text-lg font-bold text-white">
                        ${finalPriceUsd.toLocaleString()} USD
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-slate-950/50 px-3 py-3">
                      <p className="text-[11px] uppercase tracking-wider text-slate-500">A pagar</p>
                      <p className="mt-1 text-lg font-bold text-cyan-300">
                        ${remainingUsd.toFixed(2)} USD
                      </p>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={maxPoints}
                    value={Math.min(pointsToApply, maxPoints)}
                    onChange={(e) => setPointsToApply(Number(e.target.value))}
                    className="mt-5 w-full accent-cyan-400"
                  />
                  <p className="mt-2 text-sm text-slate-300">
                    Usar <span className="font-semibold text-white">{pointsToApply}</span> puntos
                    (−${pointsToApply} USD)
                  </p>
                </section>

                {!coveredByPoints ? (
                  <section className="rounded-2xl border border-white/10 bg-slate-900/55 p-5 sm:p-6">
                    <Field label="Método de pago">
                      <select
                        onChange={(e) => setSelectedPaymentMethod(Number(e.target.value))}
                        value={selectedPaymentMethod || ""}
                        className={inputClass}
                      >
                        <option value="" disabled>
                          Seleccione un método
                        </option>
                        {paymentType.map((payment) => (
                          <option key={payment.id} value={payment.id}>
                            {payment.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </section>
                ) : (
                  <p className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-4 text-sm leading-relaxed text-emerald-100">
                    Los puntos cubren el total. No se usa pasarela de pago.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Field label="Cuenta de juego">
                <select
                  onChange={(e) => setSelectedAccountId(Number(e.target.value))}
                  value={selectedAccountId || ""}
                  className={inputClass}
                >
                  <option value="" disabled>
                    Seleccione una cuenta
                  </option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.account_id}>
                      {account.username}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Método de pago">
                <select
                  onChange={(e) => setSelectedPaymentMethod(Number(e.target.value))}
                  value={selectedPaymentMethod || ""}
                  className={inputClass}
                >
                  <option value="" disabled>
                    Seleccione un método de pago
                  </option>
                  {paymentType.map((payment) => (
                    <option key={payment.id} value={payment.id}>
                      {payment.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          )}
        </div>

        <footer className="flex shrink-0 flex-col gap-3 border-t border-white/10 bg-slate-950/80 px-5 py-4 sm:flex-row sm:justify-end sm:px-8">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl border border-white/10 bg-slate-800/80 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-700 sm:min-w-[8rem]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void handleBuy()}
            disabled={!canSubmit}
            className={`rounded-xl px-6 py-3 text-sm font-semibold sm:min-w-[10rem] ${
              !canSubmit
                ? "cursor-not-allowed border border-white/5 bg-slate-800 text-slate-500"
                : "bg-gradient-to-r from-cyan-600 to-sky-600 text-white shadow-[0_12px_28px_rgba(8,145,178,0.35)] hover:from-cyan-500 hover:to-sky-500"
            }`}
          >
            {loading ? "Procesando..." : "Continuar"}
          </button>
        </footer>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default Buy;

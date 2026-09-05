"use client";

import { getAccountAndServerId } from "@/api/account";
import { getPaymentMethodsGateway } from "@/api/payment_methods";
import { buyProduct } from "@/api/store";
import { getAmountWallet } from "@/api/wallet";
import { PaymentMethodsGatewayReponse } from "@/dto/response/PaymentMethodsResponse";
import { parseSizeOptions } from "@/features/store/utils/physicalStock";
import { AccountsModel, BuyRedirectDto } from "@/model/model";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
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
  "w-full px-4 py-3 bg-slate-800 text-gray-300 text-lg rounded-xl border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-slate-700";

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

  return isOpen ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="mx-4 max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-white">Completar compra</h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-1 text-gray-400 transition-colors hover:bg-slate-700 hover:text-white"
          >
            ×
          </button>
        </div>

        <div className="mb-6 rounded-xl border border-blue-500/20 bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-4">
          <p className="text-lg leading-relaxed text-gray-300">
            {isPhysical
              ? "Completa la dirección de envío. Puedes usar puntos de donación: 1 punto = 1 USD."
              : "Al adquirir este producto también contribuyes al servidor."}
          </p>
        </div>

        <div className="space-y-5">
          {isPhysical ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-lg font-semibold text-gray-300">
                  Nombre completo
                  <input
                    className={inputClass}
                    value={shipping.full_name}
                    onChange={(e) => updateShipping("full_name", e.target.value)}
                  />
                </label>
                <label className="space-y-2 text-lg font-semibold text-gray-300">
                  Teléfono
                  <input
                    className={inputClass}
                    value={shipping.phone}
                    onChange={(e) => updateShipping("phone", e.target.value)}
                  />
                </label>
              </div>
              <label className="block space-y-2 text-lg font-semibold text-gray-300">
                País
                <input
                  className={inputClass}
                  value={shipping.country}
                  onChange={(e) => updateShipping("country", e.target.value)}
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-lg font-semibold text-gray-300">
                  Departamento / región
                  <input
                    className={inputClass}
                    value={shipping.region}
                    onChange={(e) => updateShipping("region", e.target.value)}
                  />
                </label>
                <label className="space-y-2 text-lg font-semibold text-gray-300">
                  Ciudad
                  <input
                    className={inputClass}
                    value={shipping.city}
                    onChange={(e) => updateShipping("city", e.target.value)}
                  />
                </label>
              </div>
              <label className="block space-y-2 text-lg font-semibold text-gray-300">
                Código postal
                <input
                  className={inputClass}
                  value={shipping.postal_code}
                  onChange={(e) => updateShipping("postal_code", e.target.value)}
                />
              </label>
              <label className="block space-y-2 text-lg font-semibold text-gray-300">
                Dirección
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={2}
                  value={shipping.address_line}
                  onChange={(e) => updateShipping("address_line", e.target.value)}
                />
              </label>
              <label className="block space-y-2 text-lg font-semibold text-gray-300">
                Notas
                <input
                  className={inputClass}
                  value={shipping.notes}
                  onChange={(e) => updateShipping("notes", e.target.value)}
                />
              </label>
              {sizes.length > 0 ? (
                <label className="block space-y-2 text-lg font-semibold text-gray-300">
                  Talla
                  <select
                    className={inputClass}
                    value={shipping.size}
                    onChange={(e) => updateShipping("size", e.target.value)}
                  >
                    <option value="">Selecciona una talla</option>
                    {sizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-cyan-100">
                <p className="text-lg font-semibold">Puntos de donación</p>
                <p className="mt-1 text-sm text-cyan-200/80">
                  Saldo: {donationPoints} · 1 punto = 1 USD · Precio: ${finalPriceUsd.toLocaleString()} USD
                </p>
                <input
                  type="range"
                  min={0}
                  max={maxPoints}
                  value={Math.min(pointsToApply, maxPoints)}
                  onChange={(e) => setPointsToApply(Number(e.target.value))}
                  className="mt-4 w-full"
                />
                <p className="mt-2 text-sm">
                  Usar {pointsToApply} puntos (−${pointsToApply} USD). Restan ${remainingUsd.toFixed(2)} USD.
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <span className="text-lg font-semibold text-gray-300">Seleccionar cuenta</span>
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
            </div>
          )}

          {!coveredByPoints ? (
            <div className="space-y-2">
              <span className="text-lg font-semibold text-gray-300">Método de pago</span>
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
            </div>
          ) : (
            <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-200">
              Los puntos cubren el total. No se usa pasarela de pago.
            </p>
          )}
        </div>

        <div className="mt-8 flex space-x-3">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 rounded-xl bg-slate-700 px-6 py-3 text-lg font-semibold text-white hover:bg-slate-600"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void handleBuy()}
            disabled={!canSubmit}
            className={`flex-1 rounded-xl px-6 py-3 text-lg font-semibold ${
              !canSubmit
                ? "cursor-not-allowed bg-gray-500 text-gray-300"
                : "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            }`}
          >
            {loading ? "Procesando..." : "Continuar"}
          </button>
        </div>
      </div>
    </div>
  ) : null;
};

export default Buy;

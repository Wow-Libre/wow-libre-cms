"use client";

import { getAccountAndServerId } from "@/api/account";
import { getCharacters } from "@/api/account/character";
import { getPaymentMethodsGateway } from "@/api/payment_methods";
import { buyProduct } from "@/api/store";
import { PaymentMethodsGatewayReponse } from "@/dto/response/PaymentMethodsResponse";
import { AccountsModel, BuyRedirectDto, Character } from "@/model/model";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

interface BuyProps {
  isOpen: boolean;
  reference: string;
  token: string;
  realmId: number;
  onClose: () => void;
}
const Buy: React.FC<BuyProps> = ({
  isOpen,
  token,
  reference,
  realmId,
  onClose,
}) => {
  const router = useRouter();

  const [accounts, setAccounts] = useState<AccountsModel[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    null
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    number | null
  >(null);
  const [paymentType, setPaymentType] = useState<
    PaymentMethodsGatewayReponse[]
  >([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState<number | null>(
    null
  );
  const [loadingCharacters, setLoadingCharacters] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const buildOfflineInstructions = (
    method?: PaymentMethodsGatewayReponse
  ): string[] => {
    const creds = method?.credentials as Record<string, any> | undefined;
    if (!creds) return [];

    const possible = [
      creds.instructions,
      creds.details,
      creds.info,
      creds.note,
      creds.account,
      creds.account_name,
      creds.accountNumber,
      creds.account_number,
      creds.bank,
      creds.contact,
      creds.phone,
      creds.email,
    ]
      .filter(Boolean)
      .map((item: any) => String(item));

    return possible;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedAccounts, paymentTypeResponse] = await Promise.all([
          getAccountAndServerId(token, realmId),
          getPaymentMethodsGateway(token),
        ]);

        setPaymentType(paymentTypeResponse);
        setAccounts(fetchedAccounts.accounts);
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: `${error.message}`,
          color: "white",
          background: "#0B1218",
          timer: 4500,
        });
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen, token, realmId]);

  const handleAccountChange = async (accountId: number) => {
    setSelectedAccountId(accountId);
    setSelectedCharacterId(null);
    setCharacters([]);

    const account = accounts.find((acc) => acc.account_id === accountId);
    if (!account) return;

    setLoadingCharacters(true);
    try {
      const charactersResponse = await getCharacters(
        token,
        account.account_id,
        account.server_id
      );
      setCharacters(charactersResponse.characters);

      if (charactersResponse.characters.length > 0) {
        setSelectedCharacterId(charactersResponse.characters[0].id);
      } else {
        Swal.fire({
          icon: "warning",
          title: "Sin personajes",
          text: "Esta cuenta no tiene personajes disponibles",
          color: "white",
          background: "#0B1218",
          timer: 4000,
        });
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: `${error.message}`,
        color: "white",
        background: "#0B1218",
        timer: 4500,
      });
    } finally {
      setLoadingCharacters(false);
    }
  };

  const handleCharacterChange = (characterId: number) => {
    setSelectedCharacterId(characterId);
  };

  const handlePaymentMethodChange = (paymentMethodId: number) => {
    setSelectedPaymentMethod(paymentMethodId);
  };

  const handleClose = () => {
    onClose();
  };

  const handleBuy = async () => {
    try {
      setLoading(true);

      if (!selectedAccountId || !selectedPaymentMethod || !selectedCharacterId) {
        setLoading(false);
        return;
      }

      const selectedPayment = paymentType.find(
        (p) => p.id === selectedPaymentMethod
      );
      const paymentTypeName = selectedPayment?.payment_type || "";
      const isOfflinePayment = paymentTypeName.toLowerCase() === "offline";

      const response: BuyRedirectDto = await buyProduct(
        selectedAccountId,
        token,
        false,
        reference,
        paymentTypeName,
        realmId,
        selectedCharacterId
      );
      if (isOfflinePayment) {
        const instructions = buildOfflineInstructions(selectedPayment);
        const html = instructions.length
          ? `<ul style="text-align:left;line-height:1.6;">${instructions
              .map((item) => `<li>• ${item}</li>`)
              .join("")}</ul>`
          : "Revisa los detalles del método seleccionado o contacta soporte para finalizar el pago.";

        Swal.fire({
          icon: "info",
          title: "Pedido creado (pago offline)",
          html,
          color: "white",
          background: "#0B1218",
        });
        return;
      }

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
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: `${error.message}`,
        color: "white",
        background: "#0B1218",
        timer: 4500,
      });
    } finally {
      setLoading(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  const selectedPayment = paymentType.find(
    (p) => p.id === selectedPaymentMethod
  );
  const isOfflinePayment =
    (selectedPayment?.payment_type || "").toLowerCase() === "offline";
  const offlineInstructions = buildOfflineInstructions(selectedPayment);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl border border-slate-700 transform transition-all duration-300 ease-out animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <h2 className="text-4xl font-bold text-white">Completar Compra</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors duration-200 p-1 rounded-full hover:bg-slate-700"
          >
            <svg
              className="w-6 h-6"
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
        </div>

        <div className="mb-6 p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl border border-blue-500/20">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg
                className="w-3 h-3 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="text-gray-300 text-lg leading-relaxed">
                Al adquirir este producto, no solo obtendrás un premio
                increíble, sino que también contribuirás a la mejora de nuestro
                servidor. Tu generosidad hace posible que sigamos creciendo.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-lg font-semibold text-gray-300">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span>Seleccionar Cuenta</span>
              </label>
              <select
                onChange={(e) => handleAccountChange(Number(e.target.value))}
                value={selectedAccountId || ""}
                className="w-full px-4 py-3 bg-slate-800 text-gray-300 text-lg rounded-xl border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-slate-700"
              >
                <option value="" disabled>
                  Seleccione una cuenta
                </option>
                {accounts.map((account) => (
                  <option
                    className="bg-slate-800 text-gray-300"
                    key={account.id}
                    value={account.account_id}
                  >
                    {account.username}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-lg font-semibold text-gray-300">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4a4 4 0 014 4v1a4 4 0 01-2 3.464V16a2 2 0 01-4 0v-3.536A4 4 0 018 9V8a4 4 0 014-4z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 20a6 6 0 0112 0"
                  />
                </svg>
                <span>Seleccionar Personaje</span>
              </label>
              <select
                onChange={(e) => handleCharacterChange(Number(e.target.value))}
                value={selectedCharacterId || ""}
                disabled={!selectedAccountId || loadingCharacters}
                className="w-full px-4 py-3 bg-slate-800 text-gray-300 text-lg rounded-xl border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-800/60"
              >
                <option value="" disabled>
                  {loadingCharacters
                    ? "Cargando personajes..."
                    : "Seleccione un personaje"}
                </option>
                {characters.map((character) => (
                  <option
                    className="bg-slate-800 text-gray-300"
                    key={character.id}
                    value={character.id}
                  >
                    {character.name} - Nivel {character.level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-lg font-semibold text-gray-300">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              <span>Método de Pago</span>
            </label>
            <select
              onChange={(e) =>
                handlePaymentMethodChange(Number(e.target.value))
              }
              value={selectedPaymentMethod || ""}
              className="w-full px-4 py-3 bg-slate-800 text-gray-300 text-lg rounded-xl border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-slate-700"
            >
              <option value="" disabled>
                Seleccione un método de pago
              </option>
              {paymentType.map((payment) => (
                <option
                  className="bg-slate-800 text-gray-300"
                  key={payment.id}
                  value={payment.id}
                >
                  {payment.name}
                </option>
              ))}
            </select>
          </div>

          {isOfflinePayment && (
            <div className="p-4 rounded-xl bg-amber-900/30 border border-amber-600/40 text-amber-100 space-y-2">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
                <p className="font-semibold">Pago offline seleccionado</p>
              </div>
              {offlineInstructions.length ? (
                <ul className="list-disc list-inside text-sm text-amber-100 space-y-1">
                  {offlineInstructions.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-amber-100">
                  Sigue las instrucciones del método seleccionado para completar
                  el pago y envía el comprobante al equipo de soporte.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex space-x-3 mt-8">
          <button
            onClick={handleClose}
            className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white text-lg rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center space-x-2"
          >
            <svg
              className="w-4 h-4"
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
            <span>Cancelar</span>
          </button>
          <button
            onClick={handleBuy}
            disabled={
              !selectedAccountId ||
              !selectedPaymentMethod ||
              !selectedCharacterId ||
              loading
            }
            className={`flex-1 px-6 py-3 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
              loading ||
              !selectedAccountId ||
              !selectedPaymentMethod ||
              !selectedCharacterId
                ? "bg-gray-500 cursor-not-allowed text-gray-300"
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:scale-105 active:scale-95 shadow-lg hover:shadow-blue-500/25"
            }`}
          >
            {loading ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
                <span>Continuar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Buy;

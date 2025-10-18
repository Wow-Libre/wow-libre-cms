"use client";

import { getAccountAndServerId } from "@/api/account";
import { getPaymentMethodsGateway } from "@/api/payment_methods";
import { buyProduct } from "@/api/store";
import { PaymentMethodsGatewayReponse } from "@/dto/response/PaymentMethodsResponse";
import { AccountsModel, BuyRedirectDto } from "@/model/model";
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
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ejecutar ambas llamadas en paralelo
        const [fetchedAccounts, paymentType] = await Promise.all([
          getAccountAndServerId(token, realmId),
          getPaymentMethodsGateway(token),
        ]);
        setPaymentType(paymentType);
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
  }, [isOpen, token]);

  const handleAccountChange = async (accountId: number) => {
    setSelectedAccountId(accountId);
  };

  const handlePaymentMethodChange = (paymentMethodId: number) => {
    setSelectedPaymentMethod(paymentMethodId);
  };

  const handleClose = () => {
    onClose();
  };

  const handleBuy = async () => {
    try {
      if (!selectedAccountId || !selectedPaymentMethod) {
        return;
      }

      // Obtener el nombre del método de pago seleccionado
      const selectedPayment = paymentType.find(
        (p) => p.id === selectedPaymentMethod
      );
      const paymentTypeName = selectedPayment?.payment_type || "";

      const response: BuyRedirectDto = await buyProduct(
        selectedAccountId,
        null, // serverId - se puede pasar null si no es necesario
        token,
        false,
        reference,
        paymentTypeName,
        realmId
      );
      if (!response.is_payment) {
        router.push(response.redirect);
        return;
      }

      // Verificar si el método de pago es PayU
      if (paymentTypeName.toLowerCase() === "payu") {
        const paymentData: Record<string, string> = {
          merchantId: response.merchant_id,
          accountId: response.account_id,
          description: response.description,
          referenceCode: response.reference_code,
          amount: response.amount,
          tax: response.tax,
          taxReturnBase: response.tax_return_base,
          currency: response.currency,
          signature: response.signature,
          test: response.test,
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

  return isOpen ? (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-midnight rounded-lg p-8 w-96 max-w-full overflow-auto">
        {" "}
        {/* Cambiar aquí el ancho */}
        <h2 className="text-2xl font-bold mb-4 text-gray-200">
          ¡Selecciona Tu Cuenta y Haz la Diferencia!
        </h2>
        <p className="text-gray-400 text-lg mt-5 mb-5">
          Al adquirir este producto, no solo obtendrás un premio increíble,
          ¡sino que también contribuirás a la mejora de nuestro servidor! Tu
          generosidad hace posible que sigamos creciendo y ofreciendo lo mejor
          para todos.
        </p>
        <select
          onChange={(e) => handleAccountChange(Number(e.target.value))}
          value={selectedAccountId || ""}
          className="mt-4 px-4 py-2 bg-gray-800 text-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300 w-full"
        >
          <option value="" disabled>
            Seleccione una cuenta
          </option>
          {accounts.map((account) => (
            <option
              className="bg-gray-800 text-gray-300"
              key={account.id}
              value={account.account_id}
            >
              {account.username}
            </option>
          ))}
        </select>
        {/* Select de Medio de Pago */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Medio de Pago
          </label>
          <select
            onChange={(e) => handlePaymentMethodChange(Number(e.target.value))}
            value={selectedPaymentMethod || ""}
            className="w-full px-4 py-2 bg-gray-800 text-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
          >
            <option value="" disabled>
              Seleccione un medio de pago
            </option>
            {paymentType.map((payment) => (
              <option
                className="bg-gray-800 text-gray-300"
                key={payment.id}
                value={payment.id}
              >
                {payment.name}
              </option>
            ))}
          </select>
        </div>
        {/* Botones */}
        <div className="flex mt-4">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 bg-red-900 text-white rounded mr-2"
          >
            Cancelar
          </button>
          <button
            onClick={handleBuy}
            disabled={!selectedAccountId || !selectedPaymentMethod || loading}
            className={`flex-1 px-4 py-2 ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-800"
            } text-white rounded ml-2`}
          >
            {loading ? "Cargando..." : "Donar"}
          </button>
        </div>
      </div>
    </div>
  ) : null;
};

export default Buy;

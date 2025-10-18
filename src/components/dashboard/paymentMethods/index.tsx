import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import LoadingSpinnerCentral from "@/components/utilities/loading-spinner-v2";
import { PaymentMethod } from "@/model/PaymentMethod";
import {
  createPaymentMethod,
  deletePaymentMethod,
  getPaymentMethodAvailable,
} from "@/service/PaymentMethodsService";

interface PaymentMethodsDashboardProps {
  token: string;
  t: (key: string) => string;
}

const PaymentMethodsDashboard: React.FC<PaymentMethodsDashboardProps> = ({
  token,
  t,
}) => {
  const [loading, setLoading] = useState(true);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [type, setType] = useState<string>(""); // PayU o Stripe
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const data = await getPaymentMethodAvailable(token);
      setMethods(data);
    } catch (error: any) {
      Swal.fire({ icon: "error", title: "Error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPaymentMethod(token, type, type, form);
      await fetchData();
      Swal.fire({
        icon: "success",
        title: t("payment-dashboard.success.title"),
        text: t("payment-dashboard.success.created"),
      });
      setForm({});
      setType("");
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
    }
  };

  const handleDelete = async (id: number) => {
    const confirm = await Swal.fire({
      title: t("payment-dashboard.confirm.title"),
      text: t("payment-dashboard.confirm.text"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("payment-dashboard.confirm.confirm"),
      cancelButtonText: t("payment-dashboard.confirm.cancel"),
    });

    if (confirm.isConfirmed) {
      try {
        await deletePaymentMethod(token, id);
        await fetchData();
        Swal.fire({
          icon: "success",
          title: t("payment-dashboard.success.title"),
          text: t("payment-dashboard.success.deleted"),
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: t("payment-dashboard.errors.title"),
          text: t("payment-dashboard.errors.delete"),
        });
      }
    }
  };

  const renderFields = () => {
    if (type === "PAYU") {
      return (
        <>
          <InputField
            label="Host"
            name="host"
            value={form.host || ""}
            onChange={handleChange}
            placeholder="Ingrese el host de PayU"
          />
          <InputField
            label="API Key"
            name="apiKey"
            value={form.apiKey || ""}
            onChange={handleChange}
            placeholder="Ingrese su API Key"
          />
          <InputField
            label="API Login"
            name="apiLogin"
            value={form.apiLogin || ""}
            onChange={handleChange}
            placeholder="Ingrese su API Login"
          />
          <InputField
            label="Key Public"
            name="keyPublic"
            value={form.keyPublic || ""}
            onChange={handleChange}
            placeholder="Ingrese su Key Public"
          />
          <InputField
            label="Merchant ID"
            name="merchantId"
            value={form.merchantId || ""}
            onChange={handleChange}
            placeholder="Ingrese su Merchant ID"
          />
          <InputField
            label="Account ID"
            name="accountId"
            value={form.accountId || ""}
            onChange={handleChange}
            placeholder="Ingrese su Account ID"
          />
          <InputField
            label="Success URL"
            name="successUrl"
            value={form.successUrl || ""}
            onChange={handleChange}
            placeholder="Ingrese su Success URL"
          />
          <InputField
            label="Cancel URL"
            name="cancelUrl"
            value={form.cancelUrl || ""}
            onChange={handleChange}
            placeholder="Ingrese su Cancel URL"
          />
          <InputField
            label="Webhook URL"
            name="webhookUrl"
            value={form.webhookUrl || ""}
            onChange={handleChange}
            placeholder="Ingrese su Webhook URL"
          />
        </>
      );
    }
    if (type === "STRIPE") {
      return (
        <>
          <InputField
            label="API Secret"
            name="apiSecret"
            value={form.apiSecret || ""}
            onChange={handleChange}
            placeholder="Ingrese su API Secret"
          />
          <InputField
            label="API Public"
            name="apiPublic"
            value={form.apiPublic || ""}
            onChange={handleChange}
            placeholder="Ingrese su API Public"
          />
          <InputField
            label="Success URL"
            name="successUrl"
            value={form.successUrl || ""}
            onChange={handleChange}
            placeholder="Ingrese su Success URL"
          />
          <InputField
            label="Cancel URL"
            name="cancelUrl"
            value={form.cancelUrl || ""}
            onChange={handleChange}
            placeholder="Ingrese su Cancel URL"
          />
          <InputField
            label="Webhook URL"
            name="webhookUrl"
            value={form.webhookUrl || ""}
            onChange={handleChange}
            placeholder="Ingrese su Webhook URL"
          />
        </>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <LoadingSpinnerCentral />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-blue-500/20 rounded-full blur-xl animate-pulse"></div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2 mt-4">
            Cargando Métodos de Pago
          </h3>
          <p className="text-slate-300">Preparando configuración de pagos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white min-h-screen overflow-y-auto">
      {/* Header del Dashboard */}
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm border-b border-slate-600/30 p-6">
        <h1 className="text-3xl font-bold text-white mb-2">Métodos de Pago</h1>
        <p className="text-slate-300">
          Configura y gestiona los métodos de pago del servidor
        </p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Formulario dinámico */}
          <form
            onSubmit={handleSubmit}
            className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-600/30 rounded-2xl p-8 space-y-6 shadow-xl hover:shadow-2xl hover:border-blue-400/50 transition-all duration-300"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {t("payment-dashboard.form.title")}
              </h2>
              <div className="h-1 w-16 bg-gradient-to-r from-blue-400 to-cyan-400 mx-auto rounded-full"></div>
            </div>

            <div className="flex flex-col">
              <label className="mb-2 font-semibold text-slate-200 text-lg">
                {t("payment-dashboard.form.select-method")}
              </label>
              <select
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setForm({});
                }}
                required
                className="p-4 rounded-lg bg-slate-700/50 border border-slate-600/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none text-white text-lg transition-all duration-300"
              >
                <option value="">
                  {t("payment-dashboard.form.select-placeholder")}
                </option>
                <option value="PAYU">PayU</option>
                <option value="STRIPE">Stripe</option>
              </select>
            </div>

            {renderFields()}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-semibold px-8 py-4 rounded-lg border border-blue-400/30 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 text-lg"
            >
              {t("payment-dashboard.form.submit-button")}
            </button>
          </form>

          {/* Listado */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-600/30 rounded-2xl p-8 space-y-6 shadow-xl hover:shadow-2xl hover:border-green-400/50 transition-all duration-300">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {t("payment-dashboard.list.title")}
              </h2>
              <div className="h-1 w-16 bg-gradient-to-r from-green-400 to-emerald-400 mx-auto rounded-full"></div>
            </div>
            {methods.length === 0 ? (
              <p className="text-gray-400">
                {t("payment-dashboard.list.empty")}
              </p>
            ) : (
              methods.map((method) => (
                <div
                  key={method.id}
                  className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 p-6 rounded-xl border border-slate-600/30 hover:border-red-400/50 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300"
                >
                  <div className="space-y-3">
                    <div>
                      <span className="font-semibold text-blue-300 text-lg">
                        Nombre:
                      </span>
                      <p className="text-white text-lg">{method.name}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-blue-300 text-lg">
                        Tipo:
                      </span>
                      <p className="text-white text-lg">
                        {method.payment_type}
                      </p>
                    </div>
                    <div>
                      <span className="font-semibold text-blue-300 text-lg">
                        Fecha de creación:
                      </span>
                      <p className="text-white text-lg">{method.created_at}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(method.id)}
                    className="mt-4 w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-semibold px-6 py-3 rounded-lg border border-red-400/30 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300"
                  >
                    {t("payment-dashboard.list.remove")}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodsDashboard;

const InputField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}) => (
  <div className="flex flex-col">
    <label className="mb-2 font-semibold text-slate-200 text-lg">{label}</label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required
      className="p-4 rounded-lg bg-slate-700/50 border border-slate-600/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none text-white text-lg transition-all duration-300"
    />
  </div>
);

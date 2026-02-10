import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { PaymentMethod } from "@/model/PaymentMethod";
import {
  createPaymentMethod,
  deletePaymentMethod,
  getPaymentMethodAvailable,
} from "@/service/PaymentMethodsService";
import { DASHBOARD_PALETTE } from "../styles/dashboardPalette";
import { DashboardLoading, DashboardSection } from "../layout";

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
      <DashboardLoading message="Preparando métodos de pago..." />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
      <DashboardSection
        title={t("payment-dashboard.form.title")}
        description={t("payment-dashboard.form.select-method")}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={`mb-1.5 block text-sm font-medium ${DASHBOARD_PALETTE.label}`}>
              {t("payment-dashboard.form.select-method")}
            </label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setForm({});
              }}
              required
              className={DASHBOARD_PALETTE.input}
            >
              <option value="">
                {t("payment-dashboard.form.select-placeholder")}
              </option>
              <option value="PAYU">PayU</option>
              <option value="STRIPE">Stripe</option>
            </select>
          </div>

          {renderFields()}

          <button type="submit" className={`w-full ${DASHBOARD_PALETTE.btnPrimary}`}>
            {t("payment-dashboard.form.submit-button")}
          </button>
        </form>
      </DashboardSection>

      <DashboardSection
        title={t("payment-dashboard.list.title")}
        description={methods.length === 0 ? undefined : `${methods.length} configurado(s)`}
      >
        {methods.length === 0 ? (
          <p className={`py-8 text-center text-sm ${DASHBOARD_PALETTE.textMuted}`}>
            {t("payment-dashboard.list.empty")}
          </p>
        ) : (
          <ul className="space-y-4">
            {methods.map((method) => (
              <li
                key={method.id}
                className={`rounded-xl border ${DASHBOARD_PALETTE.border} bg-slate-800/50 p-4 transition-colors hover:border-slate-600/50`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-0.5 text-sm">
                    <p className={`font-semibold ${DASHBOARD_PALETTE.text}`}>
                      {method.name}
                    </p>
                    <p className={DASHBOARD_PALETTE.textMuted}>
                      {method.payment_type} · {method.created_at}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(method.id)}
                    className={DASHBOARD_PALETTE.btnDanger}
                  >
                    {t("payment-dashboard.list.remove")}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </DashboardSection>
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
  <div>
    <label className={`mb-1.5 block text-sm font-medium ${DASHBOARD_PALETTE.label}`}>
      {label}
    </label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required
      className={DASHBOARD_PALETTE.input}
    />
  </div>
);

import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

import LoadingSpinnerCentral from "@/components/utilities/loading-spinner-v2";
import {
  createProvider,
  deleteProvider,
  getNotificationProviders,
} from "@/service/NotificationProviderService";
import { NotificationProviders } from "@/model/NotificationProviders";

interface FormConnection {
  name: string;
  host: string;
  client: string;
  secret: string;
}

interface ConnectionDashboardProps {
  token: string;
  t: (key: string) => string;
}

const ProviderConfigs: React.FC<ConnectionDashboardProps> = ({ token, t }) => {
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState<NotificationProviders[]>([]);
  const [form, setForm] = useState<FormConnection>({
    name: "",
    host: "",
    client: "",
    secret: "",
  });

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const data = await getNotificationProviders(token);
      setConnections(data);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (value.length > 100) {
      Swal.fire({
        icon: "warning",
        title: t("providers-dashboard.errors.warning"),
        text: t("providers-dashboard.errors.long-value"),
      });
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProvider(
        form.name,
        form.host,
        form.client,
        form.secret,
        token
      );
      await fetchData();
      Swal.fire({
        icon: "success",
        title: t("providers-dashboard.success.title"),
        text: t("providers-dashboard.success.created"),
      });
      setForm({ name: "", host: "", client: "", secret: "" });
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
      title: t("providers-dashboard.confirm.title"),
      text: t("providers-dashboard.confirm.text"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("providers-dashboard.confirm.confirm"),
      cancelButtonText: t("providers-dashboard.confirm.cancel"),
    });

    if (confirm.isConfirmed) {
      try {
        await deleteProvider(id, token);
        await fetchData();
        Swal.fire({
          icon: "success",
          title: t("providers-dashboard.success.title"),
          text: t("providers-dashboard.success.deleted"),
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: t("providers-dashboard.errors.title"),
          text: t("providers-dashboard.errors.delete"),
        });
      }
    }
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
            Cargando Proveedores
          </h3>
          <p className="text-slate-300">
            Preparando configuración de notificaciones...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white min-h-screen overflow-y-auto">
      {/* Header del Dashboard */}
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm border-b border-slate-600/30 p-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          Proveedores de Notificaciones
        </h1>
        <p className="text-slate-300">
          Configura y gestiona los proveedores de notificaciones del servidor
        </p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-600/30 rounded-2xl p-8 space-y-6 shadow-xl hover:shadow-2xl hover:border-blue-400/50 transition-all duration-300"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {t("providers-dashboard.info.form-title")}
              </h2>
              <div className="h-1 w-16 bg-gradient-to-r from-blue-400 to-cyan-400 mx-auto rounded-full"></div>
            </div>

            <div className="flex flex-col">
              <label className="mb-2 font-semibold text-slate-200 text-lg">
                {t("providers-dashboard.form.select-service")}
              </label>
              <select
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="p-4 rounded-lg bg-slate-700/50 border border-slate-600/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none text-white text-lg transition-all duration-300"
              >
                <option value="">
                  {t("providers-dashboard.form.select-placeholder")}
                </option>
                <option value="METRICS">
                  {t("providers-dashboard.form.metrics-option")}
                </option>
                <option value="MAILS">
                  {t("providers-dashboard.form.mails-option")}
                </option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="mb-2 font-semibold text-slate-200 text-lg">
                {t("providers-dashboard.form.host-label")}
              </label>
              <input
                type="text"
                name="host"
                max={50}
                placeholder={t("providers-dashboard.form.host-placeholder")}
                value={form.host}
                onChange={handleChange}
                required
                className="p-4 rounded-lg bg-slate-700/50 border border-slate-600/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none text-white text-lg transition-all duration-300"
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-2 font-semibold text-slate-200 text-lg">
                {t("providers-dashboard.form.client-label")}
              </label>
              <input
                type="text"
                name="client"
                max={50}
                placeholder={t("providers-dashboard.form.client-placeholder")}
                value={form.client}
                onChange={handleChange}
                required
                className="p-4 rounded-lg bg-slate-700/50 border border-slate-600/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none text-white text-lg transition-all duration-300"
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-2 font-semibold text-slate-200 text-lg">
                {t("providers-dashboard.form.secret-label")}
              </label>
              <input
                type="text"
                name="secret"
                max={50}
                placeholder={t("providers-dashboard.form.secret-placeholder")}
                value={form.secret}
                onChange={handleChange}
                required
                className="p-4 rounded-lg bg-slate-700/50 border border-slate-600/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none text-white text-lg transition-all duration-300"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-semibold px-8 py-4 rounded-lg border border-blue-400/30 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 text-lg"
            >
              {t("providers-dashboard.form.submit-button")}
            </button>
          </form>

          {/* List */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-600/30 rounded-2xl p-8 space-y-6 shadow-xl hover:shadow-2xl hover:border-green-400/50 transition-all duration-300">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {t("providers-dashboard.list.title")}
              </h2>
              <div className="h-1 w-16 bg-gradient-to-r from-green-400 to-emerald-400 mx-auto rounded-full"></div>
            </div>

            {connections.length === 0 ? (
              <p className="text-gray-400">
                {t("providers-dashboard.list.empty")}
              </p>
            ) : (
              connections.map((conn) => (
                <div
                  key={conn.id}
                  className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 p-6 rounded-xl border border-slate-600/30 hover:border-red-400/50 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300"
                >
                  <div className="space-y-3">
                    <div>
                      <span className="font-semibold text-blue-300 text-lg">
                        {t("providers-dashboard.list.type")}:
                      </span>
                      <p className="text-white text-lg">{conn.name}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-blue-300 text-lg">
                        {t("providers-dashboard.list.host")}:
                      </span>
                      <p className="text-white text-lg">{conn.host}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-blue-300 text-lg">
                        {t("providers-dashboard.list.client")}:
                      </span>
                      <p className="text-white text-lg">{conn.client}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(conn.id)}
                    className="mt-4 w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-semibold px-6 py-3 rounded-lg border border-red-400/30 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300"
                  >
                    {t("providers-dashboard.list.remove")}
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

export default ProviderConfigs;

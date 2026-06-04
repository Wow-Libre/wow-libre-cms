"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  getWebUsersPage,
  previewBulkEmailRecipients,
  sendBulkEmail,
  type WebUserRowDto,
  type WebUsersPageDto,
} from "@/api/users/admin";
import { DashboardSection } from "../layout";
import { DASHBOARD_PALETTE } from "../styles/dashboardPalette";
import { dashboardSwal } from "../dashboardSwal";
import LoadingSpinner from "@/components/utilities/loading-spinner";
import WalletPagination from "../wallet/WalletPagination";

type ViewTab = "email" | "list";

interface UsersWebDashboardProps {
  token: string;
  realmId?: number;
  t?: (key: string) => string;
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-5 py-3 text-base font-semibold transition-all ${
        active
          ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-900/30"
          : "border border-slate-600/50 bg-slate-800/50 text-slate-300 hover:border-slate-500 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function StepCard({
  step,
  title,
  description,
  children,
}: {
  step: number;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl border ${DASHBOARD_PALETTE.border} bg-slate-800/40 p-6 sm:p-7`}>
      <div className="mb-5 flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 text-lg font-bold text-cyan-300 ring-1 ring-cyan-500/30">
          {step}
        </span>
        <div>
          <h3 className="text-lg font-semibold text-white sm:text-xl">{title}</h3>
          <p className={`mt-1 text-base ${DASHBOARD_PALETTE.textMuted}`}>{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function FilterToggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-all sm:p-5 ${
        checked
          ? "border-cyan-500/50 bg-cyan-500/10 ring-1 ring-cyan-500/20"
          : "border-slate-600/50 bg-slate-900/40 hover:border-slate-500/60"
      }`}
    >
      <span
        className={`mt-0.5 flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors ${
          checked ? "bg-cyan-500" : "bg-slate-600"
        }`}
        aria-hidden
      >
        <span
          className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
      <span>
        <span className="block text-base font-semibold text-white">{label}</span>
        <span className={`mt-1 block text-sm leading-relaxed sm:text-base ${DASHBOARD_PALETTE.textMuted}`}>
          {description}
        </span>
      </span>
    </button>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3 p-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex animate-pulse items-center gap-5 rounded-xl border border-slate-700/40 bg-slate-800/30 px-6 py-5"
        >
          <div className="h-12 w-12 rounded-xl bg-slate-700/60" />
          <div className="flex-1 space-y-2.5">
            <div className="h-4 w-56 rounded bg-slate-700/60" />
            <div className="h-4 w-72 rounded bg-slate-700/40" />
          </div>
        </div>
      ))}
    </div>
  );
}

const UsersWebDashboard: React.FC<UsersWebDashboardProps> = ({ token, realmId }) => {
  const [activeTab, setActiveTab] = useState<ViewTab>("email");

  const [data, setData] = useState<WebUsersPageDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [emailFilter, setEmailFilter] = useState("");
  const [emailInput, setEmailInput] = useState("");

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [onlyActive, setOnlyActive] = useState(true);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [limitToRealm, setLimitToRealm] = useState(Boolean(realmId));
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const fetchPage = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getWebUsersPage(token, page, size, emailFilter || undefined);
      setData(result);
    } catch {
      setData({
        content: [],
        total_elements: 0,
        total_pages: 0,
        size,
        number: page,
      });
    } finally {
      setLoading(false);
    }
  }, [token, page, size, emailFilter]);

  useEffect(() => {
    if (activeTab === "list") {
      fetchPage();
    }
  }, [fetchPage, activeTab]);

  const buildEmailOptions = useCallback(
    () => ({
      email: emailFilter || undefined,
      onlyActive,
      onlyVerified,
      realmId: limitToRealm && realmId ? realmId : undefined,
    }),
    [emailFilter, onlyActive, onlyVerified, limitToRealm, realmId]
  );

  const resetPreview = () => setPreviewCount(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailFilter(emailInput.trim());
    setPage(0);
    resetPreview();
  };

  const handlePreviewRecipients = async () => {
    setPreviewLoading(true);
    try {
      const result = await previewBulkEmailRecipients(token, buildEmailOptions());
      setPreviewCount(result.recipient_count);
    } catch (error) {
      setPreviewCount(null);
      await dashboardSwal.fire({
        icon: "error",
        title: "Error",
        text: error instanceof Error ? error.message : "No se pudo calcular destinatarios",
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  const canSend =
    subject.trim().length > 0 &&
    message.trim().length > 0 &&
    previewCount != null &&
    previewCount > 0 &&
    !sending &&
    !previewLoading;

  const handleSendBulkEmail = async () => {
    if (!subject.trim() || !message.trim()) {
      await dashboardSwal.fire({
        icon: "warning",
        title: "Falta contenido",
        text: "Completa el asunto y el mensaje antes de enviar.",
      });
      return;
    }

    if (previewCount == null) {
      await dashboardSwal.fire({
        icon: "info",
        title: "Calcula los destinatarios",
        text: "Usa el botón «Calcular destinatarios» para saber a cuántas personas llegará el correo.",
      });
      return;
    }

    const confirm = await dashboardSwal.fire({
      icon: "warning",
      title: "¿Confirmar envío masivo?",
      html: `Se enviará el mismo mensaje en texto plano a <strong>${previewCount.toLocaleString()}</strong> correos.`,
      showCancelButton: true,
      confirmButtonText: "Sí, enviar ahora",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    setSending(true);
    try {
      const result = await sendBulkEmail(token, {
        subject: subject.trim(),
        body: message.trim(),
        email_filter: emailFilter || undefined,
        only_active: onlyActive,
        only_verified: onlyVerified,
        realm_id: limitToRealm && realmId ? realmId : undefined,
      });
      await dashboardSwal.fire({
        icon: "success",
        title: "Envío iniciado",
        text: `${result.message} Destinatarios: ${result.recipient_count.toLocaleString()}.`,
      });
    } catch (error) {
      await dashboardSwal.fire({
        icon: "error",
        title: "Error al enviar",
        text: error instanceof Error ? error.message : "No se pudo iniciar el envío",
      });
    } finally {
      setSending(false);
    }
  };

  const totalElements = data?.total_elements ?? 0;
  const totalPages = data?.total_pages ?? 0;
  const content = data?.content ?? [];
  const messageLength = message.length;

  return (
    <div className={`space-y-6 ${DASHBOARD_PALETTE.text}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className={`max-w-2xl text-base leading-relaxed sm:text-lg ${DASHBOARD_PALETTE.textMuted}`}>
          Comunica con tus jugadores registrados o consulta el listado completo de cuentas web.
        </p>
        <div className="flex flex-wrap gap-3">
          <TabButton active={activeTab === "email"} onClick={() => setActiveTab("email")}>
            Email masivo
          </TabButton>
          <TabButton active={activeTab === "list"} onClick={() => setActiveTab("list")}>
            Listado de usuarios
          </TabButton>
        </div>
      </div>

      {activeTab === "email" && (
        <div className="space-y-6">
          <StepCard
            step={1}
            title="Redacta el correo"
            description="El mismo texto plano llegará a todos los destinatarios seleccionados."
          >
            <div className="space-y-5">
              <label className="block space-y-2">
                <span className="text-base font-semibold text-slate-200">Asunto</span>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    resetPreview();
                  }}
                  placeholder="Ej. Te extrañamos — vuelve al reino"
                  maxLength={200}
                  className={`${DASHBOARD_PALETTE.input} text-base`}
                />
              </label>

              <label className="block space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-base font-semibold text-slate-200">Mensaje</span>
                  <span className={`text-sm tabular-nums sm:text-base ${DASHBOARD_PALETTE.textMuted}`}>
                    {messageLength.toLocaleString()} / 10.000
                  </span>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    resetPreview();
                  }}
                  placeholder="Escribe el mensaje que recibirán todos los usuarios..."
                  rows={10}
                  maxLength={10000}
                  className={`${DASHBOARD_PALETTE.input} min-h-[220px] resize-y text-base leading-relaxed`}
                />
              </label>
            </div>
          </StepCard>

          <StepCard
            step={2}
            title="Elige la audiencia"
            description="Activa los filtros que necesites. Luego calcula cuántas personas recibirán el correo."
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <FilterToggle
                checked={onlyActive}
                onChange={(value) => {
                  setOnlyActive(value);
                  resetPreview();
                }}
                label="Solo usuarios activos"
                description="Excluye cuentas desactivadas en la plataforma."
              />
              <FilterToggle
                checked={onlyVerified}
                onChange={(value) => {
                  setOnlyVerified(value);
                  resetPreview();
                }}
                label="Solo email verificado"
                description="Envía únicamente a quienes confirmaron su correo."
              />
              {realmId != null && (
                <FilterToggle
                  checked={limitToRealm}
                  onChange={(value) => {
                    setLimitToRealm(value);
                    resetPreview();
                  }}
                  label="Solo jugadores de este reino"
                  description="Limita el envío a usuarios con cuenta de juego en el reino actual."
                />
              )}
            </div>

            {emailFilter && (
              <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-base text-amber-100">
                También se aplica el filtro del listado: <strong>{emailFilter}</strong>
              </div>
            )}
          </StepCard>

          <div
            className={`rounded-2xl border ${DASHBOARD_PALETTE.border} bg-gradient-to-br from-slate-800/90 via-slate-900/80 to-slate-950 p-6 sm:p-8`}
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-base font-semibold text-slate-300">Destinatarios estimados</p>
                <p className="mt-2 text-4xl font-bold tabular-nums text-cyan-300 sm:text-5xl">
                  {previewLoading ? "…" : previewCount != null ? previewCount.toLocaleString() : "—"}
                </p>
                <p className={`mt-2 text-base ${DASHBOARD_PALETTE.textMuted}`}>
                  {previewCount == null
                    ? "Calcula los destinatarios antes de enviar."
                    : previewCount === 0
                      ? "Nadie coincide con estos filtros."
                      : "Personas que recibirán el correo."}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                <button
                  type="button"
                  onClick={handlePreviewRecipients}
                  disabled={previewLoading || sending}
                  className={`min-w-[200px] rounded-xl border border-slate-600/60 bg-slate-800/80 px-6 py-3.5 text-base font-semibold text-white transition hover:border-slate-500 disabled:opacity-50`}
                >
                  {previewLoading ? "Calculando…" : "Calcular destinatarios"}
                </button>
                <button
                  type="button"
                  onClick={handleSendBulkEmail}
                  disabled={!canSend}
                  title={
                    previewCount == null
                      ? "Calcula destinatarios primero"
                      : !subject.trim() || !message.trim()
                        ? "Completa asunto y mensaje"
                        : undefined
                  }
                  className={`${DASHBOARD_PALETTE.btnPrimary} min-w-[200px] px-8 py-3.5 text-base disabled:cursor-not-allowed disabled:opacity-45`}
                >
                  {sending ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <LoadingSpinner />
                      Enviando…
                    </span>
                  ) : (
                    "Enviar email masivo"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "list" && (
        <DashboardSection
          title="Usuarios registrados"
          description="Consulta cuentas web, estado y reinos vinculados."
          noPadding
        >
          <div className="space-y-6 p-5 sm:p-6 lg:p-7">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/15 via-slate-800 to-slate-900 p-6 shadow-lg shadow-cyan-900/20">
                <p className="text-base font-semibold text-slate-400">Total registrados</p>
                <p className="mt-2 text-4xl font-bold text-cyan-300 tabular-nums">
                  {totalElements.toLocaleString()}
                </p>
                <p className="mt-2 text-base text-slate-400">
                  {emailFilter ? `Filtrado por «${emailFilter}»` : "Sin filtro de correo"}
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSearch}
              className={`flex flex-col gap-4 rounded-2xl border ${DASHBOARD_PALETTE.border} bg-slate-800/40 p-5 sm:flex-row sm:items-end`}
            >
              <label className="block flex-1 space-y-2">
                <span className="text-base font-semibold text-slate-200">Buscar por correo</span>
                <input
                  type="text"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="usuario@ejemplo.com"
                  className={`${DASHBOARD_PALETTE.input} text-base`}
                />
              </label>
              <div className="flex flex-wrap gap-3">
                <button type="submit" className={`${DASHBOARD_PALETTE.btnPrimary} px-6 py-3.5 text-base`}>
                  Buscar
                </button>
                {emailFilter && (
                  <button
                    type="button"
                    onClick={() => {
                      setEmailInput("");
                      setEmailFilter("");
                      setPage(0);
                      resetPreview();
                    }}
                    className="rounded-xl border border-slate-600/60 px-5 py-3.5 text-base font-medium text-slate-300 hover:text-white"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </form>

            {loading ? (
              <TableSkeleton />
            ) : content.length === 0 ? (
              <div className={`rounded-2xl border ${DASHBOARD_PALETTE.border} py-16 text-center`}>
                <p className="text-lg font-medium text-slate-300">No hay usuarios con ese criterio</p>
                <p className={`mt-2 text-base ${DASHBOARD_PALETTE.textMuted}`}>
                  Prueba otro correo o limpia el filtro de búsqueda.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-2xl border border-slate-700/50">
                  <table className="w-full min-w-[880px]">
                    <thead>
                      <tr className="border-b border-slate-700/60 bg-slate-900/60 text-left">
                        {["ID", "Correo", "Nombre", "Idioma", "Rol", "Estado", "Cuentas", "Reinos"].map(
                          (col) => (
                            <th
                              key={col}
                              className="px-5 py-4 text-sm font-semibold uppercase tracking-wide text-slate-400"
                            >
                              {col}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/40">
                      {content.map((row) => (
                        <tr key={row.id} className="bg-slate-800/30 transition hover:bg-slate-700/40">
                          <td className="px-5 py-4 text-base tabular-nums text-slate-300">{row.id}</td>
                          <td className="px-5 py-4 text-base text-white">{row.email ?? "—"}</td>
                          <td className="px-5 py-4 text-base text-slate-200">
                            {[row.first_name, row.last_name].filter(Boolean).join(" ") || "—"}
                          </td>
                          <td className="px-5 py-4 text-base uppercase text-slate-300">
                            {row.language ?? "—"}
                          </td>
                          <td className="px-5 py-4">
                            <span className="rounded-full border border-slate-600/50 bg-slate-900/60 px-3 py-1 text-sm font-medium text-slate-300">
                              {row.rol_name ?? "—"}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <StatusBadge status={row.status} verified={row.verified} />
                          </td>
                          <td className="px-5 py-4 text-base font-bold tabular-nums text-cyan-300">
                            {row.account_count}
                          </td>
                          <td className="px-5 py-4">
                            <RealmsCell accounts={row.accounts} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <WalletPagination
                  currentPage={page}
                  pageCount={totalPages}
                  totalItems={totalElements}
                  itemsPerPage={size}
                  onPageChange={setPage}
                  onItemsPerPageChange={(next) => {
                    setSize(next);
                    setPage(0);
                  }}
                  itemLabel="usuarios"
                  ariaLabel="Paginación de usuarios web"
                />
              </>
            )}
          </div>
        </DashboardSection>
      )}
    </div>
  );
};

function StatusBadge({ status, verified }: { status: boolean | null; verified: boolean | null }) {
  const active = status === true;
  const verifiedLabel = verified === true ? "Verificado" : "No verificado";
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold ${
        active
          ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
          : "border-slate-500/50 bg-slate-700/50 text-slate-400"
      }`}
      title={verifiedLabel}
    >
      <span className={`h-2 w-2 rounded-full ${active ? "bg-emerald-400" : "bg-slate-500"}`} />
      {active ? "Activo" : "Inactivo"}
    </span>
  );
}

function RealmsCell({ accounts }: { accounts: WebUserRowDto["accounts"] }) {
  if (!accounts?.length) return <span className={`text-base ${DASHBOARD_PALETTE.textMuted}`}>—</span>;
  const realms = [...new Set(accounts.map((a) => a.realm_name).filter(Boolean))];
  return (
    <div className="flex flex-wrap gap-1.5">
      {realms.slice(0, 3).map((name) => (
        <span
          key={name}
          className={`rounded-full border px-2.5 py-1 text-sm font-medium ${DASHBOARD_PALETTE.accentBorder} bg-cyan-500/10 ${DASHBOARD_PALETTE.accent}`}
        >
          {name}
        </span>
      ))}
      {realms.length > 3 && (
        <span className={`self-center text-sm ${DASHBOARD_PALETTE.textMuted}`}>+{realms.length - 3}</span>
      )}
    </div>
  );
}

export default UsersWebDashboard;

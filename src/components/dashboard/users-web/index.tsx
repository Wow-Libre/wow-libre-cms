"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getWebUsersPage, type WebUserRowDto, type WebUsersPageDto } from "@/api/users/admin";
import { DashboardSection } from "../layout";
import { DASHBOARD_PALETTE } from "../styles/dashboardPalette";
import LoadingSpinner from "@/components/utilities/loading-spinner";

const PAGE_SIZES = [10, 20, 50];

interface UsersWebDashboardProps {
  token: string;
  t?: (key: string) => string;
}

const UsersWebDashboard: React.FC<UsersWebDashboardProps> = ({ token, t = (k) => k }) => {
  const [data, setData] = useState<WebUsersPageDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [emailFilter, setEmailFilter] = useState("");
  const [emailInput, setEmailInput] = useState("");

  const fetchPage = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getWebUsersPage(token, page, size, emailFilter || undefined);
      setData(result);
    } catch (error) {
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
    fetchPage();
  }, [fetchPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailFilter(emailInput.trim());
    setPage(0);
  };

  const totalElements = data?.total_elements ?? 0;
  const totalPages = data?.total_pages ?? 0;
  const content = data?.content ?? [];

  return (
    <div className={`space-y-6 ${DASHBOARD_PALETTE.text}`}>
      <DashboardSection
        title="Análisis de usuarios web"
        description="Usuarios registrados en la web y sus cuentas de juego por reino."
      >
        <div className="space-y-4">
          <div className={`flex flex-wrap items-center gap-4 rounded-xl border ${DASHBOARD_PALETTE.border} bg-slate-800/40 p-4`}>
            <div className="text-2xl font-bold text-cyan-400">
              {totalElements.toLocaleString()} usuarios
            </div>
            <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Filtrar por correo..."
                className={`min-w-[200px] max-w-xs ${DASHBOARD_PALETTE.input} py-2 text-sm`}
              />
              <button type="submit" className={DASHBOARD_PALETTE.btnPrimary + " py-2 px-4 text-sm"}>
                Buscar
              </button>
              {emailFilter && (
                <button
                  type="button"
                  onClick={() => {
                    setEmailInput("");
                    setEmailFilter("");
                    setPage(0);
                  }}
                  className={`text-sm ${DASHBOARD_PALETTE.textMuted} hover:text-cyan-400`}
                >
                  Limpiar filtro
                </button>
              )}
            </form>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : content.length === 0 ? (
            <div className={`py-12 text-center ${DASHBOARD_PALETTE.textMuted}`}>
              No hay usuarios que coincidan con el criterio.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-2">
                  <thead className={DASHBOARD_PALETTE.textMuted}>
                    <tr>
                      <th className="p-3 text-left text-sm font-semibold">ID</th>
                      <th className="p-3 text-left text-sm font-semibold">Correo</th>
                      <th className="p-3 text-left text-sm font-semibold">Nombre</th>
                      <th className="p-3 text-left text-sm font-semibold">Idioma</th>
                      <th className="p-3 text-left text-sm font-semibold">Rol</th>
                      <th className="p-3 text-left text-sm font-semibold">Estado</th>
                      <th className="p-3 text-left text-sm font-semibold">Cuentas juego</th>
                      <th className="p-3 text-left text-sm font-semibold">Reinos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {content.map((row) => (
                      <tr
                        key={row.id}
                        className={`rounded-lg border ${DASHBOARD_PALETTE.border} bg-slate-800/50 hover:bg-slate-700/50 transition-colors`}
                      >
                        <td className="p-3 text-sm">{row.id}</td>
                        <td className="p-3 text-sm">{row.email ?? "—"}</td>
                        <td className="p-3 text-sm">
                          {[row.first_name, row.last_name].filter(Boolean).join(" ") || "—"}
                        </td>
                        <td className="p-3 text-sm">{row.language ?? "—"}</td>
                        <td className="p-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs border ${DASHBOARD_PALETTE.border} ${DASHBOARD_PALETTE.textMuted}`}>
                            {row.rol_name ?? "—"}
                          </span>
                        </td>
                        <td className="p-3">
                          <StatusBadge status={row.status} verified={row.verified} />
                        </td>
                        <td className="p-3 text-sm font-medium text-cyan-400">{row.account_count}</td>
                        <td className="p-3 text-sm">
                          <RealmsCell accounts={row.accounts} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${DASHBOARD_PALETTE.textMuted}`}>Filas por página:</span>
                    <select
                      value={size}
                      onChange={(e) => {
                        setSize(Number(e.target.value));
                        setPage(0);
                      }}
                      className={`${DASHBOARD_PALETTE.input} py-1.5 px-2 text-sm w-auto`}
                    >
                      {PAGE_SIZES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className={`${DASHBOARD_PALETTE.input} py-2 px-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      Anterior
                    </button>
                    <span className={`px-3 py-2 text-sm ${DASHBOARD_PALETTE.textMuted}`}>
                      Página {page + 1} de {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                      className={`${DASHBOARD_PALETTE.input} py-2 px-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DashboardSection>
    </div>
  );
};

function StatusBadge({ status, verified }: { status: boolean | null; verified: boolean | null }) {
  const active = status === true;
  const verifiedLabel = verified === true ? "Verificado" : "No verificado";
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium border ${
        active ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300" : "border-slate-500/50 bg-slate-700/50 text-slate-400"
      }`}
      title={verifiedLabel}
    >
      {active ? "Activo" : "Inactivo"}
    </span>
  );
}

function RealmsCell({ accounts }: { accounts: WebUserRowDto["accounts"] }) {
  if (!accounts?.length) return <span className={DASHBOARD_PALETTE.textMuted}>—</span>;
  const realms = [...new Set(accounts.map((a) => a.realm_name).filter(Boolean))];
  return (
    <div className="flex flex-wrap gap-1">
      {realms.slice(0, 3).map((name) => (
        <span
          key={name}
          className={`rounded-full px-2 py-0.5 text-xs border ${DASHBOARD_PALETTE.accentBorder} bg-cyan-500/10 ${DASHBOARD_PALETTE.accent}`}
        >
          {name}
        </span>
      ))}
      {realms.length > 3 && (
        <span className={`text-xs ${DASHBOARD_PALETTE.textMuted}`}>+{realms.length - 3}</span>
      )}
    </div>
  );
}

export default UsersWebDashboard;

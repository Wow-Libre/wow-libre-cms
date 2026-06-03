"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  getWalletUsersPage,
  updateMachinePoints,
  updateVotingPoints,
  updateWalletPoints,
  type WalletUserRowDto,
  type WalletUsersPageDto,
} from "@/api/wallet/admin";
import { dashboardSwal as Swal } from "@/components/dashboard/dashboardSwal";
import { DashboardSection } from "../layout";
import { DASHBOARD_PALETTE } from "../styles/dashboardPalette";
import { formatWalletAmount } from "@/features/wallet-balance/utils/formatWalletAmount";
import { WalletEditModal, type WalletBalanceSaveType } from "./WalletEditModal";
import WalletPagination from "./WalletPagination";

interface WalletDashboardProps {
  token: string;
  defaultRealmId?: number;
}

function getInitials(row: WalletUserRowDto): string {
  const a = row.first_name?.trim()?.[0] ?? "";
  const b = row.last_name?.trim()?.[0] ?? "";
  if (a || b) return `${a}${b}`.toUpperCase();
  return (row.email?.trim()?.[0] ?? "?").toUpperCase();
}

function getBalanceTone(points: number): {
  badge: string;
  dot: string;
} {
  if (points <= 0) {
    return {
      badge: "border-slate-600/50 bg-slate-800/80 text-slate-400",
      dot: "bg-slate-500",
    };
  }
  if (points < 500) {
    return {
      badge: "border-cyan-500/30 bg-cyan-500/10 text-cyan-200",
      dot: "bg-cyan-400",
    };
  }
  if (points < 5000) {
    return {
      badge: "border-amber-500/35 bg-amber-500/10 text-amber-200",
      dot: "bg-amber-400",
    };
  }
  return {
    badge: "border-emerald-500/35 bg-emerald-500/10 text-emerald-200",
    dot: "bg-emerald-400",
  };
}

function BalanceBadge({ points, variant }: { points: number; variant: "amber" | "cyan" | "violet" }) {
  const tone = getBalanceTone(points);
  const ring =
    variant === "cyan"
      ? "ring-cyan-500/20"
      : variant === "violet"
        ? "ring-violet-500/20"
        : "ring-amber-500/20";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-base font-bold tabular-nums ring-1 ${tone.badge} ${ring}`}
    >
      <span className={`h-2.5 w-2.5 rounded-full ${tone.dot}`} aria-hidden />
      {formatWalletAmount(points)}
    </span>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  hint: string;
  accent: "amber" | "cyan" | "emerald" | "slate";
  icon: React.ReactNode;
}

function StatCard({ label, value, hint, accent, icon }: StatCardProps) {
  const styles = {
    amber: {
      border: "border-amber-500/30",
      bg: "from-amber-500/15 via-slate-800 to-slate-900",
      shadow: "shadow-amber-500/10 hover:shadow-amber-500/20",
      value: "text-amber-400",
      icon: "text-amber-400",
    },
    cyan: {
      border: "border-cyan-500/30",
      bg: "from-cyan-500/15 via-slate-800 to-slate-900",
      shadow: "shadow-cyan-500/10 hover:shadow-cyan-500/20",
      value: "text-cyan-400",
      icon: "text-cyan-400",
    },
    emerald: {
      border: "border-emerald-500/30",
      bg: "from-emerald-500/15 via-slate-800 to-slate-900",
      shadow: "shadow-emerald-500/10 hover:shadow-emerald-500/20",
      value: "text-emerald-400",
      icon: "text-emerald-400",
    },
    slate: {
      border: "border-slate-500/30",
      bg: "from-slate-500/10 via-slate-800 to-slate-900",
      shadow: "shadow-slate-900/40 hover:border-slate-400/30",
      value: "text-slate-300",
      icon: "text-slate-400",
    },
  }[accent];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${styles.border} bg-gradient-to-br ${styles.bg} p-6 shadow-lg ${styles.shadow} transition sm:p-7`}
    >
      <div className={`absolute right-4 top-4 opacity-15 ${styles.icon}`}>{icon}</div>
      <p className={`text-base font-semibold ${DASHBOARD_PALETTE.textMuted}`}>{label}</p>
      <p className={`mt-3 text-3xl font-bold sm:text-4xl ${styles.value}`}>{value}</p>
      <p className={`mt-2 text-sm sm:text-base ${DASHBOARD_PALETTE.textMuted}`}>{hint}</p>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3 p-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex animate-pulse items-center gap-5 rounded-xl border border-slate-700/40 bg-slate-800/30 px-6 py-5"
        >
          <div className="h-14 w-14 rounded-xl bg-slate-700/60" />
          <div className="flex-1 space-y-2.5">
            <div className="h-4 w-48 rounded bg-slate-700/60" />
            <div className="h-4 w-64 rounded bg-slate-700/40" />
          </div>
          <div className="h-10 w-28 rounded-full bg-slate-700/50" />
          <div className="h-11 w-28 rounded-xl bg-slate-700/50" />
        </div>
      ))}
    </div>
  );
}

const WalletDashboard: React.FC<WalletDashboardProps> = ({ token, defaultRealmId }) => {
  const [data, setData] = useState<WalletUsersPageDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [emailFilter, setEmailFilter] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [editUser, setEditUser] = useState<WalletUserRowDto | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingType, setSavingType] = useState<WalletBalanceSaveType | null>(null);

  const fetchPage = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (opts?.silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      try {
        const result = await getWalletUsersPage(token, page, size, emailFilter || undefined);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo cargar el listado de wallets");
        setData({
          content: [],
          total_elements: 0,
          total_pages: 0,
          size,
          number: page,
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, page, size, emailFilter]
  );

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  const content = data?.content ?? [];
  const totalElements = data?.total_elements ?? 0;
  const totalPages = data?.total_pages ?? 0;

  const stats = useMemo(() => {
    const donationTotal = content.reduce((sum, row) => sum + (row.points ?? 0), 0);
    const votingTotal = content.reduce((sum, row) => sum + (row.voting_points ?? 0), 0);
    const machineTotal = content.reduce((sum, row) => sum + (row.machine_points_total ?? 0), 0);
    const withDonation = content.filter((row) => (row.points ?? 0) > 0).length;
    return { donationTotal, votingTotal, machineTotal, withDonation };
  }, [content]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailFilter(emailInput.trim());
    setPage(0);
  };

  const handleSaveDonation = async (points: number) => {
    if (!editUser) return;
    setSaving(true);
    setSavingType("donation");
    try {
      const updated = await updateWalletPoints(token, { user_id: editUser.id, points });
      setEditUser(updated);
      await fetchPage({ silent: true });
      Swal.fire({
        icon: "success",
        title: "Donación actualizada",
        text: `Nuevo saldo: ${formatWalletAmount(points)} puntos`,
        timer: 2500,
      });
    } catch (err: unknown) {
      Swal.fire({
        icon: "error",
        title: "No se pudo guardar",
        text: err instanceof Error ? err.message : "Error al actualizar donación",
        timer: 4500,
      });
    } finally {
      setSaving(false);
      setSavingType(null);
    }
  };

  const handleSaveVoting = async (points: number) => {
    if (!editUser) return;
    setSaving(true);
    setSavingType("voting");
    try {
      const updated = await updateVotingPoints(token, { user_id: editUser.id, points });
      setEditUser(updated);
      await fetchPage({ silent: true });
      Swal.fire({
        icon: "success",
        title: "Votación actualizada",
        text: `Nuevo saldo: ${formatWalletAmount(points)} puntos`,
        timer: 2500,
      });
    } catch (err: unknown) {
      Swal.fire({
        icon: "error",
        title: "No se pudo guardar",
        text: err instanceof Error ? err.message : "Error al actualizar votación",
        timer: 4500,
      });
    } finally {
      setSaving(false);
      setSavingType(null);
    }
  };

  const handleSaveMachine = async (updates: { realm_id: number; points: number }[]) => {
    if (!editUser || updates.length === 0) return;
    setSaving(true);
    setSavingType("machine");
    try {
      let updated = editUser;
      for (const update of updates) {
        updated = await updateMachinePoints(token, {
          user_id: editUser.id,
          realm_id: update.realm_id,
          points: update.points,
        });
      }
      setEditUser(updated);
      await fetchPage({ silent: true });
      Swal.fire({
        icon: "success",
        title: "Máquina actualizada",
        text: "Los puntos de slot se guardaron correctamente.",
        timer: 2500,
      });
    } catch (err: unknown) {
      Swal.fire({
        icon: "error",
        title: "No se pudo guardar",
        text: err instanceof Error ? err.message : "Error al actualizar máquina",
        timer: 4500,
      });
    } finally {
      setSaving(false);
      setSavingType(null);
    }
  };

  const showPagination = !loading && totalElements > 0;

  return (
    <div className={`space-y-8 ${DASHBOARD_PALETTE.text}`}>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Usuarios registrados"
          value={totalElements.toLocaleString()}
          hint={emailFilter ? "Resultado del filtro activo" : "Total en la plataforma"}
          accent="cyan"
          icon={
            <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <StatCard
          label="Donación en página"
          value={formatWalletAmount(stats.donationTotal)}
          hint={`${stats.withDonation} usuarios con saldo de donación`}
          accent="amber"
          icon={
            <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Votación en página"
          value={formatWalletAmount(stats.votingTotal)}
          hint="Suma de puntos de voto visibles"
          accent="cyan"
          icon={
            <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Máquina en página"
          value={formatWalletAmount(stats.machineTotal)}
          hint="Suma de puntos slot por reino"
          accent="emerald"
          icon={
            <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Página actual"
          value={`${page + 1} / ${Math.max(totalPages, 1)}`}
          hint={`${size} registros por página`}
          accent="slate"
          icon={
            <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          }
        />
      </div>

      <DashboardSection
        title="Gestión de balances"
        description="Consulta y edita puntos de donación, votación y máquina (slot) por usuario."
      >
        <div className="space-y-6">
          <div
            className={`flex flex-col gap-5 rounded-2xl border ${DASHBOARD_PALETTE.border} bg-slate-800/30 p-5 sm:p-6`}
          >
            <form onSubmit={handleSearch} className="flex min-w-0 flex-1 flex-col gap-4 lg:flex-row lg:items-center">
              <div className="relative min-w-0 flex-1">
                <svg
                  className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
                </svg>
                <input
                  type="search"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Buscar por correo electrónico..."
                  className={`${DASHBOARD_PALETTE.input} py-3.5 pl-12 text-base`}
                />
              </div>
              <div className="flex shrink-0 flex-wrap gap-3">
                <button type="submit" className={`${DASHBOARD_PALETTE.btnPrimary} px-6 py-3.5 text-base`}>
                  Buscar
                </button>
                <button
                  type="button"
                  onClick={() => fetchPage({ silent: true })}
                  disabled={refreshing}
                  className={`rounded-xl border ${DASHBOARD_PALETTE.border} px-5 py-3.5 text-base font-semibold text-slate-300 transition-colors hover:bg-slate-700/50 disabled:opacity-50`}
                  title="Actualizar listado"
                >
                  {refreshing ? "Actualizando..." : "Actualizar"}
                </button>
              </div>
            </form>

            {emailFilter && (
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-sm font-semibold text-cyan-100 sm:text-base">
                  Filtro: {emailFilter}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEmailInput("");
                    setEmailFilter("");
                    setPage(0);
                  }}
                  className="text-base font-medium text-slate-400 transition-colors hover:text-cyan-300"
                >
                  Quitar filtro
                </button>
              </div>
            )}
          </div>

          {error && !loading && (
            <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-5 sm:flex-row">
              <p className="text-base text-red-300">{error}</p>
              <button
                type="button"
                onClick={() => fetchPage()}
                className="rounded-xl border border-red-500/40 px-5 py-2.5 text-base font-semibold text-red-200 hover:bg-red-500/15"
              >
                Reintentar
              </button>
            </div>
          )}

          {showPagination && (
            <WalletPagination
              currentPage={page}
              pageCount={totalPages}
              totalItems={totalElements}
              itemsPerPage={size}
              onPageChange={setPage}
              onItemsPerPageChange={(nextSize) => {
                setSize(nextSize);
                setPage(0);
              }}
            />
          )}

          <div className={`overflow-hidden rounded-2xl border ${DASHBOARD_PALETTE.border} bg-slate-900/40`}>
            {loading ? (
              <TableSkeleton />
            ) : content.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-700/50 bg-slate-800/60 text-slate-500">
                  <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
                  </svg>
                </div>
                <p className="text-xl font-semibold text-slate-200">No hay usuarios para mostrar</p>
                <p className={`mt-2 max-w-md text-base ${DASHBOARD_PALETTE.textMuted}`}>
                  {emailFilter
                    ? "Prueba con otro correo o quita el filtro activo."
                    : "Aún no hay usuarios registrados en la plataforma."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px]">
                  <thead>
                    <tr className="border-b border-slate-700/60 bg-slate-800/50 text-left text-sm font-bold uppercase tracking-wide text-slate-300 sm:text-base">
                      <th className="px-6 py-5">Usuario</th>
                      <th className="px-6 py-5">Donación</th>
                      <th className="px-6 py-5">Votación</th>
                      <th className="px-6 py-5">Máquina</th>
                      <th className="px-6 py-5 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {content.map((row) => {
                      const name =
                        [row.first_name, row.last_name].filter(Boolean).join(" ") || "Sin nombre";

                      return (
                        <tr
                          key={row.id}
                          className="group transition-colors hover:bg-slate-800/35"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700/80 to-slate-800 text-base font-bold text-slate-200 ring-1 ring-slate-600/50 group-hover:from-cyan-500/20 group-hover:to-blue-600/10 group-hover:text-cyan-100">
                                {getInitials(row)}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-lg font-semibold text-white">{name}</p>
                                <p className="truncate text-base text-slate-400">{row.email ?? "—"}</p>
                                <p className="mt-0.5 font-mono text-sm text-slate-500">ID #{row.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <BalanceBadge points={row.points ?? 0} variant="amber" />
                          </td>
                          <td className="px-6 py-5">
                            <BalanceBadge points={row.voting_points ?? 0} variant="cyan" />
                          </td>
                          <td className="px-6 py-5">
                            <div className="space-y-1">
                              <BalanceBadge points={row.machine_points_total ?? 0} variant="violet" />
                              {(row.machine_wallets?.length ?? 0) > 1 && (
                                <p className="text-sm text-slate-500">
                                  {row.machine_wallets.length} reinos
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <button
                              type="button"
                              onClick={() => setEditUser(row)}
                              className="inline-flex items-center gap-2.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-3 text-base font-semibold text-cyan-100 transition-all hover:border-cyan-400/50 hover:bg-cyan-500/20"
                              title="Gestionar balances"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Gestionar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {showPagination && (
            <WalletPagination
              currentPage={page}
              pageCount={totalPages}
              totalItems={totalElements}
              itemsPerPage={size}
              onPageChange={setPage}
              onItemsPerPageChange={(nextSize) => {
                setSize(nextSize);
                setPage(0);
              }}
            />
          )}
        </div>
      </DashboardSection>

      <WalletEditModal
        open={editUser != null}
        user={editUser}
        defaultRealmId={defaultRealmId}
        saving={saving}
        savingType={savingType}
        onClose={() => {
          if (!saving) setEditUser(null);
        }}
        onSaveDonation={handleSaveDonation}
        onSaveVoting={handleSaveVoting}
        onSaveMachine={handleSaveMachine}
      />
    </div>
  );
};

export default WalletDashboard;

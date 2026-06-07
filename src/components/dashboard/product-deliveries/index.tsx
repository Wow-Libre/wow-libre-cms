"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  getProductDeliveriesAdmin,
  resendProductDeliveryEmail,
  type ProductDeliveryAdminItem,
  type ProductDeliveryStatus,
} from "@/api/products/deliveries";
import { dashboardSwal as Swal } from "@/components/dashboard/dashboardSwal";
import { DashboardSection } from "../layout";
import { DASHBOARD_PALETTE } from "../styles/dashboardPalette";
import WalletPagination from "../wallet/WalletPagination";

const DEFAULT_PAGE_SIZE = 20;

const STATUS_FILTERS: { value: ProductDeliveryStatus; label: string }[] = [
  { value: "ALL", label: "Todas" },
  { value: "PENDING_DELIVERY", label: "Pendiente de envío" },
  { value: "DELIVERED", label: "Entregadas" },
  { value: "AWAITING_PAYMENT", label: "Esperando pago" },
  { value: "FAILED", label: "Fallidas" },
];

type StatAccent = "amber" | "cyan" | "emerald" | "rose";

interface StatCardProps {
  label: string;
  value: string;
  hint: string;
  accent: StatAccent;
}

function StatCard({ label, value, hint, accent }: StatCardProps) {
  const styles = {
    amber: {
      border: "border-amber-500/30",
      bg: "from-amber-500/15 via-slate-800 to-slate-900",
      value: "text-amber-400",
    },
    cyan: {
      border: "border-cyan-500/30",
      bg: "from-cyan-500/15 via-slate-800 to-slate-900",
      value: "text-cyan-400",
    },
    emerald: {
      border: "border-emerald-500/30",
      bg: "from-emerald-500/15 via-slate-800 to-slate-900",
      value: "text-emerald-400",
    },
    rose: {
      border: "border-rose-500/30",
      bg: "from-rose-500/15 via-slate-800 to-slate-900",
      value: "text-rose-400",
    },
  }[accent];

  return (
    <div
      className={`rounded-2xl border ${styles.border} bg-gradient-to-br ${styles.bg} p-6 shadow-lg sm:p-7`}
    >
      <p className={`text-base font-semibold sm:text-lg ${DASHBOARD_PALETTE.textMuted}`}>{label}</p>
      <p className={`mt-3 text-3xl font-bold tabular-nums sm:text-4xl ${styles.value}`}>{value}</p>
      <p className={`mt-2 text-sm sm:text-base ${DASHBOARD_PALETTE.textMuted}`}>{hint}</p>
    </div>
  );
}

function DeliveryStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    DELIVERED: "border-emerald-500/35 bg-emerald-500/10 text-emerald-200",
    PENDING_DELIVERY: "border-amber-500/35 bg-amber-500/10 text-amber-200",
    AWAITING_PAYMENT: "border-cyan-500/35 bg-cyan-500/10 text-cyan-200",
    FAILED: "border-rose-500/35 bg-rose-500/10 text-rose-200",
  };
  const labels: Record<string, string> = {
    DELIVERED: "Entregada",
    PENDING_DELIVERY: "Pendiente",
    AWAITING_PAYMENT: "Esperando pago",
    FAILED: "Fallida",
  };
  const cls = styles[status] ?? "border-slate-600/50 bg-slate-800/80 text-slate-300";
  const label = labels[status] ?? status;

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${cls}`}>
      {label}
    </span>
  );
}

function maskKey(key: string): string {
  if (key.length <= 8) return "••••••••";
  return `${key.slice(0, 4)}••••${key.slice(-4)}`;
}

function KeyCell({ redeemKey }: { redeemKey: string | null }) {
  const [visible, setVisible] = useState(false);

  if (!redeemKey) {
    return <span className="text-slate-500">Sin asignar</span>;
  }

  const copyKey = async () => {
    try {
      await navigator.clipboard.writeText(redeemKey);
      Swal.fire({
        icon: "success",
        title: "Clave copiada",
        color: "white",
        background: "#0B1218",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "No se pudo copiar",
        color: "white",
        background: "#0B1218",
      });
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <code className="rounded-lg border border-slate-600/50 bg-slate-900/80 px-2 py-1 text-sm text-slate-200">
        {visible ? redeemKey : maskKey(redeemKey)}
      </code>
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="rounded-lg border border-slate-600/50 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700/50"
      >
        {visible ? "Ocultar" : "Ver"}
      </button>
      <button
        type="button"
        onClick={copyKey}
        className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-xs text-cyan-200 hover:bg-cyan-500/20"
      >
        Copiar
      </button>
    </div>
  );
}

function canResendEmail(row: ProductDeliveryAdminItem): boolean {
  if (row.delivery_status === "AWAITING_PAYMENT" || row.delivery_status === "FAILED") {
    return false;
  }
  return row.delivery_status === "DELIVERED" || row.delivery_status === "PENDING_DELIVERY";
}

function ResendEmailButton({
  row,
  token,
  realmId,
  onSuccess,
}: {
  row: ProductDeliveryAdminItem;
  token: string;
  realmId?: number;
  onSuccess: () => void;
}) {
  const [sending, setSending] = useState(false);
  const eligible = canResendEmail(row);
  const label = row.redeem_key || row.sent ? "Reenviar email" : "Enviar email";

  const handleResend = async () => {
    const confirm = await Swal.fire({
      icon: "question",
      title: row.redeem_key || row.sent ? "¿Reenviar clave por email?" : "¿Enviar clave por email?",
      html: `Se enviará la clave a <strong>${row.user_email ?? "el usuario"}</strong>.`,
      showCancelButton: true,
      confirmButtonText: row.redeem_key || row.sent ? "Reenviar" : "Enviar",
      cancelButtonText: "Cancelar",
      color: "white",
      background: "#0B1218",
    });
    if (!confirm.isConfirmed) return;

    setSending(true);
    try {
      await resendProductDeliveryEmail(token, {
        referenceNumber: row.reference_number,
        transactionDbId: row.transaction_id,
        realmId,
      });
      Swal.fire({
        icon: "success",
        title: row.redeem_key || row.sent ? "Email reenviado" : "Email enviado",
        text: `Clave enviada a ${row.user_email ?? "el usuario"}.`,
        color: "white",
        background: "#0B1218",
        timer: 2500,
      });
      onSuccess();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "No se pudo enviar",
        text: err instanceof Error ? err.message : "Error desconocido",
        color: "white",
        background: "#0B1218",
      });
    } finally {
      setSending(false);
    }
  };

  if (!eligible) {
    return <span className="text-xs text-slate-600">—</span>;
  }

  return (
    <button
      type="button"
      onClick={handleResend}
      disabled={sending || !row.user_email}
      title={!row.user_email ? "El usuario no tiene email registrado" : undefined}
      className="rounded-lg border border-indigo-500/35 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-200 hover:bg-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {sending ? "Enviando…" : label}
    </button>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3 p-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex animate-pulse items-center gap-4 rounded-xl border border-slate-700/40 bg-slate-800/30 px-5 py-4"
        >
          <div className="h-4 w-32 rounded bg-slate-700/60" />
          <div className="h-4 flex-1 rounded bg-slate-700/40" />
          <div className="h-8 w-24 rounded-full bg-slate-700/50" />
        </div>
      ))}
    </div>
  );
}

interface ProductDeliveriesDashboardProps {
  token: string;
  realmId?: number;
}

const ProductDeliveriesDashboard: React.FC<ProductDeliveriesDashboardProps> = ({
  token,
  realmId,
}) => {
  const [data, setData] = useState<Awaited<ReturnType<typeof getProductDeliveriesAdmin>> | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ProductDeliveryStatus>("ALL");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const fetchData = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (opts?.silent) setRefreshing(true);
      else setLoading(true);
      try {
        const result = await getProductDeliveriesAdmin(token, {
          realmId,
          deliveryStatus: statusFilter,
          page,
          size: pageSize,
        });
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar entregas");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, realmId, statusFilter, page, pageSize]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  const handleFilterChange = (value: ProductDeliveryStatus) => {
    setStatusFilter(value);
    setPage(0);
  };

  const deliveries = data?.deliveries ?? [];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Pendientes de envío"
          value={String(data?.pending_delivery_count ?? "—")}
          hint="Pagadas, clave aún no enviada"
          accent="amber"
        />
        <StatCard
          label="Entregadas"
          value={String(data?.delivered_count ?? "—")}
          hint="Clave asignada y enviada"
          accent="emerald"
        />
        <StatCard
          label="Esperando pago"
          value={String(data?.awaiting_payment_count ?? "—")}
          hint="Transacción creada o pendiente"
          accent="cyan"
        />
        <StatCard
          label="Fallidas"
          value={String(data?.failed_count ?? "—")}
          hint="Rechazadas o con error"
          accent="rose"
        />
      </div>

      <DashboardSection
        title="Historial de entregas"
        description="Compras de productos con clave externa (Steam, Epic, etc.). Revisa a quién se envió o debe enviarse cada clave."
        action={
          <button
            type="button"
            onClick={() => fetchData({ silent: true })}
            disabled={refreshing}
            className="rounded-xl border border-slate-600/50 bg-slate-800/80 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700/80 disabled:opacity-50"
          >
            {refreshing ? "Actualizando…" : "Actualizar"}
          </button>
        }
      >
        <div className="mb-6 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => handleFilterChange(f.value)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                statusFilter === f.value
                  ? "border-cyan-500/50 bg-cyan-500/15 text-cyan-100"
                  : "border-slate-600/50 text-slate-400 hover:border-slate-500 hover:text-slate-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-rose-200">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/40">
          {loading ? (
            <TableSkeleton />
          ) : deliveries.length === 0 ? (
            <p className="p-8 text-center text-slate-400">No hay entregas con este filtro.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-700/60 bg-slate-800/60 text-slate-400">
                    <th className="px-4 py-3 font-semibold">Referencia</th>
                    <th className="px-4 py-3 font-semibold">Producto</th>
                    <th className="px-4 py-3 font-semibold">Destinatario</th>
                    <th className="px-4 py-3 font-semibold">Estado</th>
                    <th className="px-4 py-3 font-semibold">Clave</th>
                    <th className="px-4 py-3 font-semibold">Compra</th>
                    <th className="px-4 py-3 font-semibold">Clave asignada</th>
                    <th className="px-4 py-3 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((row: ProductDeliveryAdminItem) => (
                    <tr
                      key={row.transaction_id}
                      className="border-b border-slate-700/30 hover:bg-slate-800/30"
                    >
                      <td className="px-4 py-4">
                        <span className="font-mono text-xs text-slate-300">{row.reference_number}</span>
                        <p className="mt-1 text-xs text-slate-500">ID {row.transaction_id}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-200">{row.product_name ?? "—"}</p>
                        <p className="text-xs text-slate-500">
                          {row.price.toLocaleString()} {row.currency}
                          {row.payment_method ? ` · ${row.payment_method}` : ""}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-slate-200">{row.user_email ?? "—"}</p>
                        <p className="text-xs text-slate-500">Usuario #{row.user_id}</p>
                      </td>
                      <td className="px-4 py-4">
                        <DeliveryStatusBadge status={row.delivery_status} />
                        {row.sent && (
                          <p className="mt-1 text-xs text-emerald-400/80">Email enviado</p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <KeyCell redeemKey={row.redeem_key} />
                      </td>
                      <td className="px-4 py-4 text-slate-400">{formatDate(row.creation_date)}</td>
                      <td className="px-4 py-4 text-slate-400">{formatDate(row.key_assigned_at)}</td>
                      <td className="px-4 py-4">
                        <ResendEmailButton
                          row={row}
                          token={token}
                          realmId={realmId}
                          onSuccess={() => fetchData({ silent: true })}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {data && data.total_elements > 0 && (
          <div className="mt-6">
            <WalletPagination
              currentPage={page}
              pageCount={Math.max(data.total_pages, 1)}
              totalItems={data.total_elements}
              itemsPerPage={pageSize}
              onPageChange={setPage}
              onItemsPerPageChange={(size) => {
                setPageSize(size);
                setPage(0);
              }}
              itemLabel="entregas"
              ariaLabel="Paginación de entregas"
            />
          </div>
        )}
      </DashboardSection>
    </div>
  );
};

export default ProductDeliveriesDashboard;

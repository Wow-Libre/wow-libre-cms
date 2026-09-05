"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  getProductShipmentsAdmin,
  updateProductShipmentAdmin,
  type ProductShipmentAdminItem,
  type ShippingStatusFilter,
} from "@/api/products/shipments";
import { dashboardSwal as Swal } from "@/components/dashboard/dashboardSwal";
import { DashboardSection } from "../layout";
import { DASHBOARD_PALETTE } from "../styles/dashboardPalette";
import WalletPagination from "../wallet/WalletPagination";

const DEFAULT_PAGE_SIZE = 20;

const STATUS_FILTERS: { value: ShippingStatusFilter; label: string }[] = [
  { value: "ALL", label: "Todos" },
  { value: "PENDING", label: "Pendientes" },
  { value: "SHIPPED", label: "Enviados" },
  { value: "CANCELLED", label: "Cancelados" },
];

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "border-amber-500/35 bg-amber-500/10 text-amber-200",
    SHIPPED: "border-emerald-500/35 bg-emerald-500/10 text-emerald-200",
    CANCELLED: "border-rose-500/35 bg-rose-500/10 text-rose-200",
  };
  const labels: Record<string, string> = {
    PENDING: "Pendiente",
    SHIPPED: "Enviado",
    CANCELLED: "Cancelado",
  };
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${
        styles[status] ?? "border-slate-600/50 bg-slate-800/80 text-slate-300"
      }`}
    >
      {labels[status] ?? status}
    </span>
  );
}

interface PhysicalShipmentsDashboardProps {
  token: string;
  realmId: number;
}

const PhysicalShipmentsDashboard: React.FC<PhysicalShipmentsDashboardProps> = ({
  token,
  realmId,
}) => {
  const [data, setData] = useState<Awaited<ReturnType<typeof getProductShipmentsAdmin>> | null>(
    null
  );
  const [status, setStatus] = useState<ShippingStatusFilter>("ALL");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getProductShipmentsAdmin(token, {
        realmId,
        status,
        page,
        size: pageSize,
      });
      setData(result);
    } catch (error: unknown) {
      Swal.fire({
        icon: "error",
        title: "No se pudieron cargar los envíos",
        text: error instanceof Error ? error.message : "Error inesperado",
        color: "white",
        background: "#0B1218",
      });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, realmId, status, token]);

  useEffect(() => {
    void load();
  }, [load]);

  const markShipped = async (item: ProductShipmentAdminItem) => {
    const { value: tracking } = await Swal.fire({
      title: "Marcar como enviado",
      input: "text",
      inputLabel: "Código de seguimiento (opcional)",
      inputPlaceholder: "Guía o tracking",
      showCancelButton: true,
      confirmButtonText: "Enviar",
      cancelButtonText: "Cancelar",
      color: "white",
      background: "#0B1218",
    });
    if (tracking === undefined) return;
    try {
      await updateProductShipmentAdmin(token, item.shipment_id, {
        status: "SHIPPED",
        tracking_code: tracking ? String(tracking) : undefined,
      });
      await load();
    } catch (error: unknown) {
      Swal.fire({
        icon: "error",
        title: "No se pudo marcar enviado",
        text: error instanceof Error ? error.message : "Error inesperado",
        color: "white",
        background: "#0B1218",
      });
    }
  };

  const markCancelled = async (item: ProductShipmentAdminItem) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "¿Cancelar este envío?",
      text: "Si el pago ya estaba confirmado, se devolverá 1 unidad al stock.",
      showCancelButton: true,
      confirmButtonText: "Cancelar envío",
      cancelButtonText: "Volver",
      color: "white",
      background: "#0B1218",
    });
    if (!confirm.isConfirmed) return;
    try {
      await updateProductShipmentAdmin(token, item.shipment_id, { status: "CANCELLED" });
      await load();
    } catch (error: unknown) {
      Swal.fire({
        icon: "error",
        title: "No se pudo cancelar",
        text: error instanceof Error ? error.message : "Error inesperado",
        color: "white",
        background: "#0B1218",
      });
    }
  };

  return (
    <DashboardSection
      title="Envíos físicos"
      description="Pedidos de figuras y camisas: dirección, talla, puntos de donación y estado postal."
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/15 via-slate-800 to-slate-900 p-6">
          <p className={`text-base font-semibold ${DASHBOARD_PALETTE.textMuted}`}>Pendientes</p>
          <p className="mt-3 text-3xl font-bold text-amber-400">{data?.pending_count ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 via-slate-800 to-slate-900 p-6">
          <p className={`text-base font-semibold ${DASHBOARD_PALETTE.textMuted}`}>Enviados</p>
          <p className="mt-3 text-3xl font-bold text-emerald-400">{data?.shipped_count ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-500/15 via-slate-800 to-slate-900 p-6">
          <p className={`text-base font-semibold ${DASHBOARD_PALETTE.textMuted}`}>Cancelados</p>
          <p className="mt-3 text-3xl font-bold text-rose-400">{data?.cancelled_count ?? 0}</p>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => {
              setPage(0);
              setStatus(filter.value);
            }}
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              status === filter.value
                ? "border-cyan-400/60 bg-cyan-500/15 text-cyan-100"
                : "border-slate-600/60 bg-slate-800/70 text-slate-300"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-700/60">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-slate-400">
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Comprador</th>
              <th className="px-4 py-3">Dirección</th>
              <th className="px-4 py-3">Talla</th>
              <th className="px-4 py-3">Pago</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Tracking</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(data?.shipments ?? []).map((item) => (
              <tr key={item.shipment_id} className="border-t border-slate-700/50 text-slate-200">
                <td className="px-4 py-3">
                  <p className="font-semibold">{item.product_name ?? "—"}</p>
                  <p className="font-mono text-xs text-slate-500">{item.reference_number}</p>
                </td>
                <td className="px-4 py-3">
                  <p>{item.full_name}</p>
                  <p className="text-xs text-slate-400">{item.user_email}</p>
                  <p className="text-xs text-slate-500">{item.phone}</p>
                </td>
                <td className="max-w-[240px] px-4 py-3 text-slate-300">
                  {item.address_line}, {item.city}
                  {item.region ? `, ${item.region}` : ""} {item.country}
                  {item.postal_code ? ` (${item.postal_code})` : ""}
                </td>
                <td className="px-4 py-3">{item.size ?? "—"}</td>
                <td className="px-4 py-3">
                  <p>
                    {item.currency === "POINTS"
                      ? `${item.price} pts`
                      : `$${Number(item.price).toLocaleString()} ${item.currency}`}
                  </p>
                  {item.points_applied ? (
                    <p className="text-xs text-cyan-300">{item.points_applied} pts donación</p>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={item.shipping_status} />
                </td>
                <td className="px-4 py-3 font-mono text-xs">{item.tracking_code ?? "—"}</td>
                <td className="px-4 py-3">
                  {item.shipping_status === "PENDING" ? (
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => void markShipped(item)}
                        className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-200"
                      >
                        Enviar
                      </button>
                      <button
                        type="button"
                        onClick={() => void markCancelled(item)}
                        className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-200"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <span className="text-slate-500">—</span>
                  )}
                </td>
              </tr>
            ))}
            {!loading && (data?.shipments?.length ?? 0) === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-slate-400">
                  No hay envíos para este filtro.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      {data ? (
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
            itemLabel="envíos"
            ariaLabel="Paginación de envíos físicos"
          />
        </div>
      ) : null}
    </DashboardSection>
  );
};

export default PhysicalShipmentsDashboard;

/**
 * Estados alineados con wow-core `TransactionStatus` enum.
 * @see wow-core/domain/enums/TransactionStatus.java
 */
export const TRANSACTION_STATUS = {
  PAID: "PAID",
  CREATED: "CREATED",
  DELIVERED: "DELIVERED",
  REJECTED: "REJECTED",
  ERROR: "ERROR",
  INSUFFICIENT_MONEY: "INSUFFICIENT_MONEY",
  PENDING: "PENDING",
} as const;

export type TransactionStatusCode =
  (typeof TRANSACTION_STATUS)[keyof typeof TRANSACTION_STATUS];

/** Progreso (%) que wow-core envía en el listado por estado. */
const PROGRESS_BY_STATUS: Record<TransactionStatusCode, number> = {
  PAID: 100,
  CREATED: 1,
  DELIVERED: 100,
  REJECTED: 100,
  ERROR: 100,
  INSUFFICIENT_MONEY: 0,
  PENDING: 50,
};

const LEGACY_STATUS_MAP: Record<string, TransactionStatusCode> = {
  COMPLETED: TRANSACTION_STATUS.PAID,
  PROCESSING: TRANSACTION_STATUS.PENDING,
  FAILED: TRANSACTION_STATUS.ERROR,
  CANCELLED: TRANSACTION_STATUS.REJECTED,
};

export const TRANSACTION_STATUS_FILTER_OPTIONS: {
  value: string;
  label: string;
}[] = [
  { value: "all", label: "Todos los estados" },
  { value: TRANSACTION_STATUS.CREATED, label: "Creado" },
  { value: TRANSACTION_STATUS.PENDING, label: "Pendiente" },
  { value: TRANSACTION_STATUS.PAID, label: "Pagado" },
  { value: TRANSACTION_STATUS.DELIVERED, label: "Entregado" },
  { value: TRANSACTION_STATUS.REJECTED, label: "Rechazado" },
  { value: TRANSACTION_STATUS.ERROR, label: "Error" },
  {
    value: TRANSACTION_STATUS.INSUFFICIENT_MONEY,
    label: "Fondos insuficientes",
  },
];

const STATUS_LABELS_ES: Record<TransactionStatusCode, string> = {
  PAID: "Pagado",
  CREATED: "Creado",
  DELIVERED: "Entregado",
  REJECTED: "Rechazado",
  ERROR: "Error",
  INSUFFICIENT_MONEY: "Fondos insuficientes",
  PENDING: "Pendiente",
};

export function normalizeTransactionStatus(
  status: string | null | undefined
): TransactionStatusCode | string {
  if (!status?.trim()) {
    return status ?? "";
  }
  const upper = status.trim().toUpperCase().replace(/\s+/g, "_");
  if (upper in TRANSACTION_STATUS) {
    return upper as TransactionStatusCode;
  }
  if (upper in LEGACY_STATUS_MAP) {
    return LEGACY_STATUS_MAP[upper];
  }
  return upper;
}

export function getTransactionStatusLabel(status: string): string {
  const normalized = normalizeTransactionStatus(status);
  if (normalized in STATUS_LABELS_ES) {
    return STATUS_LABELS_ES[normalized as TransactionStatusCode];
  }
  return status;
}

export function getTransactionProgress(
  status: string,
  apiProgress?: number | null
): number {
  if (typeof apiProgress === "number" && !Number.isNaN(apiProgress)) {
    return Math.min(100, Math.max(0, apiProgress));
  }
  const normalized = normalizeTransactionStatus(status);
  if (normalized in PROGRESS_BY_STATUS) {
    return PROGRESS_BY_STATUS[normalized as TransactionStatusCode];
  }
  return 0;
}

export function matchesTransactionStatusFilter(
  transactionStatus: string,
  filterValue: string
): boolean {
  if (filterValue === "all") {
    return true;
  }
  return (
    normalizeTransactionStatus(transactionStatus) ===
    normalizeTransactionStatus(filterValue)
  );
}

export function getTransactionStatusColorClass(status: string): string {
  const normalized = normalizeTransactionStatus(status);
  switch (normalized) {
    case TRANSACTION_STATUS.PAID:
    case TRANSACTION_STATUS.DELIVERED:
      return "bg-emerald-500/15 text-emerald-200 border-emerald-400/35";
    case TRANSACTION_STATUS.PENDING:
    case TRANSACTION_STATUS.CREATED:
      return "bg-amber-500/15 text-amber-100 border-amber-400/35";
    case TRANSACTION_STATUS.REJECTED:
    case TRANSACTION_STATUS.ERROR:
    case TRANSACTION_STATUS.INSUFFICIENT_MONEY:
      return "bg-rose-500/15 text-rose-200 border-rose-400/35";
    default:
      return "bg-sky-500/15 text-sky-200 border-sky-400/35";
  }
}

export function getTransactionProgressBarClass(progress: number): string {
  if (progress >= 100) return "bg-gradient-to-r from-emerald-500 to-emerald-400";
  if (progress >= 50) return "bg-gradient-to-r from-amber-500 to-amber-400";
  return "bg-gradient-to-r from-rose-500 to-rose-400";
}

/** Filtros rápidos en la barra de compras (estados más consultados). */
export const TRANSACTION_QUICK_FILTER_OPTIONS: {
  value: string;
  label: string;
}[] = [
  { value: "all", label: "Todas" },
  { value: TRANSACTION_STATUS.PENDING, label: "Pendientes" },
  { value: TRANSACTION_STATUS.PAID, label: "Pagadas" },
  { value: TRANSACTION_STATUS.DELIVERED, label: "Entregadas" },
  { value: TRANSACTION_STATUS.REJECTED, label: "Rechazadas" },
];

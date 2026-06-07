import { BASE_URL_CORE } from "@/configs/configs";
import { GenericResponseDto, InternalServerError } from "@/dto/generic";
import { v4 as uuidv4 } from "uuid";

export type ProductDeliveryStatus =
  | "ALL"
  | "AWAITING_PAYMENT"
  | "PENDING_DELIVERY"
  | "DELIVERED"
  | "FAILED";

export type ProductDeliveryAdminItem = {
  transaction_id: number;
  reference_number: string;
  transaction_status: string;
  delivery_status: ProductDeliveryStatus | string;
  sent: boolean;
  user_id: number;
  user_email: string | null;
  product_id: number | null;
  product_name: string | null;
  price: number;
  currency: string;
  payment_method: string | null;
  creation_date: string;
  redeem_key: string | null;
  key_assigned_at: string | null;
  realm_id: number | null;
};

export type ProductDeliveryAdminListResponse = {
  deliveries: ProductDeliveryAdminItem[];
  total_elements: number;
  total_pages: number;
  page: number;
  size: number;
  pending_delivery_count: number;
  delivered_count: number;
  awaiting_payment_count: number;
  failed_count: number;
};

type RawDelivery = Record<string, unknown>;

function normalizeDelivery(raw: RawDelivery): ProductDeliveryAdminItem {
  return {
    transaction_id: Number(raw.transaction_id ?? raw.transactionId),
    reference_number: String(raw.reference_number ?? raw.referenceNumber ?? ""),
    transaction_status: String(raw.transaction_status ?? raw.transactionStatus ?? ""),
    delivery_status: String(raw.delivery_status ?? raw.deliveryStatus ?? ""),
    sent: Boolean(raw.sent),
    user_id: Number(raw.user_id ?? raw.userId),
    user_email: (raw.user_email ?? raw.userEmail) as string | null,
    product_id: raw.product_id != null || raw.productId != null
      ? Number(raw.product_id ?? raw.productId)
      : null,
    product_name: (raw.product_name ?? raw.productName) as string | null,
    price: Number(raw.price ?? 0),
    currency: String(raw.currency ?? ""),
    payment_method: (raw.payment_method ?? raw.paymentMethod) as string | null,
    creation_date: String(raw.creation_date ?? raw.creationDate ?? ""),
    redeem_key: (raw.redeem_key ?? raw.redeemKey) as string | null,
    key_assigned_at: (raw.key_assigned_at ?? raw.keyAssignedAt) as string | null,
    realm_id: raw.realm_id != null || raw.realmId != null
      ? Number(raw.realm_id ?? raw.realmId)
      : null,
  };
}

function normalizeList(raw: Record<string, unknown>): ProductDeliveryAdminListResponse {
  const deliveriesRaw = (raw.deliveries ?? []) as RawDelivery[];
  return {
    deliveries: deliveriesRaw.map(normalizeDelivery),
    total_elements: Number(raw.total_elements ?? raw.totalElements ?? 0),
    total_pages: Number(raw.total_pages ?? raw.totalPages ?? 0),
    page: Number(raw.page ?? 0),
    size: Number(raw.size ?? 0),
    pending_delivery_count: Number(raw.pending_delivery_count ?? raw.pendingDeliveryCount ?? 0),
    delivered_count: Number(raw.delivered_count ?? raw.deliveredCount ?? 0),
    awaiting_payment_count: Number(raw.awaiting_payment_count ?? raw.awaitingPaymentCount ?? 0),
    failed_count: Number(raw.failed_count ?? raw.failedCount ?? 0),
  };
}

export async function getProductDeliveriesAdmin(
  token: string,
  options: {
    realmId?: number;
    deliveryStatus?: ProductDeliveryStatus;
    page?: number;
    size?: number;
  } = {}
): Promise<ProductDeliveryAdminListResponse> {
  const transactionId = uuidv4();
  const params = new URLSearchParams();
  if (options.realmId != null) params.set("realm_id", String(options.realmId));
  if (options.deliveryStatus && options.deliveryStatus !== "ALL") {
    params.set("delivery_status", options.deliveryStatus);
  }
  params.set("page", String(options.page ?? 0));
  params.set("size", String(options.size ?? 20));

  try {
    const response = await fetch(
      `${BASE_URL_CORE}/api/products/deliveries/admin?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          transaction_id: transactionId,
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const err = (await response.json().catch(() => null)) as GenericResponseDto<void> | null;
      throw new InternalServerError(
        err?.message ?? "Error al cargar entregas",
        response.status,
        transactionId
      );
    }

    const body = (await response.json()) as GenericResponseDto<Record<string, unknown>>;
    if (!body.data) {
      throw new Error("Respuesta inválida del servidor");
    }
    return normalizeList(body.data);
  } catch (error: unknown) {
    if (error instanceof InternalServerError) throw error;
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Servicios no disponibles. Intenta más tarde.");
    }
    if (error instanceof Error) throw error;
    throw new Error(`Error inesperado - TransactionId: ${transactionId}`);
  }
}

export async function resendProductDeliveryEmail(
  token: string,
  options: {
    referenceNumber: string;
    transactionDbId?: number;
    realmId?: number;
  }
): Promise<void> {
  const transactionId = uuidv4();
  const params = new URLSearchParams();
  params.set("reference_number", options.referenceNumber);
  if (options.transactionDbId != null) {
    params.set("transaction_db_id", String(options.transactionDbId));
  }
  if (options.realmId != null) params.set("realm_id", String(options.realmId));

  try {
    const response = await fetch(
      `${BASE_URL_CORE}/api/products/deliveries/admin/resend?${params.toString()}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          transaction_id: transactionId,
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const err = (await response.json().catch(() => null)) as GenericResponseDto<void> | null;
      throw new InternalServerError(
        err?.message ?? "Error al reenviar el email",
        response.status,
        transactionId
      );
    }
  } catch (error: unknown) {
    if (error instanceof InternalServerError) throw error;
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Servicios no disponibles. Intenta más tarde.");
    }
    if (error instanceof Error) throw error;
    throw new Error(`Error inesperado - TransactionId: ${transactionId}`);
  }
}

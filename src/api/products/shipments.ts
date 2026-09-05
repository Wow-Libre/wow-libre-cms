import { BASE_URL_CORE } from "@/configs/configs";
import { GenericResponseDto, InternalServerError } from "@/dto/generic";
import { v4 as uuidv4 } from "uuid";

export type ShippingStatusFilter = "ALL" | "PENDING" | "SHIPPED" | "CANCELLED";

export type ProductShipmentAdminItem = {
  shipment_id: number;
  transaction_id: number | null;
  reference_number: string;
  transaction_status: string | null;
  shipping_status: string;
  user_id: number;
  user_email: string | null;
  product_id: number | null;
  product_name: string | null;
  price: number;
  points_applied: number | null;
  currency: string;
  payment_method: string | null;
  full_name: string;
  phone: string;
  country: string;
  region: string | null;
  city: string;
  postal_code: string | null;
  address_line: string;
  notes: string | null;
  size: string | null;
  tracking_code: string | null;
  created_at: string;
  realm_id: number | null;
};

export type ProductShipmentAdminListResponse = {
  shipments: ProductShipmentAdminItem[];
  total_elements: number;
  total_pages: number;
  page: number;
  size: number;
  pending_count: number;
  shipped_count: number;
  cancelled_count: number;
};

type RawShipment = Record<string, unknown>;

function normalizeShipment(raw: RawShipment): ProductShipmentAdminItem {
  return {
    shipment_id: Number(raw.shipment_id ?? raw.shipmentId),
    transaction_id:
      raw.transaction_id != null || raw.transactionId != null
        ? Number(raw.transaction_id ?? raw.transactionId)
        : null,
    reference_number: String(raw.reference_number ?? raw.referenceNumber ?? ""),
    transaction_status: (raw.transaction_status ?? raw.transactionStatus) as string | null,
    shipping_status: String(raw.shipping_status ?? raw.shippingStatus ?? ""),
    user_id: Number(raw.user_id ?? raw.userId),
    user_email: (raw.user_email ?? raw.userEmail) as string | null,
    product_id:
      raw.product_id != null || raw.productId != null
        ? Number(raw.product_id ?? raw.productId)
        : null,
    product_name: (raw.product_name ?? raw.productName) as string | null,
    price: Number(raw.price ?? 0),
    points_applied:
      raw.points_applied != null || raw.pointsApplied != null
        ? Number(raw.points_applied ?? raw.pointsApplied)
        : null,
    currency: String(raw.currency ?? ""),
    payment_method: (raw.payment_method ?? raw.paymentMethod) as string | null,
    full_name: String(raw.full_name ?? raw.fullName ?? ""),
    phone: String(raw.phone ?? ""),
    country: String(raw.country ?? ""),
    region: (raw.region as string | null) ?? null,
    city: String(raw.city ?? ""),
    postal_code: (raw.postal_code ?? raw.postalCode) as string | null,
    address_line: String(raw.address_line ?? raw.addressLine ?? ""),
    notes: (raw.notes as string | null) ?? null,
    size: (raw.size as string | null) ?? null,
    tracking_code: (raw.tracking_code ?? raw.trackingCode) as string | null,
    created_at: String(raw.created_at ?? raw.createdAt ?? ""),
    realm_id:
      raw.realm_id != null || raw.realmId != null
        ? Number(raw.realm_id ?? raw.realmId)
        : null,
  };
}

function normalizeList(raw: Record<string, unknown>): ProductShipmentAdminListResponse {
  const shipmentsRaw = (raw.shipments ?? []) as RawShipment[];
  return {
    shipments: shipmentsRaw.map(normalizeShipment),
    total_elements: Number(raw.total_elements ?? raw.totalElements ?? 0),
    total_pages: Number(raw.total_pages ?? raw.totalPages ?? 0),
    page: Number(raw.page ?? 0),
    size: Number(raw.size ?? 0),
    pending_count: Number(raw.pending_count ?? raw.pendingCount ?? 0),
    shipped_count: Number(raw.shipped_count ?? raw.shippedCount ?? 0),
    cancelled_count: Number(raw.cancelled_count ?? raw.cancelledCount ?? 0),
  };
}

export async function getProductShipmentsAdmin(
  token: string,
  options: {
    realmId?: number;
    status?: ShippingStatusFilter;
    page?: number;
    size?: number;
  } = {}
): Promise<ProductShipmentAdminListResponse> {
  const transactionId = uuidv4();
  const params = new URLSearchParams();
  if (options.realmId != null) params.set("realm_id", String(options.realmId));
  if (options.status && options.status !== "ALL") {
    params.set("status", options.status);
  }
  params.set("page", String(options.page ?? 0));
  params.set("size", String(options.size ?? 20));

  const response = await fetch(
    `${BASE_URL_CORE}/api/products/shipments/admin?${params.toString()}`,
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
      err?.message ?? "Error al cargar envíos",
      response.status,
      transactionId
    );
  }

  const body = (await response.json()) as GenericResponseDto<Record<string, unknown>>;
  if (!body.data) {
    throw new Error("Respuesta inválida del servidor");
  }
  return normalizeList(body.data);
}

export async function updateProductShipmentAdmin(
  token: string,
  shipmentId: number,
  request: { status: "SHIPPED" | "CANCELLED"; tracking_code?: string }
): Promise<void> {
  const transactionId = uuidv4();
  const response = await fetch(
    `${BASE_URL_CORE}/api/products/shipments/admin/${shipmentId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        transaction_id: transactionId,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    const err = (await response.json().catch(() => null)) as GenericResponseDto<void> | null;
    throw new InternalServerError(
      err?.message ?? "Error al actualizar el envío",
      response.status,
      transactionId
    );
  }
}

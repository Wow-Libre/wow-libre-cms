import { Transaction } from "@/model/model";
import {
  getTransactionProgress,
  normalizeTransactionStatus,
} from "@/lib/transaction/transactionStatus";

const DEFAULT_PRODUCT_IMAGE =
  "https://static.wixstatic.com/media/5dd8a0_cbcd4683525e448c8502b031dfce2527~mv2.webp";

function readProductNested(
  raw: Record<string, unknown>
): Record<string, unknown> | null {
  const nested = raw.productId ?? raw.product_id;
  if (nested && typeof nested === "object") {
    return nested as Record<string, unknown>;
  }
  return null;
}

function readSubscriptionNested(
  raw: Record<string, unknown>
): Record<string, unknown> | null {
  const nested = raw.subscriptionId ?? raw.subscription_id;
  if (nested && typeof nested === "object") {
    return nested as Record<string, unknown>;
  }
  return null;
}

function normalizeProductCategory(product: Record<string, unknown>) {
  const cat = product.productCategoryId ?? product.product_category_id;
  if (!cat || typeof cat !== "object") return undefined;
  const category = cat as Record<string, unknown>;
  return {
    id: Number(category.id),
    name: String(category.name ?? ""),
    description: String(category.description ?? ""),
    disclaimer: String(category.disclaimer ?? ""),
  };
}

function resolveProductName(
  raw: Record<string, unknown>,
  product: Record<string, unknown> | null
): string {
  if (product?.name) return String(product.name);
  if (raw.product_name) return String(raw.product_name);
  if (raw.productName) return String(raw.productName);

  const subscription = readSubscriptionNested(raw);
  const plan = subscription?.planId ?? subscription?.plan_id;
  if (plan && typeof plan === "object" && (plan as Record<string, unknown>).name) {
    return String((plan as Record<string, unknown>).name);
  }

  return "Azeroth Pass";
}

/** Conserva datos del listado si el detalle de la API viene incompleto. */
export function mergeTransactionPreview(
  detail: Transaction,
  preview?: Transaction | null
): Transaction {
  if (!preview) return detail;

  return {
    ...detail,
    product_name: detail.product_name || preview.product_name,
    logo: detail.logo || preview.logo,
    reference_number: detail.reference_number || preview.reference_number,
    price: detail.price || preview.price,
    currency: detail.currency || preview.currency,
    progress: detail.progress ?? preview.progress,
    product_id: detail.product_id ?? preview.product_id,
    redeem_key: detail.redeem_key ?? preview.redeem_key,
    key_assigned_at: detail.key_assigned_at ?? preview.key_assigned_at,
  };
}

/** Normaliza respuestas de wow-core (camelCase o snake_case) al modelo del CMS. */
export function normalizeTransactionFromApi(
  raw: Record<string, unknown>
): Transaction {
  const product = readProductNested(raw);
  const status = String(raw.status ?? "");
  const normalizedStatus = normalizeTransactionStatus(status);
  const productName = resolveProductName(raw, product);

  const logo =
    raw.logo ??
    product?.imageUrl ??
    product?.image_url ??
    DEFAULT_PRODUCT_IMAGE;

  const progress = getTransactionProgress(
    normalizedStatus,
    typeof raw.progress === "number" ? raw.progress : undefined
  );

  return {
    id: Number(raw.id),
    price: Number(raw.price),
    currency: String(raw.currency ?? ""),
    status: String(normalizedStatus),
    progress,
    date: String(raw.date ?? raw.creationDate ?? raw.creation_date ?? ""),
    reference_number: String(
      raw.reference_number ?? raw.referenceNumber ?? ""
    ),
    product_name: String(productName),
    logo: String(logo),
    user_id: (raw.user_id ?? raw.userId) as number | undefined,
    account_id: (raw.account_id ?? raw.accountId) as number | undefined,
    realm_id: (raw.realm_id ?? raw.realmId) as number | undefined,
    payment_method: (raw.payment_method ?? raw.paymentMethod) as
      | string
      | undefined,
    credit_points: (raw.credit_points ?? raw.creditPoints) as
      | boolean
      | undefined,
    send: raw.send as boolean | undefined,
    reference_payment: (raw.reference_payment ?? raw.referencePayment) as
      | string
      | null
      | undefined,
    subscription: (raw.subscription ?? raw.isSubscription) as
      | boolean
      | undefined,
    redeem_key: (raw.redeem_key ?? raw.redeemKey) as string | null | undefined,
    key_assigned_at: (raw.key_assigned_at ?? raw.keyAssignedAt) as
      | string
      | null
      | undefined,
    product_id: product
      ? {
          id: Number(product.id),
          name: String(product.name ?? productName),
          product_category_id: normalizeProductCategory(product),
          disclaimer: product.disclaimer as string | undefined,
          description: product.description as string | undefined,
          image_url: (product.imageUrl ?? product.image_url) as
            | string
            | undefined,
          realm_name: (product.realmName ?? product.realm_name) as
            | string
            | undefined,
          reference_number: (product.referenceNumber ??
            product.reference_number) as string | undefined,
          delivery_type: (product.deliveryType ?? product.delivery_type) as
            | string
            | undefined,
          redeem_instructions: (product.redeemInstructions ??
            product.redeem_instructions) as string | undefined,
        }
      : undefined,
  };
}

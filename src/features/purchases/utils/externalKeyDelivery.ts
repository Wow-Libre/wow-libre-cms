import { Transaction } from "@/model/model";

export function isExternalKeyPurchase(transaction: Transaction): boolean {
  const deliveryType = transaction.product_id?.delivery_type?.toUpperCase();
  return deliveryType === "EXTERNAL_KEY";
}

export function maskRedeemKey(key: string): string {
  if (key.length <= 8) return "••••••••";
  return `${key.slice(0, 4)}••••••••${key.slice(-4)}`;
}

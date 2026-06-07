type StoreProductStockFields = {
  delivery_type?: string | null;
  deliveryType?: string | null;
  available_redeem_keys?: number | null;
  availableRedeemKeys?: number | null;
};

export function isExternalKeyStoreProduct(product: StoreProductStockFields): boolean {
  const deliveryType = (product.delivery_type ?? product.deliveryType ?? "").toUpperCase();
  return deliveryType === "EXTERNAL_KEY";
}

export function getExternalKeyStock(product: StoreProductStockFields): number | null {
  if (!isExternalKeyStoreProduct(product)) return null;
  const stock = product.available_redeem_keys ?? product.availableRedeemKeys;
  return stock ?? 0;
}

export function isExternalKeyOutOfStock(product: StoreProductStockFields): boolean {
  const stock = getExternalKeyStock(product);
  return stock !== null && stock <= 0;
}

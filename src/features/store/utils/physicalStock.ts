type PhysicalProductFields = {
  delivery_type?: string | null;
  deliveryType?: string | null;
  physical_stock?: number | null;
  physicalStock?: number | null;
  size_options?: string | null;
  sizeOptions?: string | null;
};

export function isPhysicalStoreProduct(product: PhysicalProductFields): boolean {
  const deliveryType = (product.delivery_type ?? product.deliveryType ?? "").toUpperCase();
  return deliveryType === "PHYSICAL";
}

export function getPhysicalStock(product: PhysicalProductFields): number | null {
  if (!isPhysicalStoreProduct(product)) return null;
  return product.physical_stock ?? product.physicalStock ?? 0;
}

export function isPhysicalOutOfStock(product: PhysicalProductFields): boolean {
  const stock = getPhysicalStock(product);
  return stock !== null && stock <= 0;
}

export function parseSizeOptions(raw?: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((size) => size.trim())
    .filter(Boolean);
}

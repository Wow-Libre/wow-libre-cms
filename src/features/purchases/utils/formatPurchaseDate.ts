export function formatPurchaseDate(dateInput: string): string {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    return dateInput;
  }
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatPurchasePrice(price: number, currency: string): string {
  const value = Number.isInteger(price) ? price : price.toFixed(2);
  return `${value} ${currency}`;
}

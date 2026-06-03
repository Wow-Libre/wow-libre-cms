import { socialLinks } from "@/constants/socialLinks";
import { getTransactionStatusLabel } from "@/lib/transaction/transactionStatus";

/** Grupo / enlace oficial de WhatsApp de Wow Libre (footer y redes). */
export const WHATSAPP_PAGE_LINK =
  socialLinks.find((link) => link.name === "WhatsApp")?.href ??
  "https://chat.whatsapp.com/KpvQJSOAujI4DlYjweWDxW";

export function buildPurchaseSupportMessage(transaction?: {
  reference_number: string;
  product_name: string;
  status: string;
} | null): string {
  if (!transaction) {
    return "Hola, necesito ayuda con una compra en Wow Libre.";
  }

  const statusLabel = getTransactionStatusLabel(transaction.status);
  return [
    "Hola, necesito ayuda con mi compra en Wow Libre.",
    "",
    `Referencia: ${transaction.reference_number}`,
    `Producto: ${transaction.product_name}`,
    `Estado: ${statusLabel}`,
  ].join("\n");
}

/** Abre el WhatsApp oficial de la página (mismo enlace que el footer). */
export function getWhatsAppSupportHref(): string {
  return WHATSAPP_PAGE_LINK;
}

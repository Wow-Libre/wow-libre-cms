import { BASE_URL_CORE } from "@/configs/configs";

/**
 * Base URL para llamadas a Wow Core desde el navegador: proxy mismo-origen (`/api/wow-core`)
 * evita CORS. En servidor (SSR poco frecuente aquí) se usa `BASE_URL_CORE` directo.
 */
export function getWowCoreFetchBase(): string {
  if (typeof window === "undefined") {
    return BASE_URL_CORE.replace(/\/$/, "");
  }
  return "/api/wow-core";
}

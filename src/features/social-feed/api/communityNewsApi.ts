import { GenericResponseDto, InternalServerError } from "@/dto/generic";
import type { NewsModel } from "@/model/News";
import { v4 as uuidv4 } from "uuid";
import { getWowCoreFetchBase } from "./wowCoreClientBase";

/**
 * Lista de noticias para la comunidad. En el navegador usa `/api/wow-core` (mismo origen)
 * para evitar CORS; en servidor usa `BASE_URL_CORE` directo.
 */
export async function fetchCommunityNewsList(
  size: number,
  page: number
): Promise<NewsModel[]> {
  const transactionId = uuidv4();
  const base = getWowCoreFetchBase();
  const url = `${base}/api/news?size=${size}&page=${page}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        transaction_id: transactionId,
      },
    });

    if (response.ok && response.status === 200) {
      const responseData = (await response.json()) as GenericResponseDto<NewsModel[]>;
      const data = responseData.data;
      return Array.isArray(data) ? data : [];
    }

    const genericResponse = (await response.json().catch(() => null)) as
      | GenericResponseDto<void>
      | null;
    throw new InternalServerError(
      genericResponse?.message ?? response.statusText,
      response.status,
      transactionId
    );
  } catch (error: unknown) {
    if (error instanceof InternalServerError) throw error;
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Please try again later, services are not available.");
    }
    if (error instanceof Error) throw error;
    throw new Error(`Unknown error - TransactionId: ${transactionId}`);
  }
}

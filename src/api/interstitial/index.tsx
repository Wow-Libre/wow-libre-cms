import { BASE_URL_CORE } from "@/configs/configs";
import { GenericResponseDto, InternalServerError } from "@/dto/generic";
import { v4 as uuidv4 } from "uuid";

export interface InterstitialItem {
  id: number;
  urlImg: string;
  redirectUrl: string;
  active: boolean;
}

export const getInterstitialList = async (
  token: string
): Promise<InterstitialItem[]> => {
  const transactionId = uuidv4();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    transaction_id: transactionId,
    Authorization: `Bearer ${token}`,
  };

  try {
    const response = await fetch(`${BASE_URL_CORE}/api/interstitial/list`, {
      method: "GET",
      headers,
    });

    if (response.ok && response.status === 200) {
      const data: GenericResponseDto<InterstitialItem[]> = await response.json();
      return data.data ?? [];
    }
    const genericResponse: GenericResponseDto<void> = await response.json().catch(() => ({}));
    throw new InternalServerError(
      genericResponse.message ?? "Error al obtener la lista de interstitials",
      response.status,
      transactionId
    );
  } catch (error: unknown) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Servicios no disponibles. Intenta más tarde.");
    }
    if (error instanceof InternalServerError) throw error;
    if (error instanceof Error) throw error;
    throw new Error(`Error inesperado - TransactionId: ${transactionId}`);
  }
};

export const createInterstitial = async (
  token: string,
  urlImg: string,
  redirectUrl: string
): Promise<void> => {
  const transactionId = uuidv4();
  try {
    const response = await fetch(`${BASE_URL_CORE}/api/interstitial`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        transaction_id: transactionId,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ urlImg, redirectUrl }),
    });

    if (response.ok && (response.status === 200 || response.status === 201)) return;
    const genericResponse: GenericResponseDto<void> = await response.json().catch(() => ({}));
    throw new InternalServerError(
      genericResponse.message ?? "Error al crear el interstitial",
      response.status,
      transactionId
    );
  } catch (error: unknown) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Servicios no disponibles. Intenta más tarde.");
    }
    if (error instanceof InternalServerError) throw error;
    if (error instanceof Error) throw error;
    throw new Error(`Error inesperado - TransactionId: ${transactionId}`);
  }
};

export const updateInterstitial = async (
  token: string,
  id: number,
  urlImg: string,
  redirectUrl: string
): Promise<void> => {
  const transactionId = uuidv4();
  try {
    const response = await fetch(`${BASE_URL_CORE}/api/interstitial`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        transaction_id: transactionId,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id, urlImg, redirectUrl }),
    });

    if (response.ok && response.status === 200) return;
    const genericResponse: GenericResponseDto<void> = await response.json().catch(() => ({}));
    throw new InternalServerError(
      genericResponse.message ?? "Error al actualizar el interstitial",
      response.status,
      transactionId
    );
  } catch (error: unknown) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Servicios no disponibles. Intenta más tarde.");
    }
    if (error instanceof InternalServerError) throw error;
    if (error instanceof Error) throw error;
    throw new Error(`Error inesperado - TransactionId: ${transactionId}`);
  }
};

export const deleteInterstitial = async (
  token: string,
  id: number
): Promise<void> => {
  const transactionId = uuidv4();
  try {
    const response = await fetch(`${BASE_URL_CORE}/api/interstitial/delete/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        transaction_id: transactionId,
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok && response.status === 200) return;
    const genericResponse: GenericResponseDto<void> = await response.json().catch(() => ({}));
    throw new InternalServerError(
      genericResponse.message ?? "Error al desactivar el interstitial",
      response.status,
      transactionId
    );
  } catch (error: unknown) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Servicios no disponibles. Intenta más tarde.");
    }
    if (error instanceof InternalServerError) throw error;
    if (error instanceof Error) throw error;
    throw new Error(`Error inesperado - TransactionId: ${transactionId}`);
  }
};

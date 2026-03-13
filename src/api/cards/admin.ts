import { BASE_URL_CORE } from "@/configs/configs";
import { GenericResponseDto, InternalServerError } from "@/dto/generic";
import { v4 as uuidv4 } from "uuid";

export interface CardCatalogAdminItem {
  code: string;
  image_url: string;
  display_name: string;
  probability: number;
  active: boolean;
}

export interface CardCatalogAdminRequestDto {
  code: string;
  image_url: string;
  display_name?: string;
  probability?: number;
  active?: boolean;
}

function adminHeaders(token: string, transactionId: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    transaction_id: transactionId,
    Authorization: `Bearer ${token}`,
  };
}

export const getCardCatalogAdminList = async (
  token: string
): Promise<CardCatalogAdminItem[]> => {
  const transactionId = uuidv4();
  try {
    const response = await fetch(`${BASE_URL_CORE}/api/cards/admin/catalog`, {
      method: "GET",
      headers: adminHeaders(token, transactionId),
    });
    if (response.ok && response.status === 200) {
      const data: GenericResponseDto<CardCatalogAdminItem[]> = await response.json();
      return data.data ?? [];
    }
    const genericResponse: GenericResponseDto<void> = await response.json().catch(() => ({}));
    throw new InternalServerError(
      genericResponse.message ?? "Error al obtener el catálogo de cartas",
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

export const createCardCatalogAdmin = async (
  token: string,
  body: CardCatalogAdminRequestDto
): Promise<CardCatalogAdminItem> => {
  const transactionId = uuidv4();
  try {
    const response = await fetch(`${BASE_URL_CORE}/api/cards/admin/catalog`, {
      method: "POST",
      headers: adminHeaders(token, transactionId),
      body: JSON.stringify(body),
    });
    if (response.ok && (response.status === 200 || response.status === 201)) {
      const data: GenericResponseDto<CardCatalogAdminItem> = await response.json();
      if (!data.data) throw new InternalServerError("Sin datos en respuesta", response.status, transactionId);
      return data.data;
    }
    const genericResponse: GenericResponseDto<void> = await response.json().catch(() => ({}));
    throw new InternalServerError(
      genericResponse.message ?? "Error al crear la carta",
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

export const updateCardCatalogAdmin = async (
  token: string,
  code: string,
  body: CardCatalogAdminRequestDto
): Promise<CardCatalogAdminItem> => {
  const transactionId = uuidv4();
  try {
    const response = await fetch(`${BASE_URL_CORE}/api/cards/admin/catalog/${encodeURIComponent(code)}`, {
      method: "PUT",
      headers: adminHeaders(token, transactionId),
      body: JSON.stringify(body),
    });
    if (response.ok && response.status === 200) {
      const data: GenericResponseDto<CardCatalogAdminItem> = await response.json();
      if (!data.data) throw new InternalServerError("Sin datos en respuesta", response.status, transactionId);
      return data.data;
    }
    const genericResponse: GenericResponseDto<void> = await response.json().catch(() => ({}));
    throw new InternalServerError(
      genericResponse.message ?? "Error al actualizar la carta",
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

export const deleteCardCatalogAdmin = async (
  token: string,
  code: string
): Promise<void> => {
  const transactionId = uuidv4();
  try {
    const response = await fetch(
      `${BASE_URL_CORE}/api/cards/admin/catalog/${encodeURIComponent(code)}`,
      {
        method: "DELETE",
        headers: adminHeaders(token, transactionId),
      }
    );
    if (response.ok && response.status === 200) return;
    const genericResponse: GenericResponseDto<void> = await response.json().catch(() => ({}));
    throw new InternalServerError(
      genericResponse.message ?? "Error al eliminar la carta",
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

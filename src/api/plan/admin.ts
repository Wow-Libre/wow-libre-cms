import { BASE_URL_CORE } from "@/configs/configs";
import { GenericResponseDto, InternalServerError } from "@/dto/generic";
import { v4 as uuidv4 } from "uuid";

export interface PlanAdminItem {
  id: number;
  name: string;
  price: number;
  currency: string | null;
  discount: number | null;
  discounted_price: number | null;
  status: boolean;
  frequency_type: string | null;
  frequency_value: number | null;
}

export interface PlanAdminCreateDto {
  name: string;
  price: number;
  currency?: string;
  discount?: number;
  status?: boolean;
  frequency_type?: string;
  frequency_value?: number;
}

export interface PlanAdminUpdateDto extends PlanAdminCreateDto {
  id: number;
}

function adminHeaders(token: string, transactionId: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    transaction_id: transactionId,
    Authorization: `Bearer ${token}`,
  };
}

export const getPlanAdminList = async (
  token: string
): Promise<PlanAdminItem[]> => {
  const transactionId = uuidv4();
  try {
    const response = await fetch(
      `${BASE_URL_CORE}/api/plan/admin/list`,
      {
        method: "GET",
        headers: adminHeaders(token, transactionId),
      }
    );

    if (response.ok && response.status === 200) {
      const data: GenericResponseDto<PlanAdminItem[]> = await response.json();
      return data.data ?? [];
    }
    const genericResponse: GenericResponseDto<void> = await response
      .json()
      .catch(() => ({}));
    throw new InternalServerError(
      genericResponse.message ?? "Error al obtener la lista de planes",
      response.status,
      transactionId
    );
  } catch (error: unknown) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Servicios no disponibles. Intenta más tarde.");
    }
    if (error instanceof InternalServerError) throw error;
    if (error instanceof Error) throw error;
    throw new Error(
      `Error inesperado - TransactionId: ${transactionId}`
    );
  }
};

export const createPlanAdmin = async (
  token: string,
  body: PlanAdminCreateDto
): Promise<PlanAdminItem> => {
  const transactionId = uuidv4();
  try {
    const response = await fetch(`${BASE_URL_CORE}/api/plan/admin`, {
      method: "POST",
      headers: adminHeaders(token, transactionId),
      body: JSON.stringify(body),
    });

    if (response.ok && (response.status === 200 || response.status === 201)) {
      const data: GenericResponseDto<PlanAdminItem> = await response.json();
      return data.data;
    }
    const genericResponse: GenericResponseDto<void> = await response
      .json()
      .catch(() => ({}));
    throw new InternalServerError(
      genericResponse.message ?? "Error al crear el plan",
      response.status,
      transactionId
    );
  } catch (error: unknown) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Servicios no disponibles. Intenta más tarde.");
    }
    if (error instanceof InternalServerError) throw error;
    if (error instanceof Error) throw error;
    throw new Error(
      `Error inesperado - TransactionId: ${transactionId}`
    );
  }
};

export const updatePlanAdmin = async (
  token: string,
  body: PlanAdminUpdateDto
): Promise<PlanAdminItem> => {
  const transactionId = uuidv4();
  try {
    const response = await fetch(`${BASE_URL_CORE}/api/plan/admin`, {
      method: "PUT",
      headers: adminHeaders(token, transactionId),
      body: JSON.stringify(body),
    });

    if (response.ok && response.status === 200) {
      const data: GenericResponseDto<PlanAdminItem> = await response.json();
      return data.data;
    }
    const genericResponse: GenericResponseDto<void> = await response
      .json()
      .catch(() => ({}));
    throw new InternalServerError(
      genericResponse.message ?? "Error al actualizar el plan",
      response.status,
      transactionId
    );
  } catch (error: unknown) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Servicios no disponibles. Intenta más tarde.");
    }
    if (error instanceof InternalServerError) throw error;
    if (error instanceof Error) throw error;
    throw new Error(
      `Error inesperado - TransactionId: ${transactionId}`
    );
  }
};

export const deletePlanAdmin = async (
  token: string,
  id: number
): Promise<void> => {
  const transactionId = uuidv4();
  try {
    const response = await fetch(
      `${BASE_URL_CORE}/api/plan/admin/${id}`,
      {
        method: "DELETE",
        headers: adminHeaders(token, transactionId),
      }
    );

    if (response.ok && response.status === 200) return;
    const genericResponse: GenericResponseDto<void> = await response
      .json()
      .catch(() => ({}));
    throw new InternalServerError(
      genericResponse.message ?? "Error al eliminar el plan",
      response.status,
      transactionId
    );
  } catch (error: unknown) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Servicios no disponibles. Intenta más tarde.");
    }
    if (error instanceof InternalServerError) throw error;
    if (error instanceof Error) throw error;
    throw new Error(
      `Error inesperado - TransactionId: ${transactionId}`
    );
  }
};

import { BASE_URL_CORE } from "@/configs/configs";
import { GenericResponseDto, InternalServerError } from "@/dto/generic";
import { SubscriptionBenefits } from "@/model/model";
import { v4 as uuidv4 } from "uuid";

export const getBenefitsPremium = async (
  language: string,
  token: string,
  serverId: number
): Promise<SubscriptionBenefits> => {
  try {
    const transactionId = uuidv4();

    const response = await fetch(
      `${BASE_URL_CORE}/api/subscription/benefits?server_id=${serverId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          transaction_id: transactionId,
          "Accept-Language": language,
          Authorization: "Bearer " + token,
        },
      }
    );

    if (response.ok && response.status === 200) {
      const responseData: GenericResponseDto<SubscriptionBenefits> =
        await response.json();

      return responseData.data;
    } else {
      const errorGeneric: GenericResponseDto<void> = await response.json();

      throw new Error(
        `${errorGeneric.message} - Transaction Id: ${transactionId}`
      );
    }
  } catch (error: any) {
    throw new Error(`An unexpected error has occurred: ${error.message}`);
  }
};

export const claimBenefitsPremium = async (
  serverId: number,
  accountId: number,
  characterId: number,
  benefitId: number,
  language: string,
  token: string
): Promise<GenericResponseDto<void>> => {
  const transactionId = uuidv4();

  try {
    const response = await fetch(
      `${BASE_URL_CORE}/api/subscription/claim-benefits`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          transaction_id: transactionId,
          "Accept-Language": language,
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          character_id: characterId,
          benefit_id: benefitId,
          account_id: accountId,
          server_id: serverId,
        }),
      }
    );

    if (response.ok && response.status === 200) {
      const responseData: GenericResponseDto<void> = await response.json();
      return responseData;
    } else {
      const genericResponse: GenericResponseDto<void> = await response.json();
      throw new InternalServerError(
        `${genericResponse.message}`,
        response.status,
        transactionId
      );
    }
  } catch (error: any) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(`Please try again later, services are not available.`);
    } else if (error instanceof InternalServerError) {
      throw error;
    } else if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(
        `Unknown error occurred - TransactionId: ${transactionId}`
      );
    }
  }
};

export interface CurrentSubscriptionDetail {
  id: number;
  reference_number: string;
  status: string;
  plan_name: string | null;
  plan_price: number | null;
  currency: string | null;
  frequency_type: string | null;
  frequency_value: number | null;
  activated_at: string | null;
  renews_or_expires_at: string | null;
}

export interface CurrentSubscriptionResponse {
  active: boolean;
  subscription: CurrentSubscriptionDetail | null;
}

/**
 * Detalle de la suscripción activa del usuario (plan, fechas, referencia).
 */
export const getCurrentSubscription = async (
  token: string,
): Promise<CurrentSubscriptionResponse> => {
  const transactionId = uuidv4();
  const response = await fetch(`${BASE_URL_CORE}/api/subscription/current`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      transaction_id: transactionId,
      Authorization: "Bearer " + token,
    },
  });

  if (response.ok && response.status === 200) {
    const data: GenericResponseDto<CurrentSubscriptionResponse> =
      await response.json();
    return data.data ?? { active: false, subscription: null };
  }
  if (response.status === 401) {
    throw new InternalServerError(
      "Token expiration",
      response.status,
      transactionId,
    );
  }
  const genericResponse: GenericResponseDto<void> = await response
    .json()
    .catch(() => ({}));
  throw new InternalServerError(
    genericResponse.message ?? "Error al obtener la suscripción",
    genericResponse.code ?? response.status,
    transactionId,
  );
};

export const getSubscriptionActive = async (
  token: string
): Promise<boolean> => {
  const transactionId = uuidv4();

  try {
    const response = await fetch(`${BASE_URL_CORE}/api/subscription`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        transaction_id: transactionId,
        Authorization: "Bearer " + token,
      },
    });

    if (response.ok && response.status === 200) {
      const responseData: GenericResponseDto<boolean> = await response.json();
      return responseData.data;
    } else {
      const genericResponse: GenericResponseDto<void> = await response.json();
      throw new InternalServerError(
        `${genericResponse.message}`,
        response.status,
        transactionId
      );
    }
  } catch (error: any) {
    return false;
  }
};

export interface SubscriptionAdminItem {
  id: number;
  user_id: number;
  reference_number: string;
  status: string;
  plan_name: string | null;
  plan_price: number | null;
  currency: string | null;
  frequency_type: string | null;
  frequency_value: number | null;
  activated_at: string;
  expires_at: string;
}

export interface SubscriptionAdminListResponse {
  total_count: number;
  subscriptions: SubscriptionAdminItem[];
}

export const getSubscriptionAdminList = async (
  token: string
): Promise<SubscriptionAdminListResponse> => {
  const transactionId = uuidv4();
  try {
    const response = await fetch(
      `${BASE_URL_CORE}/api/subscription/admin/list`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          transaction_id: transactionId,
          Authorization: "Bearer " + token,
        },
      }
    );

    if (response.ok && response.status === 200) {
      const data: GenericResponseDto<SubscriptionAdminListResponse> =
        await response.json();
      return data.data ?? { total_count: 0, subscriptions: [] };
    }
    const genericResponse: GenericResponseDto<void> = await response
      .json()
      .catch(() => ({}));
    throw new InternalServerError(
      genericResponse.message ?? "Error al obtener suscripciones",
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

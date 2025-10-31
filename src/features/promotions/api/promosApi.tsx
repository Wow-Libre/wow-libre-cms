import { BASE_URL_CORE } from "@/configs/configs";
import { GenericResponseDto, InternalServerError } from "@/dto/generic";
import { v4 as uuidv4 } from "uuid";
import { CreatePromotionDto, PromotionModel } from "../types";

export const getPromotionsAll = async (
  language: string,
  realmId: number,
  token: string
): Promise<PromotionModel[]> => {
  const transactionId = uuidv4();

  try {
    const response = await fetch(
      `${BASE_URL_CORE}/api/promotions?realm_id=${realmId}&language=${language}`,
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
          transaction_id: transactionId,
        },
      }
    );

    if (response.ok && response.status === 200) {
      // La API retorna directamente un array de PromotionModel
      const responseData: GenericResponseDto<PromotionModel[]> =
        await response.json();
      
      // Retornar directamente el array que viene de la API
      return responseData.data || [];
    } else if (response.status === 204) {
      return [];
    } else {
      const errorGeneric: GenericResponseDto<void> = await response.json();
      throw new InternalServerError(
        `${errorGeneric.message}`,
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

export const deletePromotion = async (
  promotionId: number,
  token: string
): Promise<GenericResponseDto<void>> => {
  const transactionId = uuidv4();

  try {
    const response = await fetch(
      `${BASE_URL_CORE}/api/promotions/${promotionId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token,
          transaction_id: transactionId,
        },
      }
    );

    if (response.ok && response.status === 200) {
      const responseData: GenericResponseDto<void> = await response.json();
      return responseData;
    } else {
      const errorGeneric: GenericResponseDto<void> = await response.json();
      throw new InternalServerError(
        `${errorGeneric.message}`,
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

export const createPromotion = async (
  promotion: CreatePromotionDto,
  token: string
): Promise<GenericResponseDto<void>> => {
  const transactionId = uuidv4();

  try {
    const response = await fetch(`${BASE_URL_CORE}/api/promotions/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
        transaction_id: transactionId,
      },
      body: JSON.stringify(promotion),
    });

    if (response.ok && response.status === 201) {
      const responseData: GenericResponseDto<void> = await response.json();
      return responseData;
    } else {
      const errorGeneric: GenericResponseDto<void> = await response.json();
      throw new InternalServerError(
        `${errorGeneric.message}`,
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

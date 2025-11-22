import { BASE_URL_CORE, BASE_URL_TRANSACTION } from "@/configs/configs";
import { GenericResponseDto, InternalServerError } from "@/dto/generic";
import { v4 as uuidv4 } from "uuid";
import { CreateBenefitPremiumDto, UpdateBenefitPremiumDto, BenefitsPremiumDto } from "../types";

export const getBenefitsPremiumAll = async (
  language: string,
  realmId: number,
  token: string
): Promise<BenefitsPremiumDto[]> => {
  const transactionId = uuidv4();

  try {
    const response = await fetch(
      `${BASE_URL_TRANSACTION}/api/benefit-premium?realmId=${realmId}`,
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
          "Accept-Language": language,
          transaction_id: transactionId,
        },
      }
    );

    if (response.ok && response.status === 200) {
      const responseData: GenericResponseDto<BenefitsPremiumDto[]> =
        await response.json();
      
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

export const deleteBenefitPremium = async (
  benefitPremiumId: number,
  token: string
): Promise<GenericResponseDto<void>> => {
  const transactionId = uuidv4();

  try {
    const response = await fetch(
      `${BASE_URL_TRANSACTION}/api/benefit-premium?id=${benefitPremiumId}`,
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

export const createBenefitPremium = async (
  benefitPremium: CreateBenefitPremiumDto,
  token: string
): Promise<GenericResponseDto<void>> => {
  const transactionId = uuidv4();

  try {
    const response = await fetch(`${BASE_URL_TRANSACTION}/api/benefit-premium`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
        transaction_id: transactionId,
      },
      body: JSON.stringify(benefitPremium),
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

export const updateBenefitPremium = async (
  benefitPremium: UpdateBenefitPremiumDto,
  token: string
): Promise<GenericResponseDto<void>> => {
  const transactionId = uuidv4();

  try {
    const response = await fetch(`${BASE_URL_TRANSACTION}/api/benefit-premium`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
        transaction_id: transactionId,
      },
      body: JSON.stringify(benefitPremium),
    });

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


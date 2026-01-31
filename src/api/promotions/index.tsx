import { BASE_URL_CORE } from "@/configs/configs";
import { GenericResponseDto, InternalServerError } from "@/dto/generic";
import { PromotionsDto } from "@/model/model";
import { v4 as uuidv4 } from "uuid";

export const getPromotions = async (
  language: string,
  token: string,
  serverId: number,
  accountId: number,
  characterId: number,
  classId: number
): Promise<PromotionsDto> => {
  try {
    const transactionId = uuidv4();

    const response = await fetch(
      `${BASE_URL_CORE}/api/promotions/all?server_id=${serverId}&character_id=${characterId}&account_id=${accountId}&class_id=${classId}`,
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
      const responseData: GenericResponseDto<PromotionsDto> =
        await response.json();

      return responseData.data;
    } else {
      const errorGeneric: GenericResponseDto<void> = await response.json();

      throw new Error(
        `${errorGeneric.message} - Transaction Id: ${transactionId}`
      );
    }
  } catch (error: any) {
    throw new Error(
      `It was not possible to obtain the professions: ${error.message}`
    );
  }
};

export const claimPromotion = async (
  serverId: number,
  accountId: number,
  characterId: number,
  promotionId: number,
  language: string,
  token: string
): Promise<GenericResponseDto<void>> => {
  const transactionId = uuidv4();

  try {
    const response = await fetch(
      `${BASE_URL_CORE}/api/promotions/claim-promotions`,
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
          promotion_id: promotionId,
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

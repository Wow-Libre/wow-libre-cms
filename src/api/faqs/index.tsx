import { BASE_URL_CORE } from "@/configs/configs";
import { GenericResponseDto, InternalServerError } from "@/dto/generic";
import { FaqType } from "@/enums/FaqType";
import { FaqsModel } from "@/model/model";
import { v4 as uuidv4 } from "uuid";

export const getFaqs = async (
  type: FaqType,
  language: string
): Promise<FaqsModel[]> => {
  const transactionId = uuidv4();

  try {
    const response = await fetch(
      `${BASE_URL_CORE}/api/resources/faqs?type=${type}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": language,
          transaction_id: transactionId,
        },
      }
    );

    if (response.ok && response.status === 200) {
      const responseData: GenericResponseDto<FaqsModel[]> =
        await response.json();
      return responseData.data;
    }

    const genericResponse: GenericResponseDto<void> = await response.json();
    throw new InternalServerError(
      `${genericResponse.message}`,
      response.status,
      transactionId
    );
  } catch (error: unknown) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      console.error(
        `FAQs service unavailable - TransactionId: ${transactionId}`
      );
      return [];
    }

    if (error instanceof InternalServerError || error instanceof Error) {
      throw error;
    }

    throw new Error(
      `Unknown error occurred - TransactionId: ${transactionId}`
    );
  }
};

export const createFaq = async (
  question: string,
  answer: string,
  type: FaqType,
  language: string,
  jwt: string
): Promise<void> => {
  const transactionId = uuidv4();

  try {
    const response = await fetch(`${BASE_URL_CORE}/api/resources/create/faq`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        transaction_id: transactionId,
        Authorization: "Bearer " + jwt,
      },
      body: JSON.stringify({
        language,
        question,
        type,
        answer,
      }),
    });

    if (response.ok && response.status === 200) {
      const responseData: GenericResponseDto<void> = await response.json();
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

export const deleteFaq = async (faqId: number, jwt: string): Promise<void> => {
  const transactionId = uuidv4();

  try {
    const response = await fetch(
      `${BASE_URL_CORE}/api/resources/delete/faq?id=${faqId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          transaction_id: transactionId,
          Authorization: "Bearer " + jwt,
        },
      }
    );

    if (response.ok && response.status === 200) {
      const responseData: GenericResponseDto<void> = await response.json();
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

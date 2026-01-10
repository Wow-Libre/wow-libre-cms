import { BASE_URL_TRANSACTION } from "@/configs/configs";
import { GenericResponseDto, InternalServerError } from "@/dto/generic";
import {
  BuyRedirectDto,
  CategoryDetail,
  Product,
  ProductDetail,
} from "@/model/model";
import { v4 as uuidv4 } from "uuid";

export const getProductOffert = async (language: string): Promise<Product> => {
  try {
    const transactionId = uuidv4();

    const response = await fetch(`${BASE_URL_TRANSACTION}/api/products/offer`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        transaction_id: transactionId,
        "Accept-Language": language,
      },
    });

    if (response.ok && response.status === 200) {
      const responseData: GenericResponseDto<Product> = await response.json();
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

export const getProductsDiscount = async (
  language: string
): Promise<Product[]> => {
  try {
    const transactionId = uuidv4();

    const response = await fetch(
      `${BASE_URL_TRANSACTION}/api/products/discount`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          transaction_id: transactionId,
          "Accept-Language": language,
        },
      }
    );

    if (response.ok && response.status === 200) {
      const responseData: GenericResponseDto<Product[]> = await response.json();
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

export const getProducts = async (
  language: string
): Promise<Map<String, CategoryDetail[]>> => {
  try {
    const transactionId = uuidv4();

    const response = await fetch(`${BASE_URL_TRANSACTION}/api/products`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        transaction_id: transactionId,
        "Accept-Language": language,
      },
    });

    if (response.ok && response.status === 200) {
      const responseData: GenericResponseDto<Map<String, CategoryDetail[]>> =
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

export const getProduct = async (reference: string): Promise<ProductDetail> => {
  try {
    const transactionId = uuidv4();

    const response = await fetch(
      `${BASE_URL_TRANSACTION}/api/products/${reference}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          transaction_id: transactionId,
        },
      }
    );

    if (response.ok && response.status === 200) {
      const responseData: GenericResponseDto<ProductDetail> =
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

export const buyProduct = async (
  accountId: number | null,
  token: string,
  isSubscription: boolean,
  reference: string | null,
  paymentType: string,
  realmId: number,
  characterId: number | null = null
): Promise<BuyRedirectDto> => {
  const transactionId = uuidv4();

  try {
    const requestBody: {
      is_subscription: boolean;
      account_id: number | null;
      product_reference: string | null;
      payment_type: string;
      realm_id: number;
      character_id: number | null;
    } = {
      is_subscription: isSubscription,
      account_id: accountId,
      product_reference: reference,
      payment_type: paymentType,
      realm_id: realmId,
      character_id: characterId,
    };
    const response = await fetch(`${BASE_URL_TRANSACTION}/api/payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        transaction_id: transactionId,
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok && response.status === 200) {
      const responseData: GenericResponseDto<BuyRedirectDto> =
        await response.json();
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

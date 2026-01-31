import { BASE_URL_CORE } from "@/configs/configs";
import { GenericResponseDto, InternalServerError } from "@/dto/generic";
import { ProductRequestDto } from "@/dto/request/ProductRequestDto";
import { ProductsDetailsDto } from "@/model/ProductsDetails";
import { v4 as uuidv4 } from "uuid";

export const getAllProducts = async (
  token: string
): Promise<ProductsDetailsDto> => {
  const transactionId = uuidv4();

  try {
    const response = await fetch(`${BASE_URL_CORE}/api/products/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        transaction_id: transactionId,
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok && response.status === 200) {
      const responseData: GenericResponseDto<ProductsDetailsDto> =
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

export const createProduct = async (
  token: string,
  request: ProductRequestDto
): Promise<void> => {
  const transactionId = uuidv4();

  try {
    const response = await fetch(`${BASE_URL_CORE}/api/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        transaction_id: transactionId,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(request),
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

export const deleteProduct = async (
  token: string,
  productId: number
): Promise<void> => {
  const transactionId = uuidv4();

  try {
    const response = await fetch(
      `${BASE_URL_CORE}/api/products?productId=${productId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          transaction_id: transactionId,
          Authorization: `Bearer ${token}`,
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

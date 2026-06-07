import { BASE_URL_CORE } from "@/configs/configs";
import { GenericResponseDto, InternalServerError } from "@/dto/generic";
import { ProductRequestDto } from "@/dto/request/ProductRequestDto";
import { Product, ProductsDetailsDto } from "@/model/ProductsDetails";
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
  } catch (error: unknown) {
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

    if (response.ok) {
      return;
    }
    const genericResponse: GenericResponseDto<void> = await response.json();
    throw new InternalServerError(
      genericResponse.message ?? "Error al crear producto",
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

/** Obtiene un producto por referencia. GET /api/products/{reference} */
export const getProductByReference = async (
  token: string,
  referenceNumber: string
): Promise<ProductStoreDto | null> => {
  const transactionId = uuidv4();
  try {
    const response = await fetch(
      `${BASE_URL_CORE}/api/products/${encodeURIComponent(referenceNumber)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          transaction_id: transactionId,
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      if (response.status === 404) return null;
      const genericResponse: GenericResponseDto<void> = await response.json();
      throw new InternalServerError(
        genericResponse.message ?? "Error al obtener producto",
        response.status,
        transactionId
      );
    }
    const responseData: GenericResponseDto<ProductStoreDto> = await response.json();
    return responseData.data ?? null;
  } catch (error: unknown) {
    if (error instanceof InternalServerError) throw error;
    if (error instanceof Error) throw error;
    throw new Error(`Error inesperado - TransactionId: ${transactionId}`);
  }
};

/** @deprecated Usa getProductByReference — el backend identifica productos por reference_number */
export const getProduct = async (
  token: string,
  productId: number
): Promise<Product | null> => {
  void productId;
  void token;
  return null;
};

export type ProductStoreDetail = {
  id?: number;
  product_id?: number;
  title: string;
  description: string;
  img_url: string;
};

export type ProductStoreDto = {
  id: number;
  name: string;
  disclaimer: string;
  description: string;
  img_url?: string;
  imgUrl?: string;
  partner?: string;
  realm_name?: string;
  reference_number?: string;
  referenceNumber?: string;
  details?: ProductStoreDetail[];
  packages?: string[];
};

/** Actualiza un producto. En wow-core: PUT /api/products/{id} con body ProductRequestDto */
export const updateProduct = async (
  token: string,
  productId: number,
  request: ProductRequestDto
): Promise<void> => {
  const transactionId = uuidv4();
  try {
    const response = await fetch(
      `${BASE_URL_CORE}/api/products/${productId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          transaction_id: transactionId,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(request),
      }
    );
    if (response.ok) return;
    const genericResponse: GenericResponseDto<void> = await response.json();
    throw new InternalServerError(
      genericResponse.message ?? "Error al actualizar producto",
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

export const addRedeemKeys = async (
  token: string,
  productId: number,
  keys: string[]
): Promise<void> => {
  const transactionId = uuidv4();
  try {
    const response = await fetch(
      `${BASE_URL_CORE}/api/products/${productId}/redeem-keys`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          transaction_id: transactionId,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ keys }),
      }
    );
    if (response.ok) return;
    const genericResponse: GenericResponseDto<void> = await response.json();
    throw new InternalServerError(
      genericResponse.message ?? "Error al cargar claves",
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

    if (response.ok) return;
    const genericResponse: GenericResponseDto<void> = await response.json();
    throw new InternalServerError(
      genericResponse.message ?? "Error al eliminar producto",
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

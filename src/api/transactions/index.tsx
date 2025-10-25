import { BASE_URL_TRANSACTION } from "@/configs/configs";
import { GenericResponseDto } from "@/dto/generic";
import { Transaction, TransactionDto } from "@/model/model";
import { v4 as uuidv4 } from "uuid";

export const getTransactions = async (
  token: string,
  page: number,
  size: number
): Promise<TransactionDto> => {
  try {
    const transactionId = uuidv4();

    const response = await fetch(
      `${BASE_URL_TRANSACTION}/api/transactions?page=${page}&size=${size}`,
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
      const responseData: GenericResponseDto<TransactionDto> =
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

export const getTransactionReferenceNumber = async (
  token: string,
  referenceNumber: string
): Promise<Transaction> => {
  try {
    const transactionId = uuidv4();

    const response = await fetch(
      `${BASE_URL_TRANSACTION}/api/transactions/${referenceNumber}`,
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
      const responseData: GenericResponseDto<Transaction> =
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

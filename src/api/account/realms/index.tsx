import { BASE_URL_CORE } from "@/configs/configs";
import { GenericResponseDto, InternalServerError } from "@/dto/generic";
import { AssociatedServers, ServerModel } from "@/model/model";
import { v4 as uuidv4 } from "uuid";

export interface RealmPingItem {
  id: number;
  name: string;
}

export const pingRealmlist = async (
  host: string,
  jwt: string | null
): Promise<RealmPingItem[]> => {
  const transactionId = uuidv4();
  const url = `${BASE_URL_CORE}/realmlist/ping?host=${encodeURIComponent(host)}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    transaction_id: transactionId,
  };
  if (jwt) {
    headers.Authorization = "Bearer " + jwt;
  }
  try {
    const response = await fetch(url, {
      method: "GET",
      headers,
    });
    if (response.ok && response.status === 200) {
      const data = await response.json();
      const list = Array.isArray(data) ? data : data?.data ?? data?.realms ?? [];
      return list.map((item: { id: number; name: string }) => ({
        id: item.id,
        name: item.name,
      }));
    }
    const badRequestError: GenericResponseDto<void> = await response.json().catch(() => ({}));
    throw new InternalServerError(
      badRequestError.message ?? "Error al obtener reinos",
      badRequestError.code,
      badRequestError.transaction_id
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

export const getServers = async (): Promise<ServerModel[]> => {
  const transactionId = uuidv4();

  try {
    const response = await fetch(`${BASE_URL_CORE}/api/realm`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        transaction_id: transactionId,
      },
    });
    if (response.ok && response.status === 200) {
      const responseData = await response.json();
      return responseData.data;
    } else {
      const badRequestError: GenericResponseDto<void> = await response.json();
      throw new InternalServerError(
        `${badRequestError.message}`,
        badRequestError.code,
        badRequestError.transaction_id
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

export const getAssociatedServers = async (
  jwt: string
): Promise<AssociatedServers> => {
  const transactionId = uuidv4();

  try {
    const response = await fetch(`${BASE_URL_CORE}/api/realm/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + jwt,
        transaction_id: transactionId,
      },
    });

    if (response.ok && response.status === 200) {
      const responseData = await response.json();
      return responseData.data;
    } else if (response.status === 401) {
      throw new InternalServerError(
        `Token expiration`,
        response.status,
        transactionId
      );
    } else if (response.status === 403) {
      throw new InternalServerError(
        `Role not authorized`,
        response.status,
        transactionId
      );
    } else {
      const badRequestError: GenericResponseDto<void> = await response.json();
      throw new InternalServerError(
        `${badRequestError.message}`,
        badRequestError.code,
        badRequestError.transaction_id
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

export const createServer = async (
  jwt: string,
  name: string,
  emulator: string,
  webSite: string,
  host: string,
  password: string,
  realmlist: string,
  externalUsername: string,
  externalPassword: string,
  expansion: number,
  typeServer: string
): Promise<void> => {
  const transactionId = uuidv4();

  try {
    const response = await fetch(`${BASE_URL_CORE}/api/realm/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + jwt,
        transaction_id: transactionId,
      },
      body: JSON.stringify({
        name: name,
        emulator: emulator,
        web_site: webSite,
        host: host,
        password: password,
        realmlist: realmlist,
        external_username: externalUsername,
        external_password: externalPassword,
        expansion: expansion,
        type: typeServer,
      }),
    });

    if (response.ok && response.status === 201) {
      const responseData = await response.json();
      return responseData.data;
    } else if (response.status === 401) {
      throw new InternalServerError(
        `Token expiration`,
        response.status,
        transactionId
      );
    } else {
      const badRequestError: GenericResponseDto<void> = await response.json();
      throw new InternalServerError(
        `${badRequestError.message}`,
        badRequestError.code,
        badRequestError.transaction_id
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

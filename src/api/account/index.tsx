import { BASE_URL_CORE } from "@/configs/configs";
import { GenericResponseDto, InternalServerError } from "@/dto/generic";
import {
  AccountDetailDto,
  AccountsDto,
  UserDetailDto,
  AccountGameStatsDto,
  LinkRealmPreviewAccount,
  LinkRealmPreviewResponse,
} from "@/model/model";
import { v4 as uuidv4 } from "uuid";

function toPositiveLong(v: unknown): number {
  if (v == null || v === "") return NaN;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

/**
 * Unifica snake_case / camelCase y números como string (JSON) para que la selección en el modal no falle.
 */
export function normalizeLinkRealmPreviewPayload(raw: unknown): LinkRealmPreviewResponse {
  const d = raw as Record<string, unknown> | null | undefined;
  const listRaw = (d?.linkable_accounts ?? d?.linkableAccounts) as unknown[] | undefined;
  const linkable_accounts: LinkRealmPreviewAccount[] = (listRaw ?? []).map((item) => {
    const a = item as Record<string, unknown>;
    return {
      account_id: toPositiveLong(a.account_id ?? a.accountId),
      source_account_game_id: toPositiveLong(a.source_account_game_id ?? a.sourceAccountGameId),
      username: typeof a.username === "string" ? a.username : String(a.username ?? ""),
      has_characters: Boolean(a.has_characters ?? a.hasCharacters),
      character_count: Math.max(0, Math.floor(toPositiveLong(a.character_count ?? a.characterCount) || 0)),
      already_linked: Boolean(a.already_linked ?? a.alreadyLinked),
      can_link: Boolean(a.can_link ?? a.canLink),
    };
  });
  return {
    realm_id: Math.floor(toPositiveLong(d?.realm_id ?? d?.realmId) || 0),
    realm_name: typeof d?.realm_name === "string" ? d.realm_name : String(d?.realm_name ?? d?.realmName ?? ""),
    linkable_accounts,
  };
}

/**
 * ES: Obtiene todas las cuentas asociadas con el cliente, paginadas y filtradas por servidor y nombre de usuario.
 * @param jwt - El token JWT para autorización.
 * @param page - Página actual para paginación (por defecto 0).
 * @param size - Número de elementos por página (por defecto 10).
 * @param server - Filtro opcional por servidor.
 * @param username - Filtro opcional por nombre de usuario.
 * @returns Promesa que resuelve con los datos de cuentas (`AccountsDto`).
 * @throws Error - Lanza errores específicos según la respuesta del servidor o si ocurre algún problema en la solicitud.
 */
export const getAccounts = async (
  jwt: string,
  page: number = 0,
  size: number = 10,
  realm: string | null,
  username: string | null
): Promise<AccountsDto> => {
  const transactionId = uuidv4();

  try {
    const response = await fetch(
      `${BASE_URL_CORE}/api/account/game/available?size=${size}&page=${page}&username=${username}&realm=${realm}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + jwt,
          transaction_id: transactionId,
        },
      }
    );

    if (response.ok && response.status === 200) {
      const responseData = await response.json();
      return responseData.data;
    } else if (response.status === 401) {
      throw new InternalServerError(
        `Token expiration`,
        response.status,
        transactionId
      );
    } else {
      const genericResponse: GenericResponseDto<void> = await response.json();
      throw new InternalServerError(
        `${genericResponse.message}`,
        genericResponse.code,
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

/**
 * ES: Obtiene las cuentas asociadas a un servidor específico.
 * @param jwt - El token JWT para autorización.
 * @param serverId - Identificador del servidor.
 * @returns Promesa que resuelve con los datos de cuentas (`AccountsDto`).
 * @throws Error - Lanza errores específicos según la respuesta del servidor o si ocurre algún problema en la solicitud.
 */
export const getAccountAndServerId = async (
  jwt: string,
  serverId: number
): Promise<AccountsDto> => {
  const transactionId = uuidv4();

  try {
    const response = await fetch(
      `${BASE_URL_CORE}/api/account/game?server_id=${serverId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + jwt,
          transaction_id: transactionId,
        },
      }
    );

    if (response.ok && response.status === 200) {
      const responseData = await response.json();
      return responseData.data;
    } else if (response.status === 401 || response.status === 403) {
      throw new InternalServerError(
        `Token expiration`,
        response.status,
        transactionId
      );
    } else {
      const genericResponse: GenericResponseDto<void> = await response.json();
      throw new InternalServerError(
        `${genericResponse.message}`,
        genericResponse.code,
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

/**
 * ES: Obtiene los detalles de una cuenta específica utilizando su ID y el ID del servidor.
 * @param jwt - El token JWT para autorización.
 * @param account_id - Identificador de la cuenta.
 * @param server_id - Identificador del servidor.
 * @returns Promesa que resuelve con los detalles de la cuenta (`AccountDetailDto`).
 * @throws Error - Lanza errores específicos según la respuesta del servidor o si ocurre algún problema en la solicitud.
 */
export const getAccount = async (
  jwt: string,
  account_id: number,
  realm_id: number
): Promise<AccountDetailDto> => {
  const response = await fetch(
    `${BASE_URL_CORE}/api/account/game/${account_id}/${realm_id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + jwt,
        transaction_id: uuidv4(),
      },
    }
  );

  const responseData = await response.json();

  if (response.ok && response.status === 200) {
    return responseData.data;
  } else if (response.status == 404 || response.status == 409) {
    const badRequestError: GenericResponseDto<void> = responseData;
    throw new Error(`Error: ${badRequestError.message}`);
  } else {
    const errorMessage = await response.text();
    throw new Error(
      `An error occurred while trying to register data: ${errorMessage}`
    );
  }
};

/**
 * ES: Obtiene los datos del usuario asociado con el JWT.
 * @param jwt - El token JWT para autorización.
 * @returns Promesa que resuelve con el modelo del usuario (`UserModel`).
 * @throws Error - Lanza errores específicos según la respuesta del servidor o si ocurre algún problema en la solicitud.
 */
export const getUser = async (jwt: string): Promise<UserDetailDto> => {
  const response = await fetch(`${BASE_URL_CORE}/api/account`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + jwt,
      transaction_id: uuidv4(),
    },
  });

  const responseData = await response.json();

  if (response.ok && response.status === 200) {
    return responseData.data;
  } else if (response.status == 404 || response.status == 409) {
    const badRequestError: GenericResponseDto<void> = responseData;
    throw new Error(`Error: ${badRequestError.message}`);
  } else {
    const errorMessage = await response.text();
    throw new Error(
      `An error occurred while trying to register data: ${errorMessage}`
    );
  }
};

/**
 * ES: Envía un correo al usuario asociado con el JWT.
 * @param jwt - El token JWT para autorización.
 * @returns Promesa que resuelve con una respuesta genérica (`GenericResponseDto<void>`).
 * @throws Error - Lanza errores específicos según la respuesta del servidor o si ocurre algún problema en la solicitud.
 */
export const sendMail = async (
  jwt: string
): Promise<GenericResponseDto<void>> => {
  const transactionId = uuidv4();

  try {
    const response = await fetch(
      `${BASE_URL_CORE}/api/account/validated-mail/send`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + jwt,
          transaction_id: transactionId,
        },
      }
    );

    if (response.ok && response.status === 200) {
      const responseData = await response.json();
      return responseData.data;
    } else {
      const genericResponse: GenericResponseDto<void> = await response.json();
      throw new InternalServerError(
        `${genericResponse.message}`,
        genericResponse.code,
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

export const accountInactive = async (
  jwt: string,
  ids: number[]
): Promise<GenericResponseDto<void>> => {
  const transactionId = uuidv4();
  try {
    const response = await fetch(`${BASE_URL_CORE}/api/account/game/inactive`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + jwt,
        transaction_id: transactionId,
      },
      body: JSON.stringify(ids),
    });

    if (response.ok && response.status === 200) {
      const responseData = await response.json();
      return responseData.data;
    } else {
      const genericResponse: GenericResponseDto<void> = await response.json();
      throw new InternalServerError(
        `${genericResponse.message}`,
        genericResponse.code,
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

/**
 * ES: Obtiene las estadísticas del usuario (total de cuentas y reinos).
 * @param jwt - El token JWT para autorización.
 * @returns Promesa que resuelve con las estadísticas del usuario (`AccountGameStatsDto`).
 * @throws Error - Lanza errores específicos según la respuesta del servidor o si ocurre algún problema en la solicitud.
 */
export const getStats = async (jwt: string): Promise<AccountGameStatsDto> => {
  const transactionId = uuidv4();

  try {
    const response = await fetch(
      `${BASE_URL_CORE}/api/account/game/stats`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + jwt,
          transaction_id: transactionId,
        },
      }
    );

    if (response.ok && response.status === 200) {
      const responseData = await response.json();
      return responseData.data;
    } else if (response.status === 401) {
      throw new InternalServerError(
        `Token expiration`,
        response.status,
        transactionId
      );
    } else {
      const genericResponse: GenericResponseDto<void> = await response.json();
      throw new InternalServerError(
        `${genericResponse.message}`,
        genericResponse.code,
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

export const linkRealmPreview = async (
  jwt: string,
  realmId: number,
): Promise<LinkRealmPreviewResponse> => {
  const transactionId = uuidv4();
  const params = new URLSearchParams({ realm_id: String(realmId) });
  const response = await fetch(
    `${BASE_URL_CORE}/api/account/game/link/preview?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + jwt,
        transaction_id: transactionId,
      },
    },
  );

  const body = await response.json().catch(() => ({}));

  if (response.ok && response.status === 200) {
    return normalizeLinkRealmPreviewPayload(body.data);
  }
  if (response.status === 401) {
    throw new InternalServerError(
      "Token expiration",
      response.status,
      transactionId,
    );
  }
  const msg =
    (body as GenericResponseDto<void>)?.message ?? "No se pudo obtener la vista previa";
  throw new InternalServerError(
    msg,
    response.status,
    (body as GenericResponseDto<void>)?.transaction_id ?? transactionId,
  );
};

export const linkRealmConfirm = async (
  jwt: string,
  realmId: number,
  sourceAccountGameId?: number | null,
): Promise<void> => {
  const transactionId = uuidv4();
  const payload: Record<string, unknown> = { realm_id: realmId };
  if (sourceAccountGameId != null) {
    payload.source_account_game_id = sourceAccountGameId;
  }
  const response = await fetch(`${BASE_URL_CORE}/api/account/game/link`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + jwt,
      transaction_id: transactionId,
    },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => ({}));

  if (response.ok && response.status === 201) {
    return;
  }
  if (response.status === 401) {
    throw new InternalServerError(
      "Token expiration",
      response.status,
      transactionId,
    );
  }
  const msg =
    (body as GenericResponseDto<void>)?.message ?? "No se pudo vincular el reino";
  throw new InternalServerError(
    msg,
    response.status,
    (body as GenericResponseDto<void>)?.transaction_id ?? transactionId,
  );
};

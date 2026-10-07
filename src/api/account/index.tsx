import { BASE_URL_CORE } from "@/configs/configs";
import { GenericResponseDto, InternalServerError } from "@/dto/generic";
import {
  AccountDetailDto,
  AccountsDto,
  UserDetailDto,
  AccountGameStatsDto,
  LinkRealmPreviewAccount,
  LinkRealmPreviewResponse,
  AccountManageAccess,
  AccountFallbackOption,
} from "@/model/model";
import { v4 as uuidv4 } from "uuid";

function toNullableId(value: unknown): number | null {
  const id = toPositiveLong(value);
  return Number.isFinite(id) && id > 0 ? id : null;
}

function normalizeAccountsPayload(raw: unknown): AccountsDto {
  const data = (raw ?? {}) as Record<string, unknown>;
  const accounts = (data.accounts ?? []) as AccountsDto["accounts"];
  return {
    accounts,
    size: Number(data.size ?? 0),
    vip_active:
      data.vip_active == null && data.vipActive == null
        ? undefined
        : Boolean(data.vip_active ?? data.vipActive),
    selection_required: Boolean(data.selection_required ?? data.selectionRequired),
    fallback_account_game_id: toNullableId(
      data.fallback_account_game_id ?? data.fallbackAccountGameId,
    ),
    active_account_count: Number(
      data.active_account_count ?? data.activeAccountCount ?? 0,
    ),
  };
}

function normalizeManageAccess(raw: unknown): AccountManageAccess {
  const data = (raw ?? {}) as Record<string, unknown>;
  const optionsRaw = (data.options ?? []) as unknown[];
  const options: AccountFallbackOption[] = optionsRaw.map((item) => {
    const option = item as Record<string, unknown>;
    return {
      id: toPositiveLong(option.id),
      username: String(option.username ?? ""),
      realm: String(option.realm ?? ""),
      account_id: toPositiveLong(option.account_id ?? option.accountId),
      server_id: toPositiveLong(option.server_id ?? option.serverId),
    };
  });
  const manageableRaw = data.manageable;
  return {
    vip_active: Boolean(data.vip_active ?? data.vipActive),
    selection_required: Boolean(data.selection_required ?? data.selectionRequired),
    fallback_account_game_id: toNullableId(
      data.fallback_account_game_id ?? data.fallbackAccountGameId,
    ),
    active_account_count: Number(
      data.active_account_count ?? data.activeAccountCount ?? 0,
    ),
    manageable:
      manageableRaw == null ? null : Boolean(manageableRaw),
    options,
  };
}

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
      return normalizeAccountsPayload(responseData.data);
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

export const getManageAccess = async (
  jwt: string,
  accountId?: number,
  serverId?: number,
): Promise<AccountManageAccess> => {
  const transactionId = uuidv4();
  const params = new URLSearchParams();
  if (accountId != null && serverId != null) {
    params.set("account_id", String(accountId));
    params.set("server_id", String(serverId));
  }
  const query = params.toString();
  const response = await fetch(
    `${BASE_URL_CORE}/api/account/game/manage-access${query ? `?${query}` : ""}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + jwt,
        transaction_id: transactionId,
      },
    },
  );
  const responseData = await response.json();
  if (response.ok && response.status === 200) {
    return normalizeManageAccess(responseData.data);
  }
  const genericResponse: GenericResponseDto<void> = responseData;
  throw new InternalServerError(
    genericResponse.message ?? "Error al consultar el acceso",
    response.status,
    transactionId,
  );
};

export const selectFallbackAccount = async (
  jwt: string,
  accountGameId: number,
): Promise<AccountManageAccess> => {
  const transactionId = uuidv4();
  const response = await fetch(
    `${BASE_URL_CORE}/api/account/game/manage-access`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + jwt,
        transaction_id: transactionId,
      },
      body: JSON.stringify({ account_game_id: accountGameId }),
    },
  );
  const responseData = await response.json();
  if (response.ok && response.status === 200) {
    return normalizeManageAccess(responseData.data);
  }
  const genericResponse: GenericResponseDto<void> = responseData;
  throw new InternalServerError(
    genericResponse.message ?? "Error al elegir la cuenta",
    response.status,
    transactionId,
  );
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

export const updateUserAvatar = async (
  jwt: string,
  avatarUrl: string
): Promise<void> => {
  const transactionId = uuidv4();

  const response = await fetch(`${BASE_URL_CORE}/api/account/avatar`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + jwt,
      transaction_id: transactionId,
    },
    body: JSON.stringify({ avatar_url: avatarUrl }),
  });

  if (response.ok && response.status === 200) {
    return;
  }
  if (response.status === 401) {
    throw new InternalServerError(`Token expiration`, response.status, transactionId);
  }
  const genericResponse: GenericResponseDto<void> = await response
    .json()
    .catch(() => ({} as GenericResponseDto<void>));
  throw new InternalServerError(
    genericResponse.message ?? "Could not update avatar",
    genericResponse.code ?? response.status,
    transactionId
  );
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

import { BASE_URL_CORE } from "@/configs/configs";
import { GenericResponseDto, InternalServerError } from "@/dto/generic";
import { v4 as uuidv4 } from "uuid";

export type CharacterMigrationStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export interface CharacterMigrationListItem {
  id: number;
  /** Id del reino en wow-core (alinear con `server_id` de la cuenta en la tabla). */
  realmId?: number | null;
  characterName: string | null;
  characterGuid: string | null;
  status: CharacterMigrationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CharacterMigrationDetail extends CharacterMigrationListItem {
  userId: number | null;
  realmId: number | null;
  validationErrors: string | null;
  rawData: Record<string, unknown>;
}

/** Fila tal como la devuelve wow-core con `spring.jackson.property-naming-strategy: SNAKE_CASE`. */
type CoreMigrationListRow = {
  id?: unknown;
  realm_id?: number | null;
  realmId?: number | null;
  character_name?: string | null;
  characterName?: string | null;
  character_guid?: string | null;
  characterGuid?: string | null;
  status?: CharacterMigrationStatus;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
};

type CoreMigrationDetailRow = CoreMigrationListRow & {
  user_id?: number | null;
  userId?: number | null;
  validation_errors?: string | null;
  validationErrors?: string | null;
  raw_data?: Record<string, unknown>;
  rawData?: Record<string, unknown>;
};

function normalizeCharacterMigrationListItem(
  row: CoreMigrationListRow
): CharacterMigrationListItem {
  return {
    id: Number(row.id),
    realmId: row.realmId ?? row.realm_id ?? null,
    characterName: row.characterName ?? row.character_name ?? null,
    characterGuid: row.characterGuid ?? row.character_guid ?? null,
    status: row.status as CharacterMigrationStatus,
    createdAt: row.createdAt ?? row.created_at ?? "",
    updatedAt: row.updatedAt ?? row.updated_at ?? "",
  };
}

function normalizeCharacterMigrationDetail(row: CoreMigrationDetailRow): CharacterMigrationDetail {
  const base = normalizeCharacterMigrationListItem(row);
  return {
    ...base,
    userId: (row.userId ?? row.user_id ?? null) as number | null,
    realmId: base.realmId ?? null,
    validationErrors: (row.validationErrors ?? row.validation_errors ?? null) as string | null,
    rawData: (row.rawData ?? row.raw_data ?? {}) as Record<string, unknown>,
  };
}

export interface CharacterMigrationAllowedSourceOption {
  id: number;
  realmlistHost: string;
  displayName: string | null;
}

type CoreAllowedSourceRow = {
  id?: unknown;
  realmlist_host?: string;
  realmlistHost?: string;
  display_name?: string | null;
  displayName?: string | null;
};

function normalizeAllowedSourceRow(row: CoreAllowedSourceRow): CharacterMigrationAllowedSourceOption {
  return {
    id: Number(row.id),
    realmlistHost: String(row.realmlistHost ?? row.realmlist_host ?? ""),
    displayName: (row.displayName ?? row.display_name ?? null) as string | null,
  };
}

/**
 * Orígenes de migración activos (realmlist) para el selector en Cuentas.
 */
export const listCharacterMigrationAllowedSourcesMe = async (
  token: string
): Promise<CharacterMigrationAllowedSourceOption[]> => {
  const transactionId = uuidv4();
  try {
    const response = await fetch(
      `${BASE_URL_CORE}/api/character-migration/me/allowed-sources`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          transaction_id: transactionId,
          Authorization: "Bearer " + token,
        },
      }
    );
    if (!response.ok) {
      const err: GenericResponseDto<void> = await response.json();
      throw new InternalServerError(
        err.message,
        response.status,
        transactionId
      );
    }
    const data: GenericResponseDto<CoreAllowedSourceRow[]> = await response.json();
    const list = data.data ?? [];
    return list.map((row) => normalizeAllowedSourceRow(row));
  } catch (error: unknown) {
    if (error instanceof InternalServerError) throw error;
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Please try again later, services are not available.");
    }
    throw error instanceof Error
      ? error
      : new Error(`Unknown error - TransactionId: ${transactionId}`);
  }
};

export type UploadCharacterMigrationMeOptions = {
  /** Obligatorio en backend si hay filas en `character_migration_allowed_source`. */
  allowedSourceId?: number;
};

/**
 * Carga del dump por usuario autenticado (vista Cuentas / migrar personajes).
 * No usa ruta admin; no requiere rol ADMIN.
 */
export const uploadCharacterMigrationMe = async (
  realmId: number,
  file: File,
  token: string,
  options?: UploadCharacterMigrationMeOptions
): Promise<CharacterMigrationDetail> => {
  const transactionId = uuidv4();
  const formData = new FormData();
  formData.append("file", file, file.name);
  const params = new URLSearchParams({ realm_id: String(realmId) });
  if (
    options?.allowedSourceId != null &&
    Number.isFinite(options.allowedSourceId)
  ) {
    params.set("allowed_source_id", String(options.allowedSourceId));
  }
  try {
    const response = await fetch(
      `${BASE_URL_CORE}/api/character-migration/me/upload?${params.toString()}`,
      {
        method: "POST",
        headers: {
          transaction_id: transactionId,
          Authorization: "Bearer " + token,
        },
        body: formData,
      }
    );
    if (!response.ok) {
      const err: GenericResponseDto<void> = await response.json();
      throw new InternalServerError(
        err.message,
        response.status,
        transactionId
      );
    }
    const data: GenericResponseDto<CharacterMigrationDetail> =
      await response.json();
    if (!data.data) {
      throw new Error("Respuesta sin datos");
    }
    return normalizeCharacterMigrationDetail(data.data as CoreMigrationDetailRow);
  } catch (error: unknown) {
    if (error instanceof InternalServerError) throw error;
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Please try again later, services are not available.");
    }
    throw error instanceof Error
      ? error
      : new Error(`Unknown error - TransactionId: ${transactionId}`);
  }
};

/**
 * Listado de migraciones del usuario autenticado (sin rol admin).
 * Sin `realm_id` devuelve todas; con `realm_id` solo ese reino.
 */
export const listCharacterMigrationMe = async (
  token: string,
  realmId?: number | null
): Promise<CharacterMigrationListItem[]> => {
  const transactionId = uuidv4();
  const qs =
    realmId != null && Number.isFinite(realmId) && realmId > 0
      ? `?realm_id=${realmId}`
      : "";
  try {
    const response = await fetch(
      `${BASE_URL_CORE}/api/character-migration/me/list${qs}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          transaction_id: transactionId,
          Authorization: "Bearer " + token,
        },
      }
    );
    if (!response.ok) {
      const err: GenericResponseDto<void> = await response.json();
      throw new InternalServerError(
        err.message,
        response.status,
        transactionId
      );
    }
    const data: GenericResponseDto<CharacterMigrationListItem[]> =
      await response.json();
    const list = data.data ?? [];
    return list.map((row) =>
      normalizeCharacterMigrationListItem(row as CoreMigrationListRow)
    );
  } catch (error: unknown) {
    if (error instanceof InternalServerError) throw error;
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Please try again later, services are not available.");
    }
    throw error instanceof Error
      ? error
      : new Error(`Unknown error - TransactionId: ${transactionId}`);
  }
};

export const updateCharacterMigrationStatus = async (
  realmId: number,
  id: number,
  status: CharacterMigrationStatus,
  token: string
): Promise<CharacterMigrationDetail> => {
  const transactionId = uuidv4();
  try {
    const response = await fetch(
      `${BASE_URL_CORE}/api/character-migration/admin/${id}/status?realm_id=${realmId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          transaction_id: transactionId,
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ status }),
      }
    );
    if (!response.ok) {
      const err: GenericResponseDto<void> = await response.json();
      throw new InternalServerError(
        err.message,
        response.status,
        transactionId
      );
    }
    const data: GenericResponseDto<CharacterMigrationDetail> =
      await response.json();
    if (!data.data) {
      throw new Error("Respuesta sin datos");
    }
    return normalizeCharacterMigrationDetail(data.data as CoreMigrationDetailRow);
  } catch (error: unknown) {
    if (error instanceof InternalServerError) throw error;
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Please try again later, services are not available.");
    }
    throw error instanceof Error
      ? error
      : new Error(`Unknown error - TransactionId: ${transactionId}`);
  }
};

export const listCharacterMigrationStaging = async (
  realmId: number,
  token: string
): Promise<CharacterMigrationListItem[]> => {
  const transactionId = uuidv4();
  try {
    const response = await fetch(
      `${BASE_URL_CORE}/api/character-migration/admin/list?realm_id=${realmId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          transaction_id: transactionId,
          Authorization: "Bearer " + token,
        },
      }
    );
    if (!response.ok) {
      const err: GenericResponseDto<void> = await response.json();
      throw new InternalServerError(
        err.message,
        response.status,
        transactionId
      );
    }
    const data: GenericResponseDto<CharacterMigrationListItem[]> =
      await response.json();
    const list = data.data ?? [];
    return list.map((row) =>
      normalizeCharacterMigrationListItem(row as CoreMigrationListRow)
    );
  } catch (error: unknown) {
    if (error instanceof InternalServerError) throw error;
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Please try again later, services are not available.");
    }
    throw error instanceof Error
      ? error
      : new Error(`Unknown error - TransactionId: ${transactionId}`);
  }
};

export const getCharacterMigrationDetail = async (
  realmId: number,
  id: number,
  token: string
): Promise<CharacterMigrationDetail> => {
  const transactionId = uuidv4();
  try {
    const response = await fetch(
      `${BASE_URL_CORE}/api/character-migration/admin/${id}?realm_id=${realmId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          transaction_id: transactionId,
          Authorization: "Bearer " + token,
        },
      }
    );
    if (!response.ok) {
      const err: GenericResponseDto<void> = await response.json();
      throw new InternalServerError(
        err.message,
        response.status,
        transactionId
      );
    }
    const data: GenericResponseDto<CharacterMigrationDetail> =
      await response.json();
    if (!data.data) {
      throw new Error("Respuesta sin datos");
    }
    return normalizeCharacterMigrationDetail(data.data as CoreMigrationDetailRow);
  } catch (error: unknown) {
    if (error instanceof InternalServerError) throw error;
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Please try again later, services are not available.");
    }
    throw error instanceof Error
      ? error
      : new Error(`Unknown error - TransactionId: ${transactionId}`);
  }
};

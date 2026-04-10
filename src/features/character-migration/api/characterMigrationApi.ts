import { BASE_URL_CORE } from "@/configs/configs";
import { GenericResponseDto, InternalServerError } from "@/dto/generic";
import { v4 as uuidv4 } from "uuid";

export type CharacterMigrationStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

/** Alineado con wow-core `CharacterMigrationTargetAccountMode`. */
export type CharacterMigrationTargetAccountMode = "CREATE_NEW" | "USE_EXISTING";

export interface CharacterMigrationListItem {
  id: number;
  /** Id del reino en wow-core (alinear con `server_id` de la cuenta en la tabla). */
  realmId?: number | null;
  characterName: string | null;
  characterGuid: string | null;
  /** Modo de cuenta destino (nueva vs existente). */
  targetAccountMode: CharacterMigrationTargetAccountMode;
  /** `account_id` del emulador cuando el modo es USE_EXISTING. */
  targetExistingAccountId: number | null;
  /** Usuario de cuenta de juego solicitado en /accounts (contraseña la genera el backend al aprobar). */
  targetGameAccountUsername: string | null;
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
  target_account_mode?: string | null;
  targetAccountMode?: string | null;
  target_existing_account_id?: number | null;
  targetExistingAccountId?: number | null;
  target_game_account_username?: string | null;
  targetGameAccountUsername?: string | null;
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
  raw_data?: Record<string, unknown> | unknown;
  rawData?: Record<string, unknown> | unknown;
};

/** wow-core devuelve enum como string; normalizamos por si viniera en otro casing. */
function coerceMigrationStatus(value: unknown): CharacterMigrationStatus {
  const u = String(value ?? "")
    .trim()
    .toUpperCase();
  if (
    u === "PENDING" ||
    u === "PROCESSING" ||
    u === "COMPLETED" ||
    u === "FAILED"
  ) {
    return u;
  }
  return "PENDING";
}

function coerceTargetAccountMode(
  value: unknown,
): CharacterMigrationTargetAccountMode {
  const u = String(value ?? "")
    .trim()
    .toUpperCase();
  if (u === "USE_EXISTING") return "USE_EXISTING";
  return "CREATE_NEW";
}

function normalizeCharacterMigrationListItem(
  row: CoreMigrationListRow,
): CharacterMigrationListItem {
  const rawExisting =
    row.targetExistingAccountId ?? row.target_existing_account_id ?? null;
  const existingId =
    rawExisting != null && Number.isFinite(Number(rawExisting))
      ? Number(rawExisting)
      : null;
  return {
    id: Number(row.id),
    realmId: row.realmId ?? row.realm_id ?? null,
    characterName: row.characterName ?? row.character_name ?? null,
    characterGuid: row.characterGuid ?? row.character_guid ?? null,
    targetAccountMode: coerceTargetAccountMode(
      row.targetAccountMode ?? row.target_account_mode,
    ),
    targetExistingAccountId: existingId,
    targetGameAccountUsername:
      row.targetGameAccountUsername ?? row.target_game_account_username ?? null,
    status: coerceMigrationStatus(row.status),
    createdAt: row.createdAt ?? row.created_at ?? "",
    updatedAt: row.updatedAt ?? row.updated_at ?? "",
  };
}

function rawDataAsRecord(raw: unknown): Record<string, unknown> {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  return {};
}

function normalizeCharacterMigrationDetail(
  row: CoreMigrationDetailRow,
): CharacterMigrationDetail {
  const base = normalizeCharacterMigrationListItem(row);
  return {
    ...base,
    userId: (row.userId ?? row.user_id ?? null) as number | null,
    realmId: base.realmId ?? null,
    validationErrors: (row.validationErrors ??
      row.validation_errors ??
      null) as string | null,
    rawData: rawDataAsRecord(row.rawData ?? row.raw_data),
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

function normalizeAllowedSourceRow(
  row: CoreAllowedSourceRow,
): CharacterMigrationAllowedSourceOption {
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
  token: string,
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
      },
    );
    if (!response.ok) {
      const err: GenericResponseDto<void> = await response.json();
      throw new InternalServerError(
        err.message,
        response.status,
        transactionId,
      );
    }
    const data: GenericResponseDto<CoreAllowedSourceRow[]> =
      await response.json();
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

/** Mismos límites que `CreateAccountGameDto` en wow-core. */
export const MIGRATION_GAME_ACCOUNT_USERNAME_MIN_LEN = 5;
export const MIGRATION_GAME_ACCOUNT_USERNAME_MAX_LEN = 20;

export type UploadCharacterMigrationMeOptions = {
  /** Obligatorio en backend si hay filas en `character_migration_allowed_source`. */
  allowedSourceId?: number;
  /** Por defecto CREATE_NEW (cuenta nueva con usuario indicado). */
  targetAccountMode?: CharacterMigrationTargetAccountMode;
  /** Requerido si `targetAccountMode` es CREATE_NEW. */
  targetGameAccountUsername?: string;
  /** Requerido si `targetAccountMode` es USE_EXISTING (mismo `account_id` que en Cuentas). */
  targetExistingAccountId?: number;
};

/**
 * Carga del dump por usuario autenticado (vista Cuentas / migrar personajes).
 * No usa ruta admin; no requiere rol ADMIN.
 */
export const uploadCharacterMigrationMe = async (
  realmId: number,
  file: File,
  token: string,
  options: UploadCharacterMigrationMeOptions,
): Promise<CharacterMigrationDetail> => {
  const transactionId = uuidv4();
  const mode = options.targetAccountMode ?? "CREATE_NEW";
  const formData = new FormData();
  formData.append("file", file, file.name);
  formData.append("target_account_mode", mode);
  if (mode === "CREATE_NEW") {
    const u = options.targetGameAccountUsername?.trim() ?? "";
    formData.append("target_game_account_username", u);
  } else {
    if (
      options.targetExistingAccountId == null ||
      !Number.isFinite(options.targetExistingAccountId)
    ) {
      throw new Error("targetExistingAccountId is required when using USE_EXISTING");
    }
    formData.append(
      "target_existing_account_id",
      String(options.targetExistingAccountId),
    );
  }
  const params = new URLSearchParams({ realm_id: String(realmId) });
  if (
    options.allowedSourceId != null &&
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
      },
    );
    if (!response.ok) {
      const err: GenericResponseDto<void> = await response.json();
      throw new InternalServerError(
        err.message,
        response.status,
        transactionId,
      );
    }
    const data: GenericResponseDto<CharacterMigrationDetail> =
      await response.json();
    if (!data.data) {
      throw new Error("Respuesta sin datos");
    }
    return normalizeCharacterMigrationDetail(
      data.data as CoreMigrationDetailRow,
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

/**
 * Listado de migraciones del usuario autenticado (sin rol admin).
 * Sin `realm_id` devuelve todas; con `realm_id` solo ese reino.
 */
export const listCharacterMigrationMe = async (
  token: string,
  realmId?: number | null,
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
      },
    );
    if (!response.ok) {
      const err: GenericResponseDto<void> = await response.json();
      throw new InternalServerError(
        err.message,
        response.status,
        transactionId,
      );
    }
    const data: GenericResponseDto<CharacterMigrationListItem[]> =
      await response.json();
    const list = data.data ?? [];
    return list.map((row) =>
      normalizeCharacterMigrationListItem(row as CoreMigrationListRow),
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
  token: string,
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
      },
    );
    if (!response.ok) {
      let message = `HTTP ${response.status}`;
      try {
        const err: GenericResponseDto<void> = await response.json();
        if (err.message) message = err.message;
      } catch {
        /* cuerpo no JSON */
      }
      throw new InternalServerError(message, response.status, transactionId);
    }
    const data: GenericResponseDto<CharacterMigrationDetail> =
      await response.json();
    if (!data.data) {
      throw new Error("Respuesta sin datos");
    }
    return normalizeCharacterMigrationDetail(
      data.data as CoreMigrationDetailRow,
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

export const listCharacterMigrationStaging = async (
  realmId: number,
  token: string,
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
      },
    );
    if (!response.ok) {
      const err: GenericResponseDto<void> = await response.json();
      throw new InternalServerError(
        err.message,
        response.status,
        transactionId,
      );
    }
    const data: GenericResponseDto<CharacterMigrationListItem[]> =
      await response.json();
    const list = data.data ?? [];
    return list.map((row) =>
      normalizeCharacterMigrationListItem(row as CoreMigrationListRow),
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
  token: string,
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
      },
    );
    if (!response.ok) {
      const err: GenericResponseDto<void> = await response.json();
      throw new InternalServerError(
        err.message,
        response.status,
        transactionId,
      );
    }
    const data: GenericResponseDto<CharacterMigrationDetail> =
      await response.json();
    if (!data.data) {
      throw new Error("Respuesta sin datos");
    }
    return normalizeCharacterMigrationDetail(
      data.data as CoreMigrationDetailRow,
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

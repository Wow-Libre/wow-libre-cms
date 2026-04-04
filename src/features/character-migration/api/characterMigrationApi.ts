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

/**
 * Carga del dump por usuario autenticado (vista Cuentas / migrar personajes).
 * No usa ruta admin; no requiere rol ADMIN.
 */
export const uploadCharacterMigrationMe = async (
  realmId: number,
  file: File,
  token: string
): Promise<CharacterMigrationDetail> => {
  const transactionId = uuidv4();
  const formData = new FormData();
  formData.append("file", file, file.name);
  try {
    const response = await fetch(
      `${BASE_URL_CORE}/api/character-migration/me/upload?realm_id=${realmId}`,
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
    return data.data;
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
    return list.map((row) => ({
      ...row,
      realmId:
        row.realmId ??
        (row as unknown as { realm_id?: number }).realm_id ??
        null,
    }));
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
    return data.data;
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
    return data.data ?? [];
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
    return data.data;
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

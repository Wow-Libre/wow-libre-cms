/**
 * Contrato JSON entre **wow-core** (u otro orquestador) y **wow-realm** cuando una
 * migración de personaje queda **aprobada** (`COMPLETED`).
 *
 * La API HTTP concreta vive en el proceso wow-realm (p. ej. endpoint interno protegido
 * por secreto compartido o red privada). Este archivo define solo la forma del cuerpo.
 *
 * Sugerencia de uso:
 * - `POST https://<realm-host>:<port>/internal/character-migration/apply`
 * - `Content-Type: application/json`
 * - Cabeceras de autenticación: a definir por el equipo realm (p. ej. `X-Migration-Token`).
 */

/** Versión del esquema; incrementar solo si se rompe compatibilidad hacia atrás. */
export const WOW_REALM_MIGRATION_PAYLOAD_SCHEMA_VERSION = 1 as const;

export type WowRealmMigrationPayloadSchemaVersion =
  typeof WOW_REALM_MIGRATION_PAYLOAD_SCHEMA_VERSION;

/**
 * Cuerpo JSON enviado a wow-realm al aprobar una migración.
 * Incluye metadatos de la solicitud + el dump parseado (`rawData`) tal como lo guarda wow-core.
 */
export interface WowRealmCharacterMigrationApprovedDto {
  schemaVersion: WowRealmMigrationPayloadSchemaVersion;
  /** Id de la fila en el staging de wow-core (`character_migration_*`). */
  migrationId: number;
  /** Id del reino destino en el CMS / core. */
  realmId: number;
  /** Cuenta de juego asociada, si existe en el registro de migración. */
  userId: number | null;
  /** Nombre de personaje detectado o informado en el proceso. */
  characterName: string | null;
  /** GUID del personaje en origen (stringificado). */
  characterGuid: string | null;
  /** Estado que debe ser siempre `COMPLETED` en este flujo. */
  status: "COMPLETED";
  /** ISO 8601: momento en que el staff aprobó (o en que core emitió el evento). */
  approvedAt: string;
  /**
   * Dump del addon ya parseado como objeto JSON (mismas claves que en el panel admin:
   * `ginf`, `uinf`, `inventory`, etc.).
   */
  dump: CharacterMigrationDumpSectionsDto;
}

/**
 * Secciones típicas del dump; cada una puede omitirse si el addon no la envió.
 * Claves adicionales no listadas aquí pueden existir: el realm debe tolerar extensiones.
 */
export interface CharacterMigrationDumpSectionsDto {
  ginf?: MigrationDumpGinfDto;
  uinf?: MigrationDumpUinfDto;
  inventory?: unknown;
  bags?: unknown;
  bank?: unknown;
  equipment?: unknown;
  skills?: unknown;
  spells?: unknown;
  talents?: unknown;
  glyphs?: unknown;
  currency?: unknown;
  quests?: unknown;
  achievements?: unknown;
  reputations?: unknown;
  pets?: unknown;
  mounts?: unknown;
  /** Cualquier bloque extra que añada el addon en el futuro. */
  [section: string]: unknown;
}

/**
 * Bloque `ginf` — información de reino / realmlist (forma real depende del addon).
 * Campos opcionales como guía; el realm puede leer otros índices.
 */
export type MigrationDumpGinfDto = {
  realmlist?: string;
  realm?: string;
  realmName?: string;
} & Record<string, unknown>;

/**
 * Bloque `uinf` — datos de cuenta/personaje en origen (forma real depende del addon).
 */
export type MigrationDumpUinfDto = {
  account?: string;
  character?: string;
  name?: string;
} & Record<string, unknown>;

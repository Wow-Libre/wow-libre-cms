/** Versión del esquema; incrementar solo si se rompe compatibilidad hacia atrás. */
export const WOW_LIBRE_CLIENT_MIGRATION_PAYLOAD_SCHEMA_VERSION = 1 as const;

export type WowLibreClientMigrationPayloadSchemaVersion =
  typeof WOW_LIBRE_CLIENT_MIGRATION_PAYLOAD_SCHEMA_VERSION;

/**
 * Cuerpo JSON enviado a wow-libre-client cuando la migración queda aprobada en core.
 * Incluye metadatos + dump parseado (`rawData` almacenado en wow-core).
 */
export interface WowLibreClientCharacterMigrationApprovedDto {
  schemaVersion: WowLibreClientMigrationPayloadSchemaVersion;
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
  /** Debe ser `COMPLETED` en este flujo (ya persistido en la entidad en wow-core). */
  status: "COMPLETED";
  /** ISO 8601: momento de la aprobación / emisión del evento (p. ej. tras guardar en BD). */
  approvedAt: string;
  /**
   * Contenido del dump **tal como está persistido en BD** (p. ej. columna `raw_data`), no reenviado
   * por el admin al aprobar.
   */
  dump: CharacterMigrationDumpSectionsDto;
}

/**
 * Secciones típicas del dump; cada una puede omitirse si el addon no la envió.
 * En wow-libre-client / wow-core el mismo contrato se modela como `CharacterMigrationDumpDto`
 * (`ginf`/`uinf` tipados; el resto como JSON tree hasta definir DTOs finos).
 * Claves extra en el JSON del addon: se ignoran al deserializar en Java (`@JsonIgnoreProperties(ignoreUnknown = true)`).
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

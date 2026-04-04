import type { CharacterMigrationDetail } from "../api/characterMigrationApi";
import {
  WOW_REALM_MIGRATION_PAYLOAD_SCHEMA_VERSION,
  type CharacterMigrationDumpSectionsDto,
  type WowRealmCharacterMigrationApprovedDto,
} from "../types/wowRealmMigrationDto";

/**
 * Construye el cuerpo JSON que wow-realm debe recibir al aprobar una migración.
 * Útil para pruebas, documentación y para alinear la misma forma en wow-core (Java) al hacer POST.
 */
export function buildWowRealmMigrationApprovedPayload(
  detail: CharacterMigrationDetail,
  approvedAt: Date = new Date()
): WowRealmCharacterMigrationApprovedDto {
  const raw = detail.rawData;
  const dump: CharacterMigrationDumpSectionsDto =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as CharacterMigrationDumpSectionsDto)
      : {};

  return {
    schemaVersion: WOW_REALM_MIGRATION_PAYLOAD_SCHEMA_VERSION,
    migrationId: detail.id,
    realmId: detail.realmId ?? 0,
    userId: detail.userId,
    characterName: detail.characterName,
    characterGuid: detail.characterGuid,
    status: "COMPLETED",
    approvedAt: approvedAt.toISOString(),
    dump,
  };
}

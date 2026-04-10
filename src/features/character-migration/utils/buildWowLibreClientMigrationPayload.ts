import type { CharacterMigrationDetail } from "../api/characterMigrationApi";
import {
  WOW_LIBRE_CLIENT_MIGRATION_PAYLOAD_SCHEMA_VERSION,
  type CharacterMigrationDumpSectionsDto,
  type WowLibreClientCharacterMigrationApprovedDto,
} from "../types/wowLibreClientMigrationDto";

/**
 * Simula lo que **wow-core** debe armar tras leer la entidad desde BD (status ya `COMPLETED`):
 * metadatos de la fila + `dump` = `raw_data` guardado. El CMS no usa esto en producción; sirve para
 * tests y para copiar la misma forma en Java al implementar el `POST` desde core al client.
 */
export function buildWowLibreClientMigrationApprovedPayload(
  detail: CharacterMigrationDetail,
  approvedAt: Date = new Date()
): WowLibreClientCharacterMigrationApprovedDto {
  const raw = detail.rawData;
  const dump: CharacterMigrationDumpSectionsDto =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as CharacterMigrationDumpSectionsDto)
      : {};

  return {
    schemaVersion: WOW_LIBRE_CLIENT_MIGRATION_PAYLOAD_SCHEMA_VERSION,
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

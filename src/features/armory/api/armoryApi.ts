import { BASE_URL_CORE } from "@/configs/configs";
import { GenericResponseDto } from "@/dto/generic";
import type {
  ArmoryAutocompleteItem,
  ArmoryCharacterProfile,
  ArmoryLeaderboards,
  ArmoryLeaderboardsFilters,
  ArmorySearchFilters,
  ArmorySearchResponse,
} from "@/features/armory/types/armory.types";
import { v4 as uuidv4 } from "uuid";

function buildRealmQuery(filters: ArmorySearchFilters): string {
  const params = new URLSearchParams();
  if (filters.realm_id != null) {
    params.set("realm_id", String(filters.realm_id));
  } else {
    if (filters.realm) params.set("realm", filters.realm);
    if (filters.expansion_id != null) {
      params.set("expansion_id", String(filters.expansion_id));
    }
  }
  const query = params.toString();
  return query ? `&${query}` : "";
}

export async function getArmoryProfile(
  characterName: string,
  realmId?: number,
  realm?: string,
  expansionId?: number
): Promise<ArmoryCharacterProfile> {
  const transactionId = uuidv4();
  const realmParams = new URLSearchParams();
  if (realmId != null) {
    realmParams.set("realm_id", String(realmId));
  } else {
    if (realm) realmParams.set("realm", realm);
    if (expansionId != null) realmParams.set("expansion_id", String(expansionId));
  }
  const realmQuery = realmParams.toString();
  const url = `${BASE_URL_CORE}/api/armory/profile/${encodeURIComponent(characterName)}${realmQuery ? `?${realmQuery}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      transaction_id: transactionId,
    },
  });

  const body: GenericResponseDto<ArmoryCharacterProfile> = await response.json();
  if (!response.ok) {
    throw new Error(body.message || "Character not found");
  }
  return body.data;
}

export async function searchArmoryCharacters(
  filters: ArmorySearchFilters
): Promise<ArmorySearchResponse> {
  const transactionId = uuidv4();
  const params = new URLSearchParams();
  if (filters.name) params.set("name", filters.name);
  if (filters.class_id != null) params.set("class_id", String(filters.class_id));
  if (filters.race_id != null) params.set("race_id", String(filters.race_id));
  if (filters.faction) params.set("faction", filters.faction);
  if (filters.min_level != null) params.set("min_level", String(filters.min_level));
  if (filters.max_level != null) params.set("max_level", String(filters.max_level));
  if (filters.sort) params.set("sort", filters.sort);
  params.set("page", String(filters.page ?? 0));
  params.set("size", String(filters.size ?? 20));
  if (filters.realm_id != null) {
    params.set("realm_id", String(filters.realm_id));
  } else {
    if (filters.realm) params.set("realm", filters.realm);
    if (filters.expansion_id != null) {
      params.set("expansion_id", String(filters.expansion_id));
    }
  }

  const response = await fetch(
    `${BASE_URL_CORE}/api/armory/search?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        transaction_id: transactionId,
      },
    }
  );

  const body: GenericResponseDto<ArmorySearchResponse> = await response.json();
  if (!response.ok) {
    throw new Error(body.message || "Search failed");
  }
  return body.data;
}

export async function autocompleteArmoryCharacters(
  query: string,
  realmId?: number,
  realm?: string,
  expansionId?: number,
  limit = 10
): Promise<ArmoryAutocompleteItem[]> {
  const transactionId = uuidv4();
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  if (realmId != null) {
    params.set("realm_id", String(realmId));
  } else {
    if (realm) params.set("realm", realm);
    if (expansionId != null) params.set("expansion_id", String(expansionId));
  }

  const response = await fetch(
    `${BASE_URL_CORE}/api/armory/search/chars?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        transaction_id: transactionId,
      },
    }
  );

  const body: GenericResponseDto<ArmoryAutocompleteItem[]> = await response.json();
  if (!response.ok) {
    return [];
  }
  return body.data ?? [];
}

export async function getArmoryLeaderboards(
  filters: ArmoryLeaderboardsFilters = {}
): Promise<ArmoryLeaderboards> {
  const transactionId = uuidv4();
  const params = new URLSearchParams();
  params.set("limit", String(filters.limit ?? 10));
  if (filters.faction) params.set("faction", filters.faction);
  if (filters.realm_id != null) {
    params.set("realm_id", String(filters.realm_id));
  } else {
    if (filters.realm) params.set("realm", filters.realm);
    if (filters.expansion_id != null) {
      params.set("expansion_id", String(filters.expansion_id));
    }
  }

  const response = await fetch(
    `${BASE_URL_CORE}/api/armory/leaderboards?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        transaction_id: transactionId,
      },
    }
  );

  const body: GenericResponseDto<ArmoryLeaderboards> = await response.json();
  if (!response.ok) {
    throw new Error(body.message || "Leaderboards fetch failed");
  }
  return body.data;
}

// Kept for potential JSON export route usage
export { buildRealmQuery };

import { BASE_URL_CORE } from "@/configs/configs";
import { GenericResponseDto, InternalServerError } from "@/dto/generic";
import { v4 as uuidv4 } from "uuid";
import type {
  BattlePassSeason,
  BattlePassReward,
  BattlePassProgress,
} from "../types";

/** Obtener temporada activa del reino */
export const getActiveSeason = async (
  realmId: number,
  token: string
): Promise<BattlePassSeason | null> => {
  const transactionId = uuidv4();
  try {
    const response = await fetch(
      `${BASE_URL_CORE}/api/battle-pass/season?realm_id=${realmId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          transaction_id: transactionId,
          Authorization: "Bearer " + token,
        },
      }
    );
    if (response.status === 204 || response.status === 404) return null;
    if (!response.ok) {
      const err: GenericResponseDto<void> = await response.json();
      throw new InternalServerError(
        err.message,
        response.status,
        transactionId
      );
    }
    const data: GenericResponseDto<BattlePassSeason> = await response.json();
    return data.data ?? null;
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

/** Listar premios de una temporada */
export const getRewards = async (
  realmId: number,
  seasonId: number,
  token: string
): Promise<BattlePassReward[]> => {
  const transactionId = uuidv4();
  try {
    const response = await fetch(
      `${BASE_URL_CORE}/api/battle-pass/rewards?realm_id=${realmId}&season_id=${seasonId}`,
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
    const data: GenericResponseDto<BattlePassReward[]> = await response.json();
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

/** Progreso del personaje en la temporada */
export const getProgress = async (
  realmId: number,
  accountId: number,
  characterId: number,
  seasonId: number,
  token: string
): Promise<BattlePassProgress> => {
  const transactionId = uuidv4();
  try {
    const params = new URLSearchParams({
      realm_id: String(realmId),
      account_id: String(accountId),
      character_id: String(characterId),
      season_id: String(seasonId),
    });
    const response = await fetch(
      `${BASE_URL_CORE}/api/battle-pass/progress?${params}`,
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
    const data: GenericResponseDto<BattlePassProgress> = await response.json();
    return data.data ?? { character_level: 0, claimed_reward_ids: [] };
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

/** Reclamar un beneficio del pase */
export const claimReward = async (
  realmId: number,
  accountId: number,
  characterId: number,
  seasonId: number,
  rewardId: number,
  token: string
): Promise<void> => {
  const transactionId = uuidv4();
  try {
    const response = await fetch(`${BASE_URL_CORE}/api/battle-pass/claim`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        transaction_id: transactionId,
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        realm_id: realmId,
        account_id: accountId,
        character_id: characterId,
        season_id: seasonId,
        reward_id: rewardId,
      }),
    });
    if (!response.ok) {
      const err: GenericResponseDto<void> = await response.json();
      throw new InternalServerError(
        err.message,
        response.status,
        transactionId
      );
    }
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

// --- Admin API (dashboard) ---

export interface BattlePassSeasonCreateDto {
  realm_id: number;
  name: string;
  start_date: string;
  end_date: string;
}

export interface BattlePassRewardCreateDto {
  season_id: number;
  level: number;
  name: string;
  image_url: string;
  core_item_id: number;
  wowhead_id: number | null;
}

export const adminGetSeasons = async (
  realmId: number,
  token: string
): Promise<BattlePassSeason[]> => {
  const transactionId = uuidv4();
  try {
    const response = await fetch(
      `${BASE_URL_CORE}/api/battle-pass/admin/seasons?realm_id=${realmId}`,
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
    const data: GenericResponseDto<BattlePassSeason[]> = await response.json();
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

export const adminCreateSeason = async (
  body: BattlePassSeasonCreateDto,
  token: string
): Promise<BattlePassSeason> => {
  const transactionId = uuidv4();
  try {
    const response = await fetch(
      `${BASE_URL_CORE}/api/battle-pass/admin/seasons`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          transaction_id: transactionId,
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(body),
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
    const data: GenericResponseDto<BattlePassSeason> = await response.json();
    return data.data as BattlePassSeason;
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

export const adminUpdateSeason = async (
  seasonId: number,
  body: Partial<BattlePassSeasonCreateDto>,
  token: string
): Promise<void> => {
  const transactionId = uuidv4();
  try {
    const response = await fetch(
      `${BASE_URL_CORE}/api/battle-pass/admin/seasons/${seasonId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          transaction_id: transactionId,
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(body),
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

export const adminGetRewards = async (
  realmId: number,
  seasonId: number,
  token: string
): Promise<BattlePassReward[]> => {
  const transactionId = uuidv4();
  try {
    const response = await fetch(
      `${BASE_URL_CORE}/api/battle-pass/admin/rewards?realm_id=${realmId}&season_id=${seasonId}`,
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
    const data: GenericResponseDto<BattlePassReward[]> = await response.json();
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

export const adminCreateReward = async (
  body: BattlePassRewardCreateDto,
  token: string
): Promise<BattlePassReward> => {
  const transactionId = uuidv4();
  try {
    const response = await fetch(
      `${BASE_URL_CORE}/api/battle-pass/admin/rewards`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          transaction_id: transactionId,
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(body),
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
    const data: GenericResponseDto<BattlePassReward> = await response.json();
    return data.data as BattlePassReward;
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

export const adminUpdateReward = async (
  rewardId: number,
  body: Partial<BattlePassRewardCreateDto>,
  token: string
): Promise<void> => {
  const transactionId = uuidv4();
  try {
    const response = await fetch(
      `${BASE_URL_CORE}/api/battle-pass/admin/rewards/${rewardId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          transaction_id: transactionId,
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(body),
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

export const adminDeleteReward = async (
  rewardId: number,
  token: string
): Promise<void> => {
  const transactionId = uuidv4();
  try {
    const response = await fetch(
      `${BASE_URL_CORE}/api/battle-pass/admin/rewards/${rewardId}`,
      {
        method: "DELETE",
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

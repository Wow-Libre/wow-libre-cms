import { BASE_URL_CORE } from "@/configs/configs";
import { GenericResponseDto, InternalServerError } from "@/dto/generic";
import { v4 as uuidv4 } from "uuid";

export interface WalletVoteItemDto {
  id: number;
  platform_id: number;
  platform_name: string;
  vote_balance: number;
}

export interface WalletMachineItemDto {
  id: number;
  realm_id: number;
  realm_name: string;
  points: number;
}

export interface WalletUserRowDto {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  points: number;
  voting_points: number;
  machine_points_total: number;
  voting_available?: boolean;
  voting_wallets: WalletVoteItemDto[];
  machine_wallets: WalletMachineItemDto[];
}

export interface WalletUsersPageDto {
  content: WalletUserRowDto[];
  total_elements: number;
  total_pages: number;
  size: number;
  number: number;
}

export interface UpdateWalletPointsRequestDto {
  user_id: number;
  points: number;
}

export interface UpdateVotingPointsRequestDto {
  user_id: number;
  points: number;
}

export interface UpdateMachinePointsRequestDto {
  user_id: number;
  realm_id: number;
  points: number;
}

function headers(token: string, transactionId: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    transaction_id: transactionId,
    Authorization: `Bearer ${token}`,
  };
}

async function parseError(response: Response, transactionId: string, fallback: string): Promise<never> {
  const err: GenericResponseDto<void> = await response.json().catch(() => ({}));
  throw new InternalServerError(err.message ?? fallback, response.status, transactionId);
}

export const getWalletUsersPage = async (
  token: string,
  page: number,
  size: number,
  email?: string
): Promise<WalletUsersPageDto> => {
  const transactionId = uuidv4();
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", String(size));
  if (email != null && email.trim() !== "") {
    params.set("email", email.trim());
  }
  const url = `${BASE_URL_CORE}/api/wallet/admin/list?${params.toString()}`;
  const response = await fetch(url, {
    method: "GET",
    headers: headers(token, transactionId),
  });
  if (!response.ok) {
    await parseError(response, transactionId, "Error al obtener wallets de usuarios");
  }
  const data: GenericResponseDto<WalletUsersPageDto> = await response.json();
  if (data.data == null) {
    return {
      content: [],
      total_elements: 0,
      total_pages: 0,
      size,
      number: page,
    };
  }
  return {
    ...data.data,
    content: (data.data.content ?? []).map((row) => ({
      ...row,
      points: row.points ?? 0,
      voting_points: row.voting_points ?? 0,
      machine_points_total: row.machine_points_total ?? 0,
      voting_wallets: row.voting_wallets ?? [],
      machine_wallets: row.machine_wallets ?? [],
    })),
  };
};

export const updateWalletPoints = async (
  token: string,
  payload: UpdateWalletPointsRequestDto
): Promise<WalletUserRowDto> => {
  const transactionId = uuidv4();
  const response = await fetch(`${BASE_URL_CORE}/api/wallet/admin/points`, {
    method: "PUT",
    headers: headers(token, transactionId),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    await parseError(response, transactionId, "Error al actualizar puntos de donación");
  }
  const data: GenericResponseDto<WalletUserRowDto> = await response.json();
  if (data.data == null) {
    throw new InternalServerError("Respuesta inválida al actualizar wallet", response.status, transactionId);
  }
  return data.data;
};

export const updateVotingPoints = async (
  token: string,
  payload: UpdateVotingPointsRequestDto
): Promise<WalletUserRowDto> => {
  const transactionId = uuidv4();
  const response = await fetch(`${BASE_URL_CORE}/api/wallet/admin/voting/points`, {
    method: "PUT",
    headers: headers(token, transactionId),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    await parseError(response, transactionId, "Error al actualizar puntos de votación");
  }
  const data: GenericResponseDto<WalletUserRowDto> = await response.json();
  if (data.data == null) {
    throw new InternalServerError("Respuesta inválida al actualizar votación", response.status, transactionId);
  }
  return data.data;
};

export const updateMachinePoints = async (
  token: string,
  payload: UpdateMachinePointsRequestDto
): Promise<WalletUserRowDto> => {
  const transactionId = uuidv4();
  const response = await fetch(`${BASE_URL_CORE}/api/wallet/admin/machine/points`, {
    method: "PUT",
    headers: headers(token, transactionId),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    await parseError(response, transactionId, "Error al actualizar puntos de máquina");
  }
  const data: GenericResponseDto<WalletUserRowDto> = await response.json();
  if (data.data == null) {
    throw new InternalServerError("Respuesta inválida al actualizar máquina", response.status, transactionId);
  }
  return data.data;
};

import { BASE_URL_CORE } from "@/configs/configs";
import { GenericResponseDto, InternalServerError } from "@/dto/generic";
import { v4 as uuidv4 } from "uuid";

/** DTO en snake_case como lo devuelve wow-core */
export interface WebUserAccountGameDto {
  id: number;
  username: string;
  game_email: string;
  account_id: number;
  status: boolean;
  realm_id: number;
  realm_name: string;
}

/** DTO en snake_case como lo devuelve wow-core */
export interface WebUserRowDto {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  language: string | null;
  status: boolean | null;
  verified: boolean | null;
  rol_name: string | null;
  account_count: number;
  accounts: WebUserAccountGameDto[];
}

/** DTO en snake_case como lo devuelve wow-core */
export interface WebUsersPageDto {
  content: WebUserRowDto[];
  total_elements: number;
  total_pages: number;
  size: number;
  number: number;
}

function headers(token: string, transactionId: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    transaction_id: transactionId,
    Authorization: `Bearer ${token}`,
  };
}

export const getWebUsersPage = async (
  token: string,
  page: number,
  size: number,
  email?: string
): Promise<WebUsersPageDto> => {
  const transactionId = uuidv4();
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", String(size));
  if (email != null && email.trim() !== "") {
    params.set("email", email.trim());
  }
  const url = `${BASE_URL_CORE}/api/users/admin/web?${params.toString()}`;
  const response = await fetch(url, {
    method: "GET",
    headers: headers(token, transactionId),
  });
  if (!response.ok) {
    const err: GenericResponseDto<void> = await response.json().catch(() => ({}));
    throw new InternalServerError(
      err.message ?? "Error al obtener usuarios web",
      response.status,
      transactionId
    );
  }
  const data: GenericResponseDto<WebUsersPageDto> = await response.json();
  if (data.data == null) {
    return {
      content: [],
      total_elements: 0,
      total_pages: 0,
      size,
      number: page,
    };
  }
  return data.data;
};

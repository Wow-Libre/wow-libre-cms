import { BASE_URL_CORE } from "@/configs/configs";
import { GenericResponseDto, InternalServerError } from "@/dto/generic";
import { GuildMemberDto } from "@/model/model";
import { v4 as uuidv4 } from "uuid";

export const attach = async (
  serverId: number,
  guildId: number,
  accountId: number,
  characterId: number,
  token: string
): Promise<void> => {
  const transactionId = uuidv4();

  try {
    const requestBody: {
      server_id: number;
      account_id: number;
      character_id: number;
      guild_id: number;
    } = {
      server_id: serverId,
      account_id: accountId,
      character_id: characterId,
      guild_id: guildId,
    };

    const response = await fetch(`${BASE_URL_CORE}/api/guilds/attach`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        transaction_id: transactionId,
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok && response.status === 204) {
      return;
    } else {
      const genericResponse: GenericResponseDto<void> = await response.json();
      throw new InternalServerError(
        `${genericResponse.message}`,
        response.status,
        transactionId
      );
    }
  } catch (error: any) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(`Please try again later, services are not available.`);
    } else if (error instanceof InternalServerError) {
      throw error;
    } else if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(
        `Unknown error occurred - TransactionId: ${transactionId}`
      );
    }
  }
};

export const getMemberDetailGuild = async (
  serverId: number,
  accountId: number,
  characterId: number,
  token: string
): Promise<GuildMemberDto> => {
  try {
    const transactionId = uuidv4();

    const response = await fetch(
      `${BASE_URL_CORE}/api/guilds/member?server_id=${serverId}&character_id=${characterId}&account_id=${accountId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          transaction_id: transactionId,
          Authorization: "Bearer " + token,
        },
      }
    );

    if (response.ok && response.status === 200) {
      const responseData: GenericResponseDto<GuildMemberDto> =
        await response.json();

      return responseData.data;
    } else {
      const errorGeneric: GenericResponseDto<void> = await response.json();

      throw new Error(
        `${errorGeneric.message} - Transaction Id: ${transactionId}`
      );
    }
  } catch (error: any) {
    throw new Error(
      `It was not possible to obtain the guilds: ${error.message}`
    );
  }
};

export const unlinkGuild = async (
  serverId: number,
  accountId: number,
  characterId: number,
  token: string
): Promise<GenericResponseDto<void>> => {
  const transactionId = uuidv4();

  try {
    const requestBody: {
      server_id: number;
      account_id: number;
      character_id: number;
    } = {
      server_id: serverId,
      account_id: accountId,
      character_id: characterId,
    };

    const response = await fetch(`${BASE_URL_CORE}/api/guilds/attach`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        transaction_id: transactionId,
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok && response.status === 200) {
      const responseData: GenericResponseDto<void> = await response.json();
      return responseData;
    } else {
      const genericResponse: GenericResponseDto<void> = await response.json();
      throw new InternalServerError(
        `${genericResponse.message}`,
        response.status,
        transactionId
      );
    }
  } catch (error: any) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(`Please try again later, services are not available.`);
    } else if (error instanceof InternalServerError) {
      throw error;
    } else if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(
        `Unknown error occurred - TransactionId: ${transactionId}`
      );
    }
  }
};

export const claimBenefits = async (
  serverId: number,
  accountId: number,
  characterId: number,
  token: string,
  language: string
): Promise<GenericResponseDto<void>> => {
  const transactionId = uuidv4();

  try {
    const response = await fetch(`${BASE_URL_CORE}/api/guilds/claim-benefit`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        transaction_id: transactionId,
        Authorization: "Bearer " + token,
        "Accept-Language": language,
      },
      body: JSON.stringify({
        character_id: characterId,
        account_id: accountId,
        server_id: serverId,
      }),
    });

    if (response.ok && response.status === 200) {
      const responseData: GenericResponseDto<void> = await response.json();
      return responseData;
    } else {
      const genericResponse: GenericResponseDto<void> = await response.json();
      throw new InternalServerError(
        `${genericResponse.message}`,
        response.status,
        transactionId
      );
    }
  } catch (error: any) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(`Please try again later, services are not available.`);
    } else if (error instanceof InternalServerError) {
      throw error;
    } else if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(
        `Unknown error occurred - TransactionId: ${transactionId}`
      );
    }
  }
};

export const update = async (
  serverId: number,
  accountId: number,
  characterId: number,
  discord: string,
  multiFaction: boolean,
  isPublic: boolean,
  token: string
): Promise<GenericResponseDto<void>> => {
  try {
    const transactionId = uuidv4();

    const requestBody: {
      server_id: number;
      account_id: number;
      character_id: number;
      discord: string;
      multi_faction: boolean;
      is_public: boolean;
    } = {
      server_id: serverId,
      account_id: accountId,
      character_id: characterId,
      discord: discord,
      multi_faction: multiFaction,
      is_public: isPublic,
    };

    const response = await fetch(`${BASE_URL_CORE}/api/guilds/edit`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        transaction_id: transactionId,
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok && response.status === 200) {
      const responseData: GenericResponseDto<void> = await response.json();
      return responseData;
    } else {
      const errorGeneric: GenericResponseDto<void> = await response.json();
      throw new Error(
        `${errorGeneric.message} - Transaction Id: ${transactionId}`
      );
    }
  } catch (error: any) {
    throw new Error(
      `It was not possible to separate from the brotherhood: ${error.message}`
    );
  }
};

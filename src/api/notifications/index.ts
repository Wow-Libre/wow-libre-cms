import { BASE_URL_CORE } from "@/configs/configs";
import { GenericResponseDto, InternalServerError } from "@/dto/generic";
import { v4 as uuidv4 } from "uuid";

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

function headers(token: string, transactionId: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    transaction_id: transactionId,
    Authorization: `Bearer ${token}`,
  };
}

/** List notifications for the logged-in user (backend resolves user from JWT). unreadOnly: true = only unread (they disappear after read). */
export const getNotifications = async (
  token: string,
  unreadOnly = true
): Promise<NotificationItem[]> => {
  const transactionId = uuidv4();
  try {
    const url = `${BASE_URL_CORE}/api/notifications?unreadOnly=${unreadOnly}`;
    const response = await fetch(url, {
      method: "GET",
      headers: headers(token, transactionId),
    });
    if (response.ok && response.status === 200) {
      const data: GenericResponseDto<NotificationItem[]> = await response.json();
      return data.data ?? [];
    }
    const err: GenericResponseDto<void> = await response.json().catch(() => ({}));
    throw new InternalServerError(
      err.message ?? "Error al obtener notificaciones",
      response.status,
      transactionId
    );
  } catch (error: unknown) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Servicios no disponibles. Intenta más tarde.");
    }
    if (error instanceof InternalServerError) throw error;
    if (error instanceof Error) throw error;
    throw new Error(`Error inesperado - TransactionId: ${transactionId}`);
  }
};

/** Mark one notification as read (it will disappear from unread list). */
export const markNotificationAsRead = async (
  token: string,
  id: number
): Promise<void> => {
  const transactionId = uuidv4();
  try {
    const response = await fetch(
      `${BASE_URL_CORE}/api/notifications/${id}/read`,
      {
        method: "PATCH",
        headers: headers(token, transactionId),
      }
    );
    if (response.ok) return;
    const err: GenericResponseDto<void> = await response.json().catch(() => ({}));
    throw new InternalServerError(
      err.message ?? "Error al marcar notificación",
      response.status,
      transactionId
    );
  } catch (error: unknown) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Servicios no disponibles. Intenta más tarde.");
    }
    if (error instanceof InternalServerError) throw error;
    if (error instanceof Error) throw error;
    throw new Error(`Error inesperado - TransactionId: ${transactionId}`);
  }
};

/** Mark all notifications of the user as read. */
export const markAllNotificationsAsRead = async (
  token: string
): Promise<void> => {
  const transactionId = uuidv4();
  try {
    const response = await fetch(
      `${BASE_URL_CORE}/api/notifications/mark-all-read`,
      {
        method: "POST",
        headers: headers(token, transactionId),
      }
    );
    if (response.ok && response.status === 200) return;
    const err: GenericResponseDto<void> = await response.json().catch(() => ({}));
    throw new InternalServerError(
      err.message ?? "Error al marcar notificaciones",
      response.status,
      transactionId
    );
  } catch (error: unknown) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Servicios no disponibles. Intenta más tarde.");
    }
    if (error instanceof InternalServerError) throw error;
    if (error instanceof Error) throw error;
    throw new Error(`Error inesperado - TransactionId: ${transactionId}`);
  }
};


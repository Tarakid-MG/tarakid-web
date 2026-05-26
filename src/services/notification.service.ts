import api from "../api/client";

export type NotificationType =
  | "BOOKING_CANCELLED"
  | "BOOKING_REPORTED"
  | "BOOKING_ASSIGNED";

export interface AppNotification {
  id: string;
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  metadata?: {
    bookingId?: string | number;
    bookingType?: string;
  } | null;
  createdAt: string;
}

export const notificationService = {
  async getMyNotifications(): Promise<AppNotification[]> {
    const res = await api.get<AppNotification[]>("/notifications");
    return res.data;
  },

  async markAsRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await api.patch("/notifications/read-all");
  },
};

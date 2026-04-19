import api from "../api/client";
import { type AppNotification } from "./admin.service";
export type { AppNotification };

export const notificationService = {
  async getMyNotifications(): Promise<AppNotification[]> {
    const res = await api.get<AppNotification[]>("/notifications/my");
    return res.data;
  },

  async markAsRead(id: number): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await api.patch("/notifications/read-all");
  },
};

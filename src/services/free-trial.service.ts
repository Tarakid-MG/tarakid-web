import api from "../api/client";
import { type FreeTrialSession, type FreeTrialBooking } from "../types/auth";

export const freeTrialService = {
  async getAvailableSessions(): Promise<FreeTrialSession[]> {
    const response = await api.get<FreeTrialSession[]>(
      "/free-trial/available-sessions",
    );
    return response.data;
  },

  async bookSession(
    sessionId: number,
    userId: number,
    kidId?: number,
  ): Promise<FreeTrialBooking> {
    const response = await api.post<FreeTrialBooking>(
      `/free-trial/book/${sessionId}`,
      { userId, kidId },
    );
    return response.data;
  },

  async getBookings(userId: number): Promise<FreeTrialBooking[]> {
    const response = await api.get<FreeTrialBooking[]>(
      `/free-trial/bookings/user/${userId}`,
    );
    return response.data;
  },

  async createSession(
    dto: Partial<FreeTrialSession>,
  ): Promise<FreeTrialSession> {
    const response = await api.post<FreeTrialSession>(
      "/free-trial/sessions",
      dto,
    );
    return response.data;
  },
  async createBulkSessions(data: {
    startDate: string;
    endDate: string;
    daysOfWeek: number[];
    startTimes: string[];
    capacity: number;
  }): Promise<void> {
    await api.post("/free-trial/bulk-sessions", data);
  },

  async updateSession(
    id: number,
    data: Partial<FreeTrialSession>,
  ): Promise<void> {
    await api.patch(`/free-trial/sessions/${id}`, data);
  },

  async deleteSession(id: number): Promise<void> {
    await api.delete(`/free-trial/sessions/${id}`);
  },

  async getUserBookings(userId: number): Promise<FreeTrialBooking[]> {
    const response = await api.get<FreeTrialBooking[]>(
      `/free-trial/bookings/user/${userId}`,
    );
    return response.data;
  },

  async cancelBooking(bookingId: number, userId: number): Promise<void> {
    await api.delete(`/free-trial/bookings/${bookingId}`, { data: { userId } });
  },
};

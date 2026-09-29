import api from "../api/client";
import { type FreeTrialSession, type FreeTrialBooking } from "../types/auth";
import type { GlobalAvailability } from "./booking.service";

export const freeTrialService = {
  async bookSession(
    sessionId: number,
    userId: number,
    kidId?: string,
  ): Promise<FreeTrialBooking> {
    const response = await api.post<FreeTrialBooking>(
      `/free-trial/book/${sessionId}`,
      { userId, kidId },
    );
    return response.data;
  },

  async bookByDateTime(
    userId: number,
    date: string,
    startTime: string,
    kidId?: string,
  ): Promise<FreeTrialBooking> {
    const response = await api.post<FreeTrialBooking>(
      "/free-trial/book-by-datetime",
      { userId, date, startTime, kidId },
    );
    return response.data;
  },

  async getUserBookings(userId: number): Promise<FreeTrialBooking[]> {
    const response = await api.get<FreeTrialBooking[]>(
      `/free-trial/bookings/user/${userId}`,
    );
    return response.data;
  },

  async getBookings(userId: number): Promise<FreeTrialBooking[]> {
    return this.getUserBookings(userId);
  },

  async cancelBooking(bookingId: number, userId: number): Promise<void> {
    await api.patch(`/free-trial/bookings/${bookingId}/cancel`, { userId });
  },

  async reportBooking(bookingId: number, userId: number): Promise<void> {
    await api.patch(`/free-trial/bookings/${bookingId}/report`, { userId });
  },

  async getGlobalAvailability(): Promise<GlobalAvailability> {
    const response = await api.get<GlobalAvailability>(
      "/bookings/availability",
    );
    return response.data;
  },

  async getAvailableDates(
    months: number = 2,
  ): Promise<{ available: string[]; full: string[] }> {
    const response = await api.get<{ available: string[]; full: string[] }>(
      "/bookings/available-dates",
      {
        params: { months },
      },
    );
    return response.data;
  },

  async getClassroomStatus(id: number): Promise<FreeTrialBooking> {
    const response = await api.get<FreeTrialBooking>(
      `/free-trial/${id}/classroom-status`,
    );
    return response.data;
  },

  async updateWaitingStatus(
    id: number,
    isKidWaiting: boolean,
  ): Promise<FreeTrialBooking> {
    const response = await api.patch<FreeTrialBooking>(
      `/free-trial/${id}/waiting-status`,
      { isKidWaiting },
    );
    return response.data;
  },

  async updateAcceptanceStatus(
    id: number,
    isKidAccepted: boolean,
  ): Promise<FreeTrialBooking> {
    const response = await api.patch<FreeTrialBooking>(
      `/free-trial/${id}/acceptance-status`,
      { isKidAccepted },
    );
    return response.data;
  },

  async updatePresenceStatus(
    id: number,
    isTeacherInClass: boolean,
  ): Promise<FreeTrialBooking> {
    const response = await api.patch<FreeTrialBooking>(
      `/free-trial/${id}/presence`,
      { isTeacherInClass },
    );
    return response.data;
  },

  async updateInteractionData(
    id: number,
    interactionData: string,
  ): Promise<FreeTrialBooking> {
    const response = await api.patch<FreeTrialBooking>(
      `/free-trial/${id}/interaction`,
      { interactionData },
    );
    return response.data;
  },
};

export type { FreeTrialSession };

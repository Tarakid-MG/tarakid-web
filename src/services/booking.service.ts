import api from "../api/client";
import { type Booking } from "../types/auth";

interface BookingSlot {
  sessionDate: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  recurrencePattern?: Record<string, unknown>;
}

interface CreateBookingRequest {
  subscriptionId: string;
  kidId: string;
  bookings: BookingSlot[];
  teacherId?: number;
}

interface SuggestedSchedule {
  id: string;
  name: string;
  description: string;
  slots: Array<{
    dayOfWeek: number;
    time: string;
  }>;
}

export interface TeacherAvailability {
  id: string;
  teacherId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface TeacherStats {
  commitmentScore: number;
  hearts: number;
  maxHearts: number;
  currentCompetence: "poor" | "belowAverage" | "average" | "good" | "competent";
  competences: {
    poor: number;
    belowAverage: number;
    average: number;
    good: number;
    competent: number;
  };
  earnings: {
    total: number;
    currency: string;
    ratePerClass: number;
  };
  performance: {
    finishedCourses: number;
    canceledCourses: number;
    lateCourses: number;
    thumbsUp: number;
    thumbsDown: number;
    stars: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
  };
}

export interface GlobalAvailability {
  slotCapacities: Record<string, number>;
  bookings: Array<{ date: string; startTime: string; count: number }>;
}

export const bookingService = {
  async create(data: CreateBookingRequest): Promise<Booking[]> {
    const response = await api.post<Booking[]>("/bookings", data);
    return response.data;
  },

  async getKidBookings(kidId: string): Promise<Booking[]> {
    const response = await api.get<Booking[]>(`/bookings/kid/${kidId}`);
    return response.data;
  },

  async getUpcomingBookings(kidId: string): Promise<Booking[]> {
    const response = await api.get<Booking[]>(`/bookings/upcoming/${kidId}`);
    return response.data;
  },

  async getSubscriptionBookings(subscriptionId: string): Promise<Booking[]> {
    const response = await api.get<Booking[]>(
      `/bookings/subscription/${subscriptionId}`,
    );
    return response.data;
  },

  async getSuggestedSchedules(
    subscriptionId: string,
  ): Promise<SuggestedSchedule[]> {
    const response = await api.get<SuggestedSchedule[]>(
      "/bookings/suggested-schedule",
      {
        params: { subscriptionId },
      },
    );
    return response.data;
  },

  async cancelBooking(id: string): Promise<Booking> {
    const response = await api.delete<Booking>(`/bookings/${id}`);
    return response.data;
  },

  async reportBooking(id: string): Promise<Booking> {
    const response = await api.patch<Booking>(`/bookings/${id}/report`);
    return response.data;
  },

  async getTeacherUpcoming(): Promise<Booking[]> {
    const response = await api.get<Booking[]>("/bookings/teacher/upcoming");
    return response.data;
  },

  async getTeacherCalendar(): Promise<Booking[]> {
    const response = await api.get<Booking[]>("/bookings/teacher/calendar");
    return response.data;
  },

  async getTeacherStats(): Promise<TeacherStats> {
    const response = await api.get<TeacherStats>("/bookings/teacher/stats");
    return response.data;
  },

  async getTeacherAvailability(): Promise<TeacherAvailability[]> {
    const response = await api.get<TeacherAvailability[]>(
      "/bookings/teacher/availability",
    );
    return response.data;
  },

  async setTeacherAvailability(
    slots: Partial<TeacherAvailability>[],
  ): Promise<TeacherAvailability[]> {
    const response = await api.post<TeacherAvailability[]>(
      "/bookings/teacher/availability",
      {
        slots,
      },
    );
    return response.data;
  },

  async cancelTeacherSession(
    id: string,
  ): Promise<{ success: boolean; penaltyApplied: boolean }> {
    const response = await api.patch<{
      success: boolean;
      penaltyApplied: boolean;
    }>(`/bookings/teacher/${id}/cancel`);
    return response.data;
  },

  async assignLesson(bookingId: string, lessonId: string): Promise<any> {
    const response = await api.patch(`/bookings/teacher/${bookingId}/lesson`, {
      lessonId,
    });
    return response.data;
  },

  async getGlobalAvailability(teacherId?: number): Promise<GlobalAvailability> {
    const response = await api.get<GlobalAvailability>(
      "/bookings/availability",
      { params: { teacherId } },
    );
    return response.data;
  },

  async getAvailableDates(
    months: number = 2,
    teacherId?: number,
  ): Promise<{ available: string[]; full: string[] }> {
    const response = await api.get<{ available: string[]; full: string[] }>(
      "/bookings/available-dates",
      {
        params: { months, teacherId },
      },
    );
    return response.data;
  },

  // ────────────────────────────────────────────────────────────────────────
  // CLASSROOM FLOW
  // ────────────────────────────────────────────────────────────────────────

  async getClassroomStatus(id: string): Promise<Booking> {
    const response = await api.get<Booking>(`/bookings/${id}/classroom-status`);
    return response.data;
  },

  async updateWaitingStatus(
    id: string,
    isKidWaiting: boolean,
  ): Promise<Booking> {
    const response = await api.patch<Booking>(
      `/bookings/${id}/waiting-status`,
      {
        isKidWaiting,
      },
    );
    return response.data;
  },

  // Teacher side
  async getTeacherClassroomStatus(id: string): Promise<Booking> {
    const response = await api.get<Booking>(
      `/bookings/teacher/${id}/classroom-status`,
    );
    return response.data;
  },

  async updateAcceptanceStatus(
    id: string,
    isKidAccepted: boolean,
  ): Promise<Booking> {
    const response = await api.patch<Booking>(
      `/bookings/teacher/${id}/acceptance-status`,
      { isKidAccepted },
    );
    return response.data;
  },

  async updatePresenceStatus(
    id: string,
    isTeacherInClass: boolean,
  ): Promise<Booking> {
    const response = await api.patch<Booking>(
      `/bookings/teacher/${id}/presence`,
      { isTeacherInClass },
    );
    return response.data;
  },

  async updateInteractionData(
    id: string,
    interactionData: string,
  ): Promise<Booking> {
    const response = await api.patch<Booking>(
      `/bookings/teacher/${id}/interaction`,
      { interactionData },
    );
    return response.data;
  },
};

export type { SuggestedSchedule, BookingSlot, CreateBookingRequest };

import api from '../api/client';
import { type Booking } from '../types/auth';

interface BookingSlot {
    sessionDate: string;
    startTime: string;
    endTime: string;
    isRecurring: boolean;
    recurrencePattern?: any;
}

interface CreateBookingRequest {
    subscriptionId: string;
    kidId: string;
    bookings: BookingSlot[];
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

export const bookingService = {
    async create(data: CreateBookingRequest): Promise<Booking[]> {
        const response = await api.post<Booking[]>('/bookings', data);
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
        const response = await api.get<Booking[]>(`/bookings/subscription/${subscriptionId}`);
        return response.data;
    },

    async getSuggestedSchedules(subscriptionId: string): Promise<SuggestedSchedule[]> {
        const response = await api.get<SuggestedSchedule[]>('/bookings/suggested-schedule', {
            params: { subscriptionId },
        });
        return response.data;
    },

    async cancelBooking(id: string): Promise<Booking> {
        const response = await api.delete<Booking>(`/bookings/${id}`);
        return response.data;
    },
};

export type { SuggestedSchedule, BookingSlot, CreateBookingRequest };

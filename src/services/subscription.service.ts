import api from '../api/client';
import { type Subscription } from '../types/auth';

interface CreateSubscriptionRequest {
    kidId?: string;
    planName: string;
    frequency: number;
    commitmentType: 'MONTHLY' | 'THREE_MONTHS' | 'SIX_MONTHS';
    creditsPerMonth: number;
    pricePerMonth: number;
}

export const subscriptionService = {
    async create(data: CreateSubscriptionRequest): Promise<Subscription> {
        const response = await api.post<Subscription>('/subscriptions', data);
        return response.data;
    },

    async getMySubscriptions(): Promise<Subscription[]> {
        const response = await api.get<Subscription[]>('/subscriptions/my-subscriptions');
        return response.data;
    },

    async getKidSubscriptions(kidId: string): Promise<Subscription[]> {
        const response = await api.get<Subscription[]>(`/subscriptions/kid/${kidId}`);
        return response.data;
    },

    async getSubscription(id: string): Promise<Subscription> {
        const response = await api.get<Subscription>(`/subscriptions/${id}`);
        return response.data;
    },
};

export type UserRole = 'admin' | 'teacher' | 'client' | 'support';
export type AccountType = 'INDIVIDUAL' | 'BUSINESS' | 'PARENT';

export interface Kid {
    id: number;
    name: string;
    age: number;
    hobbies: string[];
    // add other fields if needed, but these are enough for the check
}

export interface FreeTrialSession {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    capacity: number;
    bookedSlots: number;
    type: 'FREE_TRIAL' | 'REGULAR';
}

export interface FreeTrialBooking {
    id: number;
    userId: number;
    kidId?: number;
    sessionId: number;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
    createdAt: string;
    session?: FreeTrialSession;
}

export interface Subscription {
    id: string;
    userId: number;
    kidId?: string;
    planName: string;
    frequency: number;
    commitmentType: 'MONTHLY' | 'THREE_MONTHS' | 'SIX_MONTHS';
    creditsPerMonth: number;
    totalCredits: number;
    remainingCredits: number;
    pricePerMonth: number;
    startDate: string;
    endDate: string;
    status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
    kid?: Kid;
    createdAt: string;
    updatedAt: string;
}

export interface Booking {
    id: string;
    subscriptionId: string;
    kidId: string;
    userId: number;
    sessionDate: string;
    startTime: string;
    endTime: string;
    dayOfWeek: number;
    isRecurring: boolean;
    recurrencePattern?: any;
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'MISSED';
    teacherId?: number;
    createdAt: string;
    updatedAt: string;
}

export interface User {
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
    role: UserRole;
    accountType?: AccountType;
    isVerified: boolean;
    kids?: Kid[];
    bookings?: FreeTrialBooking[];
    subscriptions?: Subscription[];
    credits?: number;
    subscriptionPlan?: string;
}

export interface AuthResponse {
    access_token: string;
}

export interface MessageResponse {
    message: string;
    userId?: number;
}

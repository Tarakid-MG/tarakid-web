export type UserRole = 'ADMIN' | 'TEACHER' | 'CLIENT' | 'SUPPORT';
export type AccountType = 'INDIVIDUAL' | 'BUSINESS' | 'PARENT';

export interface User {
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
    role: UserRole;
    accountType?: AccountType;
    isVerified: boolean;
}

export interface AuthResponse {
    access_token: string;
}

export interface MessageResponse {
    message: string;
}

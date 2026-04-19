export type UserRole = "admin" | "teacher" | "client" | "support";
export type AccountType =
  | "INDIVIDUAL"
  | "BUSINESS"
  | "PARENT"
  | "parent"
  | "kid";

export interface Kid {
  id: string;
  name: string;
  age: number;
  gender: string;
  motherTongueProficiency: string;
  englishReadingLevel: string;
  englishSpeakingLevel: string;
  learningDuration: string;
  hobbies: string[];
  avatarUrl?: string;
  level?: string;
  assignedTeacherId?: number;
  assignedTeacher?: {
    id: number;
    firstName?: string;
    lastName?: string;
  };
}

export interface FreeTrialSession {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedSlots: number;
  type: "FREE_TRIAL" | "REGULAR";
}

export interface FreeTrialBooking {
  id: number;
  userId: number;
  kidId?: string;
  sessionId: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  createdAt: string;
  isKidWaiting?: boolean;
  isKidAccepted?: boolean;
  isTeacherInClass?: boolean;
  session?: FreeTrialSession;
  kid?: Kid;
  lesson?: any;
  interactionData?: string;
}

export interface Subscription {
  id: string;
  userId: number;
  kidId?: string;
  planName: string;
  frequency: number;
  commitmentType: "MONTHLY" | "THREE_MONTHS" | "SIX_MONTHS";
  creditsPerMonth: number;
  totalCredits: number;
  remainingCredits: number;
  pricePerMonth: number;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED";
  kid?: Kid;
  createdAt: string;
  updatedAt: string;
}

export interface RecurrencePattern {
  frequency?: "DAILY" | "WEEKLY" | "MONTHLY";
  interval?: number;
  endDate?: string;
  daysOfWeek?: number[];
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
  recurrencePattern?: RecurrencePattern;
  status:
    | "SCHEDULED"
    | "COMPLETED"
    | "CANCELLED"
    | "MISSED"
    | "ABSENT"
    | "REPORTED"
    | "DONE_BUT_MISSING";
  teacherId?: number;
  isKidWaiting?: boolean;
  isKidAccepted?: boolean;
  isTeacherInClass?: boolean;
  kid?: Kid;
  lesson?: any;
  interactionData?: string;
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
  isActive: boolean;
  isOnline?: boolean;
  lastLogin?: string;
  lastActivity?: string;
  kids?: Kid[];
  bookings?: FreeTrialBooking[];
  subscriptions?: Subscription[];
  credits?: number;
  hearts?: number;
  subscriptionPlan?: string;
  phoneNumber?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  accountType?: AccountType;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
}

export interface MessageResponse {
  message: string;
  userId?: number;
}

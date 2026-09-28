import type { DerivedBookingStatus } from "../../utils/bookingStatus";

export type ScheduleItem = {
  id: string | number;
  type: "FREE_TRIAL" | "REGULAR";
  date: string;
  start: string;
  end: string;
  rawStatus: string;
  derivedStatus: DerivedBookingStatus;
  kidId?: string;
  teacherId?: number;
};

export type CalendarDay = {
  date: Date;
  dateKey: string;
  inMonth: boolean;
  bookings: ScheduleItem[];
};

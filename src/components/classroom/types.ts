import type { Lesson, Unit } from "../../services/lesson.service";
import type { Booking, FreeTrialBooking } from "../../types/auth";

export interface Message {
  id: string;
  sender: "prof" | "me" | "user";
  text: string;
  time: string;
}

export interface ContentSize {
  width: number;
  height: number;
}

export interface RemotePointer {
  x: number;
  y: number;
}

export type { Lesson, Unit, Booking, FreeTrialBooking };

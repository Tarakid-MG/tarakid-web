import { format } from "date-fns";
import type { SlotKey } from "./types";

export const HOURS = Array.from({ length: 24 }, (_, i) => i);
export const MINUTES = ["00", "30"];

export const toSlotKey = (date: Date, hour: number, minute: string): SlotKey =>
  `${format(date, "yyyy-MM-dd")}|${hour.toString().padStart(2, "0")}:${minute}`;

export const isBlackout = (day: Date, hour: number): boolean => {
  const d = day.getDay();
  if (d === 5) return hour >= 18;
  if (d === 6) return hour < 18;
  return false;
};

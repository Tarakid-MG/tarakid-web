import { parentArt } from "../parent-dashboard/parentDashboardUtils";
import type { DerivedBookingStatus } from "../../utils/bookingStatus";
import type { ScheduleItem } from "./scheduleTypes";

export function formatDayLabel(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date
    .toLocaleDateString("fr-FR", { weekday: "short" })
    .replace(".", "")
    .toUpperCase();
}

export function formatMonthLabel(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const value = date.toLocaleDateString("fr-FR", { month: "short" });
  return value.charAt(0).toUpperCase() + value.slice(1).replace(".", "");
}

export function toHHMM(time: string) {
  return (time || "").substring(0, 5);
}

export function toDateTime(date: string, time: string) {
  return new Date(`${date}T${toHHMM(time)}:00`);
}

export function getMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, delta: number) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

export function formatMonthYearLabel(date: Date) {
  const month = date.toLocaleDateString("fr-FR", { month: "long" });
  return `${month.charAt(0).toUpperCase()}${month.slice(1)} ${date.getFullYear()}`;
}

export function formatLongDateLabel(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const scheduleArtCycle = [
  parentArt.calendar,
  parentArt.book,
  parentArt.blocks,
  parentArt.target,
  parentArt.chest,
  parentArt.hat,
] as const;

export const weekDayLabels = [
  "Lun",
  "Mar",
  "Mer",
  "Jeu",
  "Ven",
  "Sam",
  "Dim",
] as const;

export function getScheduleRangeLabel(bookings: ScheduleItem[]) {
  if (bookings.length === 0) return "Aucun cours";

  const first = toDateTime(bookings[0].date, bookings[0].start);
  const last = toDateTime(
    bookings[bookings.length - 1].date,
    bookings[bookings.length - 1].start,
  );

  const firstMonth = first.toLocaleDateString("fr-FR", { month: "short" });
  const lastMonth = last.toLocaleDateString("fr-FR", { month: "short" });
  const year = last.getFullYear();

  return `${firstMonth.charAt(0).toUpperCase()}${firstMonth.slice(1).replace(".", "")} - ${lastMonth
    .charAt(0)
    .toUpperCase()}${lastMonth.slice(1).replace(".", "")} ${year}`;
}

export function getScheduleStatusTheme(
  status: DerivedBookingStatus,
  isTrial: boolean,
) {
  if (status === "UPCOMING") {
    return isTrial
      ? {
          badge: "Essai",
          day: "text-orange",
          count: "bg-orange/12 text-orange",
          chip: "bg-orange/10 text-orange",
          dot: "bg-orange",
          detail: "bg-orange/10 text-orange",
          label: "À venir",
        }
      : {
          badge: "Standard",
          day: "text-blue",
          count: "bg-blue/10 text-blue",
          chip: "bg-blue/10 text-blue",
          dot: "bg-blue",
          detail: "bg-blue/10 text-blue",
          label: "À venir",
        };
  }

  switch (status) {
    case "COMPLETED":
      return {
        badge: "Terminé",
        day: "text-emerald-600",
        count: "bg-emerald-50 text-emerald-600",
        chip: "bg-emerald-50 text-emerald-600",
        dot: "bg-emerald-500",
        detail: "bg-emerald-50 text-emerald-700",
        label: "Terminé",
      };
    case "LATE":
      return {
        badge: "En retard",
        day: "text-sky-600",
        count: "bg-sky-50 text-sky-600",
        chip: "bg-sky-50 text-sky-600",
        dot: "bg-sky-500",
        detail: "bg-sky-50 text-sky-700",
        label: "En retard",
      };
    case "MISSING":
      return {
        badge: "Manqué",
        day: "text-red-500",
        count: "bg-red-50 text-red-500",
        chip: "bg-red-50 text-red-500",
        dot: "bg-red-500",
        detail: "bg-red-50 text-red-700",
        label: "Manqué",
      };
    case "TEACHER_ABSENT":
      return {
        badge: "Prof absent",
        day: "text-rose-600",
        count: "bg-rose-50 text-rose-600",
        chip: "bg-rose-50 text-rose-600",
        dot: "bg-rose-500",
        detail: "bg-rose-50 text-rose-700",
        label: "Prof absent",
      };
    case "REPORTED":
      return {
        badge: "Reporté",
        day: "text-amber-600",
        count: "bg-amber-50 text-amber-600",
        chip: "bg-amber-50 text-amber-600",
        dot: "bg-amber-500",
        detail: "bg-amber-50 text-amber-700",
        label: "Reporté",
      };
    case "CANCELLED":
      return {
        badge: "Annulé",
        day: "text-slate-500",
        count: "bg-slate-100 text-slate-500",
        chip: "bg-slate-100 text-slate-500",
        dot: "bg-slate-400",
        detail: "bg-slate-100 text-slate-600",
        label: "Annulé",
      };
    default:
      return {
        badge: "Cours",
        day: "text-navy",
        count: "bg-slate-100 text-navy",
        chip: "bg-slate-100 text-navy",
        dot: "bg-slate-400",
        detail: "bg-slate-100 text-navy",
        label: "Cours",
      };
  }
}

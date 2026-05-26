import type { Booking, FreeTrialBooking } from "../types/auth";

export const ATTENDANCE_WINDOW_MS = 30 * 60 * 1000;

export type DerivedBookingStatus =
  | "COMPLETED"
  | "MISSING"
  | "LATE"
  | "REPORTED"
  | "TEACHER_ABSENT"
  | "CANCELLED"
  | "UPCOMING";

export type ClassroomInteractionData = {
  pointer?: { x: number; y: number };
  kidFirstEnteredAt?: string;
  teacherFirstEnteredAt?: string;
};

export type BookingStatusSource = {
  status: string;
  date: string;
  start: string;
  end: string;
  interactionData?: string | null;
  isKidWaiting?: boolean;
  isTeacherInClass?: boolean;
};

export function parseClassroomInteractionData(
  raw?: string | null,
): ClassroomInteractionData {
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as ClassroomInteractionData;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function mergeClassroomInteractionData(
  raw: string | null | undefined,
  patch: Partial<ClassroomInteractionData>,
): string {
  return JSON.stringify({
    ...parseClassroomInteractionData(raw),
    ...patch,
  });
}

function toMs(date: string, time: string) {
  const safeTime = (time || "").substring(0, 5);
  return new Date(`${date}T${safeTime}`).getTime();
}

function isValidMs(value: number) {
  return Number.isFinite(value) && !Number.isNaN(value);
}

function resolveJoinMs(
  explicitIso: string | undefined,
  fallbackFlag: boolean | undefined,
  fallbackMs: number,
) {
  if (explicitIso) {
    const parsed = new Date(explicitIso).getTime();
    if (isValidMs(parsed)) return parsed;
  }

  return fallbackFlag ? fallbackMs : null;
}

export function getHistoryReadyAtMs(source: BookingStatusSource) {
  const startMs = toMs(source.date, source.start);
  const endMs = toMs(source.date, source.end);
  return Math.max(startMs + ATTENDANCE_WINDOW_MS, endMs);
}

export function isPastBooking(source: BookingStatusSource, now = Date.now()) {
  return getHistoryReadyAtMs(source) <= now;
}

export function deriveBookingStatus(
  source: BookingStatusSource,
  now = Date.now(),
): DerivedBookingStatus {
  if (!isPastBooking(source, now)) {
    return "UPCOMING";
  }

  if (source.status === "REPORTED") {
    return "REPORTED";
  }

  if (source.status === "CANCELLED") {
    return "CANCELLED";
  }

  const startMs = toMs(source.date, source.start);
  const windowEndMs = startMs + ATTENDANCE_WINDOW_MS;
  const interaction = parseClassroomInteractionData(source.interactionData);

  const kidJoinMs = resolveJoinMs(
    interaction.kidFirstEnteredAt,
    source.isKidWaiting,
    startMs,
  );
  const teacherJoinMs = resolveJoinMs(
    interaction.teacherFirstEnteredAt,
    source.isTeacherInClass,
    startMs,
  );

  const kidEnteredWithinWindow =
    kidJoinMs !== null && kidJoinMs <= windowEndMs;
  const teacherEnteredWithinWindow =
    teacherJoinMs !== null && teacherJoinMs <= windowEndMs;

  if (!kidEnteredWithinWindow) {
    return "MISSING";
  }

  if (!teacherEnteredWithinWindow) {
    return "TEACHER_ABSENT";
  }

  if (kidJoinMs !== null && kidJoinMs > startMs && kidJoinMs <= windowEndMs) {
    return "LATE";
  }

  if (source.status === "COMPLETED") {
    return "COMPLETED";
  }

  if (
    source.status === "MISSED" ||
    source.status === "ABSENT" ||
    source.status === "DONE_BUT_MISSING"
  ) {
    return "MISSING";
  }

  return "COMPLETED";
}

export function toBookingStatusSource(
  booking: Booking | FreeTrialBooking,
): BookingStatusSource | null {
  if ("sessionDate" in booking) {
    if (!booking.sessionDate || !booking.startTime || !booking.endTime) {
      return null;
    }

    return {
      status: booking.status,
      date: booking.sessionDate,
      start: booking.startTime,
      end: booking.endTime,
      interactionData: booking.interactionData,
      isKidWaiting: booking.isKidWaiting,
      isTeacherInClass: booking.isTeacherInClass,
    };
  }

  if (!booking.session?.date || !booking.session?.startTime || !booking.session?.endTime) {
    return null;
  }

  return {
    status: booking.status,
    date: booking.session.date,
    start: booking.session.startTime,
    end: booking.session.endTime,
    interactionData: booking.interactionData,
    isKidWaiting: booking.isKidWaiting,
    isTeacherInClass: booking.isTeacherInClass,
  };
}

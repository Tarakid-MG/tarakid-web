import type { Booking, FreeTrialBooking } from "../../types/auth";

export type UnifiedBooking = (FreeTrialBooking | Booking) & {
  date: string;
  startTime: string;
  type: "FREE_TRIAL" | "REGULAR";
  isKidWaiting?: boolean;
  isKidAccepted?: boolean;
  isTeacherInClass?: boolean;
};

export type ActionTone = "yellow" | "turquoise" | "purple" | "orange" | "blue";

export type KidAction = {
  title: string;
  subtitle: string;
  tone: ActionTone;
  art: string;
  onClick: () => void;
  comingSoon?: boolean;
};

export type SidebarItemTone =
  | "blue"
  | "turquoise"
  | "yellow"
  | "orange"
  | "slate";

export type SidebarItem = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: SidebarItemTone;
  active?: boolean;
  onClick: () => void;
};

export const kidArt = {
  calendar: "/images/kid/calendar-3d.png",
  magicHat: "/images/kid/magic-hat-3d.png",
  book: "/images/kid/book-3d.png",
  blocks: "/images/kid/blocks-3d.png",
  clapperboard: "/images/kid/clapperboard-3d.png",
  gamepad: "/images/kid/gamepad-3d.png",
  target: "/images/kid/target-3d.png",
  chest: "/images/kid/treasure-chest-3d.png",
} as const;

export function getAvatarIdentity(url?: string) {
  if (!url) return "";
  return url.split("?")[0]?.split("#")[0] || "";
}

export function parseSafeDateTime(date: string, time: string) {
  const dPart = date.includes("T") ? date.split("T")[0] : date;
  const tPart = time.substring(0, 5);
  return new Date(`${dPart}T${tPart}:00`);
}

export function formatNextClassFR(date?: string, start?: string) {
  if (!date || !start) return "Aucun cours prévu";
  const value = parseSafeDateTime(date, start);
  if (Number.isNaN(value.getTime())) return "Format date invalide";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDay = new Date(
    value.getFullYear(),
    value.getMonth(),
    value.getDate(),
  );
  const diffInDays = Math.round(
    (targetDay.getTime() - today.getTime()) / (24 * 60 * 60 * 1000),
  );
  const timeLabel = value.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (diffInDays === 0) {
    return `Aujourd'hui, ${timeLabel}`;
  }

  if (diffInDays === 1) {
    return `Demain, ${timeLabel}`;
  }

  return value.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatGateCountdown(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  return hours > 0
    ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`;
}

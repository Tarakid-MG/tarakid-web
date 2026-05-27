
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Calendar,
  Clock3,
  Gamepad2,
  HelpCircle,
  History,
  Home,
  MessageCircle,
  PlayCircle,
  Settings,
  Trophy,
  UserCircle2,
  Zap,
} from "lucide-react";

export type UnifiedBooking = {
  id: string | number;
  displayType: "FREE_TRIAL" | "REGULAR";
  date: string;
  start: string;
  end: string;
  kidId?: string | number;
  teacherId?: number;
  courseName?: string;
};

export type ParentDashboardStat = {
  key: "credits" | "booked" | "finished" | "missing" | "late";
  label: string;
  hint: string;
  value: number | string;
  accent: "gold" | "blue" | "turquoise" | "orange";
  icon: LucideIcon;
};

export type ParentQuickAction = {
  eyebrow: string;
  title: string;
  description: string;
  accent: "gold" | "blue";
  onClick: () => void;
};

export type ParentActivity = {
  id: number;
  type: "quiz" | "video" | "achievement";
  title: string;
  date: string;
  score?: string;
};

export type ParentSidebarItem = {
  label: string;
  icon: LucideIcon;
  active?: boolean;
  disabled?: boolean;
  badge?: string;
  onClick?: () => void;
};

export const parentArt = {
  calendar: "/images/kid/calendar-3d.png",
  book: "/images/kid/book-3d.png",
  blocks: "/images/kid/blocks-3d.png",
  target: "/images/kid/target-3d.png",
  chest: "/images/kid/treasure-chest-3d.png",
  hat: "/images/kid/magic-hat-3d.png",
} as const;

export const parentActivityData: ParentActivity[] = [
  {
    id: 1,
    type: "quiz",
    title: 'Quiz "Les Animaux" complété',
    date: "Hier",
    score: "8/10",
  },
  {
    id: 2,
    type: "video",
    title: 'Vidéo "Les Couleurs" regardée',
    date: "Il y a 2 jours",
  },
  {
    id: 3,
    type: "achievement",
    title: 'Badge "Explorateur" débloqué',
    date: "Il y a 3 jours",
  },
];

export function formatDateFR(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatTime(timeString: string) {
  return timeString?.substring(0, 5) || "";
}

export function getActivityIcon(type: ParentActivity["type"]) {
  switch (type) {
    case "quiz":
      return BookOpen;
    case "video":
      return PlayCircle;
    default:
      return Trophy;
  }
}

export function getLevelMeta(level?: string) {
  switch (level) {
    case "L1":
      return { label: "Junior Starter", progress: 20 };
    case "L2":
      return { label: "Starter", progress: 40 };
    case "L3":
      return { label: "Mover", progress: 60 };
    case "L4":
      return { label: "Flyer", progress: 80 };
    case "L5":
      return { label: "Master Explorer", progress: 100 };
    case "L0":
    default:
      return { label: "Pré-K Explorer", progress: 70 };
  }
}

export function getBookingHeadline(booking: UnifiedBooking) {
  return booking.displayType === "FREE_TRIAL"
    ? "L'aventure TaraKid commence !"
    : "Prêt pour votre prochain cours ?";
}

export function buildParentStats(stats: {
  credits: number;
  booked: number;
  finished: number;
  missing: number;
  late: number;
}): ParentDashboardStat[] {
  return [
    {
      key: "credits",
      label: "Crédits disponibles",
      hint: "Cours achetés non encore réservés",
      value: stats.credits,
      accent: "gold",
      icon: Zap,
    },
    {
      key: "booked",
      label: "Cours réservés",
      hint: "Séances planifiées à venir",
      value: stats.booked,
      accent: "blue",
      icon: BookOpen,
    },
    {
      key: "finished",
      label: "Cours terminés",
      hint: "Séances déjà effectuées",
      value: stats.finished,
      accent: "turquoise",
      icon: Trophy,
    },
    {
      key: "missing",
      label: "Cours manqués",
      hint: "Aucune entrée en classe pendant 30 min",
      value: stats.missing,
      accent: "orange",
      icon: Clock3,
    },
    {
      key: "late",
      label: "Cours en retard",
      hint: "Entrée après le début du cours",
      value: stats.late,
      accent: "blue",
      icon: Calendar,
    },
  ];
}

export function buildParentSidebarItems({
  onDashboard,
  onSchedule,
  onHistory,
  onActivities,
  onSettings,
}: {
  onDashboard: () => void;
  onSchedule: () => void;
  onHistory: () => void;
  onActivities: () => void;
  onSettings: () => void;
}): ParentSidebarItem[] {
  return [
    { label: "Accueil", icon: Home, active: true, onClick: onDashboard },
    { label: "Emploi du temps", icon: Calendar, onClick: onSchedule },
    { label: "Progrès", icon: BookOpen, onClick: onHistory },
    { label: "Activités", icon: Gamepad2, onClick: onActivities },
    { label: "Historique", icon: History, onClick: onHistory },
    { label: "Messages", icon: MessageCircle, disabled: true, badge: "Bientôt" },
    { label: "Profil", icon: UserCircle2, onClick: onSettings },
    { label: "Réglages", icon: Settings, onClick: onSettings },
  ];
}

export function buildParentQuickActions({
  onSubscription,
  onSchedule,
}: {
  onSubscription: () => void;
  onSchedule: () => void;
}): ParentQuickAction[] {
  return [
    {
      eyebrow: "Abonnement",
      title: "Recharger",
      description: "Ajoutez des crédits rapidement.",
      accent: "gold",
      onClick: onSubscription,
    },
    {
      eyebrow: "Planning",
      title: "Voir",
      description: "Consultez et organisez vos cours.",
      accent: "blue",
      onClick: onSchedule,
    },
  ];
}

export function getSupportItems() {
  return [
    { label: "Navigateur", icon: HelpCircle },
    { label: "Caméra", icon: Calendar },
    { label: "Microphone", icon: MessageCircle },
  ];
}

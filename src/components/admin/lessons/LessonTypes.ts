import {
  type KidLevel,
  type CreateLessonDto,
  type CreateUnitDto,
  type Unit,
  type LessonType,
  type Lesson,
} from "../../../services/admin.service";

export type Tab = "create" | "bulk" | "unit" | "lessons";

export const LEVELS: KidLevel[] = ["L0", "L1", "L2", "L3", "L4", "L5"];

export const LESSON_TYPES: { value: LessonType; label: string }[] = [
  { value: "genially", label: "Genially" },
  { value: "pdf", label: "PDF" },
  { value: "video", label: "Vidéo" },
];

export const LEVEL_COLORS: Record<string, string> = {
  L0: "#94a3b8",
  L1: "var(--color-lightBlue)",
  L2: "var(--color-blue)",
  L3: "var(--color-teal)",
  L4: "var(--color-orange)",
  L5: "var(--color-gold)",
};

export const LEVEL_BG: Record<string, string> = {
  L0: "rgba(148,163,184,0.12)",
  L1: "rgba(76,201,240,0.12)",
  L2: "rgba(33,158,188,0.12)",
  L3: "rgba(0,128,128,0.12)",
  L4: "rgba(247,127,0,0.12)",
  L5: "rgba(239,191,4,0.12)",
};

export const blue = "var(--color-blue)";
export const teal = "var(--color-teal)";
export const gold = "var(--color-gold)";

export const labelCls =
  "block text-[9px] font-black uppercase tracking-[0.18em] mb-1.5";
export const inputCls =
  "w-full border border-slate-200 text-navy rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none transition-colors placeholder-slate-300";

export type {
  Unit,
  Lesson,
  CreateLessonDto,
  CreateUnitDto,
  KidLevel,
  LessonType,
};

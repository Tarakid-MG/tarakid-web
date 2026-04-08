import {
  type CreateTeacherDto,
  type User,
} from "../../../services/admin.service";

export type Tab = "create" | "list";

export const navy = "var(--color-navy)";
export const blue = "var(--color-blue)";
export const deepBlue = "var(--color-deepBlue)";

export const labelCls =
  "block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-1.5";
export const inputCls =
  "w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm font-medium text-navy focus:outline-none focus:border-blue/50 transition-colors placeholder-navy/30";

export type { CreateTeacherDto, User };

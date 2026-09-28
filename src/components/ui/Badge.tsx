import React from "react";

type BadgeVariant =
  | "default"
  | "soft"
  | "blue"
  | "orange"
  | "yellow"
  | "teal"
  | "success";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:
    "border border-slate-200 bg-white text-navy shadow-sm",
  soft:
    "border border-slate-100 bg-slate-50 text-navy shadow-sm",
  blue:
    "border-2 border-slate-100 bg-white text-blue shadow-sm",
  orange:
    "border-2 border-white bg-white text-orange shadow-[0_10px_22px_rgba(32,42,68,0.08)]",
  yellow:
    "border-2 border-white bg-yellow text-navy shadow-[0_12px_24px_rgba(239,191,4,0.16)]",
  teal:
    "border-2 border-white bg-turquoise/12 text-teal shadow-sm",
  success:
    "border border-[#7AE582]/50 bg-[#E9FFEF] text-[#2B9348] shadow-sm",
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  className = "",
  variant = "default",
}) => (
  <div
    className={[
      "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.18em]",
      variantClasses[variant],
      className,
    ].join(" ")}
  >
    {children}
  </div>
);

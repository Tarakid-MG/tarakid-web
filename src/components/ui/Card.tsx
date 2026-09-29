import React from "react";

export type CardVariant =
  | "default"
  | "soft"
  | "blue"
  | "navy"
  | "parentPanel"
  | "kidGlass"
  | "kidSection"
  | "kidCard";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: CardVariant;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const cardVariantClasses: Record<CardVariant, string> = {
  default: "rounded-2xl border border-slate-200 bg-white text-navy shadow-sm",
  soft: "rounded-2xl border border-slate-200 bg-beige/40 text-navy shadow-sm",
  blue: "rounded-2xl border border-blue bg-blue text-white shadow-lg shadow-blue/20",
  navy: "rounded-2xl border border-navy bg-navy text-white shadow-lg shadow-navy/20",
  parentPanel:
    "rounded-[1.85rem] border border-white/90 bg-white/92 text-navy shadow-[0_18px_44px_rgba(32,42,68,0.07)] ring-1 ring-slate-900/2 backdrop-blur-xl",
  kidGlass:
    "rounded-[2.6rem] border-[3px] border-white bg-white/96 text-navy shadow-[0_16px_40px_rgba(31,92,153,0.14)]",
  kidSection:
    "rounded-[2.8rem] border-[3px] border-white bg-white/96 text-navy shadow-[0_16px_40px_rgba(31,92,153,0.14)]",
  kidCard:
    "rounded-[2rem] border-[3px] border-white bg-white text-navy shadow-[0_12px_28px_rgba(32,42,68,0.10)]",
};

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  variant = "default",
  onClick,
}) => {
  const clickable = onClick
    ? "cursor-pointer transition hover:-translate-y-[1px] hover:shadow-md"
    : "";

  return (
    <div
      className={[cardVariantClasses[variant], clickable, className].join(" ")}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, right, className = "" }) => (
  <div className={`flex items-start justify-between gap-4 ${className}`}>
    <div className="min-w-0">
      <div className="text-base leading-tight font-semibold">{title}</div>
      {subtitle ? <div className="mt-1 text-sm opacity-80">{subtitle}</div> : null}
    </div>
    {right ? <div className="shrink-0">{right}</div> : null}
  </div>
);

export const CardSection: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => <div className={`mt-4 ${className}`}>{children}</div>;

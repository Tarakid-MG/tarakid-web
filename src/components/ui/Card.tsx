import React from "react";

type CardVariant = "default" | "soft" | "blue" | "navy";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: CardVariant;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const variants: Record<CardVariant, string> = {
  default: "bg-white text-navy border border-slate-200 shadow-sm",
  soft: "bg-beige/40 text-navy border border-slate-200 shadow-sm",
  blue: "bg-blue text-white border border-blue shadow-lg shadow-blue/20",
  navy: "bg-navy text-white border border-navy shadow-lg shadow-navy/20",
};

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  variant = "default",
  onClick,
}) => {
  const clickable = onClick
    ? "cursor-pointer hover:shadow-md hover:-translate-y-[1px] transition"
    : "";

  return (
    <div className={`${variants[variant]} rounded-2xl ${clickable} ${className}`} onClick={onClick}>
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
      <div className="font-semibold text-base leading-tight">{title}</div>
      {subtitle ? <div className="text-sm opacity-80 mt-1">{subtitle}</div> : null}
    </div>
    {right ? <div className="shrink-0">{right}</div> : null}
  </div>
);

export const CardSection: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => <div className={`mt-4 ${className}`}>{children}</div>;

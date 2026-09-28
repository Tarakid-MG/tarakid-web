import React from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "inverse"
  | "danger"
  | "parentOutlineBlue"
  | "parentOutlineOrange"
  | "parentOutlineRed"
  | "classroomControl"
  | "classroomControlActive"
  | "classroomControlDanger"
  | "kidBlue"
  | "kidOrange"
  | "kidYellow"
  | "kidTeal"
  | "kidWhiteIcon"
  | "kidAccentIcon";

export type ButtonSize =
  | "sm"
  | "md"
  | "lg"
  | "iconSm"
  | "iconMd"
  | "iconLg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

export const buttonBaseClass =
  "inline-flex items-center justify-center gap-2 font-black transition-all disabled:opacity-70 disabled:cursor-not-allowed";

export const buttonSizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm rounded-2xl",
  md: "px-6 py-3 text-base rounded-2xl",
  lg: "px-8 py-4 text-lg rounded-2xl",
  iconSm: "h-11 w-11 rounded-[1.1rem]",
  iconMd: "h-14 w-14 rounded-[1.3rem]",
  iconLg: "h-16 w-16 rounded-[1.9rem]",
};

export const buttonVariantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-2 border-[#c96500] bg-orange text-white shadow-[0_4px_0_#c96500] hover:translate-y-[2px] hover:shadow-[0_2px_0_#c96500] active:translate-y-[4px] active:shadow-none",
  secondary:
    "border-2 border-[#1a7fa3] bg-blue text-white shadow-[0_4px_0_#1a7fa3] hover:translate-y-[2px] hover:shadow-[0_2px_0_#1a7fa3] active:translate-y-[4px] active:shadow-none",
  outline:
    "border-2 border-beige bg-transparent text-navy hover:bg-beige/20 hover:border-navy/20 active:translate-y-[2px]",
  ghost:
    "border-2 border-transparent bg-transparent text-navy hover:bg-slate-100 active:translate-y-[2px]",
  inverse: "border-2 border-white bg-white text-blue shadow-lg hover:bg-blue-50",
  danger:
    "border-2 border-red-500 bg-red-500 text-white shadow-lg shadow-red-200 hover:bg-red-600 hover:border-red-600 active:translate-y-[2px]",
  parentOutlineBlue:
    "border-2 border-blue/20 bg-transparent text-blue hover:bg-blue/6 active:translate-y-[2px]",
  parentOutlineOrange:
    "border-2 border-orange/30 bg-transparent text-orange hover:bg-orange/10 active:translate-y-[2px]",
  parentOutlineRed:
    "border-2 border-red-300 bg-transparent text-red-500 hover:bg-red-50 active:translate-y-[2px]",
  classroomControl:
    "border-2 border-slate-100 bg-white text-slate-500 shadow-md hover:bg-slate-50 active:scale-95",
  classroomControlActive:
    "border-2 border-transparent bg-blue text-white shadow-md shadow-blue/20 active:scale-95",
  classroomControlDanger:
    "border-2 border-transparent bg-red-500 text-white shadow-md shadow-red-200 hover:bg-red-600 active:scale-95",
  kidBlue:
    "rounded-full border-2 border-white bg-blue text-white shadow-[0_10px_24px_rgba(15,143,234,0.22)] hover:-translate-y-0.5 active:translate-y-0",
  kidOrange:
    "rounded-full border-2 border-white bg-orange text-white shadow-[0_10px_24px_rgba(247,127,0,0.22)] hover:-translate-y-0.5 active:translate-y-0",
  kidYellow:
    "rounded-full border-2 border-white bg-yellow text-navy shadow-[0_10px_24px_rgba(239,191,4,0.22)] hover:-translate-y-0.5 active:translate-y-0",
  kidTeal:
    "rounded-full border-2 border-white bg-teal text-white shadow-[0_10px_24px_rgba(0,128,128,0.22)] hover:-translate-y-0.5 active:translate-y-0",
  kidWhiteIcon:
    "border-[3px] border-white bg-white text-navy shadow-[0_12px_24px_rgba(32,42,68,0.10)] hover:-translate-y-0.5 active:translate-y-0",
  kidAccentIcon:
    "shrink-0 border-[3px] border-white bg-white shadow-[0_10px_22px_rgba(32,42,68,0.10)] hover:-translate-y-0.5 active:translate-y-0",
};

export const getButtonClasses = (
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  fullWidth = false,
  className = "",
) =>
  [
    buttonBaseClass,
    buttonSizeClasses[size],
    buttonVariantClasses[variant],
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  children,
  className = "",
  disabled,
  ...props
}) => (
  <button
    className={getButtonClasses(variant, size, fullWidth, className)}
    disabled={disabled || loading}
    {...props}
  >
    {loading ? (
      <svg
        className="h-5 w-5 animate-spin text-current"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    ) : (
      children
    )}
  </button>
);

import type { ReactNode, TextareaHTMLAttributes } from "react";

type BaseFieldProps = {
  label: string;
  icon: ReactNode;
  value: string | number;
  onChange: (value: string) => void;
  className?: string;
};

type InputFieldProps = BaseFieldProps & {
  type?: string;
  placeholder?: string;
};

export function SettingsInputField({
  label,
  icon,
  value,
  onChange,
  type = "text",
  placeholder,
  className,
}: InputFieldProps) {
  return (
    <div className="space-y-2">
      <label className="ml-1 text-sm font-black text-navy/70">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/32">
          {icon}
        </div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={[
            "w-full rounded-[1.35rem] border border-slate-100 bg-linear-to-r from-slate-50 to-white py-3.5 pl-12 pr-4 font-bold text-navy outline-none transition focus:bg-white",
            className || "",
          ].join(" ")}
        />
      </div>
    </div>
  );
}

type TextAreaFieldProps = BaseFieldProps &
  Pick<TextareaHTMLAttributes<HTMLTextAreaElement>, "rows" | "placeholder">;

export function SettingsTextAreaField({
  label,
  icon,
  value,
  onChange,
  rows = 3,
  placeholder,
  className,
}: TextAreaFieldProps) {
  return (
    <div className="space-y-2">
      <label className="ml-1 text-sm font-black text-navy/70">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-4 text-navy/32">{icon}</div>
        <textarea
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={[
            "w-full resize-none rounded-[1.35rem] border border-slate-100 bg-linear-to-r from-slate-50 to-white py-3.5 pl-12 pr-4 font-bold text-navy outline-none transition focus:bg-white",
            className || "",
          ].join(" ")}
        />
      </div>
    </div>
  );
}

import React from "react";
import { Check, Calendar as CalendarIcon } from "lucide-react";

interface StatPillsProps {
  editMode: boolean;
  savedCount: number;
  sessionCount: number;
}

export const StatPills: React.FC<StatPillsProps> = ({
  editMode,
  savedCount,
  sessionCount,
}) => {
  if (editMode) return null;

  const pills = [
    {
      icon: <Check className="w-3.5 h-3.5" />,
      label: "Disponibilités",
      value: savedCount,
      color: "var(--color-teal)",
      bg: "rgba(0,128,128,0.08)",
      border: "rgba(0,128,128,0.2)",
    },
    {
      icon: <CalendarIcon className="w-3.5 h-3.5" />,
      label: "Cours à venir",
      value: sessionCount,
      color: "var(--color-blue)",
      bg: "rgba(33,158,188,0.08)",
      border: "rgba(33,158,188,0.2)",
    },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {pills.map((pill, i) => (
        <div
          key={i}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border text-sm"
          style={{
            background: pill.bg,
            color: pill.color,
            borderColor: pill.border,
          }}
        >
          {pill.icon}
          <span className="font-black">{pill.value}</span>
          <span className="font-semibold opacity-70 text-xs uppercase tracking-wide">
            {pill.label}
          </span>
        </div>
      ))}
    </div>
  );
};

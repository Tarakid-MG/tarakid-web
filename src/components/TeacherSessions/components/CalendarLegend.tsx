import React from "react";

interface CalendarLegendProps {
  editMode: boolean;
}

export const CalendarLegend: React.FC<CalendarLegendProps> = ({ editMode }) => {
  const legendItems = [
    {
      bg: "rgba(33,158,188,0.12)",
      border: "#219EBC",
      label: "Cours à venir",
    },
    {
      bg: "rgba(16, 185, 129, 0.12)",
      border: "#10b981",
      label: "Terminé (passé)",
    },
    {
      bg: "rgba(100,116,139,0.1)",
      border: "#64748b",
      label: "Annulé / Reporté (passé)",
    },
    {
      bg: "rgba(239,68,68,0.08)",
      border: "#ef4444",
      label: "Manqué / Absent (passé)",
    },
    {
      bg: "rgba(255,183,3,0.12)",
      border: "#FB8500",
      label: "Essai Gratuit",
    },
    {
      bg: "rgba(0,128,128,0.08)",
      border: "rgba(0,128,128,0.4)",
      label: "Disponible",
    },
    ...(editMode
      ? [
          {
            bg: "linear-gradient(135deg, rgba(255,190,11,0.22) 0%, rgba(255,150,0,0.14) 100%)",
            border: "rgba(255,190,11,0.7)",
            label: "Sélectionné (en attente)",
          },
        ]
      : []),
    {
      bg: "repeating-linear-gradient(135deg, #fff5f5 0px, #fff5f5 5px, #fde8e8 5px, #fde8e8 10px)",
      border: "#fca5a5",
      label: editMode ? "Non disponible (défaut)" : "Non disponible",
    },
    {
      bg: "repeating-linear-gradient(135deg, #fff5f5 0px, #fff5f5 4px, #ffe0e0 4px, #ffe0e0 8px)",
      border: "#fca5a5",
      label: "Bloqué vendredi 18h – samedi 18h (Sabbath Day)",
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      {legendItems.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded"
            style={{
              background: item.bg,
              border: `2px solid ${item.border}`,
            }}
          />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};

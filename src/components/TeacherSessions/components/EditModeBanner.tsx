import React from "react";
import { Info, CheckSquare } from "lucide-react";

interface EditModeBannerProps {
  editMode: boolean;
  selectAllVisible: () => void;
  pendingCount: number;
}

export const EditModeBanner: React.FC<EditModeBannerProps> = ({
  editMode,
  selectAllVisible,
  pendingCount,
}) => {
  if (!editMode) return null;

  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 rounded-2xl"
      style={{
        background: "rgba(239,191,4,0.06)",
        border: "1.5px solid rgba(239,191,4,0.3)",
      }}
    >
      <div className="flex items-start gap-3 flex-1">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: "rgba(239,191,4,0.15)" }}
        >
          <Info className="w-4 h-4" style={{ color: "var(--color-gold)" }} />
        </div>
        <p
          className="text-sm font-medium"
          style={{ color: "var(--color-navy)" }}
        >
          <span className="font-black" style={{ color: "var(--color-gold)" }}>
            Mode édition activé —
          </span>{" "}
          <span className="text-slate-600">
            Cliquez ou{" "}
            <strong style={{ color: "var(--color-navy)" }}>glissez</strong> sur
            les créneaux pour les sélectionner. Cliquez sur un{" "}
            <strong style={{ color: "var(--color-navy)" }}>jour</strong> pour
            tout cocher / décocher d'un coup.
          </span>
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
        <button
          onClick={selectAllVisible}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all hover:opacity-80"
          style={{
            background: "rgba(239,191,4,0.15)",
            color: "var(--color-gold)",
          }}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          Tout sélectionner
        </button>
        <div
          className="px-3 py-1.5 rounded-xl text-xs font-black"
          style={{
            background: "rgba(239,191,4,0.12)",
            color: "var(--color-gold)",
          }}
        >
          {pendingCount} sélectionné{pendingCount !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
};

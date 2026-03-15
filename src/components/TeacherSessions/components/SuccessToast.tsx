import React from "react";
import { Zap } from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale/fr";
import type { Scope } from "../types";

interface SuccessToastProps {
  saveSuccess: boolean;
  savedScope: Scope | null;
}

export const SuccessToast: React.FC<SuccessToastProps> = ({
  saveSuccess,
  savedScope,
}) => {
  if (!saveSuccess || !savedScope) return null;

  return (
    <div
      className="flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold"
      style={{
        background: "rgba(0,128,128,0.08)",
        border: "1.5px solid rgba(0,128,128,0.25)",
        color: "var(--color-teal)",
      }}
    >
      <div
        className="w-7 h-7 rounded-xl flex items-center justify-center"
        style={{ background: "rgba(0,128,128,0.12)" }}
      >
        <Zap className="w-4 h-4" />
      </div>
      <span>
        Disponibilités enregistrées avec succès —{" "}
        {savedScope.type === "permanent" ? (
          <span>applicables toute l'année.</span>
        ) : (
          <span>
            du{" "}
            <strong>
              {format(parseISO(savedScope.startDate!), "dd MMM yyyy", {
                locale: fr,
              })}
            </strong>{" "}
            au{" "}
            <strong>
              {format(parseISO(savedScope.endDate!), "dd MMM yyyy", {
                locale: fr,
              })}
            </strong>
            .
          </span>
        )}
      </span>
    </div>
  );
};

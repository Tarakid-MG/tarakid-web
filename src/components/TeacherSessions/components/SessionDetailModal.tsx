import React from "react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale/fr";
import {
  X,
  BookOpen,
  User,
  Calendar as CalendarIcon,
  Clock,
} from "lucide-react";
import type { Session } from "../types";

interface SessionDetailModalProps {
  session: Session;
  onClose: () => void;
}

export const SessionDetailModal: React.FC<SessionDetailModalProps> = ({
  session,
  onClose,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ background: "rgba(32,42,68,0.6)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
        style={{ animation: "fadeUp 0.2s ease" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="px-8 pt-8 pb-6 relative overflow-hidden"
          style={{ background: "var(--color-navy)" }}
        >
          <div
            className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none"
            style={{
              background: "var(--color-blue)",
              opacity: 0.1,
              filter: "blur(40px)",
            }}
          />
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl transition-colors"
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-4 relative z-10">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: "rgba(33,158,188,0.2)",
                border: "1px solid rgba(33,158,188,0.3)",
              }}
            >
              <BookOpen
                className="w-7 h-7"
                style={{ color: "var(--color-lightBlue)" }}
              />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">
                Détails du cours
              </h3>
              <p
                className="text-sm font-medium mt-0.5"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                {session.type === "FREE_TRIAL"
                  ? "Essai Gratuit"
                  : "Cours d'Anglais Standard"}
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-4">
          {[
            {
              icon: (
                <User
                  className="w-5 h-5"
                  style={{ color: "var(--color-blue)" }}
                />
              ),
              label: "Élève",
              value: session.kid.name,
            },
            {
              icon: (
                <CalendarIcon
                  className="w-5 h-5"
                  style={{ color: "var(--color-blue)" }}
                />
              ),
              label: "Date",
              value: format(
                parseISO(session.sessionDate),
                "EEEE dd MMMM yyyy",
                {
                  locale: fr,
                },
              ),
            },
            {
              icon: (
                <Clock
                  className="w-5 h-5"
                  style={{ color: "var(--color-blue)" }}
                />
              ),
              label: "Horaire",
              value: `${session.startTime.substring(0, 5)} – ${session.endTime.substring(0, 5)}`,
            },
            {
              icon: (
                <User
                  className="w-5 h-5"
                  style={{ color: "var(--color-blue)" }}
                />
              ),
              label: "Âge",
              value: `${session.kid.age} ans`,
            },
            {
              icon: (
                <BookOpen
                  className="w-5 h-5"
                  style={{ color: "var(--color-blue)" }}
                />
              ),
              label: "Niveau",
              value: session.kid.level,
            },
          ].map((row, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 rounded-2xl border"
              style={{ background: "#f8fafc", borderColor: "#f1f5f9" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(33,158,188,0.1)" }}
              >
                {row.icon}
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
                  {row.label}
                </p>
                <p
                  className="font-bold text-sm capitalize"
                  style={{ color: "var(--color-navy)" }}
                >
                  {row.value}
                </p>
              </div>
            </div>
          ))}

          <button
            onClick={onClose}
            className="w-full mt-2 py-4 rounded-2xl font-black text-white text-sm transition-all active:scale-95"
            style={{
              background: "var(--color-blue)",
              boxShadow: "0 6px 20px rgba(33,158,188,0.3)",
            }}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

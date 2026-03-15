import React, { useState } from "react";
import { format } from "date-fns";
import {
  X,
  CalendarRange,
  Infinity as InfinityIcon,
  Check,
  ArrowRight,
  Save,
} from "lucide-react";
import type { ScopeType } from "../types";

interface ScopeModalProps {
  onConfirm: (scope: {
    type: ScopeType;
    startDate?: string;
    endDate?: string;
  }) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export const ScopeModal: React.FC<ScopeModalProps> = ({
  onConfirm,
  onCancel,
  isSaving,
}) => {
  const [scopeType, setScopeType] = useState<ScopeType>("permanent");
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (scopeType === "range") {
      if (!startDate || !endDate) {
        setError("Veuillez sélectionner une date de début et de fin.");
        return;
      }
      if (endDate <= startDate) {
        setError("La date de fin doit être après la date de début.");
        return;
      }
    }
    setError("");
    onConfirm({
      type: scopeType,
      startDate: scopeType === "range" ? startDate : undefined,
      endDate: scopeType === "range" ? endDate : undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ background: "rgba(32,42,68,0.65)" }}
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
        style={{ animation: "fadeUp 0.22s ease" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-8 pt-8 pb-6 relative overflow-hidden"
          style={{ background: "var(--color-navy)" }}
        >
          <div
            className="absolute -top-8 -right-8 w-48 h-48 rounded-full pointer-events-none"
            style={{
              background: "var(--color-blue)",
              opacity: 0.1,
              filter: "blur(40px)",
            }}
          />
          <button
            onClick={onCancel}
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
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{
                background: "rgba(0,128,128,0.25)",
                border: "1px solid rgba(0,128,128,0.4)",
              }}
            >
              <CalendarRange className="w-7 h-7" style={{ color: "#5eead4" }} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">
                Durée des disponibilités
              </h3>
              <p
                className="text-sm font-medium mt-0.5"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                Ces horaires s'appliquent sur quelle période ?
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 space-y-4">
          {/* Option: Permanent */}
          <button
            onClick={() => setScopeType("permanent")}
            className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all"
            style={{
              borderColor:
                scopeType === "permanent" ? "var(--color-teal)" : "#e2e8f0",
              background:
                scopeType === "permanent" ? "rgba(0,128,128,0.05)" : "#f8fafc",
            }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background:
                  scopeType === "permanent"
                    ? "rgba(0,128,128,0.12)"
                    : "#f1f5f9",
              }}
            >
              <InfinityIcon
                className="w-5 h-5"
                style={{
                  color:
                    scopeType === "permanent" ? "var(--color-teal)" : "#94a3b8",
                }}
              />
            </div>
            <div className="flex-1">
              <p
                className="font-black text-sm"
                style={{
                  color:
                    scopeType === "permanent"
                      ? "var(--color-teal)"
                      : "var(--color-navy)",
                }}
              >
                Permanent — toute l'année
              </p>
              <p className="text-xs font-medium text-slate-400 mt-0.5">
                Ces disponibilités s'appliquent indéfiniment, semaine après
                semaine.
              </p>
            </div>
            <div
              className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
              style={{
                borderColor:
                  scopeType === "permanent" ? "var(--color-teal)" : "#cbd5e1",
                background:
                  scopeType === "permanent"
                    ? "var(--color-teal)"
                    : "transparent",
              }}
            >
              {scopeType === "permanent" && (
                <Check className="w-2.5 h-2.5 text-white" />
              )}
            </div>
          </button>

          {/* Option: Date range */}
          <button
            onClick={() => setScopeType("range")}
            className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all"
            style={{
              borderColor:
                scopeType === "range" ? "var(--color-blue)" : "#e2e8f0",
              background:
                scopeType === "range" ? "rgba(33,158,188,0.05)" : "#f8fafc",
            }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background:
                  scopeType === "range" ? "rgba(33,158,188,0.12)" : "#f1f5f9",
              }}
            >
              <CalendarRange
                className="w-5 h-5"
                style={{
                  color:
                    scopeType === "range" ? "var(--color-blue)" : "#94a3b8",
                }}
              />
            </div>
            <div className="flex-1">
              <p
                className="font-black text-sm"
                style={{
                  color:
                    scopeType === "range"
                      ? "var(--color-blue)"
                      : "var(--color-navy)",
                }}
              >
                Période définie
              </p>
              <p className="text-xs font-medium text-slate-400 mt-0.5">
                Choisissez une date de début et de fin pour cette configuration.
              </p>
            </div>
            <div
              className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
              style={{
                borderColor:
                  scopeType === "range" ? "var(--color-blue)" : "#cbd5e1",
                background:
                  scopeType === "range" ? "var(--color-blue)" : "transparent",
              }}
            >
              {scopeType === "range" && (
                <Check className="w-2.5 h-2.5 text-white" />
              )}
            </div>
          </button>

          {/* Date pickers — shown only for range */}
          {scopeType === "range" && (
            <div
              className="flex flex-col sm:flex-row items-center gap-3 px-5 py-4 rounded-2xl"
              style={{
                background: "rgba(33,158,188,0.04)",
                border: "1.5px solid rgba(33,158,188,0.15)",
                animation: "fadeUp 0.15s ease",
              }}
            >
              <div className="flex-1 w-full">
                <label
                  className="block text-[9px] font-black uppercase tracking-widest mb-1.5"
                  style={{ color: "var(--color-blue)" }}
                >
                  Date de début
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setError("");
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm font-bold outline-none transition-all"
                  style={{
                    borderColor: "rgba(33,158,188,0.3)",
                    color: "var(--color-navy)",
                    background: "white",
                  }}
                  onFocus={(e) => {
                    (e.target as HTMLElement).style.borderColor =
                      "var(--color-blue)";
                  }}
                  onBlur={(e) => {
                    (e.target as HTMLElement).style.borderColor =
                      "rgba(33,158,188,0.3)";
                  }}
                />
              </div>

              <ArrowRight
                className="w-4 h-4 shrink-0 hidden sm:block"
                style={{
                  color: "var(--color-blue)",
                  opacity: 0.5,
                  marginTop: "20px",
                }}
              />

              <div className="flex-1 w-full">
                <label
                  className="block text-[9px] font-black uppercase tracking-widest mb-1.5"
                  style={{ color: "var(--color-blue)" }}
                >
                  Date de fin
                </label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setError("");
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm font-bold outline-none transition-all"
                  style={{
                    borderColor: "rgba(33,158,188,0.3)",
                    color: "var(--color-navy)",
                    background: "white",
                  }}
                  onFocus={(e) => {
                    (e.target as HTMLElement).style.borderColor =
                      "var(--color-blue)";
                  }}
                  onBlur={(e) => {
                    (e.target as HTMLElement).style.borderColor =
                      "rgba(33,158,188,0.3)";
                  }}
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-xs font-bold text-red-500 px-1">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onCancel}
              className="flex-1 py-3.5 rounded-2xl font-bold text-sm border transition-all hover:bg-slate-50"
              style={{ borderColor: "#e2e8f0", color: "#64748b" }}
            >
              Annuler
            </button>
            <button
              onClick={handleConfirm}
              disabled={isSaving}
              className="flex-1 py-3.5 rounded-2xl font-black text-sm text-white transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background:
                  scopeType === "permanent"
                    ? "var(--color-teal)"
                    : "var(--color-blue)",
                boxShadow:
                  scopeType === "permanent"
                    ? "0 4px 16px rgba(0,128,128,0.25)"
                    : "0 4px 16px rgba(33,158,188,0.25)",
              }}
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Enregistrement…" : "Confirmer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

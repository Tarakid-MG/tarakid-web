import React, { useState } from "react";
import { X, Send, AlertCircle } from "lucide-react";
import { type KidLevel } from "../../services/admin.service";

interface LevelChangeModalProps {
  kidName: string;
  newLevel: KidLevel;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isUpdating: boolean;
}

export const LevelChangeModal: React.FC<LevelChangeModalProps> = ({
  kidName,
  newLevel,
  onConfirm,
  onCancel,
  isUpdating,
}) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError("Veuillez fournir un motif pour ce changement.");
      return;
    }
    setError("");
    onConfirm(reason.trim());
  };

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-4 backdrop-blur-md"
      style={{ background: "rgba(32,42,68,0.7)" }}
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-blue" />
            </div>
            <div>
              <h3 className="text-lg font-black text-navy leading-tight">
                Motif du changement
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Niveau : {newLevel} • {kidName}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm font-medium text-slate-600 leading-relaxed">
            Pourquoi changez-vous le niveau de cet élève ? Ce motif sera
            enregistré dans l'historique d'audit.
          </p>

          <div className="relative">
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError("");
              }}
              placeholder="Ex: L'élève progresse vite, réévaluation après le cours..."
              className={`w-full bg-slate-50 border-2 rounded-2xl p-4 text-sm font-bold text-navy placeholder:text-slate-300 focus:ring-0 outline-none transition-all h-32 resize-none ${
                error
                  ? "border-red-200 bg-red-50/30"
                  : "border-slate-100 focus:border-blue/30"
              }`}
            />
            {error && (
              <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-1.5 flex items-center gap-1.5 ml-1">
                <AlertCircle className="w-3 h-3" />
                {error}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onCancel}
              className="flex-1 py-3.5 rounded-2xl font-bold text-sm text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleConfirm}
              disabled={isUpdating}
              className="flex-1 py-3.5 rounded-2xl font-black text-sm text-white bg-blue hover:opacity-90 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
            >
              {isUpdating ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Confirmer
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

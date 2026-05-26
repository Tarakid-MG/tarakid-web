import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const variantConfig = {
  danger: {
    iconBg: "bg-orange/15",
    iconColor: "text-orange",
    border: "border-orange/20",
    confirmBtn:
      "bg-orange hover:bg-orange/90 text-white shadow-[0_8px_18px_rgba(247,127,0,0.25)]",
  },
  warning: {
    iconBg: "bg-gold/15",
    iconColor: "text-gold",
    border: "border-gold/20",
    confirmBtn:
      "bg-gold hover:bg-gold/90 text-navy shadow-[0_8px_18px_rgba(239,191,4,0.25)]",
  },
  info: {
    iconBg: "bg-blue/12",
    iconColor: "text-blue",
    border: "border-blue/20",
    confirmBtn:
      "bg-blue hover:bg-deepBlue text-white shadow-[0_8px_18px_rgba(33,158,188,0.25)]",
  },
};

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  variant = "danger",
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!isOpen) return null;

  const cfg = variantConfig[variant];

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-navy/30 backdrop-blur-sm animate-in fade-in duration-200" />

      {/* Modal */}
      <div
        className="relative w-full max-w-md overflow-hidden rounded-4xl border border-white/70 bg-white shadow-[0_22px_64px_rgba(32,42,68,0.22)] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top_left,rgba(33,158,188,0.14),transparent_55%),radial-gradient(circle_at_top_right,rgba(239,191,4,0.14),transparent_45%)]" />

        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-xl text-navy/35 transition-colors hover:bg-beige/60 hover:text-navy"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative p-7">
          {/* Icon */}
          <div
            className={`mb-5 flex h-14 w-14 items-center justify-center rounded-[1.1rem] border ${cfg.border} ${cfg.iconBg} shadow-sm`}
          >
            <AlertTriangle className={`w-7 h-7 ${cfg.iconColor}`} />
          </div>

          {/* Text */}
          <h3 className="mb-2 text-xl font-black text-navy">{title}</h3>
          <p className="mb-7 text-sm leading-relaxed text-navy/60">{message}</p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 rounded-2xl border-2 border-beige px-4 py-3 text-sm font-bold text-navy/70 transition-all hover:border-blue/15 hover:bg-blue/5 disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition-all disabled:opacity-60 ${cfg.confirmBtn}`}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  En cours…
                </>
              ) : (
                confirmLabel
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

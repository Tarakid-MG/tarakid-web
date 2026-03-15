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
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    border: "border-red-100",
    confirmBtn:
      "bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-200",
  },
  warning: {
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    border: "border-orange-100",
    confirmBtn:
      "bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-200",
  },
  info: {
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    border: "border-blue-100",
    confirmBtn:
      "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200",
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
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-navy/40 hover:text-navy transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-7">
          {/* Icon */}
          <div
            className={`w-14 h-14 rounded-2xl ${cfg.iconBg} flex items-center justify-center mb-5 shadow-sm border ${cfg.border}`}
          >
            <AlertTriangle className={`w-7 h-7 ${cfg.iconColor}`} />
          </div>

          {/* Text */}
          <h3 className="text-navy font-bold text-xl mb-2">{title}</h3>
          <p className="text-navy/60 text-sm leading-relaxed mb-7">{message}</p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-2xl border-2 border-slate-200 text-navy/70 font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 py-3 px-4 rounded-2xl font-semibold text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2 ${cfg.confirmBtn}`}
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

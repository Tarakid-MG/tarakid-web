import { CheckCircle } from "lucide-react";

export function ScheduleSuccessAlert({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  return (
    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="relative overflow-hidden rounded-[1.8rem] border border-emerald-100 bg-emerald-50/92 p-5 shadow-[0_14px_32px_rgba(16,185,129,0.10)]">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-black text-emerald-900">C&apos;est fait !</h4>
            <p className="mt-1 text-sm font-medium leading-relaxed text-emerald-700/85">
              {message}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-emerald-600 transition hover:bg-emerald-100"
            title="Fermer"
          >
            <CheckCircle className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

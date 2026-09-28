import { CheckCircle } from "lucide-react";

export function SettingsSuccessAlert({ message }: { message: string }) {
  return (
    <div className="mb-6 mt-3 rounded-[1.6rem] border border-emerald-100 bg-emerald-50/95 p-4 text-green-700 shadow-[0_18px_34px_rgba(16,185,129,0.08)] animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100">
          <CheckCircle className="h-5 w-5 shrink-0" />
        </div>
        <p className="font-bold">{message}</p>
      </div>
    </div>
  );
}

export function SettingsErrorAlert({ message }: { message: string }) {
  return (
    <div className="mb-6 mt-3 rounded-[1.6rem] border border-red-100 bg-red-50/95 p-4 text-red-700 shadow-[0_18px_34px_rgba(239,68,68,0.08)] animate-in fade-in slide-in-from-top-2">
      <p className="font-bold">{message}</p>
    </div>
  );
}

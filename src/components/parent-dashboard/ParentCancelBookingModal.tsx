
import { X } from "lucide-react";
import { Button } from "../ui/Button";
import { ParentPanel } from "./ParentPanel";

export function ParentCancelBookingModal({
  open,
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/42 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md">
        <ParentPanel className="relative overflow-hidden p-6">
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-red-50" />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 text-navy/45 transition hover:bg-slate-50"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="relative">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-red-50 text-red-500">
              <X className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-black text-navy">Annuler le cours ?</h3>
            <p className="mt-3 text-base leading-7 text-navy/60">Vous pourrez toujours réserver un autre créneau plus tard.</p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="rounded-[1.2rem] border-blue/20 text-blue hover:bg-blue/6"
              >
                Garder
              </Button>
              <Button onClick={onConfirm} loading={loading} className="rounded-[1.2rem] bg-red-500 hover:bg-red-600">
                Oui, annuler
              </Button>
            </div>
          </div>
        </ParentPanel>
      </div>
    </div>
  );
}


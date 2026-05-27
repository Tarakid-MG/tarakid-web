import { Gift } from "lucide-react";
import { kidArt } from "./kidDashboardUtils";

export function KidRewardPanel({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-[2.5rem] border-4 border-white/85 bg-linear-to-br from-yellow/75 via-white to-gold/55 p-6 text-left shadow-[0_16px_42px_rgba(32,42,68,0.10)] hover:-translate-y-1 transition min-h-[215px]"
    >
      <div className="text-sm font-black uppercase tracking-[0.22em] text-navy">
        Ma récompense du jour
      </div>
      <div className="mt-5 flex items-center gap-5">
        <img src={kidArt.chest} alt="" className="h-32 w-32 object-contain kid-bob shrink-0" />
        <div className="flex-1">
          <div className="text-[1.65rem] font-black text-navy leading-tight">
            Ouvre ton coffre et découvre ta surprise !
          </div>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-linear-to-r from-yellow to-orange px-5 py-3 text-sm font-black text-navy shadow-[0_8px_0_rgba(247,127,0,0.26)]">
            <Gift className="w-4 h-4" />
            OUVRIR LE COFFRE
          </div>
        </div>
      </div>
    </button>
  );
}

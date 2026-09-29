import { Gift } from "lucide-react";
import { kidArt } from "./kidDashboardUtils";

export function KidRewardPanel({ unlocked = false }: { unlocked?: boolean }) {
  return (
    <div
      className={`kid-pop-in relative rounded-[2.5rem] border-4 border-white/85 bg-linear-to-br from-yellow/75 via-white to-gold/55 p-6 text-left shadow-[0_16px_42px_rgba(32,42,68,0.10)] transition min-h-[215px] ${
        unlocked ? "hover:-translate-y-1" : "saturate-[0.7] opacity-90"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-black uppercase tracking-[0.22em] text-navy">
          Ma récompense du jour
        </div>
        {!unlocked && (
          <span className="rounded-xl bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.1em] text-navy shadow-md shrink-0">
            Bientôt
          </span>
        )}
      </div>
      <div className="mt-5 flex items-center gap-5">
        <img
          src={kidArt.chest}
          alt=""
          className={`h-32 w-32 object-contain shrink-0 ${unlocked ? "kid-dance" : "kid-bob"}`}
        />
        <div className="flex-1">
          <div className="text-[1.65rem] font-black text-navy leading-tight">
            {unlocked
              ? "Ouvre ton coffre et découvre ta surprise !"
              : "Gagne des étoiles pour débloquer ton coffre !"}
          </div>
          <button
            type="button"
            disabled={!unlocked}
            className={`mt-5 inline-flex items-center gap-2 rounded-full bg-linear-to-r from-yellow to-orange px-5 py-3 text-sm font-black text-navy shadow-[0_8px_0_rgba(247,127,0,0.26)] disabled:cursor-not-allowed disabled:opacity-70 ${
              unlocked ? "kid-tap-bounce kid-glow-pulse" : ""
            }`}
          >
            <Gift className="w-4 h-4" />
            {unlocked ? "OUVRIR LE COFFRE" : "PAS ENCORE"}
          </button>
        </div>
      </div>
    </div>
  );
}

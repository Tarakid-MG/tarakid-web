import React from "react";
import { CalendarClock, LogOut, Sparkles, Star } from "lucide-react";

interface KidHeaderProps {
  selectedKid: {
    name: string;
    level?: string;
    avatarUrl?: string;
  };
  totalStars: number;
  loading: boolean;
  nextClassDate: string;
  onExit: () => void;
  onAvatarClick: () => void;
}

export const KidHeader: React.FC<KidHeaderProps> = ({
  selectedKid,
  totalStars,
  loading,
  nextClassDate,
  onExit,
  onAvatarClick,
}) => {
  return (
    <header className="max-w-7xl mx-auto w-full flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 md:gap-6 mb-8 relative z-50">
      <div className="kid-cloud-card relative overflow-hidden rounded-4xl border-4 border-white/80 bg-white/85 px-4 py-4 md:px-6 md:py-5 shadow-[0_14px_40px_rgba(32,42,68,0.16)] backdrop-blur-md">
        <div className="absolute -left-6 -top-6 h-20 w-20 rounded-full bg-lightBlue/25 blur-2xl" />
        <div className="absolute right-0 top-0 h-16 w-16 rounded-full bg-yellow/25 blur-2xl" />
        <div className="relative flex items-center gap-3 md:gap-4">
          <div className="h-14 w-14 rounded-[1.35rem] bg-linear-to-br from-blue to-lightBlue flex items-center justify-center overflow-hidden border-4 border-white shadow-[0_10px_0_rgba(29,111,163,0.35)] shrink-0">
            <img
              src="https://api.dicebear.com/7.x/bottts/svg?seed=owl"
              alt="Owl"
              className="w-full h-full"
            />
          </div>
          <div>
            <p className="inline-flex items-center gap-2 text-[11px] font-black text-blue uppercase tracking-[0.22em]">
              <CalendarClock className="w-4 h-4" />
              Prochain cours
            </p>
            <p className="mt-1 text-base md:text-lg font-black text-navy leading-tight">
              {loading ? "..." : nextClassDate}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:gap-5">
        <div className="kid-cloud-card rounded-4xl border-4 border-white/80 bg-white/85 p-4 shadow-[0_14px_40px_rgba(32,42,68,0.16)] backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-[1.35rem] bg-yellow flex items-center justify-center border-4 border-white shadow-[0_8px_0_rgba(239,191,4,0.45)]">
              <Star className="w-7 h-7 text-navy fill-current" />
            </div>
            <div>
              <p className="text-[11px] font-black text-navy/45 uppercase tracking-[0.22em]">
                Étoiles gagnées
              </p>
              <div className="flex items-end gap-2">
                <span className="text-3xl md:text-4xl font-black text-navy leading-none">
                  {totalStars}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-gold/20 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-orange">
                  <Sparkles className="w-3.5 h-3.5" />
                  Bravo
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="kid-cloud-card rounded-4xl border-4 border-white/80 bg-white/85 pl-5 pr-3 py-3 shadow-[0_14px_40px_rgba(32,42,68,0.16)] backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-xl font-black text-navy leading-none">
                {selectedKid.name}
              </span>
              <div className="mt-2 flex items-center gap-2">
                {selectedKid.level && (
                  <span className="rounded-full bg-blue/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-blue">
                    Niveau {selectedKid.level}
                  </span>
                )}
                <span className="rounded-full bg-orange/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-orange">
                  Super kid
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onAvatarClick}
              className="group relative h-16 w-16 rounded-full bg-linear-to-br from-orange/30 to-yellow/30 overflow-hidden border-4 border-white shadow-[0_8px_0_rgba(247,127,0,0.18)] shrink-0 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue/20"
              aria-label="Choisir un avatar"
            >
              <img
                src={
                  selectedKid.avatarUrl ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedKid.name}`
                }
                alt={selectedKid.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute inset-x-0 bottom-0 bg-navy/65 px-1 py-0.5 text-[8px] font-black uppercase tracking-[0.18em] text-white opacity-0 transition-opacity group-hover:opacity-100">
                Avatar
              </span>
            </button>
            <button
              onClick={onExit}
              className="h-12 w-12 rounded-2xl bg-navy/5 text-navy/45 hover:bg-red-50 hover:text-red-500 transition-all hover:-translate-y-0.5"
            >
              <LogOut className="w-5 h-5 mx-auto" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

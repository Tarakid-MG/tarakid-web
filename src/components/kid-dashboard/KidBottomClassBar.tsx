import { ArrowRight, PlayCircle } from "lucide-react";
import { kidArt } from "./kidDashboardUtils";

export function KidBottomClassBar({
  nextClassDate,
  lessonTitle,
  countdown,
  canEnter,
  onEnter,
}: {
  nextClassDate: string;
  lessonTitle?: string;
  countdown: string | null;
  canEnter: boolean;
  onEnter: () => void;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4 md:p-6">
      <div className="max-w-[1180px] mx-auto rounded-[2.8rem] border-4 border-white/85 bg-white/92 px-5 py-4 md:px-6 shadow-[0_-12px_42px_rgba(32,42,68,0.16)] backdrop-blur-xl overflow-hidden relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-2 bg-linear-to-r from-lightBlue via-blue to-yellow" />
        <div className="flex flex-col lg:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4 min-w-0">
            <div className="hidden md:flex h-20 w-20 rounded-[1.8rem] border-4 border-white bg-linear-to-br from-blue to-lightBlue shadow-[0_10px_0_rgba(29,111,163,0.30)] items-center justify-center shrink-0">
              <img src={kidArt.calendar} alt="" className="h-12 w-12 object-contain kid-float-slow" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-black uppercase tracking-[0.24em] text-blue">
                Prochain cours
              </div>
              <div className="mt-1 text-xl md:text-3xl font-black text-navy leading-tight">
                {nextClassDate}
              </div>
              {lessonTitle && (
                <div className="mt-1 text-sm font-medium text-navy/60">
                  Sois prêt(e) pour {lessonTitle}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            {countdown && !canEnter && (
              <div className="rounded-[1.4rem] bg-navy/5 px-4 py-3 text-center min-w-[120px]">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-navy/45">
                  Ouvre dans
                </div>
                <div className="mt-1 text-2xl font-black text-blue tabular-nums">
                  {countdown}
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={onEnter}
              disabled={!canEnter}
              className={[
                "rounded-full px-7 py-4 text-lg md:text-xl font-black flex items-center gap-3 transition",
                canEnter
                  ? "bg-linear-to-r from-blue to-lightBlue text-white shadow-[0_10px_0_rgba(29,111,163,0.30)] kid-glow-pulse"
                  : "bg-slate-200 text-navy/40 cursor-not-allowed shadow-[0_8px_0_rgba(148,163,184,0.20)]",
              ].join(" ")}
            >
              <PlayCircle className="w-6 h-6 fill-current" />
              {canEnter ? "ENTRER EN CLASSE" : "PORTAIL FERMÉ"}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

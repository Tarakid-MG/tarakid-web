import { ArrowRight, PlayCircle } from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
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
    <div className="fixed bottom-0 left-0 right-0 z-40 p-3 md:p-6">
      <Card
        variant="parentPanel"
        className="relative mx-auto max-w-[1180px] overflow-hidden rounded-[2rem] border-4 border-white/85 bg-white/92 px-4 py-3 md:rounded-[2.8rem] md:px-6 md:py-4 shadow-[0_-12px_42px_rgba(32,42,68,0.16)]"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-2 bg-linear-to-r from-lightBlue via-blue to-yellow" />
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-5">
          <div className="flex items-center gap-3 min-w-0 md:gap-4">
            <div className="hidden md:flex h-20 w-20 rounded-[1.8rem] border-4 border-white bg-linear-to-br from-blue to-lightBlue shadow-[0_10px_0_rgba(29,111,163,0.30)] items-center justify-center shrink-0">
              <img src={kidArt.calendar} alt="" className="h-12 w-12 object-contain kid-float-slow" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue md:text-[11px] md:tracking-[0.24em]">
                Prochain cours
              </div>
              <div className="mt-0.5 text-lg font-black text-navy leading-tight md:mt-1 md:text-3xl">
                {nextClassDate}
              </div>
              {lessonTitle && (
                <div className="mt-1 hidden text-sm font-medium text-navy/60 sm:block">
                  Sois prêt(e) pour {lessonTitle}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {countdown && !canEnter && (
              <div className="shrink-0 rounded-[1.1rem] bg-navy/5 px-3 py-2 text-center md:rounded-[1.4rem] md:px-4 md:py-3 md:min-w-[120px]">
                <div className="text-[9px] font-black uppercase tracking-[0.15em] text-navy/45 md:text-[10px] md:tracking-[0.2em]">
                  Ouvre dans
                </div>
                <div className="mt-0.5 text-lg font-black text-blue tabular-nums md:mt-1 md:text-2xl">
                  {countdown}
                </div>
              </div>
            )}
            <Button
              onClick={onEnter}
              disabled={!canEnter}
              variant={canEnter ? "kidBlue" : "ghost"}
              className={[
                "flex-1 rounded-full px-4 py-3 text-sm md:flex-initial md:px-7 md:py-4 md:text-xl",
                canEnter
                  ? "bg-linear-to-r from-blue to-lightBlue text-white shadow-[0_10px_0_rgba(29,111,163,0.30)] kid-glow-pulse"
                  : "bg-slate-200 text-navy/40 cursor-not-allowed shadow-[0_8px_0_rgba(148,163,184,0.20)]",
              ].join(" ")}
            >
              <PlayCircle className="w-5 h-5 shrink-0 fill-current md:w-6 md:h-6" />
              <span className="truncate">
                {canEnter ? "ENTRER EN CLASSE" : "PORTAIL FERMÉ"}
              </span>
              <ArrowRight className="w-4 h-4 shrink-0 md:w-5 md:h-5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

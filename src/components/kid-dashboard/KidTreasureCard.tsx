import { Sparkles, Star } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";

export function KidTreasureCard({
  totalStars,
  starsToNextGoal,
  progressPercent,
  nextClassDate,
}: {
  totalStars: number;
  starsToNextGoal: number;
  progressPercent: number;
  nextClassDate: string;
}) {
  return (
    <Card
      variant="parentPanel"
      className="kid-pop-in relative overflow-hidden rounded-[2.7rem] border-4 border-white/85 bg-white/92 p-6"
    >
      <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 rounded-full bg-yellow/20 blur-3xl" />
      <div className="pointer-events-none absolute left-0 bottom-0 h-24 w-24 rounded-full bg-lightBlue/18 blur-3xl" />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge
              variant="orange"
              className="bg-orange/10 px-3 py-1 tracking-[0.22em] shadow-none"
            >
              <Sparkles className="w-4 h-4" />
              Trésor d&apos;étoiles
            </Badge>
            <h3 className="mt-4 text-3xl font-black text-navy leading-tight">
              {totalStars} étoiles brillent pour toi !
            </h3>
            <p className="mt-3 text-base font-medium text-navy/65">
              Encore {starsToNextGoal} étoile{starsToNextGoal > 1 ? "s" : ""} pour
              débloquer ton prochain palier.
            </p>
          </div>

          <div className="kid-dance hidden sm:flex h-24 w-24 rounded-4xl bg-linear-to-br from-yellow to-gold border-4 border-white shadow-[0_10px_0_rgba(239,191,4,0.32)] items-center justify-center shrink-0">
            <Star className="w-11 h-11 text-navy fill-current" />
          </div>
        </div>

        <div className="mt-7">
          <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.22em] text-navy/48">
            <span>Barre magique</span>
            <span>{Math.round(progressPercent / 10)}/10</span>
          </div>
          <div className="mt-3 h-5 rounded-full bg-slate-200/75 overflow-hidden border border-white shadow-inner">
            <div
              className="kid-rainbow-shimmer h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.max(8, progressPercent)}%`,
                backgroundImage:
                  "linear-gradient(90deg, var(--color-yellow), var(--color-orange), var(--color-lightBlue), var(--color-orange), var(--color-yellow))",
              }}
            />
          </div>
        </div>

        <div className="mt-6 rounded-[1.8rem] border border-blue/10 bg-blue/6 px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.22em] text-blue">
              Prochaine aventure
            </div>
            <div className="mt-1 text-sm font-bold text-navy">{nextClassDate}</div>
          </div>
          <Badge
            variant="orange"
            className="bg-white px-4 py-2 text-xs tracking-[0.2em] shadow-sm"
          >
            Ready
          </Badge>
        </div>
      </div>
    </Card>
  );
}

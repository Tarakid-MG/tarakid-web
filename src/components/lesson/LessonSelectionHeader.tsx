import { ArrowLeft, BookOpen, Send, Star, X } from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

type LessonSelectionHeaderProps = {
  totalStars: number;
  progress: number;
  onBack: () => void;
  onClose: () => void;
};

export function LessonSelectionHeader({
  totalStars,
  progress,
  onBack,
  onClose,
}: LessonSelectionHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-t-[3rem] bg-linear-to-r from-blue via-deepBlue to-blue px-6 pb-16 pt-6 text-white md:px-8 md:pb-20 md:pt-7">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute left-[18%] top-0 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute right-[20%] top-4 h-24 w-24 rounded-full bg-lightBlue/18 blur-2xl" />
        <div className="absolute right-0 top-0 h-36 w-[55%] rounded-bl-[4rem] bg-white/6" />
      </div>

      <Button
        onClick={onClose}
        variant="inverse"
        size="iconMd"
        className="absolute right-5 top-5 rounded-full border-white shadow-[0_18px_36px_rgba(29,111,163,0.22)] hover:scale-105"
      >
        <X className="h-7 w-7" />
      </Button>

      <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex items-start gap-4">
          <Button
            onClick={onBack}
            variant="ghost"
            size="iconMd"
            className="mt-1 shrink-0 rounded-full border border-white/25 bg-white/14 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] backdrop-blur-sm hover:scale-105 hover:bg-white/20"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div className="flex h-18 w-18 shrink-0 items-center justify-center rounded-[1.8rem] border border-white/20 bg-white/14 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] backdrop-blur-sm">
            <BookOpen className="h-9 w-9" />
          </div>
          <div>
            <h2 className="text-4xl font-black italic tracking-[-0.04em] md:text-5xl">
              MES LEÇONS
            </h2>
            <p className="mt-2 text-sm font-black uppercase tracking-[0.08em] text-yellow md:text-xl">
              Choisis ton aventure du jour !
            </p>
          </div>
        </div>

        <div className="relative xl:min-w-[560px]">
          <div className="pointer-events-none absolute left-[-94px] top-[-10px] hidden text-white/90 xl:block">
            <Send className="h-12 w-12 rotate-12 drop-shadow-[0_10px_14px_rgba(0,0,0,0.14)]" />
            <div className="absolute left-10 top-8 h-14 w-28 rounded-full border-b-2 border-dashed border-white/70" />
          </div>

          <Card
            variant="default"
            className="rounded-[2rem] border-white/75 bg-white/96 p-4 text-navy shadow-[0_24px_60px_rgba(29,111,163,0.16)]"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-linear-to-br from-yellow via-gold to-orange text-white shadow-[0_16px_32px_rgba(247,181,0,0.24)]">
                  <Star className="h-9 w-9 fill-current" />
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.12em] text-blue">
                    Tes étoiles
                  </p>
                  <p className="text-5xl font-black tracking-[-0.05em] text-blue">
                    {totalStars}
                  </p>
                </div>
              </div>

              <div className="flex flex-1 items-center gap-4 rounded-[1.6rem] border border-slate-100 bg-slate-50/90 px-4 py-3 md:max-w-[320px]">
                <img
                  src="/images/kid/treasure-chest-3d.png"
                  alt=""
                  className="h-16 w-16 object-contain drop-shadow-[0_12px_18px_rgba(32,42,68,0.14)]"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-navy/75">
                    Encore 30 étoiles pour ton coffre !
                  </p>
                  <div className="mt-3 h-4 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-yellow via-gold to-lightBlue"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 overflow-hidden">
        <div className="absolute inset-x-[-4%] bottom-[-44px] h-24 rounded-[100%] bg-white" />
      </div>
    </div>
  );
}

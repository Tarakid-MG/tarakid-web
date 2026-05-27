import { PlayCircle } from "lucide-react";
import { kidArt } from "./kidDashboardUtils";

export function KidHeroQuestCard({
  kidName,
  level,
  lessonTitle,
  onClick,
}: {
  kidName: string;
  level: string;
  lessonTitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative w-full overflow-hidden rounded-[3rem] border-4 border-white bg-linear-to-br from-blue via-lightBlue to-deepBlue px-6 py-6 md:px-8 md:py-8 text-left shadow-[0_18px_0_rgba(29,111,163,0.32),0_34px_60px_rgba(33,158,188,0.30)] hover:-translate-y-1 transition"
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.12] bg-[radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] bg-size-[20px_20px]" />
      <div className="pointer-events-none absolute right-10 top-6 h-24 w-24 rounded-full bg-white/14 blur-xl" />
      <div className="pointer-events-none absolute left-10 bottom-6 h-20 w-20 rounded-full bg-turquoise/20 blur-xl" />

      <div className="relative">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-[1.7rem] border-4 border-white bg-white shadow-[0_8px_0_rgba(0,0,0,0.10)] flex items-center justify-center">
              <img src={kidArt.calendar} alt="" className="h-11 w-11 object-contain kid-float-slow" />
            </div>
            <div className="text-white">
              <div className="text-[11px] font-black uppercase tracking-[0.24em] text-white/85">
                Leçon du jour
              </div>
              <div className="mt-1 text-2xl md:text-4xl font-black leading-tight">
                {kidName}, prêt(e) pour jouer ?
              </div>
            </div>
          </div>

          <span className="hidden md:inline-flex rounded-full bg-white/16 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-white">
            {level}
          </span>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="flex justify-center md:justify-start">
            <img src={kidArt.magicHat} alt="" className="h-28 w-28 md:h-36 md:w-36 object-contain kid-bob" />
          </div>

          <div className="text-center">
            <div className="text-5xl md:text-7xl font-black text-white drop-shadow-[0_7px_0_rgba(0,0,0,0.16)] tracking-tight">
              MAGIC
            </div>
            <div className="mx-auto mt-3 inline-flex rounded-[1.7rem] bg-white px-5 py-3 text-2xl md:text-4xl font-black text-blue shadow-[0_10px_0_rgba(0,0,0,0.12)]">
              ACADEMY
            </div>
            <p className="mt-4 max-w-md text-sm md:text-lg font-bold text-white/92 mx-auto leading-relaxed">
              {lessonTitle} t&apos;attend. Découvre ta prochaine aventure, gagne
              des étoiles et avance dans ton monde d&apos;anglais.
            </p>

            <div className="mt-7 inline-flex items-center gap-3 rounded-full bg-linear-to-r from-yellow to-orange px-7 py-4 text-lg md:text-2xl font-black text-navy shadow-[0_12px_0_rgba(247,127,0,0.42)]">
              <PlayCircle className="w-7 h-7 fill-current" />
              JOUER LA LEÇON
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <img src={kidArt.book} alt="" className="h-24 w-24 md:h-32 md:w-32 object-contain kid-float-fast" />
          </div>
        </div>
      </div>
    </button>
  );
}

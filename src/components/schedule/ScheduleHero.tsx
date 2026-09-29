import { Zap } from "lucide-react";
import { Button } from "../ui/Button";
import { ParentKidAvatar, ParentPanel } from "../parent-dashboard";

type ScheduleHeroProps = {
  kidName: string;
  avatarSrc?: string;
  remainingCredits: number;
  onProfileClick: () => void;
  onReserveClick: () => void;
};

export function ScheduleHero({
  kidName,
  avatarSrc,
  remainingCredits,
  onProfileClick,
  onReserveClick,
}: ScheduleHeroProps) {
  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
      <div className="max-w-3xl">
        <h1 className="text-[1.8rem] font-black tracking-[-0.04em] text-navy md:text-[2.65rem] md:leading-[1.05]">
          Emploi du temps
          <span className="ml-2 text-blue">{kidName ? `de ${kidName}` : ""}</span>
        </h1>
        <p className="mt-3 text-[15px] leading-7 text-navy/60 md:text-base">
          Gérez les cours et rejoignez la classe en un clic.
        </p>
      </div>

      <div className="flex flex-col gap-4 xl:w-[480px]">
        <button
          type="button"
          onClick={onProfileClick}
          className="ml-auto w-full rounded-[1.7rem] border border-white/85 bg-white/90 p-3 text-left shadow-[0_18px_36px_rgba(32,42,68,0.08)] backdrop-blur-xl transition hover:-translate-y-0.5 xl:max-w-[210px]"
        >
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 overflow-hidden rounded-full border-4 border-white shadow-[0_10px_24px_rgba(32,42,68,0.12)]">
              <ParentKidAvatar
                kidName={kidName}
                avatarSrc={avatarSrc}
                className="h-full w-full"
                fallbackClassName="text-base font-black"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-lg font-black text-navy">{kidName}</div>
            </div>
          </div>
        </button>

        <ParentPanel className="overflow-hidden p-0">
          <div className="relative">
            <div className="absolute left-0 top-0 h-full w-1.5 rounded-l-[1.8rem] bg-gold" />
            <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-gold/12 text-orange shadow-[0_14px_28px_rgba(239,191,4,0.14)]">
                  <Zap className="h-7 w-7" />
                </div>
                <div>
                  <div className="text-sm font-bold uppercase tracking-[0.16em] text-navy/42">
                    Crédits restants
                  </div>
                  <div className="mt-1 text-[1.8rem] font-black leading-none tracking-[-0.04em] text-navy">
                    {remainingCredits}
                  </div>
                </div>
              </div>

              <Button onClick={onReserveClick} className="rounded-[1.1rem] px-7">
                Réserver
              </Button>
            </div>
          </div>
        </ParentPanel>
      </div>
    </div>
  );
}

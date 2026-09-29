import { ArrowRight, Calendar, ChevronDown, ChevronLeft, ChevronRight, Clock } from "lucide-react";

type ScheduleToolbarProps = {
  selectedTab: "upcoming" | "calendar";
  scheduleRangeLabel: string;
  onSelectTab: (tab: "upcoming" | "calendar") => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onBackDashboard: () => void;
};

export function ScheduleToolbar({
  selectedTab,
  scheduleRangeLabel,
  onSelectTab,
  onPrevMonth,
  onNextMonth,
  onBackDashboard,
}: ScheduleToolbarProps) {
  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="grid w-full grid-cols-1 gap-3 sm:max-w-[360px] sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onSelectTab("upcoming")}
          className={[
            "inline-flex items-center justify-center gap-2 rounded-[1.35rem] px-5 py-3.5 text-sm font-bold transition",
            selectedTab === "upcoming"
              ? "bg-blue/12 text-blue shadow-[inset_0_0_0_1px_rgba(33,158,188,0.12)]"
              : "border border-white/80 bg-white/88 text-navy/65 shadow-[0_12px_28px_rgba(32,42,68,0.05)] hover:text-navy",
          ].join(" ")}
        >
          <Clock className="h-5 w-5" />
          Prochains cours
        </button>
        <button
          type="button"
          onClick={() => onSelectTab("calendar")}
          className={[
            "inline-flex items-center justify-center gap-2 rounded-[1.35rem] px-5 py-3.5 text-sm font-bold transition",
            selectedTab === "calendar"
              ? "bg-blue/12 text-blue shadow-[inset_0_0_0_1px_rgba(33,158,188,0.12)]"
              : "border border-white/80 bg-white/88 text-navy/65 shadow-[0_12px_28px_rgba(32,42,68,0.05)] hover:text-navy",
          ].join(" ")}
        >
          <Calendar className="h-5 w-5" />
          Calendrier
        </button>
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-[1.25rem] border border-white/80 bg-white/90 px-5 py-3 text-sm font-bold text-navy shadow-[0_12px_28px_rgba(32,42,68,0.05)]"
        >
          {selectedTab === "upcoming" ? "Tous les cours" : "Vue calendrier"}
          <ChevronDown className="h-4 w-4 text-navy/50" />
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onPrevMonth}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/80 bg-white/90 text-navy shadow-[0_12px_28px_rgba(32,42,68,0.05)]"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="inline-flex items-center gap-3 rounded-[1.25rem] border border-white/80 bg-white/90 px-5 py-3 text-sm font-black text-navy shadow-[0_12px_28px_rgba(32,42,68,0.05)]">
            <Calendar className="h-5 w-5 text-blue" />
            <span>{scheduleRangeLabel}</span>
          </div>
          <button
            type="button"
            onClick={onNextMonth}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/80 bg-white/90 text-navy shadow-[0_12px_28px_rgba(32,42,68,0.05)]"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <button
          type="button"
          onClick={onBackDashboard}
          className="inline-flex items-center justify-center gap-2 px-2 py-3 text-sm font-bold text-blue transition hover:text-deepBlue"
        >
          Retour dashboard <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
